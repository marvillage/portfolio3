"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";

// Black-and-white space: paper-dot starfield, white ink shooting stars, and a
// Three.js cosmos (spiral galaxy + lit Earth horizon), client only.
const CosmosCanvas = dynamic(() => import("./three/CosmosCanvas"), {
  ssr: false,
});

export default function SpaceBackground() {
  const warp = useRef<HTMLDivElement>(null);

  // Star streaks on fast scroll: stretch the starfield vertically with the
  // scroll velocity and ease back when the page settles.
  useEffect(() => {
    const el = warp.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let lastY = window.scrollY;
    let velocity = 0;
    let amount = 0;
    let raf = 0;
    const onScroll = () => {
      const y = window.scrollY;
      velocity = y - lastY;
      lastY = y;
    };
    const tick = () => {
      const target = Math.min(1, Math.abs(velocity) / 45);
      amount += (target - amount) * (target > amount ? 0.35 : 0.08);
      velocity *= 0.6;
      if (amount > 0.002) {
        el.style.transform = `scaleY(${(1 + amount * 5).toFixed(3)})`;
        el.style.opacity = (1 - amount * 0.3).toFixed(3);
      } else if (el.style.transform) {
        el.style.transform = "";
        el.style.opacity = "";
      }
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-ink">
      {/* layered drifting starfields, stretched into streaks on fast scroll */}
      <div ref={warp} className="absolute inset-0 origin-center will-change-transform">
        <div className="stars stars--sm" />
        <div className="stars stars--md" />
        <div className="stars stars--lg" />
      </div>

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
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink/60 via-ink/20 to-transparent md:hidden" />
    </div>
  );
}
