"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Float } from "@react-three/drei";
import { useRef, useMemo, Suspense } from "react";
import * as THREE from "three";

/* ── Black hole: dark core + glowing accretion disk + lensing halo ───────── */
function BlackHole() {
  const disk = useRef<THREE.Mesh>(null);
  const disk2 = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (disk.current) disk.current.rotation.z += delta * 0.25;
    if (disk2.current) disk2.current.rotation.z -= delta * 0.18;
    if (halo.current) {
      const s = 1 + Math.sin(performance.now() / 1400) * 0.04;
      halo.current.scale.set(s, s, s);
    }
  });

  return (
    <group rotation={[1.15, 0, 0.35]}>
      {/* event horizon */}
      <mesh>
        <sphereGeometry args={[1.05, 64, 64]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* lensing halo */}
      <mesh ref={halo}>
        <sphereGeometry args={[1.18, 64, 64]} />
        <meshBasicMaterial
          color="#4c6ef5"
          transparent
          opacity={0.18}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* accretion disk — inner */}
      <mesh ref={disk}>
        <ringGeometry args={[1.25, 2.4, 128]} />
        <meshBasicMaterial
          color="#7c5cff"
          transparent
          opacity={0.55}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* accretion disk — outer, cyan */}
      <mesh ref={disk2}>
        <ringGeometry args={[2.4, 3.3, 128]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.28}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

/* ── Orbiting planets ────────────────────────────────────────────────────── */
function Planet({
  radius,
  size,
  color,
  speed,
  offset,
  tilt,
}: {
  radius: number;
  size: number;
  color: string;
  speed: number;
  offset: number;
  tilt: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (!ref.current) return;
    const t = performance.now() / 1000;
    const a = t * speed + offset;
    ref.current.position.x = Math.cos(a) * radius;
    ref.current.position.z = Math.sin(a) * radius;
    ref.current.position.y = Math.sin(a) * radius * tilt;
    ref.current.rotation.y += 0.01;
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.35}
        roughness={0.6}
        metalness={0.2}
      />
    </mesh>
  );
}

/* ── Pointer parallax wrapper ────────────────────────────────────────────── */
function Scene() {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    const { x, y } = state.pointer;
    group.current.rotation.y += (x * 0.4 - group.current.rotation.y) * 0.04;
    group.current.rotation.x += (-y * 0.25 - group.current.rotation.x) * 0.04;
  });

  const planets = useMemo(
    () => [
      { radius: 4.2, size: 0.18, color: "#38bdf8", speed: 0.45, offset: 0, tilt: 0.18 },
      { radius: 5.4, size: 0.26, color: "#7c5cff", speed: 0.32, offset: 2.1, tilt: -0.12 },
      { radius: 6.6, size: 0.14, color: "#e6ecff", speed: 0.24, offset: 4.0, tilt: 0.22 },
    ],
    []
  );

  return (
    <group ref={group}>
      <Stars radius={80} depth={50} count={4000} factor={4} saturation={0} fade speed={1} />
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 0, 0]} intensity={2.5} color="#7c5cff" distance={14} />
      <pointLight position={[6, 4, 6]} intensity={1.2} color="#38bdf8" />
      <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.4}>
        <BlackHole />
      </Float>
      {planets.map((p, i) => (
        <Planet key={i} {...p} />
      ))}
    </group>
  );
}

export default function SpaceScene() {
  return (
    <div className="fixed inset-0 -z-10 space-bg">
      <Canvas
        dpr={[1, 1.8]}
        camera={{ position: [0, 1.5, 9], fov: 55 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
      {/* vignette + readability gradient over the canvas */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-space-black/30 via-transparent to-space-black/80" />
    </div>
  );
}
