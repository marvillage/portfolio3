"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// A white ink splatter that covers the screen while the destination's name
// stamps in across it, then both fade as the page jumps to the section.
// Used by the navbar links. Respects reduced motion.

type Phase = "idle" | "in" | "out";

// main blobs (slightly squashed for an organic splat) and small droplets
const blobs = [
  { cx: 50, cy: 50, rx: 48, ry: 44, d: 0 },
  { cx: 16, cy: 28, rx: 27, ry: 23, d: 40 },
  { cx: 85, cy: 26, rx: 24, ry: 20, d: 70 },
  { cx: 20, cy: 80, rx: 25, ry: 22, d: 60 },
  { cx: 82, cy: 78, rx: 29, ry: 25, d: 30 },
  { cx: 50, cy: 8, rx: 18, ry: 14, d: 110 },
  { cx: 6, cy: 54, rx: 15, ry: 13, d: 90 },
  { cx: 95, cy: 56, rx: 16, ry: 14, d: 120 },
  { cx: 50, cy: 94, rx: 17, ry: 13, d: 100 },
];
const drops = [
  { cx: 9, cy: 9, r: 2.2, d: 160 },
  { cx: 93, cy: 7, r: 1.6, d: 190 },
  { cx: 97, cy: 92, r: 2.4, d: 170 },
  { cx: 4, cy: 94, r: 1.8, d: 200 },
  { cx: 30, cy: 4, r: 1.2, d: 210 },
  { cx: 70, cy: 97, r: 1.4, d: 180 },
  { cx: 2, cy: 36, r: 1.1, d: 220 },
  { cx: 98, cy: 40, r: 1.3, d: 230 },
];

export function useInkWipe() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [label, setLabel] = useState("");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const navigate = useCallback((href: string, name = "") => {
    const target = href.startsWith("#") ? document.querySelector<HTMLElement>(href) : null;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!target || reduced) {
      if (target) target.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
      return;
    }
    timers.current.forEach(clearTimeout);
    setLabel(name);
    setPhase("in");
    timers.current = [
      setTimeout(() => {
        target.scrollIntoView({ behavior: "auto", block: "start" });
        history.replaceState(null, "", href);
        setPhase("out");
      }, 620),
      setTimeout(() => setPhase("idle"), 1150),
    ];
  }, []);

  return { phase, label, navigate };
}

export default function InkWipe({ phase, label }: { phase: Phase; label?: string }) {
  if (phase === "idle") return null;
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-[80] ${phase === "out" ? "ink-wipe-out" : ""}`}
    >
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
        {blobs.map((b, i) => (
          <ellipse
            key={`b${i}`}
            cx={b.cx}
            cy={b.cy}
            rx={b.rx}
            ry={b.ry}
            className="ink-splat"
            style={{ animationDelay: `${b.d}ms` }}
          />
        ))}
        {drops.map((d, i) => (
          <circle
            key={`d${i}`}
            cx={d.cx}
            cy={d.cy}
            r={d.r}
            className="ink-splat"
            style={{ animationDelay: `${d.d}ms` }}
          />
        ))}
      </svg>

      {label && (
        <div className="absolute inset-0 grid place-items-center px-6">
          <div className="ink-wipe-label text-center">
            <span className="block font-hand text-lg text-ink/70 sm:text-xl">turning to…</span>
            <span className="block font-display text-[clamp(48px,11vw,150px)] uppercase leading-none tracking-wide text-ink [text-shadow:5px_5px_0_var(--ash)]">
              {label}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
