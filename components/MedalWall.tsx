"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { profile } from "@/data/profile";

// Medal wall: the four achievements hang on a riveted ship bulkhead as physical
// awards. Each medal drops onto its hook when the wall scrolls into view and
// swings to a stop; hovering tilts it toward you and sweeps a glint across it.
// The name plate under each medal carries the achievement text verbatim.

export type AwardArt = Partial<Record<"trophy" | "medal-silver" | "medal-bronze" | "rosette", string>>;

type Award = {
  rank: string; // engraved on the medal
  place: string; // small label on the plate
  kind: keyof AwardArt;
  text: string;
};

const RANKS: { rank: string; place: string; kind: keyof AwardArt }[] = [
  { rank: "1st", place: "Winner", kind: "trophy" },
  { rank: "2nd", place: "2nd rank", kind: "medal-silver" },
  { rank: "3rd", place: "3rd rank", kind: "medal-bronze" },
  { rank: "3rd", place: "3rd rank", kind: "rosette" },
];

// strip the leading medal emoji from the data string for clean display
const awards: Award[] = profile.achievements.map((a, i) => ({ ...RANKS[i % RANKS.length], text: a.replace(/^[^\sA-Za-z0-9]+\s*/, "") }));

/* ---------- inked placeholder medals (used until the stickers exist) ---------- */

function InkMedal({ kind, rank }: { kind: keyof AwardArt; rank: string }) {
  const common = { fill: "none", stroke: "#f3f1ea", strokeWidth: 3, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  if (kind === "trophy") {
    return (
      <svg viewBox="0 0 120 150" className="h-full w-full" aria-hidden="true">
        <g {...common}>
          <path d="M30 20 H90 V58 A30 30 0 0 1 30 58 Z" fill="#0a0a0c" />
          <path d="M30 30 H16 A14 14 0 0 0 30 56 M90 30 H104 A14 14 0 0 1 90 56" />
          <path d="M52 86 H68 L72 104 H48 Z" fill="#0a0a0c" />
          <rect x="34" y="104" width="52" height="14" fill="#0a0a0c" />
          <path d="M60 86 V74" />
        </g>
        <g fill="#f3f1ea" opacity="0.9">
          <circle cx="42" cy="34" r="2.5" />
          <path d="M84 24 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 z" />
        </g>
        <text x="60" y="52" textAnchor="middle" fill="#f3f1ea" fontSize="22" fontFamily="var(--font-display), Impact, sans-serif">{rank}</text>
      </svg>
    );
  }
  if (kind === "rosette") {
    return (
      <svg viewBox="0 0 120 150" className="h-full w-full" aria-hidden="true">
        <g {...common}>
          <path d="M48 92 L40 140 L56 128 M72 92 L80 140 L64 128" fill="#0a0a0c" />
          <circle cx="60" cy="60" r="44" fill="#0a0a0c" strokeDasharray="6 5" />
          <circle cx="60" cy="60" r="30" fill="#0a0a0c" />
        </g>
        <text x="60" y="68" textAnchor="middle" fill="#f3f1ea" fontSize="22" fontFamily="var(--font-display), Impact, sans-serif">{rank}</text>
      </svg>
    );
  }
  const dark = kind === "medal-bronze";
  return (
    <svg viewBox="0 0 120 150" className="h-full w-full" aria-hidden="true">
      <defs>
        <pattern id={`hatch-${kind}`} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="5" stroke="#f3f1ea" strokeWidth="0.8" opacity="0.5" />
        </pattern>
      </defs>
      <g {...common}>
        <path d="M44 4 L60 44 L76 4" fill="#0a0a0c" />
        <path d="M44 4 L36 4 L54 50 M76 4 L84 4 L66 50" />
        <circle cx="60" cy="92" r="40" fill={dark ? `url(#hatch-${kind})` : "#0a0a0c"} />
        <circle cx="60" cy="92" r="30" fill="#0a0a0c" strokeWidth="2" />
      </g>
      {!dark && <path d="M34 70 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 z" fill="#f3f1ea" />}
      <text x="60" y="100" textAnchor="middle" fill="#f3f1ea" fontSize="22" fontFamily="var(--font-display), Impact, sans-serif">{rank}</text>
    </svg>
  );
}

/* ---------- braided cord ---------- */

// Two strands twisting round each other, precomputed and rounded so server and client agree.
const strand = (phase: number) => {
  const pts: string[] = [];
  for (let y = 17; y <= 68; y += 1.5) pts.push(`${(16 + 3.4 * Math.sin(y / 5.2 + phase)).toFixed(2)} ${y.toFixed(1)}`);
  return "M" + pts.join(" L");
};
const STRAND_A = strand(0);
const STRAND_B = strand(Math.PI);
const BRAID_TICKS = Array.from({ length: 10 }, (_, i) => 19 + i * 5);

/** A shackle that grips the rail, a braided cord, and a ring that holds the award. */
function Cord() {
  return (
    <svg viewBox="0 0 32 80" className="h-20 w-8 shrink-0 overflow-visible" aria-hidden="true">
      {/* shackle wrapped over the rail, with its bolt */}
      <path d="M9 18 V9 a7 7 0 0 1 14 0 V18" fill="none" stroke="#0a0a0c" strokeWidth="6" strokeLinecap="round" />
      <path d="M9 18 V9 a7 7 0 0 1 14 0 V18" fill="none" stroke="#f3f1ea" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M6 18 H26" stroke="#f3f1ea" strokeWidth="3" strokeLinecap="round" />
      <circle cx="6" cy="18" r="2" fill="#0a0a0c" stroke="#f3f1ea" strokeWidth="1.4" />
      <circle cx="26" cy="18" r="2" fill="#0a0a0c" stroke="#f3f1ea" strokeWidth="1.4" />
      {/* braid: dark halo for contrast, then two strands, then cross ticks */}
      <path d="M16 18 V69" stroke="#0a0a0c" strokeWidth="9" strokeLinecap="round" />
      <path d={STRAND_A} fill="none" stroke="#f3f1ea" strokeWidth="2.4" strokeLinecap="round" />
      <path d={STRAND_B} fill="none" stroke="#c9c6bc" strokeWidth="2.4" strokeLinecap="round" />
      <g stroke="#0a0a0c" strokeWidth="1.2" opacity="0.8">
        {BRAID_TICKS.map((y) => (
          <line key={y} x1="13" y1={y} x2="19" y2={y + 2.5} />
        ))}
      </g>
      {/* whipping just above the ring */}
      <rect x="11.5" y="65" width="9" height="5" fill="#f3f1ea" stroke="#0a0a0c" strokeWidth="1" />
      {/* ring */}
      <circle cx="16" cy="75" r="5.5" fill="none" stroke="#0a0a0c" strokeWidth="5" />
      <circle cx="16" cy="75" r="5.5" fill="none" stroke="#f3f1ea" strokeWidth="2.4" />
    </svg>
  );
}

/* ---------- pendulum physics ---------- */

// Each award is a damped pendulum hung from its shackle. Brushing the cursor across the award
// pushes it (sideways travel sets the push, lower on the award = longer lever = harder push);
// a tap nudges it away from the side you tap. A faint idle drift keeps it alive at rest.
function usePendulum(swing: React.RefObject<HTMLDivElement>, target: React.RefObject<HTMLElement>, index: number, reduced: boolean) {
  useEffect(() => {
    const el = swing.current;
    const hit = target.current;
    if (!el || !hit || reduced) return;

    const W0 = 3.9; // natural frequency, rad/s (about a 1.6 s swing)
    const DAMP = 0.85; // per second; settles over a few seconds
    const PUSH = 0.011; // rad/s of kick per pixel of cursor travel
    let theta = 0;
    let omega = 0;
    let lastX = 0;
    let has = false;
    let raf = 0;
    let visible = true;
    let prev = performance.now();
    const t0 = prev;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      if (has) {
        const r = hit.getBoundingClientRect();
        const lever = Math.min(1.2, Math.max(0.3, (e.clientY - r.top) / r.height + 0.2));
        // moving right pushes the bottom right, which is a counter-clockwise (negative) rotation
        omega -= (e.clientX - lastX) * PUSH * lever;
        omega = Math.max(-7, Math.min(7, omega));
      }
      lastX = e.clientX;
      has = true;
    };
    const onLeave = () => {
      has = false;
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      const r = hit.getBoundingClientRect();
      const side = ((e.clientX - r.left) / r.width) * 2 - 1; // -1 left edge, +1 right edge
      omega += side * 2.6; // tap on the right swings it away to the left, and vice versa
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      const alpha = -W0 * W0 * Math.sin(theta) - DAMP * omega;
      omega += alpha * dt;
      theta = Math.max(-1.1, Math.min(1.1, theta + omega * dt));
      const idle = 0.022 * Math.sin((now - t0) / 1000 * 0.9 + index * 1.7);
      el.style.transform = `rotate(${((theta + idle) * 180) / Math.PI}deg)`;
      raf = visible ? requestAnimationFrame(tick) : 0;
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) {
        prev = performance.now();
        raf = requestAnimationFrame(tick);
      }
    });
    io.observe(el);
    hit.addEventListener("pointermove", onMove, { passive: true });
    hit.addEventListener("pointerleave", onLeave);
    hit.addEventListener("pointerdown", onDown);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      hit.removeEventListener("pointermove", onMove);
      hit.removeEventListener("pointerleave", onLeave);
      hit.removeEventListener("pointerdown", onDown);
    };
  }, [swing, target, index, reduced]);
}

/* ---------- one hanging award ---------- */

function Hanging({ a, i, art, reduced }: { a: Award; i: number; art?: string; reduced: boolean }) {
  const winner = i === 0;
  const swing = useRef<HTMLDivElement>(null);
  const hit = useRef<HTMLDivElement>(null);
  usePendulum(swing, hit, i, reduced);
  const drop = reduced
    ? {}
    : {
        initial: { y: -260, rotate: i % 2 ? 9 : -9, opacity: 0 },
        whileInView: { y: 0, rotate: [i % 2 ? 9 : -9, i % 2 ? -5 : 5, i % 2 ? 2.5 : -2.5, 0], opacity: 1 },
        viewport: { once: true, margin: "-60px 0px -60px 0px" },
        transition: {
          y: { type: "spring", stiffness: 150, damping: 14, delay: 0.15 + i * 0.18 },
          rotate: { duration: 1.7, delay: 0.35 + i * 0.18, ease: "easeOut" },
          opacity: { duration: 0.2, delay: 0.15 + i * 0.18 },
        },
      };
  return (
    <div className="group relative flex flex-col items-center">
      {/* on narrow screens there is no painted rail behind each award, so draw a short one */}
      <span aria-hidden="true" className="absolute left-1/2 top-[7px] h-1.5 w-28 -translate-x-1/2 bg-paper/85 shadow-[0_3px_0_#8c8a84] lg:hidden" />

      {/* cord + award swing as one pendulum about the shackle */}
      <div ref={swing} className="flex w-full justify-center will-change-transform" style={{ transformOrigin: "50% 0%" }}>
        <motion.div {...drop} style={{ transformOrigin: "50% 0%" }} className="relative flex w-full flex-col items-center">
          <Cord />
          <div ref={hit} className="relative -mt-1 aspect-[4/5] w-[150px] cursor-grab touch-manipulation lg:w-[60%]">
            {winner && (
              <span aria-hidden="true" className="halftone absolute -inset-10 -z-10 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-40 motion-safe:animate-pulse" />
            )}
            {art ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={art} alt="" aria-hidden="true" className="h-full w-full object-contain drop-shadow-[0_0_14px_rgba(243,241,234,0.35)]" />
            ) : (
              <InkMedal kind={a.kind} rank={a.rank} />
            )}
            {/* glint sweep on hover */}
            <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
              <span className="glint absolute -left-1/2 top-0 h-full w-1/3 -skew-x-12 bg-paper/50 opacity-0 group-hover:opacity-100" />
            </span>
          </div>
        </motion.div>
      </div>

      {/* name plate: the achievement text, verbatim */}
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px 0px -60px 0px" }}
        transition={{ duration: 0.45, delay: 0.5 + i * 0.18 }}
        className="panel-paper relative mt-4 w-full p-4 pt-5 text-ink"
      >
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 border-2 border-ink bg-ink px-2 py-0.5 font-display text-xs tracking-[0.14em] text-paper">
          {a.place.toUpperCase()}
        </span>
        <span aria-hidden="true" className="absolute left-2 top-2 h-1.5 w-1.5 rounded-full bg-ink/70" />
        <span aria-hidden="true" className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-ink/70" />
        <span aria-hidden="true" className="absolute bottom-2 left-2 h-1.5 w-1.5 rounded-full bg-ink/70" />
        <span aria-hidden="true" className="absolute bottom-2 right-2 h-1.5 w-1.5 rounded-full bg-ink/70" />
        <p className="text-sm leading-relaxed">{a.text}</p>
      </motion.div>
    </div>
  );
}

/* ---------- the wall ---------- */

// The painted wall is 2:1 and its rail sits at 25.9% of the image height, i.e. 12.95% of the width.
// Padding-top in % is relative to width, so on wide screens the shackles land on the painted rail.
const RAIL_PAD = "lg:pt-[calc(12.95%-9px)]";

export default function MedalWall({ art = {}, wall }: { art?: AwardArt; wall?: string }) {
  const reduced = useReducedMotion() ?? false;
  const painted = Boolean(wall);
  return (
    <div className="relative mt-8">
      {/* label sits outside the clipped frame so it never gets cut */}
      <span className="caption absolute -top-4 left-6 z-20 sm:left-10">Medal wall · {String(awards.length).padStart(2, "0")} awards</span>

      <div className={`relative overflow-hidden border-2 border-paper/70 bg-ink-2 px-6 pb-10 sm:px-10 ${painted ? `pt-12 ${RAIL_PAD}` : "pt-12"}`}>
        {painted && (
          <>
            {/* wide screens: the wall at its true 2:1 shape across the top, fading into dark metal below */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 hidden aspect-[2/1] bg-no-repeat lg:block" style={{ backgroundImage: `url(${wall})`, backgroundSize: "100% 100%" }}>
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-ink-2" />
            </div>
            {/* narrow screens: the wall covers the whole tall panel, dimmed */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-60 lg:hidden" style={{ backgroundImage: `url(${wall})` }} />
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-ink/30 lg:hidden" />
          </>
        )}

        {/* bulkhead: rivets and panel seams (only when no painted wall) */}
        {!painted && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-paper/30" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-paper/30" />
            <div className="absolute inset-y-0 left-1/2 w-px bg-paper/10" />
            <div className="absolute inset-y-0 left-1/4 w-px bg-paper/10" />
            <div className="absolute inset-y-0 left-3/4 w-px bg-paper/10" />
            {[8, 92].map((x) =>
              [10, 50, 90].map((y) => (
                <span key={`${x}-${y}`} className="absolute h-2 w-2 rounded-full border border-paper/60 bg-ink" style={{ left: `calc(${x}% - 4px)`, top: `calc(${y}% - 4px)` }} />
              ))
            )}
            <div className="halftone absolute inset-0 opacity-[0.06]" />
          </div>
        )}

        {/* a drawn rail for wide screens when there is no painted one */}
        {!painted && <div aria-hidden="true" className="absolute inset-x-6 top-[42px] hidden h-1.5 bg-paper shadow-[0_3px_0_#8c8a84] sm:inset-x-10 lg:block" />}

        <div className="relative grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {awards.map((a, i) => (
            <Hanging key={a.text} a={a} i={i} art={art[a.kind]} reduced={reduced} />
          ))}
        </div>
      </div>
    </div>
  );
}
