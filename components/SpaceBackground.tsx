"use client";

import dynamic from "next/dynamic";

// Black-and-white space: paper-dot starfield, white ink shooting stars, and a
// Three.js cosmos (spiral galaxy with a dark core + toon-shaded Earth), client only.
const CosmosCanvas = dynamic(() => import("./three/CosmosCanvas"), {
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

      {/* galaxy + Earth, fixed behind content */}
      <CosmosCanvas />

      {/* occasional shooting stars */}
      <div className="shooting-star shooting-star--1" />
      <div className="shooting-star shooting-star--2" />
      <div className="shooting-star shooting-star--3" />

      {/* readability vignettes: bottom fade everywhere, left-side shade on phones */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/20 via-transparent to-ink/80" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink/70 via-ink/30 to-transparent md:hidden" />
      <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-ink/55 via-ink/15 to-transparent md:block" />
    </div>
  );
}
