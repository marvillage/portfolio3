"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, FileText } from "lucide-react";
import { profile } from "@/data/profile";
import { socials } from "@/data/socials";
import RotatingRoles from "./RotatingRoles";

type Phase = "pending" | "crawl" | "hero";

// transmission 4.4s, title 4.6s + 6s, crawl 8.2s + 22s  → ~30.5s, then auto-finish
const CRAWL_MS = 31500;
const SEEN_KEY = "crawlSeen:v2";

/** Fallback line-art starfighter used until /public/art/hero-ship.png exists. */
function InkShip({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 260"
      className={className}
      fill="none"
      stroke="#f3f1ea"
      strokeWidth="3"
      strokeLinejoin="round"
      strokeLinecap="round"
      role="img"
      aria-label="Ink drawing of a starfighter"
    >
      {/* speed lines */}
      <path d="M16 118 H92 M6 140 H66 M26 162 H84" strokeWidth="2" opacity="0.5" />
      {/* X wings */}
      <polygon points="138,50 172,58 312,198 288,208" fill="#0a0a0c" />
      <polygon points="138,210 172,202 312,62 288,52" fill="#0a0a0c" />
      {/* wing-tip engines */}
      <circle cx="146" cy="54" r="11" fill="#0a0a0c" />
      <circle cx="146" cy="206" r="11" fill="#0a0a0c" />
      <circle cx="146" cy="54" r="4" fill="#f3f1ea" stroke="none" />
      <circle cx="146" cy="206" r="4" fill="#f3f1ea" stroke="none" />
      {/* fuselage */}
      <polygon points="118,130 188,106 356,120 392,130 356,140 188,154" fill="#0a0a0c" />
      {/* canopy */}
      <path d="M212 112 Q242 88 278 112" />
      <path d="M224 110 L230 98 M252 106 L252 94" strokeWidth="2" />
      {/* nose panel lines */}
      <path d="M300 121 L352 130 L300 139" strokeWidth="2" />
      <path d="M200 130 H290" strokeWidth="1.5" opacity="0.6" />
      {/* exhaust */}
      <path d="M118 124 H64 M118 136 H86" strokeWidth="3" opacity="0.75" />
      {/* halftone spatter near engines */}
      <g fill="#f3f1ea" stroke="none" opacity="0.6">
        <circle cx="120" cy="60" r="1.6" />
        <circle cx="128" cy="70" r="1.2" />
        <circle cx="114" cy="74" r="1" />
        <circle cx="120" cy="200" r="1.6" />
        <circle cx="128" cy="190" r="1.2" />
        <circle cx="114" cy="186" r="1" />
      </g>
    </svg>
  );
}

export default function Hero({ shipArt }: { shipArt?: string }) {
  const [phase, setPhase] = useState<Phase>("pending");
  const [typed, setTyped] = useState("");

  const finish = useCallback(() => {
    setPhase("hero");
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* storage unavailable */
    }
  }, []);

  // Typewriter for the opener line while the transmission is "decrypting".
  useEffect(() => {
    if (phase !== "crawl") return;
    setTyped("");
    const text = profile.crawlOpener;
    let i = 0;
    let tick: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      tick = setInterval(() => {
        i += 1;
        setTyped(text.slice(0, i));
        if (i >= text.length && tick) clearInterval(tick);
      }, 34);
    }, 900);
    return () => {
      clearTimeout(start);
      if (tick) clearInterval(tick);
    };
  }, [phase]);

  // Decide once on mount: play the crawl, or go straight to the hero.
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      /* storage unavailable */
    }
    // ?nointro skips the crawl (handy for sharing a direct link or taking screenshots)
    const nointro = window.location.search.includes("nointro");
    if (reduced || seen || nointro) {
      setPhase("hero");
      return;
    }
    setPhase("crawl");

    const off = () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchmove", skip);
    };
    const skip = () => {
      off();
      finish();
    };
    const timer = setTimeout(skip, CRAWL_MS);
    window.addEventListener("keydown", skip);
    window.addEventListener("wheel", skip, { passive: true });
    window.addEventListener("touchmove", skip, { passive: true });
    return off;
  }, [finish]);

  // Lock page scroll while the crawl plays.
  useEffect(() => {
    if (phase !== "crawl") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [phase]);

  const show = phase !== "crawl";

  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center px-6 pb-20 pt-28"
    >
      <AnimatePresence>
        {phase === "crawl" && (
          <motion.div
            key="crawl"
            role="dialog"
            aria-label="Opening crawl"
            className="fixed inset-0 z-[70] overflow-hidden bg-ink text-paper"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8 } }}
          >
            <div className="stars stars--sm" />
            <div className="stars stars--md" />

            {/* mechanic B: incoming transmission */}
            <div className="crawl-static pointer-events-none absolute inset-0" />
            <div className="crawl-tx absolute inset-x-0 top-[34%] px-6 text-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-paper/70 sm:text-xs">
                ▌▌▌ Signal acquired ▌▌▌
              </p>
              <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-paper/50 sm:text-xs">
                From: Station AECAD · Orbit of Titan-1Ab
              </p>
              <p className="mx-auto mt-6 max-w-2xl font-hand text-xl leading-snug sm:text-2xl">
                <span className="mr-2 font-mono text-[11px] uppercase tracking-[0.2em] text-paper/50 sm:text-xs">
                  Decrypting:
                </span>
                {typed}
                <span className="crawl-cursor" aria-hidden="true" />
              </p>
            </div>

            <div className="crawl-title absolute inset-x-0 top-[30%] px-6 text-center">
              <div className="font-display text-lg tracking-[0.25em] sm:text-2xl">
                {profile.crawlTitle.ep}
              </div>
              <div className="title-hollow text-balance text-[clamp(52px,12vw,150px)]">
                {profile.crawlTitle.big}
              </div>
            </div>

            <div className="crawl-stage">
              <div className="crawl-text">
                {profile.crawl.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>

            <div className="pointer-events-none absolute inset-x-0 top-0 h-[28%] bg-gradient-to-b from-ink via-ink/80 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-4 px-6 pb-8 sm:px-10">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-paper/50">
                Scroll or press any key to skip
              </p>
              <button type="button" onClick={finish} className="btn-ghost text-sm">
                Skip intro →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 md:grid-cols-[1.1fr_0.9fr]">
        <motion.div
          initial={false}
          animate={{ opacity: show ? 1 : 0, y: show ? 0 : 24 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="caption">Currently SDE @ AECAD.ai</span>

          <h1 className="title-solid mt-6 text-[clamp(52px,9vw,120px)]">
            Kushagra
            <br />
            Srivastava
          </h1>

          <p className="mt-6 text-xl text-paper/85 sm:text-2xl">
            I&apos;m a <RotatingRoles roles={profile.roles} />
          </p>

          <p className="mt-2 font-mono text-xs uppercase tracking-[0.22em] text-paper/50">
            Full-stack · AI systems · Stories on Medium
          </p>

          <p className="mt-6 max-w-xl leading-relaxed text-paper/70">{profile.intro}</p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a href="#projects" className="btn-ink">
              View missions
            </a>
            <a
              href={profile.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
            >
              <FileText size={16} /> Résumé
            </a>
          </div>

          <div className="mt-10 flex items-center gap-5">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="text-paper/55 transition-all hover:-translate-y-1 hover:text-paper"
              >
                <s.icon size={20} />
              </a>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={false}
          animate={{ opacity: show ? 1 : 0, scale: show ? 1 : 0.96 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-md md:max-w-none"
        >
          <span className="burst absolute -left-2 -top-8 z-10 h-28 w-28 -rotate-[8deg] text-lg sm:h-32 sm:w-32 sm:text-xl">
            Whoosh!
          </span>
          <div className="animate-float">
            {shipArt ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={shipArt}
                alt="Ink drawing of a starfighter"
                className="w-full drop-shadow-[0_0_24px_rgba(243,241,234,0.18)]"
              />
            ) : (
              <InkShip className="w-full" />
            )}
          </div>
          <span className="caption-ink absolute -bottom-4 right-2">
            Fig. 1 — the daily driver
          </span>
        </motion.div>
      </div>

      <a
        href="#about"
        aria-label="Scroll down"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float text-paper/40 hover:text-paper"
      >
        <ArrowDown size={22} />
      </a>
    </section>
  );
}
