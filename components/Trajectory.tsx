"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { Code2, Flag, PenLine, Users } from "lucide-react";
import { education } from "@/data/education";
import { involvement, type Role } from "@/data/involvement";

// Zig-zag flight chart for Crafted in Code & Content. Stops alternate left and
// right down the section; a dashed route swings through the open side between
// them and draws itself as you scroll, the ship riding along it. Each stop is a
// comic panel with a year stamp. The club, editorial and tech roles at IIIT
// Nagpur are the heart of it, one panel per organisation; Hyderabad and the
// station are brief waypoints that point to the Experience log.

export type StopId = "ghaziabad" | "nagpur" | "hyderabad" | "aecad";
export type StopArt = Partial<Record<StopId, string>>;
export type YearArt = Partial<Record<"2022" | "2023" | "2024" | "2025" | "2026", string>>;

type Panel = {
  key: string;
  stamp: string;
  kicker: string;
  title: string;
  subtitle?: string;
  roles?: Role[];
  tags?: string[];
  note?: string;
  artKey?: StopId;
};

const kindIcon: Record<string, typeof Code2> = { Content: PenLine, Tech: Code2, Leadership: Users };

/* ---------- group the Nagpur roles by organisation ---------- */

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
function parsePeriod(p: string) {
  const parts = p.split(/\s*[–-]\s*/);
  const read = (s: string) => {
    const m = s.trim().toLowerCase().match(/([a-z]{3})\w*\s+(\d{4})/);
    return m ? { y: Number(m[2]), m: MONTHS.indexOf(m[1]) } : null;
  };
  return { start: read(parts[0]), end: read(parts[1] ?? parts[0]) };
}
function orgKey(org: string) {
  const o = org.toLowerCase();
  if (o.includes("crispr")) return "CRISPR IIIT Nagpur";
  if (o.includes("abhivyakti")) return "Abhivyakti, IIIT Nagpur";
  if (o.includes("estória") || o.includes("estoria")) return "Estória — Drama & Poetry Club";
  if (o.includes("udyam")) return "UDYAM — E-Cell";
  if (o.includes("skills nights")) return "Skills Nights — Elevate";
  if (o.includes("tantrafiesta")) return "TantraFiesta";
  return org;
}
function stampFor(roles: Role[]) {
  const ys = roles.flatMap((r) => {
    const { start, end } = parsePeriod(r.period);
    return [start?.y, end?.y].filter((y): y is number => typeof y === "number");
  });
  const a = Math.min(...ys);
  const b = Math.max(...ys);
  return a === b ? String(a) : `${a}–${String(b).slice(2)}`;
}
function groupRoles(): { org: string; roles: Role[]; first: number }[] {
  const map = new Map<string, Role[]>();
  involvement.forEach((r) => {
    const k = orgKey(r.org);
    map.set(k, [...(map.get(k) ?? []), r]);
  });
  const sortKey = (r: Role) => {
    const s = parsePeriod(r.period).start;
    return s ? s.y * 12 + s.m : 0;
  };
  return Array.from(map.entries())
    .map(([org, roles]) => ({ org, roles: [...roles].sort((a, b) => sortKey(a) - sortKey(b)), first: Math.min(...roles.map(sortKey)) }))
    .sort((a, b) => a.first - b.first);
}

const degree = education[0];

const PANELS: Panel[] = [
  ...groupRoles().map(
    (g, i): Panel => ({
      key: `org-${i}`,
      stamp: stampFor(g.roles),
      kicker: `Nagpur · ${degree.institution}`,
      title: g.org,
      roles: g.roles,
      artKey: i === 0 ? "nagpur" : undefined,
      note: i === 0 ? "same sky, different orbits, still home" : undefined,
    })
  ),
];

const YEARS: { year: keyof YearArt; title: string; caption: string }[] = [
  { year: "2022", title: "Launch", caption: "Stepped out. Packed a bag." },
  { year: "2023", title: "Exploration", caption: "Found new horizons." },
  { year: "2024", title: "Academy", caption: "Learned. Built. Created. Led." },
  { year: "2025", title: "Internship", caption: "Real-world problems. Bigger learning." },
  { year: "2026", title: "Current station", caption: "Building what's next." },
];

/* ---------- route geometry ---------- */

type Pt = { x: number; y: number };

function buildPath(pins: Pt[], wide: boolean) {
  if (pins.length < 2) return "";
  let d = `M ${pins[0].x} ${pins[0].y}`;
  for (let i = 1; i < pins.length; i++) {
    const p = pins[i - 1];
    const q = pins[i];
    const my = (p.y + q.y) / 2;
    const swing = (i % 2 ? 1 : -1) * (wide ? 70 : 46);
    d += ` C ${p.x + swing} ${my - 10} ${q.x + swing} ${my + 10} ${q.x} ${q.y}`;
  }
  return d;
}

// deterministic wobbly polygon for hatched terrain
function blob(cx: number, cy: number, r: number, seed: number) {
  const pts: string[] = [];
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const k = 0.72 + 0.28 * Math.abs(Math.sin(seed * 3.1 + i * 2.3));
    pts.push(`${(cx + Math.cos(a) * r * 1.4 * k).toFixed(1)},${(cy + Math.sin(a) * r * 0.6 * k).toFixed(1)}`);
  }
  return pts.join(" ");
}

function RouteLayer({
  pins,
  size,
  wide,
  progress,
  onActive,
}: {
  pins: Pt[];
  size: { w: number; h: number };
  wide: boolean;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  onActive: (i: number) => void;
}) {
  const pathRef = useRef<SVGPathElement>(null);
  const shipRef = useRef<SVGGElement>(null);
  const totalRef = useRef(0);
  const pinLensRef = useRef<number[]>([]);
  const lastIdxRef = useRef(-1);
  const [total, setTotal] = useState(0);
  const [ticks, setTicks] = useState<{ x: number; y: number; a: number }[]>([]);
  const reduced = useReducedMotion();
  const d = useMemo(() => buildPath(pins, wide), [pins, wide]);

  useEffect(() => {
    const p = pathRef.current;
    if (!p || pins.length < 2) return;
    const len = p.getTotalLength();
    totalRef.current = len;
    setTotal(len);
    const lens = pins.map((t) => {
      let best = 0;
      let bestD = Infinity;
      for (let i = 0; i <= 800; i++) {
        const l = (i / 800) * len;
        const pt = p.getPointAtLength(l);
        const dd = (pt.x - t.x) ** 2 + (pt.y - t.y) ** 2;
        if (dd < bestD) {
          bestD = dd;
          best = l;
        }
      }
      return best;
    });
    lens[0] = 0;
    lens[lens.length - 1] = len;
    pinLensRef.current = lens;
    const tk: { x: number; y: number; a: number }[] = [];
    for (let l = 60; l < len - 30; l += 110) {
      const a = p.getPointAtLength(l);
      const b = p.getPointAtLength(l + 1);
      tk.push({ x: a.x, y: a.y, a: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI });
    }
    setTicks(tk);
  }, [d, pins]);

  const smooth = useSpring(progress, { stiffness: 70, damping: 22, mass: 0.8 });
  const len = useTransform(smooth, (v) => (reduced ? totalRef.current : Math.max(0, Math.min(1, v)) * totalRef.current));
  const dashOffset = useTransform(len, (v) => Math.max(0, totalRef.current - v));

  useMotionValueEvent(len, "change", (v) => {
    const p = pathRef.current;
    const s = shipRef.current;
    if (!p || !s || totalRef.current === 0) return;
    const t = totalRef.current;
    const a = p.getPointAtLength(Math.max(0, Math.min(t, v)));
    const b = p.getPointAtLength(Math.max(0, Math.min(t, v + 2)));
    const ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
    s.setAttribute("transform", `translate(${a.x} ${a.y}) rotate(${ang})`);
    let idx = 0;
    pinLensRef.current.forEach((l, i) => {
      if (v + 8 >= l) idx = i;
    });
    // motion values can change during render; hand the state update to the next frame
    if (idx !== lastIdxRef.current) {
      lastIdxRef.current = idx;
      requestAnimationFrame(() => onActive(idx));
    }
  });

  if (pins.length < 2 || size.w === 0) return null;

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-0 overflow-visible"
      width={size.w}
      height={size.h}
      viewBox={`0 0 ${size.w} ${size.h}`}
      aria-hidden="true"
    >
      <defs>
        <pattern id="trail-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="7" stroke="#f3f1ea" strokeWidth="0.7" opacity="0.35" />
        </pattern>
        <pattern id="trail-grid" width="48" height="48" patternUnits="userSpaceOnUse">
          <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#f3f1ea" strokeWidth="0.5" opacity="0.1" />
        </pattern>
        <radialGradient id="trail-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#f3f1ea" stopOpacity="0.9" />
          <stop offset="1" stopColor="#f3f1ea" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* chart grid */}
      <rect x="0" y="0" width={size.w} height={size.h} fill="url(#trail-grid)" />

      {/* hatched terrain between stops, on the open side */}
      {pins.slice(1).map((q, i) => {
        const p = pins[i];
        const mx = (p.x + q.x) / 2 + (i % 2 ? -1 : 1) * (wide ? 90 : 0);
        const my = (p.y + q.y) / 2;
        return <polygon key={`t${i}`} points={blob(mx, my, 48 + (i % 3) * 14, i + 1)} fill="url(#trail-hatch)" stroke="#f3f1ea" strokeWidth="0.7" opacity="0.5" />;
      })}

      {/* contour rings around every stop */}
      {pins.map((p, i) => (
        <g key={`c${i}`} transform={`translate(${p.x} ${p.y})`} fill="none" stroke="#f3f1ea">
          <ellipse rx="34" ry="13" strokeWidth="0.8" opacity="0.28" />
          <ellipse rx="56" ry="22" strokeWidth="0.7" opacity="0.18" strokeDasharray="4 5" />
          <ellipse rx="80" ry="31" strokeWidth="0.6" opacity="0.1" />
        </g>
      ))}


      {/* faint full route, then the drawn part */}
      <path d={d} fill="none" stroke="#f3f1ea" strokeWidth="1.2" strokeDasharray="3 7" opacity="0.22" />
      <motion.path
        ref={pathRef}
        d={d}
        fill="none"
        stroke="#f3f1ea"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeDasharray={total || 1}
        style={{ strokeDashoffset: dashOffset }}
      />

      {/* mile ticks */}
      <g stroke="#f3f1ea" strokeWidth="1.2" opacity="0.5">
        {ticks.map((t, i) => (
          <line key={i} x1="0" y1="-5" x2="0" y2="5" transform={`translate(${t.x} ${t.y}) rotate(${t.a})`} />
        ))}
      </g>

      {/* glow halos at stops */}
      {pins.map((p, i) => (
        <circle key={`g${i}`} cx={p.x} cy={p.y} r="22" fill="url(#trail-glow)" opacity="0.35" />
      ))}

      {/* the ship */}
      <g ref={shipRef} transform={`translate(${pins[0].x} ${pins[0].y})`}>
        <polygon points="16,0 -9,-8 -3,0 -9,8" fill="#f3f1ea" stroke="#0a0a0c" strokeWidth="1.3" strokeLinejoin="round" />
        <line x1="-9" y1="0" x2="-24" y2="0" stroke="#f3f1ea" strokeWidth="1.6" opacity="0.6" />
      </g>

      {/* compass rose, top-right; scale bar, bottom-left */}
      <g transform={`translate(${size.w - 46} 44)`} stroke="#f3f1ea" fill="none" strokeWidth="1">
        <circle r="22" opacity="0.6" />
        <circle r="3" opacity="0.6" />
        <polygon points="0,-20 5,0 0,20 -5,0" fill="#f3f1ea" stroke="none" />
        <polygon points="-20,0 0,-5 20,0 0,5" fill="#f3f1ea" stroke="none" opacity="0.5" />
        <text y="-27" textAnchor="middle" fill="#f3f1ea" fontSize="9" fontFamily="var(--font-mono), monospace" stroke="none">N</text>
      </g>
      <g transform={`translate(8 ${size.h - 14})`} stroke="#f3f1ea" strokeWidth="1.5">
        <line x1="0" y1="0" x2="72" y2="0" />
        <line x1="0" y1="-4" x2="0" y2="4" />
        <line x1="36" y1="-3" x2="36" y2="3" />
        <line x1="72" y1="-4" x2="72" y2="4" />
        <text x="78" y="3" fill="#f3f1ea" fontSize="9" fontFamily="var(--font-mono), monospace" stroke="none" letterSpacing="1">
          1 SEMESTER
        </text>
      </g>
    </svg>
  );
}

/* ---------- panels ---------- */

function StopPanel({
  panel,
  index,
  side,
  art,
  reached,
  current,
}: {
  panel: Panel;
  index: number;
  side: "left" | "right";
  art?: string;
  reached: boolean;
  current: boolean;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, scale: 0.94, rotate: side === "left" ? -1.5 : 1.5 }}
      whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
      viewport={{ once: true, margin: "-80px 0px -80px 0px" }}
      transition={{ type: "spring", stiffness: 160, damping: 18 }}
      className="panel panel-hover relative p-6 sm:p-7"
    >
      {/* waypoint pin on the edge facing the route */}
      <span
        data-pin={index}
        aria-hidden="true"
        className={`absolute top-9 z-20 grid h-9 w-9 place-items-center rounded-full border-2 border-paper bg-ink ${
          side === "left" ? "-left-[18px] md:left-auto md:-right-[18px]" : "-left-[18px]"
        }`}
      >
        {current && <span className="pin-ping absolute inset-0 rounded-full border-2 border-paper" />}
        <span className={`h-3 w-3 rounded-full ${reached ? "bg-paper" : "border border-paper bg-ink"}`} />
      </span>

      <motion.span
        aria-hidden="true"
        initial={{ scale: 0, rotate: -28 }}
        whileInView={{ scale: 1, rotate: -6 }}
        viewport={{ once: true, margin: "-80px 0px -80px 0px" }}
        transition={{ type: "spring", stiffness: 300, damping: 14, delay: 0.25 }}
        className={`caption absolute -top-4 z-20 !px-3 !py-1 !text-base ${side === "left" ? "left-6" : "right-6"}`}
      >
        {panel.stamp}
      </motion.span>


      <div className="min-w-0">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-paper/60">{panel.kicker}</span>
        <h3 className="mt-2 font-display text-2xl tracking-wide text-paper sm:text-3xl">{panel.title}</h3>
        {panel.subtitle && <p className="mt-1 font-hand text-base text-paper/80">{panel.subtitle}</p>}
        {panel.tags && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {panel.tags.map((t) => (
              <span key={t} className="tag">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* art shows inside the panel on phones only; on wider screens it sits beside the route */}
      {art && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={art} alt="" aria-hidden="true" className="mt-4 w-full max-w-[220px] md:hidden" />
      )}

      {panel.roles && (
        <ul className="mt-5 grid gap-3">
          {panel.roles.map((r, i) => {
            const Icon = kindIcon[r.kind] ?? Code2;
            return (
              <li key={`${r.title}-${i}`} className="flex items-start gap-3">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center border-2 border-paper bg-paper text-ink">
                  <Icon size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <span className="font-display text-lg tracking-wide text-paper">{r.title}</span>
                    <span className="font-mono text-[11px] text-paper/50">{r.period}</span>
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2">
                    <span className="font-hand text-sm text-paper/70">{r.org}</span>
                    <span className="tag !text-[9px]">{r.kind}</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {panel.note && <p className="note mt-5 !text-sm md:hidden">{panel.note}</p>}
    </motion.article>
  );
}

/** The open side beside a panel: the stop's art, or a big hollow year with a flag marker. */
function Landmark({ panel, art, side }: { panel: Panel; art?: string; side: "left" | "right" }) {
  return (
    <div className={`relative hidden min-h-[200px] items-center md:flex ${side === "left" ? "justify-start pl-10" : "justify-end pr-10"}`}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px 0px -80px 0px" }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="relative z-10 flex flex-col items-center gap-3"
      >
        {art ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={art} alt="" aria-hidden="true" className="animate-float w-[min(100%,300px)] drop-shadow-[0_0_22px_rgba(243,241,234,0.28)]" />
        ) : (
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 place-items-center border-2 border-paper bg-ink text-paper">
              <Flag size={20} />
            </span>
            <span className="title-hollow text-[clamp(56px,7vw,96px)] opacity-80">{panel.stamp}</span>
          </div>
        )}
        {panel.note && <p className="note max-w-[220px] text-center !text-sm">{panel.note}</p>}
      </motion.div>
    </div>
  );
}

/* ---------- year strip ---------- */

function YearStrip({ art }: { art: YearArt }) {
  return (
    <div className="mt-16">
      <span className="caption-ink">Mission years</span>
      <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {YEARS.map((y, i) => (
          <motion.div
            key={y.year}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px 0px -60px 0px" }}
            transition={{ duration: 0.45, delay: i * 0.08 }}
            className="panel-thin relative flex flex-col overflow-hidden"
          >
            <div className="relative aspect-[4/3] border-b border-paper/40 bg-ink p-3">
              {art[y.year] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={art[y.year]} alt={`${y.year}: ${y.title}`} loading="lazy" className="h-full w-full object-contain" />
              ) : (
                <div className="halftone h-full w-full opacity-40" />
              )}
              <motion.span
                aria-hidden="true"
                initial={{ opacity: 0.2 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-60px 0px -60px 0px" }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="absolute left-3 top-3 h-3 w-3 rounded-full border-2 border-paper bg-paper shadow-[0_0_10px_2px_rgba(243,241,234,0.6)]"
              />
            </div>
            <div className="p-3">
              <div className="font-display text-2xl tracking-wide text-paper">{y.year}</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper/60">{y.title}</div>
              <p className="mt-1 font-hand text-sm text-paper/80">{y.caption}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ---------- section body ---------- */

export default function Trajectory({ stopArt = {}, yearArt = {} }: { stopArt?: StopArt; yearArt?: YearArt }) {
  const container = useRef<HTMLDivElement>(null);
  const [pins, setPins] = useState<Pt[]>([]);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [wide, setWide] = useState(true);
  const [active, setActive] = useState(0);

  const measure = useCallback(() => {
    const c = container.current;
    if (!c) return;
    const r = c.getBoundingClientRect();
    const next: Pt[] = [];
    c.querySelectorAll<HTMLElement>("[data-pin]").forEach((el) => {
      const b = el.getBoundingClientRect();
      next.push({ x: b.left + b.width / 2 - r.left, y: b.top + b.height / 2 - r.top });
    });
    setPins(next);
    setSize({ w: r.width, h: r.height });
    setWide(window.innerWidth >= 768);
  }, []);

  useEffect(() => {
    measure();
    const c = container.current;
    if (!c) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(c);
    c.querySelectorAll("img").forEach((img) => img.addEventListener("load", measure));
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  const { scrollYProgress } = useScroll({ target: container, offset: ["start 0.62", "end 0.62"] });

  return (
    <>
      <div ref={container} className="relative">
        <RouteLayer pins={pins} size={size} wide={wide} progress={scrollYProgress} onActive={setActive} />
        <div className="relative z-10 flex flex-col gap-12 md:gap-16">
          {PANELS.map((p, i) => {
            const side: "left" | "right" = i % 2 === 0 ? "left" : "right";
            const art = p.artKey ? stopArt[p.artKey] : undefined;
            const panel = (
              <StopPanel
                key="panel"
                panel={p}
                index={i}
                side={side}
                art={art}
                reached={active >= i}
                current={active === i}
              />
            );
            const landmark = <Landmark key="landmark" panel={p} art={art} side={side} />;
            return (
              <div key={p.key} className="grid gap-6 md:grid-cols-2 md:gap-12">
                {side === "left" ? [panel, landmark] : [landmark, panel]}
              </div>
            );
          })}
        </div>
      </div>
      <YearStrip art={yearArt} />
    </>
  );
}
