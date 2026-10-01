"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";

// Black-and-white cosmos behind the page:
//  • a spiral galaxy of soft white dust, centred behind the content and tilted
//    like a classic deep-field photograph, with a bright core; slow spin that
//    speeds up a little with scroll
//  • a real Earth: grayscale NASA-derived map with relief and ocean highlights,
//    white fresnel atmosphere and a slow cloud layer, rising from the lower right
// Everything is procedural except four small textures in /public/textures.

type Progress = { p: number; v: number };

const PAPER = "#f3f1ea";
const EARTH_RADIUS = 1.25;

/* ---------- shared soft sprite ---------- */

function useSoftSprite() {
  return useMemo(() => {
    const size = 128;
    const c = document.createElement("canvas");
    c.width = size;
    c.height = size;
    const ctx = c.getContext("2d");
    if (ctx) {
      const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(0.3, "rgba(255,255,255,0.55)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
}

/* ---------- galaxy ---------- */

function Galaxy({ progress, count }: { progress: React.MutableRefObject<Progress>; count: number }) {
  const outer = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const sprite = useSoftSprite();

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const radius = 4.6;
    const branches = 3;
    const spinRate = 1.05;
    const randomness = 0.42;
    const power = 2.6;
    let seed = 20261002;
    const rnd = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const r = 0.05 + Math.pow(rnd(), 0.7) * radius; // denser toward the core
      const branchAngle = ((i % branches) / branches) * Math.PI * 2;
      const spinAngle = r * spinRate;
      const sgn = () => (rnd() < 0.5 ? 1 : -1);
      const rx = Math.pow(rnd(), power) * sgn() * randomness * r;
      const ry = Math.pow(rnd(), power) * sgn() * randomness * r * 0.28;
      const rz = Math.pow(rnd(), power) * sgn() * randomness * r;
      pos[i3] = Math.cos(branchAngle + spinAngle) * r + rx;
      pos[i3 + 1] = ry;
      pos[i3 + 2] = Math.sin(branchAngle + spinAngle) * r + rz;
      const t = r / radius; // 0 at the core, 1 at the rim
      const b = 0.9 - t * 0.78 + (rnd() - 0.5) * 0.2;
      const v = Math.max(0.06, Math.min(0.95, b));
      col[i3] = v;
      col[i3 + 1] = v;
      col[i3 + 2] = v;
    }
    return { positions: pos, colors: col };
  }, [count]);

  useFrame((_, dt) => {
    const s = spin.current;
    const o = outer.current;
    if (!s || !o) return;
    const { p, v } = progress.current;
    s.rotation.y += dt * 0.022 + v * 0.0001;
    o.position.y = 0.3 + p * 0.6; // gentle parallax as the page scrolls
  });

  return (
    <group ref={outer} position={[0.2, 0.3, -3.2]} rotation={[-1.12, 0.05, 0.32]}>
      <group ref={spin}>
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            <bufferAttribute attach="attributes-color" args={[colors, 3]} />
          </bufferGeometry>
          <pointsMaterial
            size={0.045}
            sizeAttenuation
            vertexColors
            transparent
            opacity={0.5}
            map={sprite}
            alphaMap={sprite}
            alphaTest={0.02}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
        {/* bright core, two soft layers */}
        <sprite scale={[2.4, 2.4, 1]}>
          <spriteMaterial
            map={sprite}
            color={PAPER}
            transparent
            opacity={0.32}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
        <sprite scale={[0.9, 0.9, 1]}>
          <spriteMaterial
            map={sprite}
            color={PAPER}
            transparent
            opacity={0.6}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
      </group>
    </group>
  );
}

/* ---------- earth ---------- */

const atmosphereMaterial = () =>
  new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vN; varying vec3 vP;
      void main() {
        vN = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vP = mv.xyz;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      varying vec3 vN; varying vec3 vP;
      void main() {
        float f = pow(1.0 - abs(dot(normalize(vN), normalize(-vP))), 3.0);
        gl_FragColor = vec4(vec3(0.95, 0.94, 0.90), f * 0.8);
      }`,
    transparent: true,
    side: THREE.BackSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

function Earth({ progress }: { progress: React.MutableRefObject<Progress> }) {
  const tilt = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const clouds = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();

  const [map, normalMap, specularMap, cloudMap, lightsMap] = useLoader(THREE.TextureLoader, [
    "/textures/earth-bw.jpg",
    "/textures/earth-normal.jpg",
    "/textures/earth-specular.jpg",
    "/textures/earth-clouds.png",
    "/textures/earth-lights.jpg",
  ]);
  map.colorSpace = THREE.SRGBColorSpace;
  cloudMap.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;

  const atmos = useMemo(atmosphereMaterial, []);
  useEffect(() => () => atmos.dispose(), [atmos]);

  useFrame((_, dt) => {
    const t = tilt.current;
    const s = spin.current;
    if (!t || !s) return;
    const { p, v } = progress.current;
    s.rotation.y += dt * 0.045 + v * 0.0002;
    if (clouds.current) clouds.current.rotation.y += dt * 0.012;
    // a horizon rising from the lower right; on phones it sits centred at the bottom
    const portrait = viewport.width < viewport.height;
    const halfW = viewport.width / 2;
    t.position.x = portrait ? 0.15 : halfW * 0.56;
    t.position.y = THREE.MathUtils.lerp(portrait ? -2.15 : -1.85, portrait ? -1.6 : -1.05, p);
    progress.current.v *= 0.88;
  });

  return (
    <group ref={tilt} rotation={[0.1, 0, 0.41]} scale={EARTH_RADIUS}>
      <group ref={spin}>
        <mesh>
          <sphereGeometry args={[1, 96, 64]} />
          <meshPhongMaterial
            map={map}
            normalMap={normalMap}
            normalScale={new THREE.Vector2(0.55, 0.55)}
            specularMap={specularMap}
            specular={new THREE.Color("#8a8a86")}
            shininess={16}
            color="#d6d4cd"
            emissiveMap={lightsMap}
            emissive={new THREE.Color("#ffffff")}
            emissiveIntensity={0.55}
          />
        </mesh>
        <mesh ref={clouds}>
          <sphereGeometry args={[1.012, 64, 48]} />
          <meshPhongMaterial map={cloudMap} transparent opacity={0.55} depthWrite={false} />
        </mesh>
      </group>
      <mesh material={atmos}>
        <sphereGeometry args={[1.07, 48, 36]} />
      </mesh>
    </group>
  );
}

/* ---------- static fallback ---------- */

export function CosmosSketch({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 200" aria-hidden="true" className={className}>
      <defs>
        <radialGradient id="earth-shade" cx="35%" cy="32%" r="78%">
          <stop offset="0" stopColor="#c9c6bc" />
          <stop offset="0.55" stopColor="#5a5955" />
          <stop offset="1" stopColor="#0a0a0c" />
        </radialGradient>
        <radialGradient id="core-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#f3f1ea" stopOpacity="0.7" />
          <stop offset="1" stopColor="#f3f1ea" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g fill="none" stroke={PAPER} opacity="0.3">
        <ellipse cx="160" cy="80" rx="150" ry="46" strokeWidth="0.8" />
        <ellipse cx="160" cy="80" rx="100" ry="30" strokeWidth="0.8" />
        <ellipse cx="160" cy="80" rx="50" ry="15" strokeWidth="1" />
      </g>
      <ellipse cx="160" cy="80" rx="40" ry="18" fill="url(#core-glow)" />
      <circle cx="235" cy="215" r="80" fill="url(#earth-shade)" stroke={PAPER} strokeWidth="1.2" />
    </svg>
  );
}

/* ---------- canvas shell ---------- */

type Mode = "pending" | "webgl" | "static";

export default function CosmosCanvas() {
  const [mode, setMode] = useState<Mode>("pending");
  const [active, setActive] = useState(true);
  const [count, setCount] = useState(16000);
  const progress = useRef<Progress>({ p: 0, v: 0 });

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cores = navigator.hardwareConcurrency ?? 4;
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
    const lowPower = cores <= 2 || memory < 2;
    let webgl = false;
    try {
      const c = document.createElement("canvas");
      webgl = !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      webgl = false;
    }
    setCount(cores <= 4 || window.innerWidth < 768 ? 9000 : 16000);
    setMode(!reduced && !lowPower && webgl ? "webgl" : "static");

    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.current.p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
      progress.current.v += y - lastY;
      lastY = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const onVis = () => setActive(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  if (mode === "pending") return null;

  if (mode === "static") {
    return (
      <CosmosSketch className="absolute left-1/2 top-[14vh] w-[120vw] max-w-[1200px] -translate-x-1/2 opacity-80" />
    );
  }

  return (
    <div className="absolute inset-0" aria-hidden="true">
      <Canvas
        frameloop={active ? "always" : "never"}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 3.4], fov: 42 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "low-power",
          toneMapping: THREE.NoToneMapping,
        }}
        style={{ pointerEvents: "none" }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <ambientLight intensity={0.22} />
        <hemisphereLight args={[0x9a9a96, 0x000000, 0.35]} />
        <directionalLight position={[-3.5, 1.8, 4]} intensity={2.6} />
        <Galaxy progress={progress} count={count} />
        <Suspense fallback={null}>
          <Earth progress={progress} />
        </Suspense>
      </Canvas>
    </div>
  );
}
