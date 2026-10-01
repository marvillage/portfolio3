"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// A white ink splatter that covers the screen, then fades while the page jumps
// to the target section. Used by the navbar links. Respects reduced motion.

type Phase = "idle" | "in" | "out";

const blobs = [
  { cx: 50, cy: 50, r: 46, d: 0 },
  { cx: 18, cy: 30, r: 26, d: 40 },
  { cx: 84, cy: 28, r: 22, d: 70 },
  { cx: 22, cy: 78, r: 24, d: 60 },
  { cx: 80, cy: 76, r: 28, d: 30 },
  { cx: 50, cy: 10, r: 16, d: 110 },
  { cx: 8, cy: 54, r: 14, d: 90 },
  { cx: 94, cy: 56, r: 15, d: 120 },
  { cx: 50, cy: 92, r: 15, d: 100 },
  { cx: 35, cy: 50, r: 10, d: 150 },
  { cx: 66, cy: 44, r: 9, d: 160 },
];

export function useInkWipe() {
  const [phase, setPhase] = useState<Phase>("idle");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const navigate = useCallback((href: string) => {
    const target = href.startsWith("#") ? document.querySelector<HTMLElement>(href) : null;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!target || reduced) {
      if (target) target.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
      return;
    }
    timers.current.forEach(clearTimeout);
    setPhase("in");
    timers.current = [
      setTimeout(() => {
        target.scrollIntoView({ behavior: "auto", block: "start" });
        history.replaceState(null, "", href);
        setPhase("out");
      }, 380),
      setTimeout(() => setPhase("idle"), 900),
    ];
  }, []);

  return { phase, navigate };
}

export default function InkWipe({ phase }: { phase: Phase }) {
  if (phase === "idle") return null;
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-[80] ${phase === "out" ? "ink-wipe-out" : ""}`}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="h-full w-full"
      >
        {blobs.map((b, i) => (
          <circle
            key={i}
            cx={b.cx}
            cy={b.cy}
            r={b.r}
            className="ink-splat"
            style={{ animationDelay: `${b.d}ms` }}
          />
        ))}
      </svg>
    </div>
  );
}
