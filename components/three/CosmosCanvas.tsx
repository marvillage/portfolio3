"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";

// Black-and-white cosmos behind the page:
//  • a spiral galaxy of white particles with a dark core and a bright accretion
//    ring (the "black hole" look), tilted and slowly turning, faster on scroll
//  • a real Earth: grayscale NASA-derived map on a toon-shaded sphere, white
//    fresnel atmosphere and a slow cloud layer, anchored off the right edge
// Everything is procedural except two small textures in /public/textures.

type Progress = { p: number; v: number };

const PAPER = "#f3f1ea";
const EARTH_RADIUS = 1.2;

/* ---------- galaxy ---------- */

/** Soft round sprite so particles read as stars and dust, not squares. */
function useStarSprite() {
  return useMemo(() => {
    const size = 64;
    const c = document.createElement("canvas");
    c.width = size;
    c.height = size;
    const ctx = c.getContext("2d");
    if (ctx) {
      const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(0.35, "rgba(255,255,255,0.6)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
}

function Galaxy({ progress, count }: { progress: React.MutableRefObject<Progress>; count: number }) {
  const group = useRef<THREE.Group>(null);
  const sprite = useStarSprite();

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const radius = 3.9;
    const branches = 3;
    const spin = 1.15;
    const randomness = 0.38;
    const power = 2.7;
    const hole = 0.5; // nothing inside the event horizon
    let seed = 20261002;
    const rnd = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const r = hole + Math.pow(rnd(), 0.85) * (radius - hole);
      const branchAngle = ((i % branches) / branches) * Math.PI * 2;
      const spinAngle = r * spin;
      const sgn = () => (rnd() < 0.5 ? 1 : -1);
      const rx = Math.pow(rnd(), power) * sgn() * randomness * r;
      const ry = Math.pow(rnd(), power) * sgn() * randomness * r * 0.3;
      const rz = Math.pow(rnd(), power) * sgn() * randomness * r;
      pos[i3] = Math.cos(branchAngle + spinAngle) * r + rx;
      pos[i3 + 1] = ry;
      pos[i3 + 2] = Math.sin(branchAngle + spinAngle) * r + rz;
      const t = (r - hole) / (radius - hole); // 0 at the core, 1 at the rim
      const b = 0.85 - t * 0.7 + (rnd() - 0.5) * 0.2;
      const v = Math.max(0.08, Math.min(0.9, b));
      col[i3] = v;
      col[i3 + 1] = v;
      col[i3 + 2] = v;
    }
    return { positions: pos, colors: col };
  }, [count]);

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    g.rotation.y += dt * 0.025 + progress.current.v * 0.00012;
  });

  return (
    // core sits in the top-right corner; arms sweep across the top, away from the text column
    <group position={[2.5, 1.55, -2.6]} rotation={[-1.15, 0.1, 0.5]}>
      <group ref={group}>
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            <bufferAttribute attach="attributes-color" args={[colors, 3]} />
          </bufferGeometry>
          <pointsMaterial
            size={0.05}
            sizeAttenuation
            vertexColors
            transparent
            opacity={0.55}
            map={sprite}
            alphaMap={sprite}
            alphaTest={0.02}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
        {/* event horizon and accretion rings */}
        <mesh>
          <sphereGeometry args={[0.42, 32, 24]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.56, 0.014, 8, 128]} />
          <meshBasicMaterial color={PAPER} transparent opacity={0.9} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.72, 0.006, 6, 128]} />
          <meshBasicMaterial color={PAPER} transparent opacity={0.45} />
        </mesh>
      </group>
    </group>
  );
}

/* ---------- earth ---------- */

function useToonGradient(steps = 4) {
  return useMemo(() => {
    const data = new Uint8Array(steps);
    for (let i = 0; i < steps; i++) data[i] = Math.round(38 + (217 * i) / (steps - 1));
    const tex = new THREE.DataTexture(data, steps, 1, THREE.RedFormat);
    tex.minFilter = THREE.NearestFilter;
    tex.magFilter = THREE.NearestFilter;
    tex.needsUpdate = true;
    return tex;
  }, [steps]);
}

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
        float f = pow(1.0 - abs(dot(normalize(vN), normalize(-vP))), 3.2);
        gl_FragColor = vec4(vec3(0.95, 0.94, 0.90), f * 0.85);
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

  const [map, cloudMap] = useLoader(THREE.TextureLoader, [
    "/textures/earth-bw.jpg",
    "/textures/earth-clouds.png",
  ]);
  map.colorSpace = THREE.SRGBColorSpace;
  cloudMap.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 4;

  const gradient = useToonGradient(4);
  const atmos = useMemo(atmosphereMaterial, []);
  useEffect(() => () => atmos.dispose(), [atmos]);

  useFrame((_, dt) => {
    const t = tilt.current;
    const s = spin.current;
    if (!t || !s) return;
    const { p, v } = progress.current;
    s.rotation.y += dt * 0.05 + v * 0.00025;
    if (clouds.current) clouds.current.rotation.y += dt * 0.014;
    // right-edge anchor: half a globe on landscape, a crescent limb on portrait phones
    const portrait = viewport.width < viewport.height;
    t.position.x = viewport.width / 2 + (portrait ? 0.82 : 0.05);
    t.position.y = THREE.MathUtils.lerp(portrait ? -1.1 : -0.8, portrait ? 0.7 : 0.5, p);
    progress.current.v *= 0.88;
  });

  return (
    <group ref={tilt} rotation={[0, 0, 0.41]} scale={EARTH_RADIUS}>
      <group ref={spin}>
        <mesh>
          <sphereGeometry args={[1, 64, 48]} />
          <meshToonMaterial map={map} gradientMap={gradient} color="#d9d7d0" />
        </mesh>
        <mesh ref={clouds}>
          <sphereGeometry args={[1.012, 48, 36]} />
          <meshToonMaterial
            map={cloudMap}
            gradientMap={gradient}
            transparent
            opacity={0.45}
            depthWrite={false}
          />
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
      </defs>
      <g fill="none" stroke={PAPER} opacity="0.35">
        <ellipse cx="110" cy="70" rx="100" ry="34" strokeWidth="0.8" />
        <ellipse cx="110" cy="70" rx="70" ry="24" strokeWidth="0.8" />
        <ellipse cx="110" cy="70" rx="40" ry="14" strokeWidth="1.2" />
        <circle cx="110" cy="70" r="7" fill="#0a0a0c" strokeWidth="1.5" />
      </g>
      <circle cx="250" cy="150" r="60" fill="url(#earth-shade)" stroke={PAPER} strokeWidth="1.2" />
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
      <CosmosSketch className="absolute -right-[20vw] top-[18vh] w-[110vw] max-w-[1100px] opacity-80 md:-right-[8vw] md:w-[70vw]" />
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
        <ambientLight intensity={0.35} />
        <directionalLight position={[-4, 2.5, 3]} intensity={2.4} />
        <Galaxy progress={progress} count={count} />
        <Suspense fallback={null}>
          <Earth progress={progress} />
        </Suspense>
      </Canvas>
    </div>
  );
}
