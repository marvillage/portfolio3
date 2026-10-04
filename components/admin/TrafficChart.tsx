"use client";

import { useEffect, useRef, useState } from "react";
import type { Bucket } from "@/lib/adminData";

// Page views as columns (gray), unique visitors as a line (white), one shared
// count axis. Each column slot is a hover/focus target whose tooltip lists both
// series; a table view carries every value without hovering.

const H = 240;
const PAD = { top: 16, right: 12, bottom: 28, left: 40 };

function niceMax(v: number) {
  if (v <= 4) return 4;
  const pow = 10 ** Math.floor(Math.log10(v));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => v / s <= 5) ?? pow * 10;
  return Math.ceil(v / step) * step;
}

export default function TrafficChart({ data }: { data: Bucket[] }) {
  const box = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(800);
  const [hover, setHover] = useState<number | null>(null);
  const [table, setTable] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(Math.max(280, Math.round(el.clientWidth))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const max = niceMax(Math.max(1, ...data.map((d) => Math.max(d.views, d.visitors))));
  const innerW = w - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const slot = innerW / data.length;
  const barW = Math.max(2, Math.min(24, slot - 2));
  const x = (i: number) => PAD.left + i * slot + slot / 2;
  const y = (v: number) => PAD.top + innerH - (v / max) * innerH;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(max * t));
  const every = Math.ceil(data.length / Math.max(2, Math.floor(innerW / 64)));
  const line = data.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(d.visitors).toFixed(1)}`).join(" ");
  const total = data.reduce((s, d) => s + d.views, 0);
  const h = hover === null ? null : data[hover];

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.14em] text-paper/70">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-[2px] bg-paper/40" /> Page views
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-[2px] w-4 bg-paper" /> Visitors
          </span>
        </div>
        <button
          type="button"
          onClick={() => setTable((t) => !t)}
          className="border border-paper/40 px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.14em] text-paper/70 hover:border-paper hover:text-paper"
          aria-pressed={table}
        >
          {table ? "Chart" : "Table"}
        </button>
      </div>

      {table ? (
        <div className="max-h-[260px] overflow-auto border border-paper/20">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-ink-2 font-mono text-[11px] uppercase tracking-[0.12em] text-paper/60">
              <tr>
                <th className="px-3 py-2 font-normal">When</th>
                <th className="px-3 py-2 text-right font-normal">Page views</th>
                <th className="px-3 py-2 text-right font-normal">Visitors</th>
              </tr>
            </thead>
            <tbody className="[font-variant-numeric:tabular-nums]">
              {[...data].reverse().map((d) => (
                <tr key={d.key} className="border-t border-paper/10">
                  <td className="px-3 py-1.5 text-paper/80">{d.label}</td>
                  <td className="px-3 py-1.5 text-right text-paper">{d.views.toLocaleString("en-IN")}</td>
                  <td className="px-3 py-1.5 text-right text-paper">{d.visitors.toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div ref={box} className="relative" onMouseLeave={() => setHover(null)}>
          <svg width={w} height={H} role="img" aria-label={`Page views and visitors, ${total} views in this range`} className="block">
            {ticks.map((t) => (
              <g key={t}>
                <line x1={PAD.left} x2={w - PAD.right} y1={y(t)} y2={y(t)} stroke="rgba(243,241,234,0.1)" strokeWidth={1} />
                <text x={PAD.left - 8} y={y(t) + 4} textAnchor="end" className="fill-paper/50 font-mono text-[10px] [font-variant-numeric:tabular-nums]">
                  {t.toLocaleString("en-IN")}
                </text>
              </g>
            ))}
            {data.map((d, i) => {
              const top = y(d.views);
              const hgt = PAD.top + innerH - top;
              const r = Math.min(4, hgt, barW / 2);
              const x0 = x(i) - barW / 2;
              const base = PAD.top + innerH;
              return (
                <g key={d.key}>
                  {d.views > 0 && (
                    <path
                      d={`M${x0},${base} V${top + r} Q${x0},${top} ${x0 + r},${top} H${x0 + barW - r} Q${x0 + barW},${top} ${x0 + barW},${top + r} V${base} Z`}
                      fill={hover === i ? "rgba(243,241,234,0.62)" : "rgba(243,241,234,0.4)"}
                    />
                  )}
                  {i % every === 0 && (
                    <text x={x(i)} y={H - 8} textAnchor="middle" className="fill-paper/50 font-mono text-[10px]">
                      {d.label}
                    </text>
                  )}
                </g>
              );
            })}
            <path d={line} fill="none" stroke="#f3f1ea" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            {h && hover !== null && (
              <>
                <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={PAD.top + innerH} stroke="rgba(243,241,234,0.35)" strokeWidth={1} />
                <circle cx={x(hover)} cy={y(h.visitors)} r={4.5} fill="#f3f1ea" stroke="#141417" strokeWidth={2} />
              </>
            )}
            {/* hit areas: the whole slot, keyboard focusable */}
            {data.map((d, i) => (
              <rect
                key={`hit-${d.key}`}
                x={PAD.left + i * slot}
                y={PAD.top}
                width={slot}
                height={innerH}
                fill="transparent"
                tabIndex={0}
                aria-label={`${d.label}: ${d.views} page views, ${d.visitors} visitors`}
                onMouseEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                className="outline-none"
              />
            ))}
          </svg>
          {h && hover !== null && (
            <div
              className="pointer-events-none absolute top-1 z-10 min-w-[150px] border-2 border-paper bg-ink px-3 py-2 shadow-[3px_3px_0_#8c8a84]"
              style={{ left: Math.min(Math.max(x(hover) - 75, 0), w - 160) }}
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-paper/60">{h.label}</p>
              <p className="mt-1 flex items-baseline justify-between gap-4 text-sm text-paper/70">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-[2px] bg-paper/40" /> Page views
                </span>
                <strong className="text-base text-paper">{h.views.toLocaleString("en-IN")}</strong>
              </p>
              <p className="flex items-baseline justify-between gap-4 text-sm text-paper/70">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-[2px] w-3 bg-paper" /> Visitors
                </span>
                <strong className="text-base text-paper">{h.visitors.toLocaleString("en-IN")}</strong>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
