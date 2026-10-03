"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { animate, motion, useInView, useMotionValue, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { BookOpen, CalendarDays, GraduationCap, MapPin } from "lucide-react";
import { education } from "@/data/education";
import SectionHeading from "./SectionHeading";

// The Ascent: a painted panorama from the hometown cliffs up to the orbital academy.
// Each time the panorama comes into view (scrolling down or back up) the flight plays:
// the home world appears and the ship lifts off, then each planet materialises as the
// ship closes in, locks its reticle, pops a sound effect and stamps that mission's card
// in; docking at the citadel stamps the class year. Leaving the screen resets it.
// Below xl the panorama becomes a banner and the stages stack on a vertical flight line.

export type AcademyArt = { backdrop?: string; ship?: string; planets: (string | undefined)[] };

/* ---------- the three stages, oldest first so the ship climbs ---------- */

const MISSIONS = ["First Steps", "Pre-Flight Training", "Academy Orbit"];
const SFX = ["Lift-off!", "Boost!", "Orbit!"];

const STAGES = [...education].reverse().map((e, i) => {
  const [score, ...rest] = e.detail.split(" · ");
  return { ...e, mission: MISSIONS[i], sfx: SFX[i], score, place: rest.join(" · ") };
});
type Stage = (typeof STAGES)[number];

/* ---------- flight path geometry ---------- */

// Stage coordinates are 1000 wide. The painting (2048 x 768) fills the bottom and SKY
// units of open sky sit above it for the top of the climb.
const VB_W = 1000;
const SKY = 130;
const VB_H = SKY + (VB_W * 768) / 2048; // 505
type Pt = [number, number];

// The flight weaves past the planets instead of crossing them: it rests just above the
// home world, dips under the training moon, climbs through the gap between the moon and
// its card, passes over the academy world, then runs on to the citadel's tallest spire.
// Stops are crests or troughs (level tangent), so the ship sits level while it waits;
// the climb has a waypoint in the gap so the curve stays clear of both.
const SEGS: [Pt, Pt, Pt, Pt][] = [
  [[95, 294], [165, 294], [205, 327], [275, 327]],
  [[275, 327], [330, 327], [352, 285], [357, 245]],
  [[357, 245], [365, 175], [410, 73], [490, 73]],
  [[490, 73], [580, 73], [700, 98], [775, 120]],
];
// segment where each stop begins (above the home world, under the moon, over the academy world)
const STOP_SEG = [0, 1, 3];
const segD = (s: [Pt, Pt, Pt, Pt]) => `M${s[0].join(" ")} C${s[1].join(" ")} ${s[2].join(" ")} ${s[3].join(" ")}`;
const PATH_D = SEGS.map((s, i) => (i ? `C${s[1].join(" ")} ${s[2].join(" ")} ${s[3].join(" ")}` : segD(s))).join(" ");

const STEPS = 120;
const bez = (s: [Pt, Pt, Pt, Pt], t: number): Pt => {
  const m = 1 - t;
  const a = m * m * m;
  const b = 3 * m * m * t;
  const c = 3 * m * t * t;
  const d = t * t * t;
  return [a * s[0][0] + b * s[1][0] + c * s[2][0] + d * s[3][0], a * s[0][1] + b * s[1][1] + c * s[2][1] + d * s[3][1]];
};
// arc-length table, so scroll progress maps to distance travelled rather than curve time
const LUT: { x: number; y: number; len: number }[] = [];
SEGS.forEach((s, si) => {
  for (let k = si ? 1 : 0; k <= STEPS; k++) {
    const [x, y] = bez(s, k / STEPS);
    const prev = LUT[LUT.length - 1];
    LUT.push({ x, y, len: prev ? prev.len + Math.hypot(x - prev.x, y - prev.y) : 0 });
  }
});
const TOTAL = LUT[LUT.length - 1].len;
// where each stop sits along the path (the citadel is 1), and which stop each segment leaves from
const STOP_AT = STOP_SEG.map((si) => LUT[si * STEPS].len / TOTAL);
const SEG_STOP = SEGS.map((_, si) => STOP_SEG.filter((x) => x <= si).length - 1);

function pointAt(p: number) {
  const target = Math.min(1, Math.max(0, p)) * TOTAL;
  let lo = 0;
  let hi = LUT.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (LUT[mid].len < target) lo = mid + 1;
    else hi = mid;
  }
  const b = LUT[lo];
  const a = LUT[Math.max(0, lo - 1)];
  const f = lo === 0 ? 0 : (target - a.len) / (b.len - a.len || 1);
  // heading from a short window around the point, so the nose turns smoothly
  const i0 = Math.max(0, lo - 3);
  const i1 = Math.min(LUT.length - 1, lo + 3);
  return {
    x: a.x + (b.x - a.x) * f,
    y: a.y + (b.y - a.y) * f,
    ang: (Math.atan2(LUT[i1].y - LUT[i0].y, LUT[i1].x - LUT[i0].x) * 180) / Math.PI,
  };
}

const pct = (v: number) => `${(v * 100).toFixed(3)}%`;
// the ship sprite's nose sits about 6 degrees above its tail
const SHIP_TILT = 6.4;
const SHIP_W = 7.2; // cqw

// planets (width in cqw) a clear gap from each stop, and their cards, in stage units;
// the reticle around each planet is 1.5x its body
const NODES: { at: Pt; w: number; body: number }[] = [
  { at: [95, 375], w: 6.6, body: 6.6 },
  { at: [275, 250], w: 6, body: 6 },
  { at: [490, 150], w: 10.5, body: 6 },
];
// every card sits below and to the right of its planet
const CARDS: Pt[] = [
  [165, 360],
  [395, 260],
  [595, 150],
];
const CARD_W = 17.5; // cqw
// sound-effect bursts (centres), clear of the ship's stop and the path out of it
const SFX_AT: Pt[] = [
  [45, 230],
  [195, 190],
  [405, 50],
];
// waypoint markers on the path at each stop, with a dotted tether to the planet's reticle
const WAYPOINTS = STOP_SEG.map((si, i) => {
  const [sx, sy] = SEGS[si][0];
  const [px, py] = NODES[i].at;
  const r = (NODES[i].body * 1.5 * 10) / 2;
  const len = Math.hypot(px - sx, py - sy);
  const ux = (px - sx) / len;
  const uy = (py - sy) / len;
  const f = (v: number) => Math.round(v * 10) / 10;
  return { x: sx, y: sy, tether: [f(sx + ux * 9), f(sy + uy * 9), f(px - ux * (r + 3)), f(py - uy * (r + 3))] };
});
const SPIRE = { x: 83.4, y: 0.65 }; // tallest spire tip, percent of the painting
// bright stars painted into the sky (percent of the painting) that get a twinkle
const PAINTED_STARS: Pt[] = [
  [3.3, 8.2],
  [7, 13.1],
  [26, 11.7],
  [75.2, 13.3],
];
// a few more in the open sky above the painting (stage units)
const SKY_STARS: Pt[] = [
  [40, 18],
  [190, 40],
  [330, 12],
  [610, 22],
  [905, 30],
  [70, 105],
  [250, 110],
  [660, 140],
];

/* ---------- small pieces ---------- */

// Counts the first number in a score line up from zero ("CGPA: 8.32 / 10", "92.5%"),
// keeping the text around it; renders the final text before it runs.
function Score({ text, run }: { text: string; run: boolean }) {
  const m = text.match(/\d+(?:\.(\d+))?/);
  const to = m ? parseFloat(m[0]) : NaN;
  const dec = m?.[1]?.length ?? 0;
  const head = m ? text.slice(0, m.index) : text;
  const tail = m ? text.slice((m.index ?? 0) + m[0].length) : "";
  const [v, setV] = useState(to);
  const started = useRef(false);
  useEffect(() => {
    if (!run) {
      started.current = false;
      return;
    }
    if (Number.isNaN(to) || started.current) return;
    started.current = true;
    let raf = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / 1100);
      setV(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    setV(0);
    raf = requestAnimationFrame(step);
  }, [run, to]);
  if (Number.isNaN(to)) return <>{text}</>;
  return (
    <>
      {head}
      {v.toFixed(dec)}
      {tail}
    </>
  );
}

function Sparkle({ style, delay }: { style: CSSProperties; delay: number }) {
  return (
    <svg viewBox="-10 -10 20 20" className="ac-sparkle absolute h-[1.1cqw] w-[1.1cqw] -translate-x-1/2 -translate-y-1/2" style={{ ...style, animationDelay: `${delay}s` }} aria-hidden>
      <path d="M0 -10 L1.6 -1.6 L10 0 L1.6 1.6 L0 10 L-1.6 1.6 L-10 0 L-1.6 -1.6 Z" fill="#f3f1ea" />
    </svg>
  );
}

// Fallback training moon, drawn in ink: craters, halftone on the shadow side, sticker outline.
function Moon() {
  const id = useId().replace(/:/g, "");
  const craters: [number, number, number][] = [
    [-18, -14, 9],
    [14, -24, 5],
    [20, 6, 11],
    [-6, 22, 7],
    [-28, 10, 5],
    [4, -4, 4],
  ];
  return (
    <svg viewBox="-60 -60 120 120" className="h-full w-full overflow-visible" aria-hidden>
      <defs>
        <radialGradient id={`${id}g`} cx="68%" cy="30%" r="80%">
          <stop offset="0" stopColor="#f3f1ea" />
          <stop offset="0.5" stopColor="#a9a69e" />
          <stop offset="1" stopColor="#2a2a2f" />
        </radialGradient>
        <radialGradient id={`${id}s`} cx="20%" cy="82%" r="75%">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.7" stopColor="#fff" stopOpacity="0.6" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <pattern id={`${id}d`} width="4" height="4" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="0.95" fill="#0a0a0c" />
        </pattern>
        <mask id={`${id}m`}>
          <rect x="-60" y="-60" width="120" height="120" fill={`url(#${id}s)`} />
        </mask>
        <clipPath id={`${id}c`}>
          <circle r="50" />
        </clipPath>
      </defs>
      <circle r="55" fill="#f3f1ea" />
      <circle r="52" fill="#0a0a0c" />
      <g clipPath={`url(#${id}c)`}>
        <circle r="50" fill={`url(#${id}g)`} />
        {craters.map(([x, y, r]) => (
          <g key={`${x},${y}`}>
            <ellipse cx={x} cy={y} rx={r} ry={r * 0.86} fill="rgba(10,10,12,0.32)" stroke="#0a0a0c" strokeWidth="1.3" />
            <path d={`M ${x - r * 0.7} ${y + r * 0.55} A ${r} ${r * 0.86} 0 0 0 ${x + r * 0.85} ${y + r * 0.2}`} fill="none" stroke="#f3f1ea" strokeWidth="1.1" opacity="0.8" />
          </g>
        ))}
        <rect x="-60" y="-60" width="120" height="120" fill={`url(#${id}d)`} mask={`url(#${id}m)`} />
      </g>
    </svg>
  );
}

function Planet({ i, src }: { i: number; src?: string }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className="relative block h-auto w-full drop-shadow-[0_0_10px_rgba(243,241,234,0.25)]" />;
  }
  return (
    <div className="relative aspect-square w-full">
      <Moon key={i} />
    </div>
  );
}

// Targeting reticle around a planet: dashed ring spins while searching; on lock the
// corner brackets snap in and the ring stops.
function Reticle({ locked, ping, size }: { locked: boolean; ping: boolean; size: string }) {
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 aspect-square -translate-x-1/2 -translate-y-1/2" style={{ width: size }} aria-hidden>
      {ping && <span className="pin-ping absolute inset-[14%] rounded-full border-2 border-paper/70" />}
      <svg viewBox="-60 -60 120 120" className="absolute inset-0 h-full w-full overflow-visible">
        <g className="ac-spin" style={{ animationPlayState: locked ? "paused" : "running" }}>
          <circle r="54" fill="none" stroke="rgba(243,241,234,0.6)" strokeWidth="1.5" strokeDasharray="5 6" />
        </g>
        <g
          style={{
            transform: locked ? "scale(1)" : "scale(1.22)",
            opacity: locked ? 1 : 0.4,
            transition: "transform 0.5s cubic-bezier(0.2, 1.6, 0.4, 1), opacity 0.4s ease",
          }}
        >
          {[0, 90, 180, 270].map((a) => (
            <g key={a} transform={`rotate(${a})`}>
              <path d="M -47 -31 L -47 -47 L -31 -47" stroke="#f3f1ea" strokeWidth="3" fill="none" />
              <line x1="0" y1="-62" x2="0" y2="-53" stroke="#f3f1ea" strokeWidth="2" />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}

function MissionCard({
  s,
  i,
  shown,
  stamp,
  lit,
}: {
  s: Stage;
  i: number;
  shown: boolean;
  stamp?: boolean;
  lit?: boolean;
}) {
  const ScoreIcon = i === 2 ? GraduationCap : BookOpen;
  return (
    <motion.article
      initial={false}
      animate={shown ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 14, scale: 0.96 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`ac-card relative border-2 bg-ink/90 p-[0.95em] backdrop-blur-[2px] transition-[border-color,box-shadow] duration-300 ${
        lit ? "border-paper shadow-[5px_5px_0_#f3f1ea]" : "border-paper/80 shadow-[4px_4px_0_#8c8a84]"
      }`}
    >
      {/* HUD corner ticks */}
      <span aria-hidden className="absolute -left-[3px] -top-[3px] h-2 w-2 bg-paper" />
      <span aria-hidden className="absolute -bottom-[3px] -right-[3px] h-2 w-2 bg-paper" />

      <div className="flex items-center gap-[0.5em]">
        <motion.span
          initial={false}
          animate={shown ? { scale: 1, rotate: -2 } : { scale: 1.7, rotate: -10 }}
          transition={{ type: "spring", stiffness: 420, damping: 16, delay: shown ? 0.15 : 0 }}
          className="inline-block bg-paper px-[0.45em] py-[0.1em] font-mono text-[0.72em] font-bold uppercase tracking-[0.14em] text-ink"
        >
          Mission {String(i + 1).padStart(2, "0")}
        </motion.span>
        <span aria-hidden className="h-px flex-1 bg-paper/30" />
      </div>

      <h3 className="mt-[0.45em] font-display text-[1.85em] uppercase leading-[0.95] tracking-[0.02em] text-paper [text-shadow:2px_2px_0_#8c8a84]">
        {s.mission}
      </h3>
      <p className="mt-[0.5em] font-mono text-[0.8em] font-semibold uppercase leading-snug tracking-[0.05em] text-paper">{s.degree}</p>
      <p className="mt-[0.2em] font-hand text-[0.95em] leading-snug text-paper/75">{s.institution}</p>

      <div className="mt-[0.6em] grid gap-[0.3em] border-t border-paper/25 pt-[0.55em] font-mono text-[0.8em] text-paper/90">
        <span className="flex flex-wrap items-center gap-x-[1.1em] gap-y-[0.3em]">
          <span className="inline-flex items-center gap-[0.55em] whitespace-nowrap font-semibold text-paper">
            <ScoreIcon className="h-[1.15em] w-[1.15em] shrink-0" aria-hidden />
            <Score text={s.score} run={shown} />
          </span>
          <span className="inline-flex items-center gap-[0.45em] whitespace-nowrap">
            <CalendarDays className="h-[1.05em] w-[1.05em] shrink-0" aria-hidden />
            {s.period}
          </span>
        </span>
        <span className="flex items-center gap-[0.55em] text-paper/70">
          <MapPin className="h-[1.15em] w-[1.15em] shrink-0" aria-hidden />
          {s.place}
        </span>
      </div>

      {stamp !== undefined && (
        <motion.span
          initial={false}
          animate={stamp ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 2.2 }}
          transition={{ type: "spring", stiffness: 380, damping: 15 }}
          className="seal pointer-events-none absolute -right-[0.9em] -top-[1.1em] !text-[0.78em]"
          aria-hidden={!stamp}
        >
          Class of {s.period.slice(-4)}
        </motion.span>
      )}
    </motion.article>
  );
}

/* ---------- desktop: the panorama ---------- */

function Ascent({ art }: { art: AcademyArt }) {
  const stage = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const maskId = useId().replace(/:/g, "") + "trail";

  // the painting drifts a little slower than the path as the page scrolls
  const { scrollYProgress: pass } = useScroll({ target: stage, offset: ["start end", "end start"] });
  const drift = useTransform(pass, [0, 1], ["-1.5%", "1.5%"]);

  // distance flown along the path, 0..1
  const prog = useMotionValue(0);
  const shipLeft = useTransform(prog, (v) => pct(pointAt(v).x / VB_W));
  const shipTop = useTransform(prog, (v) => pct(pointAt(v).y / VB_H));
  const shipRot = useTransform(prog, (v) => +(pointAt(v).ang + SHIP_TILT).toFixed(2));

  // shown: planets on screen; reached: planets locked (cards in), 4 = docked
  const [shown, setShown] = useState(0);
  const [reached, setReached] = useState(0);
  const [hover, setHover] = useState<number | null>(null);

  // play once most of the panorama is on screen; reset only after it has fully left
  const ready = useInView(stage, { amount: 0.7 });
  const present = useInView(stage);
  const run = useRef(0);
  const playing = useRef(false);
  const flight = useRef<ReturnType<typeof animate> | null>(null);

  useEffect(() => {
    if (reduced || present) return;
    run.current += 1;
    playing.current = false;
    flight.current?.stop();
    prog.set(0);
    setShown(0);
    setReached(0);
  }, [present, reduced, prog]);

  useEffect(() => {
    if (reduced) {
      prog.set(1);
      setShown(3);
      setReached(4);
      return;
    }
    if (!ready || playing.current) return;
    playing.current = true;
    const id = ++run.current;
    const live = () => run.current === id;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    (async () => {
      await wait(250);
      if (!live()) return;
      setShown(1); // home world appears with the ship on it
      await wait(500);
      if (!live()) return;
      setReached(1); // lift-off: lock, first card
      for (let i = 1; i <= 3; i++) {
        await wait(900);
        if (!live()) return;
        const leg = [0, 1.4, 1.9, 1.3][i];
        // the next planet materialises as the ship closes in
        if (i < 3) setTimeout(() => live() && setShown(i + 1), leg * 550);
        flight.current = animate(prog, i < 3 ? STOP_AT[i] : 1, { duration: leg, ease: [0.45, 0, 0.2, 1] });
        await flight.current;
        if (!live()) return;
        setReached(i + 1);
      }
    })();
  }, [ready, reduced, prog]);

  const end = pointAt(1);
  const docked = reached >= 4;

  return (
    <div
      ref={stage}
      className="relative mx-auto hidden w-full max-w-[1680px] [container-type:inline-size] xl:block"
      style={{ aspectRatio: `${VB_W} / ${VB_H}` }}
    >
      {/* the painting, faded into the page on every edge; it drifts a little slower than the path */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0"
        style={{
          top: pct(SKY / VB_H),
          maskImage:
            "linear-gradient(to bottom, transparent, #000 12%, #000 86%, transparent), linear-gradient(to right, transparent, #000 4%, #000 96%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent, #000 12%, #000 86%, transparent), linear-gradient(to right, transparent, #000 4%, #000 96%, transparent)",
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
        }}
      >
        <motion.div className="absolute inset-0" style={{ y: reduced ? 0 : drift }}>
          {/* solid ink under the dimmed painting, so page stars never show through it */}
          <div className="absolute inset-0 bg-ink" />
          {art.backdrop && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={art.backdrop}
              alt="Comic panorama: hometown cliffs on the left, a domed school in the valley, and an orbital academy citadel on the right"
              className="absolute inset-0 h-full w-full object-cover opacity-50"
            />
          )}
        </motion.div>
      </div>
      {/* twinkles on the painted stars and the docking beacon, riding the painting's drift */}
      <motion.div className="pointer-events-none absolute inset-x-0 bottom-0" style={{ top: pct(SKY / VB_H), y: reduced ? 0 : drift }} aria-hidden>
        {PAINTED_STARS.map(([x, y], k) => (
          <Sparkle key={k} delay={k * 0.9} style={{ left: `${x}%`, top: `${y}%` }} />
        ))}
        <span className="absolute" style={{ left: `${SPIRE.x}%`, top: `${SPIRE.y + 1.2}%` }}>
          <span className={`absolute left-0 top-0 block h-[0.6cqw] w-[0.6cqw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-paper shadow-[0_0_10px_3px_rgba(243,241,234,0.8)] transition-opacity duration-500 ${docked ? "tele-led" : "opacity-0"}`} />
          {docked && <span className="pin-ping absolute -left-[1.1cqw] -top-[1.1cqw] h-[2.2cqw] w-[2.2cqw] rounded-full border-2 border-paper" />}
        </span>
      </motion.div>

      {SKY_STARS.map(([x, y], k) => (
        <Sparkle key={k} delay={0.4 + k * 0.7} style={{ left: pct(x / VB_W), top: pct(y / VB_H) }} />
      ))}

      {/* far traffic crossing the top of the sky */}
      {art.ship && !reduced && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={art.ship} alt="" aria-hidden className="ac-traffic pointer-events-none absolute w-[2.6cqw] opacity-40" style={{ top: pct(4 / VB_H) }} />
      )}

      <p className="note absolute !text-[1.1cqw]" style={{ left: "81.5%", top: pct(20 / VB_H) }}>
        The path that shaped my orbit.
      </p>

      {/* flight path: faint route ahead, inked dashes behind the ship */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="none" aria-hidden>
        <defs>
          <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width={VB_W} height={VB_H}>
            <motion.path d={PATH_D} fill="none" stroke="#fff" strokeWidth="14" style={{ pathLength: reduced ? 1 : prog }} />
          </mask>
        </defs>
        <path d={PATH_D} fill="none" stroke="rgba(243,241,234,0.35)" strokeWidth="1.5" strokeDasharray="1 7" strokeLinecap="round" />
        <path
          d={PATH_D}
          fill="none"
          stroke="#f3f1ea"
          strokeWidth="2.4"
          strokeDasharray="10 7"
          strokeLinecap="round"
          mask={`url(#${maskId})`}
          style={{ filter: "drop-shadow(0 0 3px rgba(243,241,234,0.65))" }}
        />
        {SEGS.map((s, i) => (
          <path
            key={i}
            d={segD(s)}
            fill="none"
            stroke="#f3f1ea"
            strokeWidth="3.4"
            strokeLinecap="round"
            className="transition-opacity duration-300"
            style={{ opacity: hover === SEG_STOP[i] && reached > SEG_STOP[i] ? 1 : 0, filter: "drop-shadow(0 0 5px rgba(243,241,234,0.9))" }}
          />
        ))}
        {WAYPOINTS.map((w, i) => {
          const on = reached > i;
          return (
            <g key={i} className="transition-opacity duration-500" style={{ opacity: shown > i ? 1 : 0 }}>
              <line
                x1={w.tether[0]}
                y1={w.tether[1]}
                x2={w.tether[2]}
                y2={w.tether[3]}
                stroke="#f3f1ea"
                strokeWidth="1.4"
                strokeDasharray="2 3.5"
                strokeLinecap="round"
                opacity={on ? 0.85 : 0.4}
              />
              {on && reached === i + 1 && <circle cx={w.x} cy={w.y} r="7" fill="none" stroke="#f3f1ea" strokeWidth="1.5" className="chart-ping" />}
              <circle cx={w.x} cy={w.y} r="6.5" fill="#0a0a0c" stroke="#f3f1ea" strokeWidth="2" />
              <circle cx={w.x} cy={w.y} r="2.6" fill="#f3f1ea" style={{ opacity: on ? 1 : 0.25 }} className="transition-opacity duration-300" />
            </g>
          );
        })}
      </svg>

      {/* planets with their reticles and sound effects */}
      {NODES.map((n, i) => {
        const locked = reached > i;
        const current = reached === i + 1;
        return (
          <div key={i} className="absolute" style={{ left: pct(n.at[0] / VB_W), top: pct(n.at[1] / VB_H), width: `${n.w}cqw` }}>
            <div
              className={`relative -translate-x-1/2 -translate-y-1/2 transition-[transform,filter] duration-300 ${
                hover === i ? "scale-110 drop-shadow-[0_0_14px_rgba(243,241,234,0.7)]" : ""
              }`}
            >
              <motion.div
                className="relative"
                initial={false}
                animate={shown > i ? { scale: 1, opacity: 1, rotate: 0 } : { scale: 0.25, opacity: 0, rotate: -25 }}
                transition={{ type: "spring", stiffness: 240, damping: 17 }}
              >
                <Reticle locked={locked} ping={current && !docked} size={`${n.body * 1.5}cqw`} />
                <Planet i={i} src={art.planets[i]} />
              </motion.div>
            </div>
          </div>
        );
      })}

      {/* sound effects pop as each stop is reached */}
      {!reduced &&
        SFX_AT.map(([x, y], i) =>
          reached > i ? (
            <span
              key={i}
              className="pointer-events-none absolute z-30 h-[6.2cqw] w-[6.2cqw] -translate-x-1/2 -translate-y-1/2"
              style={{ left: pct(x / VB_W), top: pct(y / VB_H) }}
              aria-hidden
            >
              <span className="ac-sfx burst h-full w-full text-[1.05cqw]">{STAGES[i].sfx}</span>
            </span>
          ) : null
        )}

      {/* mission cards */}
      {STAGES.map((s, i) => (
        <div
          key={s.degree}
          className="absolute z-10"
          style={{ left: pct(CARDS[i][0] / VB_W), top: pct(CARDS[i][1] / VB_H), width: `${CARD_W}cqw`, fontSize: "clamp(13px, 0.95cqw, 16px)" }}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(null)}
        >
          <MissionCard s={s} i={i} shown={reached > i} lit={hover === i} stamp={i === 2 ? docked : undefined} />
        </div>
      ))}

      {/* the ship */}
      <motion.div
        className="pointer-events-none absolute z-20"
        initial={false}
        animate={{ opacity: shown > 0 ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        style={{
          left: reduced ? pct(end.x / VB_W) : shipLeft,
          top: reduced ? pct(end.y / VB_H) : shipTop,
          width: `${SHIP_W}cqw`,
          rotate: reduced ? end.ang + SHIP_TILT : shipRot,
          x: "-50%",
          y: "-50%",
        }}
        aria-hidden
      >
        <div className="ac-bob">
          {art.ship ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={art.ship} alt="" className="block h-auto w-full drop-shadow-[0_0_8px_rgba(243,241,234,0.35)]" />
          ) : (
            <svg viewBox="0 0 100 40" className="w-full">
              <path d="M2 20 L70 8 L98 20 L70 32 Z" fill="#f3f1ea" stroke="#0a0a0c" strokeWidth="2" />
            </svg>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/* ---------- below xl: banner + vertical flight line ---------- */

function MobileStage({ s, i, art, active, onSeen, nodeRef }: {
  s: Stage;
  i: number;
  art: AcademyArt;
  active: number;
  onSeen: (i: number) => void;
  nodeRef: (el: HTMLLIElement | null) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { margin: "0px 0px -30% 0px" });
  useEffect(() => {
    if (seen) onSeen(i);
  }, [seen, i, onSeen]);
  const locked = active >= i;
  return (
    <li ref={nodeRef} className="relative mb-10 last:mb-0">
      <div className="absolute -left-[64px] top-1 w-[52px] sm:-left-[84px] sm:w-[64px]">
        <motion.div
          className="relative"
          initial={false}
          animate={seen ? { scale: 1, opacity: 1, rotate: 0 } : { scale: 0.25, opacity: 0, rotate: -25 }}
          transition={{ type: "spring", stiffness: 240, damping: 17 }}
        >
          <Reticle locked={locked && seen} ping={active === i} size="150%" />
          <Planet i={i} src={art.planets[i]} />
        </motion.div>
      </div>
      <div ref={ref} className="text-[14px] sm:text-[15px]">
        <MissionCard s={s} i={i} shown={seen} stamp={i === 2 ? seen : undefined} />
      </div>
    </li>
  );
}

function AscentList({ art }: { art: AcademyArt }) {
  const items = useRef<(HTMLLIElement | null)[]>([]);
  const [active, setActive] = useState(-1);
  const [tops, setTops] = useState<number[]>([]);
  useEffect(() => {
    const measure = () => setTops(items.current.map((el) => (el ? el.offsetTop : 0)));
    measure();
    const ro = new ResizeObserver(measure);
    items.current.forEach((el) => el && ro.observe(el));
    return () => ro.disconnect();
  }, []);
  const onSeen = useRef((i: number) => setActive(i)).current;
  const list = useRef<HTMLOListElement>(null);
  const present = useInView(list);
  useEffect(() => {
    if (!present) setActive(-1);
  }, [present]);
  // the ship waits above the first planet, then flies to sit under the card that came into view last
  const shipTop = active < 0 || !tops.length ? 8 : tops[active] + 84;

  return (
    <div className="xl:hidden">
      {art.backdrop && (
        <div className="relative mb-12 overflow-hidden border-2 border-paper/70 bg-ink" style={{ aspectRatio: "2048 / 768" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={art.backdrop}
            alt="Comic panorama: hometown cliffs on the left, a domed school in the valley, and an orbital academy citadel on the right"
            className="absolute inset-0 h-full w-full object-cover opacity-50"
          />
          <p className="note absolute left-3 top-2 !text-xs sm:left-4 sm:top-3 sm:!text-sm">The path that shaped my orbit.</p>
        </div>
      )}
      <ol ref={list} className="relative pl-[64px] sm:pl-[84px]">
        <span aria-hidden className="absolute bottom-4 left-[26px] top-4 border-l-2 border-dashed border-paper/35 sm:left-[32px]" />
        {art.ship && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={art.ship}
            alt=""
            aria-hidden
            className="pointer-events-none absolute left-[27px] z-10 w-[64px] transition-[top] duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] sm:left-[33px]"
            style={{ top: shipTop, transform: `translate(-50%, -50%) rotate(${90 + SHIP_TILT}deg)` }}
          />
        )}
        {STAGES.map((s, i) => (
          <MobileStage key={s.degree} s={s} i={i} art={art} active={active} onSeen={onSeen} nodeRef={(el) => (items.current[i] = el)} />
        ))}
      </ol>
    </div>
  );
}

/* ---------- section ---------- */

export default function Education({ art }: { art: AcademyArt }) {
  return (
    <section id="education" className="relative overflow-x-clip py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading index="Log 04 · Academy Record" title="Academic Journey" subtitle="The path that brought me here." />
        <AscentList art={art} />
      </div>
      <Ascent art={art} />
    </section>
  );
}
