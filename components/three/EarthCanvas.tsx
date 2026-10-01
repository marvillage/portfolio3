"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";

// A real Earth, drawn in black and white: grayscale NASA-derived map on a
// toon-shaded sphere (four ink steps), a white fresnel rim for the atmosphere,
// and a slow cloud layer. It sits off the right edge, spins slowly, speeds up
// with scroll, and rises as you move down the page.

type Progress = { p: number; v: number };

const PAPER = "#f3f1ea";
const RADIUS = 1.15;

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
    // anchor to the right edge: ~45% of the globe visible on landscape screens,
    // only a crescent limb on portrait phones so hero text stays readable
    const portrait = viewport.width < viewport.height;
    t.position.x = viewport.width / 2 + (portrait ? 0.78 : 0.1);
    t.position.y = THREE.MathUtils.lerp(portrait ? -1.1 : -0.75, portrait ? 0.7 : 0.45, p);
    progress.current.v *= 0.88;
  });

  return (
    <group ref={tilt} rotation={[0, 0, 0.41]} scale={RADIUS}>
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

/** Static stand-in for reduced motion, no WebGL, or low-power devices. */
export function EarthSketch({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true" className={className}>
      <defs>
        <radialGradient id="earth-shade" cx="35%" cy="32%" r="78%">
          <stop offset="0" stopColor="#c9c6bc" />
          <stop offset="0.55" stopColor="#5a5955" />
          <stop offset="1" stopColor="#0a0a0c" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="96" fill="url(#earth-shade)" stroke={PAPER} strokeWidth="1.5" />
      <g fill="none" stroke={PAPER} strokeWidth="1" opacity="0.35">
        <path d="M12 70 Q100 50 188 70" />
        <path d="M6 100 Q100 84 194 100" />
        <path d="M12 130 Q100 118 188 130" />
        <path d="M100 4 Q70 100 100 196" />
        <path d="M100 4 Q130 100 100 196" />
      </g>
    </svg>
  );
}

type Mode = "pending" | "webgl" | "static";

export default function EarthCanvas() {
  const [mode, setMode] = useState<Mode>("pending");
  const [active, setActive] = useState(true);
  const progress = useRef<Progress>({ p: 0, v: 0 });

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lowPower =
      (navigator.hardwareConcurrency ?? 4) <= 2 ||
      ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4) < 2;
    let webgl = false;
    try {
      const c = document.createElement("canvas");
      webgl = !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      webgl = false;
    }
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
      <EarthSketch className="absolute -right-[30vw] top-[30vh] w-[70vw] max-w-[760px] opacity-80 md:-right-[14vw] md:w-[44vw]" />
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
        <Suspense fallback={null}>
          <Earth progress={progress} />
        </Suspense>
      </Canvas>
    </div>
  );
}
