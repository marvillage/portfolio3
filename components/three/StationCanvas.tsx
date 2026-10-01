"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Pure line-art space station: white edges on black, no textures, no lights.
// Rotates slowly, speeds up with scroll, and drifts closer as you near the end.

type Progress = { p: number; v: number };

const PAPER = "#f3f1ea";

function Station({ progress }: { progress: React.MutableRefObject<Progress> }) {
  const group = useRef<THREE.Group>(null);

  const geo = useMemo(() => {
    const sphere = new THREE.EdgesGeometry(new THREE.SphereGeometry(1, 22, 14), 1);
    const dish = new THREE.EdgesGeometry(
      new THREE.SphereGeometry(0.42, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      1
    );
    const rim = new THREE.EdgesGeometry(new THREE.TorusGeometry(0.42, 0.012, 4, 56), 1);
    const trench = new THREE.EdgesGeometry(new THREE.TorusGeometry(1.0, 0.03, 4, 80), 1);
    return { sphere, dish, rim, trench };
  }, []);

  const mats = useMemo(
    () => ({
      grid: new THREE.LineBasicMaterial({ color: PAPER, transparent: true, opacity: 0.18 }),
      line: new THREE.LineBasicMaterial({ color: PAPER, transparent: true, opacity: 0.42 }),
    }),
    []
  );

  // Dish sits on the upper-left of the sphere, bowl opening outward.
  const dishPose = useMemo(() => {
    const n = new THREE.Vector3(-0.55, 0.55, 0.62).normalize();
    const pos = n.clone().multiplyScalar(0.94);
    const qDish = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      n.clone().negate()
    );
    const qRim = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
    return { pos, qDish, qRim };
  }, []);

  useEffect(() => {
    return () => {
      Object.values(geo).forEach((g) => g.dispose());
      Object.values(mats).forEach((m) => m.dispose());
    };
  }, [geo, mats]);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const { p, v } = progress.current;
    g.rotation.y += dt * 0.08 + v * 0.0004;
    g.rotation.x = -0.28 + Math.sin(state.clock.elapsedTime * 0.2) * 0.05;
    g.rotation.z = 0.12;
    const s = 1 + p * 0.3;
    g.scale.setScalar(s);
    g.position.x = THREE.MathUtils.lerp(1.45, 0.8, p);
    g.position.y = THREE.MathUtils.lerp(0.35, -0.15, p);
    progress.current.v *= 0.88;
  });

  return (
    <group ref={group}>
      <lineSegments geometry={geo.sphere} material={mats.grid} />
      <lineSegments geometry={geo.trench} material={mats.line} rotation={[Math.PI / 2, 0, 0]} />
      <lineSegments
        geometry={geo.dish}
        material={mats.line}
        position={dishPose.pos}
        quaternion={dishPose.qDish}
      />
      <lineSegments
        geometry={geo.rim}
        material={mats.line}
        position={dishPose.pos}
        quaternion={dishPose.qRim}
      />
    </group>
  );
}

/** Static SVG stand-in for reduced motion, no WebGL, or low-power devices. */
export function StationSketch({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      aria-hidden="true"
      className={className}
      style={{ color: PAPER }}
    >
      <g fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5">
        <circle cx="100" cy="100" r="96" strokeWidth="1.5" />
        <ellipse cx="100" cy="100" rx="96" ry="40" />
        <ellipse cx="100" cy="100" rx="96" ry="75" />
        <ellipse cx="100" cy="100" rx="40" ry="96" />
        <ellipse cx="100" cy="100" rx="75" ry="96" />
        <path d="M4 74 Q100 94 196 74" strokeWidth="2" />
        <circle cx="62" cy="58" r="24" fill="#0a0a0c" strokeWidth="2" />
        <circle cx="62" cy="58" r="13" />
      </g>
    </svg>
  );
}

type Mode = "pending" | "webgl" | "static";

export default function StationCanvas() {
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
      <StationSketch className="absolute -right-[12vw] top-[12vh] w-[70vw] max-w-[760px] opacity-70 md:-right-[6vw] md:w-[46vw]" />
    );
  }

  return (
    <div className="absolute inset-0" aria-hidden="true">
      <Canvas
        frameloop={active ? "always" : "never"}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 3.4], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
        style={{ pointerEvents: "none" }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <Station progress={progress} />
      </Canvas>
    </div>
  );
}
