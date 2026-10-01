"use client";

import { useEffect, useRef, useState } from "react";
import { profile } from "@/data/profile";

// A damaged ship console that types the flight log out, character by character,
// with stutters, the odd mistyped glyph that gets corrected, and a screen tear
// now and then. Typing is driven by wall-clock time, so a slow frame rate never
// stretches the sequence. Calls onDone a moment after the last line finishes.

type Kind = "sys" | "title" | "log" | "end";
type Line = { text: string; kind: Kind; speed: number; pause: number };
type Shown = { kind: Kind; text: string };

const script: Line[] = [
  { text: "> BOOT SEQUENCE ............ OK", kind: "sys", speed: 12, pause: 240 },
  { text: "> HULL INTEGRITY ........... 41%", kind: "sys", speed: 12, pause: 240 },
  { text: "> LOCATING PILOT ........... FOUND", kind: "sys", speed: 12, pause: 360 },
  { text: "> SIGNAL ACQUIRED · FROM: STATION AECAD · ORBIT OF TITAN-1AB", kind: "sys", speed: 10, pause: 480 },
  { text: "> DECRYPTING FLIGHT LOG", kind: "sys", speed: 24, pause: 700 },
  { text: profile.crawlTitle.ep.toUpperCase(), kind: "sys", speed: 14, pause: 200 },
  { text: profile.crawlTitle.big.toUpperCase(), kind: "title", speed: 42, pause: 700 },
  ...profile.crawl.map((p): Line => ({ text: p, kind: "log", speed: 10, pause: 560 })),
  { text: "> END OF LOG. PRESS ANY KEY OR SCROLL TO CONTINUE.", kind: "end", speed: 12, pause: 0 },
];

const GLYPHS = "#%&@*+=?/\\|<>[]{}~^";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function CrashedConsole({ onDone }: { onDone: () => void }) {
  const [lines, setLines] = useState<Shown[]>([]);
  const [tear, setTear] = useState(false);
  const screen = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let seed = 4242;
    const rnd = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    const setLast = (kind: Kind, text: string) =>
      setLines((prev) => {
        const next = prev.slice(0, -1);
        next.push({ kind, text });
        return next;
      });

    (async () => {
      await sleep(500);
      for (const line of script) {
        if (cancelled) return;
        const chars = Array.from(line.text);

        // schedule: when each character becomes due, plus glitch slots
        const due: number[] = [];
        const glitchAt = new Set<number>();
        let t = 0;
        chars.forEach((ch, i) => {
          let wait = line.speed;
          if (rnd() < 0.05) wait += 40 + rnd() * 90; // stutter
          const nextCh = chars[i + 1];
          const sentenceEnd = (ch === "." || ch === "!" || ch === "…") && nextCh !== ".";
          if (sentenceEnd) wait += 130; // breathe at real sentence ends, not dotted leaders
          else if (ch === "," || ch === ":") wait += 40;
          if (line.kind !== "title" && i > 0 && rnd() < 0.014) glitchAt.add(i);
          t += wait;
          due.push(t);
        });

        setLines((prev) => [...prev, { kind: line.kind, text: "" }]);
        const start = performance.now();
        let idx = 0;
        while (idx < chars.length) {
          if (cancelled) return;
          const elapsed = performance.now() - start;
          let next = idx;
          while (next < chars.length && due[next] <= elapsed) next += 1;
          if (next > idx) {
            if (glitchAt.has(next - 1)) {
              const wrong = GLYPHS[Math.floor(rnd() * GLYPHS.length)];
              setLast(line.kind, chars.slice(0, next - 1).join("") + wrong);
              await sleep(110);
              if (cancelled) return;
            }
            idx = next;
            setLast(line.kind, chars.slice(0, idx).join(""));
            if (rnd() < 0.05) {
              setTear(true);
              await sleep(110);
              setTear(false);
            }
          }
          const untilNext = idx < chars.length ? due[idx] - (performance.now() - start) : 0;
          await sleep(Math.min(40, Math.max(8, untilNext)));
        }
        await sleep(line.pause);
      }
      await sleep(2200);
      if (!cancelled) onDone();
    })();

    return () => {
      cancelled = true;
    };
  }, [onDone]);

  // keep the newest line in view
  useEffect(() => {
    const el = screen.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  return (
    <div className="crt-wrap">
      <div className="crt-bezel">
        <div className="crt-header">
          <span>AECAD-class survey craft · console 03</span>
          <span className="crt-lights" aria-hidden="true">
            <i /> <i className="crt-light-blink" /> <i className="crt-light-off" /> PWR 41%
          </span>
        </div>

        <div ref={screen} className={`crt-screen ${tear ? "crt-tear" : ""}`} aria-live="polite">
          {lines.map((l, i) => (
            <p key={i} className={`crt-line crt-${l.kind}`}>
              {l.text}
              {i === lines.length - 1 && <span className="crt-cursor" aria-hidden="true" />}
            </p>
          ))}
        </div>

        <div className="crt-footer">
          <span>MEM 12% · LOG 0042 · CH 7</span>
          <span>▓▓▓▓▓░░░░░</span>
        </div>

        {/* cracked glass, top-right corner */}
        <svg className="crt-crack" viewBox="0 0 200 120" aria-hidden="true">
          <path d="M200 0 L168 26 L150 24 L138 44 M168 26 L176 48 L160 62 M150 24 L132 20 M138 44 L124 50 L118 68" fill="none" stroke="#f3f1ea" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
          <path d="M176 48 L196 58 M160 62 L156 84" fill="none" stroke="#f3f1ea" strokeWidth="0.8" strokeLinecap="round" opacity="0.5" />
        </svg>
      </div>
    </div>
  );
}
