"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useAnimationFrame, useInView, useReducedMotion } from "framer-motion";
import { BadgeCheck } from "lucide-react";
import type { Certification } from "@/data/certifications";

// Credentials archive in orbit. The ring station sits at the centre; the eight
// certification cards ride two elliptical orbits (inner ring clockwise, outer
// ring counter-clockwise) with depth: cards at the front are larger and pass in
// front of the station, cards at the back shrink and dim behind it. Hovering a
// card holds the orbit so it can be read. The pilot sits on his crate at the
// lower left and the shuttle flies in to land on the dock. Every certification
// keeps its full text; on phones the same cards stack in a list.

export type CertArt = {
  station?: string;
  dock?: string;
  pilot?: string;
  ship?: string;
  icons: Record<string, string | undefined>;
};

type Props = { certs: Certification[]; art: CertArt };

const CARD_W = 236;
const STAGE_H = 820;
const RY = 0.6; // ellipse flattening: rounder orbit so side cards never stack
const SPEED = 0.07; // radians per second, one full orbit in ~90 s

function stampDate(d: string) {
  const [m, y] = d.split(" ");
  return y ? `${m.toUpperCase()} · ${y}` : d.toUpperCase();
}

function Card({
  c,
  icon,
  compact = false,
  className = "",
  style,
  innerRef,
  onHold,
}: {
  c: Certification;
  icon?: string;
  compact?: boolean;
  className?: string;
  style?: React.CSSProperties;
  innerRef?: (el: HTMLElement | null) => void;
  onHold?: (el: HTMLElement, kind: "hover" | "focus", hold: boolean) => void;
}) {
  return (
    <article
      ref={innerRef}
      style={style}
      onPointerEnter={(e) => onHold?.(e.currentTarget, "hover", true)}
      onPointerLeave={(e) => onHold?.(e.currentTarget, "hover", false)}
      onFocus={(e) => {
        // only keyboard focus holds the orbit; a mouse click must not freeze it
        if (e.currentTarget.matches(":focus-visible")) onHold?.(e.currentTarget, "focus", true);
      }}
      onBlur={(e) => onHold?.(e.currentTarget, "focus", false)}
      tabIndex={0}
      className={`panel-thin group bg-ink ${compact ? "p-3 pt-4" : "p-4 pt-5"} ${className.includes("absolute") ? "" : "relative"} ${className}`}
    >
      <span className="caption absolute -top-3 left-3 !py-0.5 !text-[11px] tracking-[0.1em]">{stampDate(c.date)}</span>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h3 className={`font-display leading-tight tracking-wide text-paper ${compact ? "text-[15px]" : "text-[17px]"}`}>{c.title}</h3>
          <p className={`mt-1 font-hand text-paper/70 ${compact ? "text-xs" : "text-sm"}`}>{c.issuer}</p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {c.tags.map((t) => (
              <span key={t} className="tag !text-[9px]">
                {t}
              </span>
            ))}
          </div>
          {c.credentialId && (
            <p className="mt-2 truncate font-mono text-[9px] tracking-wide text-paper/35">ID: {c.credentialId}</p>
          )}
        </div>
        {icon ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={icon} alt="" aria-hidden="true" className={`mt-1 shrink-0 object-contain drop-shadow-[0_0_8px_rgba(243,241,234,0.35)] ${compact ? "h-14 w-14" : "h-[72px] w-[72px]"}`} />
        ) : (
          <span className="mt-1 grid h-10 w-10 shrink-0 place-items-center border-2 border-paper bg-paper text-ink">
            <BadgeCheck size={18} />
          </span>
        )}
      </div>
      {c.credentialId && (
        <span
          aria-hidden="true"
          className="seal pointer-events-none absolute -bottom-3 right-3 scale-0 opacity-0 transition-all duration-200 ease-[cubic-bezier(.2,1.6,.4,1)] group-hover:scale-100 group-hover:opacity-100 group-focus-within:scale-100 group-focus-within:opacity-100"
        >
          ✓ Verified
        </span>
      )}
    </article>
  );
}

/* ---------- the orbit (md and up) ---------- */

type Slot = { base: number };

function Orbit({ certs, art }: Props) {
  const stage = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLElement | null)[]>([]);
  const [w, setW] = useState(1100);
  const reduced = useReducedMotion();
  const inView = useInView(stage, { margin: "200px 0px 200px 0px" });
  const ship = useRef<HTMLImageElement>(null);
  const shipT = useRef(0);
  const shipPos = useRef<{ x: number; y: number; vx: number; vy: number; init: boolean }>({ x: 0, y: 0, vx: 0, vy: 0, init: false });
  const pointer = useRef<{ x: number; y: number; inside: boolean; fine: boolean }>({ x: 0, y: 0, inside: false, fine: false });
  const hovering = useRef(new Set<HTMLElement>());
  const focused = useRef(new Set<HTMLElement>());
  const lastMove = useRef(0);
  const t = useRef(0);

  // remember when the pointer last actually moved over the stage
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    let lx = -1;
    let ly = -1;
    pointer.current.fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const onMove = (e: PointerEvent) => {
      // browsers re-dispatch a move at the same spot when content slides under a still cursor; ignore those
      if (e.clientX === lx && e.clientY === ly) return;
      lx = e.clientX;
      ly = e.clientY;
      lastMove.current = performance.now();
      const r = el.getBoundingClientRect();
      pointer.current.x = e.clientX - r.left;
      pointer.current.y = e.clientY - r.top;
      pointer.current.inside = true;
    };
    const onEnter = () => {
      pointer.current.inside = true;
    };
    const onLeave = () => {
      pointer.current.inside = false;
    };
    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  // one ring, evenly spaced, newest certification starting at the front
  const slots: Slot[] = certs.map((_, i) => ({ base: Math.PI / 2 - (i / certs.length) * Math.PI * 2 }));

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      if (el.clientWidth > 0) setW(el.clientWidth);
    });
    ro.observe(el);
    if (el.clientWidth > 0) setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const place = useCallback(
    (time: number) => {
      const cx = w / 2;
      const cy = STAGE_H / 2 - 10;
      const rx = Math.max(120, Math.min(430, w / 2 - CARD_W / 2 - 8));
      const ry = rx * RY;
      slots.forEach((s, i) => {
        const el = cards.current[i];
        if (!el) return;
        const a = s.base - SPEED * time; // clockwise as seen from above
        const x = cx + Math.cos(a) * rx;
        const y = cy + Math.sin(a) * ry;
        const depth = (Math.sin(a) + 1) / 2; // 0 back, 1 front
        const scale = 0.62 + 0.46 * depth;
        el.style.transform = `translate(${(x - CARD_W / 2).toFixed(1)}px, ${y.toFixed(1)}px) translate(0, -50%) scale(${scale.toFixed(3)})`;
        el.style.opacity = (0.3 + 0.7 * depth).toFixed(3);
        el.style.zIndex = String(10 + Math.round(depth * 20));
        el.style.filter = depth < 0.4 ? `blur(${((0.4 - depth) * 3).toFixed(2)}px)` : "";
      });
    },
    [w, slots]
  );

  const flyShip = useCallback(
    (time: number, dt: number) => {
      const el = ship.current;
      if (!el) return;
      const cx = w / 2;
      const cy = STAGE_H / 2 - 10;
      const rx = Math.max(120, Math.min(430, w / 2 - CARD_W / 2 - 8)) * 1.16;
      const ry = rx * RY * 0.72;
      const a = -time * 0.42; // orbit lap in ~15 s, same direction as the cards
      const follow = pointer.current.inside && pointer.current.fine;
      // target: the cursor (ship hovers just above-left of it, with a gentle bob) or the orbit point
      const tx = follow ? pointer.current.x - 70 : cx + Math.cos(a) * rx;
      const ty = follow ? pointer.current.y - 46 + Math.sin(time * 2.2) * 5 : cy + Math.sin(a) * ry - 40;
      const sp = shipPos.current;
      if (!sp.init) {
        sp.x = tx;
        sp.y = ty;
        sp.init = true;
      }
      const k = 1 - Math.exp(-dt * (follow ? 4.5 : 3));
      const nx = sp.x + (tx - sp.x) * k;
      const ny = sp.y + (ty - sp.y) * k;
      // velocity (smoothed) gives the heading
      const inst = dt > 0 ? { vx: (nx - sp.x) / dt, vy: (ny - sp.y) / dt } : { vx: sp.vx, vy: sp.vy };
      sp.vx += (inst.vx - sp.vx) * 0.2;
      sp.vy += (inst.vy - sp.vy) * 0.2;
      sp.x = nx;
      sp.y = ny;
      const speed = Math.hypot(sp.vx, sp.vy);
      const headingLeft = speed > 6 ? sp.vx < 0 : el.dataset.left === "1";
      el.dataset.left = headingLeft ? "1" : "0";
      const tilt = speed > 6 ? Math.max(-28, Math.min(28, (Math.atan2(sp.vy * (headingLeft ? -1 : 1), Math.abs(sp.vx)) * 180) / Math.PI)) : 0;
      const depth = follow ? 1 : (Math.sin(a) + 1) / 2;
      const scale = follow ? 0.95 : 0.55 + 0.5 * depth;
      el.style.transform = `translate(${(sp.x - 55).toFixed(1)}px, ${(sp.y - 25).toFixed(1)}px) scale(${(headingLeft ? -scale : scale).toFixed(3)}, ${scale.toFixed(3)}) rotate(${(tilt * 0.6).toFixed(1)}deg)`;
      el.style.opacity = (0.45 + 0.55 * depth).toFixed(3);
      el.style.zIndex = String(depth > 0.5 ? 33 : 8);
    },
    [w]
  );

  useAnimationFrame((_, delta) => {
    if (reduced || !inView) return;
    const held = hovering.current.size > 0 || focused.current.size > 0;
    if (!held) t.current += delta / 1000;
    shipT.current += delta / 1000; // the shuttle never stops
    place(t.current);
    flyShip(shipT.current, Math.min(0.05, delta / 1000));
  });

  // static layout for reduced motion / first paint
  useEffect(() => {
    place(t.current);
    flyShip(shipT.current, 0.016);
  }, [place, flyShip]);

  const setHold = (el: HTMLElement, kind: "hover" | "focus", h: boolean) => {
    const set = kind === "hover" ? hovering.current : focused.current;
    if (!h) {
      set.delete(el);
      return;
    }
    // a card drifting under a parked cursor is not a hover: only hold when the pointer moved just now
    if (kind === "hover" && performance.now() - lastMove.current > 300) return;
    set.add(el);
  };

  const rx = Math.max(120, Math.min(430, w / 2 - CARD_W / 2 - 8));
  const cx = w / 2;
  const cy = STAGE_H / 2 - 10;

  return (
    <div ref={stage} className="relative hidden md:block" style={{ height: STAGE_H }}>
      {/* chart furniture */}
      <span className="caption absolute left-0 top-0 z-30 !text-[11px]">Orbital archive · {String(certs.length).padStart(2, "0")} records</span>
      <span className="note absolute right-0 top-1 z-30 !text-xs">hover a card to hold the orbit · the shuttle follows your cursor</span>

      {/* orbit rings */}
      <svg className="pointer-events-none absolute inset-0" width={w} height={STAGE_H} viewBox={`0 0 ${w} ${STAGE_H}`} aria-hidden="true">
        <defs>
          <filter id="orbit-glow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* the orbit path: soft glow, solid ink line, dashed overlay, tick marks */}
        <ellipse cx={cx} cy={cy} rx={rx} ry={rx * RY} fill="none" stroke="#f3f1ea" strokeWidth="6" opacity="0.14" filter="url(#orbit-glow)" />
        <ellipse cx={cx} cy={cy} rx={rx} ry={rx * RY} fill="none" stroke="#f3f1ea" strokeWidth="1.6" opacity="0.55" />
        <ellipse cx={cx} cy={cy} rx={rx} ry={rx * RY} fill="none" stroke="#f3f1ea" strokeWidth="2.4" strokeDasharray="10 14" opacity="0.9" />
        <g stroke="#f3f1ea" strokeWidth="1.4" opacity="0.7">
          {Array.from({ length: 24 }, (_, i) => {
            const a = (i / 24) * Math.PI * 2;
            const x1 = cx + Math.cos(a) * rx;
            const y1 = cy + Math.sin(a) * rx * RY;
            const nx = Math.cos(a) * 7;
            const ny = Math.sin(a) * 7 * RY;
            return <line key={i} x1={x1 - nx} y1={y1 - ny} x2={x1 + nx} y2={y1 + ny} />;
          })}
        </g>
        {/* inner and outer guide rings */}
        <ellipse cx={cx} cy={cy} rx={rx * 0.62} ry={rx * RY * 0.62} fill="none" stroke="#f3f1ea" strokeWidth="0.9" strokeDasharray="2 6" opacity="0.3" />
        <ellipse cx={cx} cy={cy} rx={rx * 1.07} ry={rx * RY * 1.07} fill="none" stroke="#f3f1ea" strokeWidth="0.8" opacity="0.22" />
      </svg>

      {/* station at the centre */}
      {art.station && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 w-[min(40%,440px)] -translate-x-1/2 -translate-y-[54%]" style={{ zIndex: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={art.station} alt="Orbital training station" className="animate-float block w-full drop-shadow-[0_0_30px_rgba(243,241,234,0.2)]" />
        </div>
      )}

      {/* dock platform and pilot */}
      {art.dock && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={art.dock} alt="" aria-hidden="true" className="pointer-events-none absolute bottom-0 left-1/2 w-[min(52%,560px)] -translate-x-1/2 opacity-90" style={{ zIndex: 9 }} />
      )}
      {art.pilot && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={art.pilot} alt="" aria-hidden="true" className="animate-float pointer-events-none absolute bottom-2 left-2 w-[min(18%,190px)]" style={{ zIndex: 31, animationDelay: "-2s" }} />
      )}

      {/* shuttle: circles the station on its own inclined path, passing behind it */}
      {art.ship && (
        // eslint-disable-next-line @next/next/no-img-element
        <img ref={ship} src={art.ship} alt="" aria-hidden="true" className="pointer-events-none absolute left-0 top-0 w-[110px] will-change-transform" style={{ zIndex: 33 }} />
      )}

      {/* the cards */}
      {certs.map((c, i) => (
        <Card
          key={c.title}
          c={c}
          icon={art.icons[c.icon ?? ""]}
          compact
          onHold={setHold}
          innerRef={(el) => {
            cards.current[i] = el;
          }}
          className="absolute left-0 top-0 will-change-transform"
          style={{ width: CARD_W }}
        />
      ))}
    </div>
  );
}

/* ---------- stacked list (below md) ---------- */

function Stack({ certs, art }: Props) {
  return (
    <div className="md:hidden">
      {art.station && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={art.station} alt="Orbital training station" className="animate-float mx-auto mb-8 w-4/5 drop-shadow-[0_0_24px_rgba(243,241,234,0.2)]" />
      )}
      <div className="grid gap-6">
        {certs.map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px 0px -50px 0px" }}
            transition={{ duration: 0.4, delay: (i % 2) * 0.06 }}
          >
            <Card c={c} icon={art.icons[c.icon ?? ""]} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function CertOrbit(props: Props) {
  return (
    <>
      <Orbit {...props} />
      <Stack {...props} />
    </>
  );
}
