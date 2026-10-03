"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Activity, BookMarked, CircleDot, GitCommitHorizontal, GitPullRequest, Users } from "lucide-react";
import type { Stats } from "@/lib/stats";

// Mission control: the painted command bay with four live screens laid exactly
// over its monitors. Screens boot in turn (CRT power-on, "signal acquired"),
// then numbers count up, gauges sweep, bars fill and the contribution grid lights
// in a wave. Below xl the screens are too small for detail, so the bay shows one
// headline per screen and the full screens stack underneath.

// Monitor rectangles measured on public/art/stats/control-room.webp (percent of the image).
const SCREENS: { left: number; top: number; w: number; h: number }[] = [
  { left: 18.84, top: 17.11, w: 29.13, h: 23.38 },
  { left: 51.85, top: 17.22, w: 28.95, h: 23.27 },
  { left: 18.78, top: 48.14, w: 29.19, h: 23.06 },
  { left: 51.85, top: 48.14, w: 29.07, h: 23.06 },
];
const ROOM_ASPECT = "1672 / 941";

/* ---------- small helpers ---------- */

function useCountUp(to: number, run: boolean, ms = 1300) {
  const [v, setV] = useState(run ? 0 : to);
  useEffect(() => {
    if (!run) return;
    let raf = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / ms);
      setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to, run, ms]);
  return v;
}

function Num({ to, on, className = "" }: { to: number; on: boolean; className?: string }) {
  const v = useCountUp(to, on);
  return <span className={`tabular-nums ${className}`}>{(on ? v : 0).toLocaleString("en-US")}</span>;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
// deterministic (no locale or timezone) so server and client render the same text;
// the year is shown only when it differs from the sync year
const parts = (iso: string) => iso.slice(0, 10).split("-").map(Number);
const shortDate = (iso: string, refYear: number) => {
  const [y, m, d] = parts(iso);
  return `${MONTHS[m - 1]} ${d}${y !== refYear ? `, ${y}` : ""}`;
};
const dateRange = (a: string, b: string, refYear: number) => {
  const [ya, ma, da] = parts(a);
  const [yb, mb, db] = parts(b);
  const yr = yb !== refYear ? `, ${yb}` : "";
  if (ya === yb && ma === mb) return `${MONTHS[ma - 1]} ${da}–${db}${yr}`; // Jul 16–25, 2025
  if (ya === yb) return `${MONTHS[ma - 1]} ${da} – ${MONTHS[mb - 1]} ${db}${yr}`;
  return `${shortDate(a, refYear)} – ${shortDate(b, refYear)}`;
};
const monthYear = (iso: string) => `${MONTHS[parts(iso)[1] - 1]} ${parts(iso)[0]}`;
const syncStamp = (iso: string) => `${MONTHS[Number(iso.slice(5, 7)) - 1]} ${Number(iso.slice(8, 10))}, ${iso.slice(11, 16)} UTC`;

/* ---------- screen shell: power-on, scanlines, flicker ---------- */

function Screen({
  title,
  index,
  booted,
  reduced,
  children,
  bezel = false,
  bare = false,
}: {
  title: string;
  index: number;
  booted: boolean;
  reduced: boolean;
  children: (on: boolean) => ReactNode;
  bezel?: boolean;
  bare?: boolean;
}) {
  const [on, setOn] = useState(reduced);
  useEffect(() => {
    if (reduced) return setOn(true);
    if (!booted) return;
    const t = setTimeout(() => setOn(true), 900);
    return () => clearTimeout(t);
  }, [booted, reduced]);

  return (
    <div
      className={`group/screen relative h-full w-full overflow-hidden bg-black [container-type:inline-size] ${
        bezel ? "aspect-[2.22/1] border-2 border-paper/60 shadow-[0_0_0_4px_#0a0a0c,0_0_0_6px_rgba(243,241,234,0.25)]" : ""
      }`}
    >
      {/* power-on line, then fade */}
      {booted && !reduced && (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-30 bg-paper"
          initial={{ scaleX: 0, scaleY: 0.02, opacity: 1 }}
          animate={{ scaleX: [0, 1, 1], scaleY: [0.02, 0.02, 1], opacity: [1, 1, 0] }}
          transition={{ duration: 0.65, times: [0, 0.45, 1], ease: "easeOut" }}
        />
      )}
      {booted && !on && !reduced && (
        <p className="absolute inset-0 z-20 grid place-items-center font-mono text-[max(9px,2.6cqw)] uppercase tracking-[0.3em] text-paper/80">
          <span>
            signal acquired<span className="crt-cursor" aria-hidden="true" />
          </span>
        </p>
      )}

      {/* content */}
      <div className={`relative z-10 h-full transition-opacity duration-500 ${on ? "opacity-100" : "opacity-0"}`}>
        <div className={`tele-flicker flex h-full flex-col ${bare ? "p-[2cqw]" : "p-[3cqw]"}`} style={{ animationDelay: `${-index * 1.3}s` } as CSSProperties}>
          {!bare && (
            <div className="mb-[1.4cqw] flex items-center justify-between gap-2 border-b border-paper/25 pb-[0.9cqw]">
              <span className="font-mono text-[max(9px,2.3cqw)] uppercase tracking-[0.22em] text-paper/80">{title}</span>
              <span className="flex items-center gap-1 font-mono text-[max(8px,2cqw)] uppercase tracking-[0.2em] text-paper/50">
                <span className="tele-led h-[max(5px,1.2cqw)] w-[max(5px,1.2cqw)] rounded-full bg-paper" />
                ch {String(index + 1).padStart(2, "0")}
              </span>
            </div>
          )}
          <div className="min-h-0 flex-1">{children(on)}</div>
        </div>
      </div>

      {/* scanlines + moving scan band + vignette */}
      <span aria-hidden="true" className="tele-scan pointer-events-none absolute inset-0 z-20" />
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 shadow-[inset_0_0_40px_rgba(0,0,0,0.9)]" />
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 bg-paper/0 transition-colors duration-300 group-hover/screen:bg-paper/[0.04]" />
    </div>
  );
}

/* ---------- screen 1: GitHub vitals with a radar sweep ---------- */

function Vitals({ s, on }: { s: Stats; on: boolean }) {
  const rows = [
    { Icon: GitCommitHorizontal, label: "Commits", v: s.github.commits },
    { Icon: GitPullRequest, label: "Pull requests", v: s.github.prs },
    { Icon: CircleDot, label: "Issues", v: s.github.issues },
    { Icon: BookMarked, label: "Repositories", v: s.github.repos },
    { Icon: Users, label: "Followers", v: s.github.followers },
    { Icon: Activity, label: "Contributions · all-time", v: s.contributions.allTime },
  ];
  return (
    <div className="flex h-full gap-[3cqw]">
      <ul className="flex min-w-0 flex-1 flex-col justify-between">
        {rows.map(({ Icon, label, v }, i) => (
          <motion.li
            key={label}
            initial={{ opacity: 0, x: -8 }}
            animate={on ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.08 * i }}
            className="flex items-center gap-[1.6cqw] text-[max(10px,2.8cqw)] leading-none text-paper/85"
          >
            <Icon className="h-[3cqw] min-h-[10px] w-[3cqw] min-w-[10px] shrink-0" />
            <span className="truncate font-mono uppercase tracking-[0.08em] text-paper/60">{label}</span>
            <span className="flex-1 border-b border-dotted border-paper/25" />
            <Num to={v} on={on} className="font-display text-[max(12px,3.3cqw)] tracking-wide text-paper" />
          </motion.li>
        ))}
      </ul>
      <div className="relative aspect-square h-full shrink-0 overflow-hidden rounded-full">
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
          {[46, 34, 22].map((r) => (
            <circle key={r} cx="50" cy="50" r={r} fill="none" stroke="#f3f1ea" strokeWidth="0.8" opacity="0.35" />
          ))}
          <line x1="50" y1="2" x2="50" y2="98" stroke="#f3f1ea" strokeWidth="0.5" opacity="0.25" />
          <line x1="2" y1="50" x2="98" y2="50" stroke="#f3f1ea" strokeWidth="0.5" opacity="0.25" />
          {[
            [28, 30],
            [70, 36],
            [62, 72],
            [34, 66],
            [78, 58],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="1.8" fill="#f3f1ea" className="tele-blip" style={{ animationDelay: `${i * 0.7}s` }} />
          ))}
        </svg>
        <span aria-hidden="true" className="tele-sweep absolute inset-[4%] rounded-full" />
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <Num to={s.github.commits} on={on} className="block font-display text-[max(16px,6.2cqw)] leading-none text-paper" />
            <span className="font-mono text-[max(8px,1.9cqw)] uppercase tracking-[0.2em] text-paper/60">commits</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- screen 2: languages ---------- */

function Languages({ s, on }: { s: Stats; on: boolean }) {
  const max = Math.max(...s.github.languages.map((l) => l.pct), 1);
  return (
    <ul className="flex h-full flex-col justify-between">
      {s.github.languages.map((l, i) => (
        <li key={l.name} className="flex items-center gap-[2cqw] text-[max(10px,3cqw)] leading-none">
          <span className="w-[22cqw] shrink-0 truncate font-mono uppercase tracking-[0.08em] text-paper/75">{l.name}</span>
          <span className="relative h-[max(6px,2cqw)] flex-1 border border-paper/30">
            <motion.span
              className="absolute inset-y-0 left-0 bg-paper"
              style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent 0 6px, rgba(10,10,12,0.55) 6px 7px)" }}
              initial={{ width: 0 }}
              animate={on ? { width: `${(l.pct / max) * 100}%` } : { width: 0 }}
              transition={{ duration: 1.1, delay: 0.12 * i, ease: [0.22, 1, 0.36, 1] }}
            />
          </span>
          <span className="w-[11cqw] shrink-0 text-right font-display text-[max(11px,3.3cqw)] tracking-wide text-paper tabular-nums">{l.pct.toFixed(1)}%</span>
        </li>
      ))}
    </ul>
  );
}

/* ---------- screen 3: LeetCode ---------- */

function LeetCode({ s, on }: { s: Stats; on: boolean }) {
  const lc = s.leetcode;
  const parts = [
    { label: "Easy", v: lc.easy, of: lc.totalEasy, stroke: "#f3f1ea" },
    { label: "Medium", v: lc.medium, of: lc.totalMedium, stroke: "#c9c6bc" },
    { label: "Hard", v: lc.hard, of: lc.totalHard, stroke: "#8c8a84" },
  ];
  const C = 2 * Math.PI * 40;
  const GAP = 1.6; // small gap between segments, in ring units
  let start = 0;
  const segs = parts.map((p) => {
    const frac = lc.solved ? p.v / lc.solved : 0;
    const seg = { ...p, startDeg: start * 360, len: Math.max(0, frac * C - GAP) };
    start += frac;
    return seg;
  });
  return (
    <div className="flex h-full gap-[3.5cqw]">
      <div className="relative aspect-square h-full shrink-0">
        <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f1ea" strokeWidth="9" opacity="0.08" />
          {segs.map((sg, i) => (
            <circle
              key={sg.label}
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke={sg.stroke}
              strokeWidth="9"
              transform={`rotate(${(sg.startDeg - 90).toFixed(2)} 50 50)`}
              style={{
                strokeDasharray: `${on ? sg.len.toFixed(2) : 0} ${C.toFixed(2)}`,
                transition: `stroke-dasharray 0.9s ease-out ${0.25 * i}s`,
              }}
            />
          ))}
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <Num to={lc.solved} on={on} className="block font-display text-[max(16px,6.2cqw)] leading-none text-paper" />
            <span className="font-mono text-[max(8px,1.9cqw)] uppercase tracking-[0.2em] text-paper/60">solved</span>
          </div>
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        {parts.map((p, i) => (
          <div key={p.label}>
            <div className="flex items-baseline justify-between text-[max(10px,3cqw)] leading-none">
              <span className="font-mono uppercase tracking-[0.12em] text-paper/70">{p.label}</span>
              <span className="font-display text-[max(12px,3.6cqw)] tracking-wide text-paper">
                <Num to={p.v} on={on} />
                <span className="font-mono text-[max(9px,2.2cqw)] text-paper/45"> / {p.of.toLocaleString("en-US")}</span>
              </span>
            </div>
            <span className="mt-[0.8cqw] block h-[max(4px,1.2cqw)] w-full bg-paper/10">
              <motion.span
                className="block h-full"
                style={{ background: p.stroke }}
                initial={{ width: 0 }}
                animate={on ? { width: `${Math.max(1.5, (p.v / Math.max(1, p.of)) * 100)}%` } : { width: 0 }}
                transition={{ duration: 1, delay: 0.3 + 0.15 * i }}
              />
            </span>
          </div>
        ))}
        <p className="font-mono text-[max(9px,2.3cqw)] uppercase tracking-[0.16em] text-paper/60">
          global rank <span className="font-display text-[max(11px,3.2cqw)] tracking-wide text-paper">#<Num to={lc.ranking} on={on} /></span>
        </p>
      </div>
    </div>
  );
}

/* ---------- screen 4: contribution grid ---------- */

const LEVEL = [0.07, 0.32, 0.55, 0.78, 1];

function Grid({ s, on }: { s: Stats; on: boolean }) {
  const days = s.contributions.days;
  const pad = days.length ? new Date(`${days[0].date}T00:00:00Z`).getUTCDay() : 0;
  const ref = Number(s.fetchedAt.slice(0, 4));
  const c = s.contributions;
  const stats: { label: string; v: number; sub: string }[] = [
    { label: "total", v: c.allTime, sub: c.since ? `since ${monthYear(c.since)}` : "all-time" },
    { label: "last 12 months", v: c.total, sub: `${c.activeDays} active days` },
    { label: "current streak", v: c.currentStreak, sub: c.currentStreak > 0 || !c.lastActive ? "days" : `last: ${shortDate(c.lastActive, ref)}` },
    { label: "longest streak", v: c.longestStreak, sub: c.longestStart && c.longestEnd ? dateRange(c.longestStart, c.longestEnd, ref) : "days" },
  ];
  // month labels: mark the first column in which each month appears
  const cols = Math.ceil((pad + days.length) / 7);
  const months: { col: number; label: string }[] = [];
  let prevMonth = -1;
  for (let c = 0; c < cols; c++) {
    const first = days[Math.max(0, c * 7 - pad)];
    if (!first) continue;
    const m = Number(first.date.slice(5, 7)) - 1;
    if (m !== prevMonth) {
      // a month that only has a sliver of columns gives way to the next label
      const last = months[months.length - 1];
      if (last && c - last.col < 3) months.pop();
      if (c < cols - 2) months.push({ col: c, label: MONTHS[m] });
      prevMonth = m;
    }
  }
  return (
    <div className="flex h-full flex-col justify-between gap-[1.4cqw]">
      <div>
        <div className="mb-[0.8cqw] grid font-mono text-[max(7px,1.7cqw)] uppercase leading-none tracking-[0.08em] text-paper/45" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {months.map((m) => (
            <span key={`${m.col}-${m.label}`} className="whitespace-nowrap" style={{ gridColumnStart: m.col + 1 }}>
              {m.label}
            </span>
          ))}
        </div>
        <div className="grid grid-flow-col grid-rows-7 gap-[0.35cqw]" style={{ gridAutoColumns: "minmax(0, 1fr)" }} aria-label="Contribution calendar, last twelve months">
          {Array.from({ length: pad }, (_, i) => (
            <span key={`p${i}`} />
          ))}
          {days.map((d, i) => (
            <span
              key={d.date}
              title={`${d.count} on ${d.date}`}
              className="aspect-square w-full bg-paper transition-opacity"
              style={{
                opacity: on ? LEVEL[Math.min(4, d.level)] : 0,
                transitionDuration: "380ms",
                transitionDelay: on ? `${Math.floor((i + pad) / 7) * 16}ms` : "0ms",
              }}
            />
          ))}
        </div>
        <div className="mt-[0.7cqw] flex items-center justify-end gap-[0.6cqw] font-mono text-[max(7px,1.45cqw)] uppercase leading-none tracking-[0.12em] text-paper/45">
          less
          {LEVEL.map((o) => (
            <span key={o} className="inline-block h-[max(5px,1.4cqw)] w-[max(5px,1.4cqw)] bg-paper" style={{ opacity: o }} />
          ))}
          more
        </div>
      </div>
      <div className="grid grid-cols-4 gap-[1.6cqw] border-t border-paper/20 pt-[1.1cqw]">
        {stats.map((x) => (
          <div key={x.label} className="min-w-0">
            <Num to={x.v} on={on} className="block font-display text-[max(12px,3.6cqw)] leading-none tracking-wide text-paper" />
            <span className="mt-[0.5cqw] block truncate font-mono text-[max(8px,1.8cqw)] uppercase leading-tight tracking-[0.1em] text-paper/70">{x.label}</span>
            <span className="block truncate font-mono text-[max(7px,1.55cqw)] leading-tight tracking-normal text-paper/45" title={x.sub}>{x.sub}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- compact headline (small screens, painted bay) ---------- */

function Headline({ v, label, on }: { v: number; label: string; on: boolean }) {
  return (
    <div className="grid h-full place-items-center text-center">
      <div>
        <Num to={v} on={on} className="block font-display text-[20cqw] leading-none text-paper" />
        <span className="mt-[2cqw] block font-mono text-[max(7px,7cqw)] uppercase leading-none tracking-[0.12em] text-paper/70">{label}</span>
      </div>
    </div>
  );
}

/* ---------- the deck ---------- */

export default function MissionControl({ stats, room }: { stats: Stats; room?: string }) {
  const deck = useRef<HTMLDivElement>(null);
  const inView = useInView(deck, { once: true, margin: "-15% 0px -15% 0px" });
  const reduced = useReducedMotion() ?? false;
  const [booted, setBooted] = useState<boolean[]>([false, false, false, false]);

  useEffect(() => {
    if (!inView) return;
    const timers = [0, 1, 2, 3].map((i) =>
      setTimeout(() => setBooted((b) => b.map((x, j) => (j === i ? true : x))), reduced ? 0 : 250 + i * 450)
    );
    return () => timers.forEach(clearTimeout);
  }, [inView, reduced]);

  const allLive = stats.live.github && stats.live.contributions && stats.live.leetcode;
  const anyLive = stats.live.github || stats.live.contributions || stats.live.leetcode;
  const status = allLive ? "Live · synced hourly" : anyLive ? "Partly live · synced hourly" : "Archive · last snapshot";

  const full = [
    { title: "GitHub · vitals", body: (on: boolean) => <Vitals s={stats} on={on} /> },
    { title: "Language telemetry", body: (on: boolean) => <Languages s={stats} on={on} /> },
    { title: "LeetCode · solved", body: (on: boolean) => <LeetCode s={stats} on={on} /> },
    { title: "Contribution grid", body: (on: boolean) => <Grid s={stats} on={on} /> },
  ];
  const top = stats.github.languages[0];
  const compact = [
    { v: stats.github.commits, label: "commits" },
    { v: Math.round(top?.pct ?? 0), label: `% ${top?.name === "TypeScript" ? "TS" : top?.name ?? ""}` },
    { v: stats.leetcode.solved, label: "solved" },
    { v: stats.contributions.allTime, label: "contributions" },
  ];

  return (
    <div ref={deck} className="relative">
      {/* status strip */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <span className="caption flex items-center gap-2">
          <span className={`tele-led inline-block h-2 w-2 rounded-full ${anyLive ? "bg-ink" : "bg-ink/40"}`} />
          Mission control · {status}
        </span>
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-paper/50">last sync {syncStamp(stats.fetchedAt)}</span>
      </div>

      {/* the painted bay with screens over its monitors */}
      {room ? (
        <div className="relative w-full overflow-hidden border-2 border-paper/70 xl:-mx-16 xl:w-[calc(100%+8rem)] 2xl:-mx-24 2xl:w-[calc(100%+12rem)]" style={{ aspectRatio: ROOM_ASPECT }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={room} alt="Ship's command bay with four monitors" className="absolute inset-0 h-full w-full object-cover" />
          {SCREENS.map((r, i) => (
            <div key={i} className="absolute" style={{ left: `${r.left}%`, top: `${r.top}%`, width: `${r.w}%`, height: `${r.h}%` }}>
              <div className="hidden h-full xl:block">
                <Screen title={full[i].title} index={i} booted={booted[i]} reduced={reduced}>
                  {full[i].body}
                </Screen>
              </div>
              <div className="h-full xl:hidden">
                <Screen title="" index={i} booted={booted[i]} reduced={reduced} bare>
                  {(on) => <Headline v={compact[i].v} label={compact[i].label} on={on} />}
                </Screen>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* below xl: the full screens stacked under the bay */}
      <div className={`grid gap-6 md:grid-cols-2 ${room ? "mt-8 xl:hidden" : ""}`}>
        {full.map((f, i) => (
          <Screen key={f.title} title={f.title} index={i} booted={booted[i]} reduced={reduced} bezel>
            {f.body}
          </Screen>
        ))}
      </div>
    </div>
  );
}
