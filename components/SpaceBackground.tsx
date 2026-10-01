"use client";

import dynamic from "next/dynamic";

// Black-and-white space: paper-dot starfield, white ink shooting stars,
// and a line-art station rendered in Three.js (client only, no SSR).
const StationCanvas = dynamic(() => import("./three/StationCanvas"), {
  ssr: false,
});

export default function SpaceBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-ink">
      {/* layered drifting starfields */}
      <div className="stars stars--sm" />
      <div className="stars stars--md" />
      <div className="stars stars--lg" />

      {/* faint halftone band for print texture */}
      <div
        className="halftone pointer-events-none absolute inset-x-0 top-0 h-[60vh] opacity-[0.07]"
        style={{
          maskImage: "linear-gradient(to bottom, #000, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, #000, transparent)",
        }}
      />

      {/* the station, fixed behind content */}
      <StationCanvas />

      {/* occasional shooting stars */}
      <div className="shooting-star shooting-star--1" />
      <div className="shooting-star shooting-star--2" />
      <div className="shooting-star shooting-star--3" />

      {/* readability vignette */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/20 via-transparent to-ink/80" />
    </div>
  );
}
