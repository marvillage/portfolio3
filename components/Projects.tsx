"use client";

import { Github, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { projects } from "@/data/projects";
import SectionHeading from "./SectionHeading";

// Comic sound effects that pop on hover, and fallback dialogue for cards without a quip
const BURSTS = ["SHIP IT!", "POW!", "ORBIT!", "WHOOSH!", "KA-CHUNK!", "MERGED!", "200 OK!", "ZAP!", "BOOM!", "LIFT-OFF!"];
const QUIPS = [
  "Deployed. No casualties.",
  "Hold my coffee, pilot.",
  "It compiled on the first try. Honest.",
  "Logged, tagged and launched.",
];

/** "ZENTRO — Multi-Tenant…" → "zentro"; used to find /art/projects/<slug>.png */
export function projectSlug(title: string) {
  return title
    .split(/[—:]/)[0]
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Browser-framed capture of a project's live site. When a full-page capture exists the
// view scrolls down the page on hover, like someone skimming the dashboard.
function LivePreview({ title, href, src, full }: { title: string; href: string; src: string; full?: string }) {
  const url = href.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open the live ${title}`}
      className="relative block border-b border-paper/40 bg-ink"
    >
      <div className="flex items-center gap-2 border-b border-paper/30 bg-ink-2 px-3 py-2">
        <span aria-hidden className="flex gap-1">
          <span className="h-2 w-2 rounded-full border border-paper/60" />
          <span className="h-2 w-2 rounded-full border border-paper/60" />
          <span className="h-2 w-2 rounded-full border border-paper/60" />
        </span>
        <span className="min-w-0 flex-1 truncate border border-paper/25 bg-ink px-2 py-0.5 font-mono text-[10px] tracking-[0.04em] text-paper/70">
          {url}
        </span>
      </div>
      <div className="relative aspect-[16/10] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={full ?? src}
          alt={`Screenshot of the live ${title}`}
          loading="lazy"
          className={`h-full w-full object-cover [filter:grayscale(1)_contrast(1.08)] ${
            full ? "object-top transition-[object-position] duration-[5s] ease-in-out group-hover:object-bottom" : "object-top"
          }`}
        />
      </div>
    </a>
  );
}

export default function Projects({ artFiles = [], liveFiles = [] }: { artFiles?: string[]; liveFiles?: string[] }) {
  const ordered = [...projects].sort(
    (a, b) => Number(!!a.last) - Number(!!b.last) || Number(!!b.featured) - Number(!!a.featured)
  );

  const artFor = (title: string, explicit?: string) => {
    if (explicit) return explicit;
    const slug = projectSlug(title);
    const hit = artFiles.find((f) => f.replace(/\.[a-z0-9]+$/i, "") === slug);
    return hit ? `/art/projects/${hit}` : undefined;
  };
  // capture of the live site: <slug>.webp for the first screen, <slug>-full.webp for the whole page
  const liveFor = (title: string) => {
    const slug = projectSlug(title);
    const find = (name: string) => liveFiles.find((f) => f.replace(/\.[a-z0-9]+$/i, "") === name);
    const first = find(slug);
    if (!first) return undefined;
    const full = find(`${slug}-full`);
    return { src: `/art/projects/live/${first}`, full: full ? `/art/projects/live/${full}` : undefined };
  };

  return (
    <section id="projects" className="relative mx-auto max-w-6xl px-6 py-24">
      <SectionHeading
        index="Log 06 · Constellations"
        title="Projects"
        subtitle="Things I've designed, built and shipped. Each one links to its live deployment or source."
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {ordered.map((p, i) => {
          const shot = p.live ? liveFor(p.title) : undefined;
          const img = shot ? undefined : artFor(p.title, p.image);
          const status = p.live ? "Live" : p.github ? "Source" : "Private";
          const burst = BURSTS[i % BURSTS.length];
          const quip = p.quip ?? QUIPS[i % QUIPS.length];
          return (
            <motion.article
              key={p.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (i % 2) * 0.08 }}
              className="panel-thin group relative flex flex-col"
            >
              {/* comic sound effect + dialogue, on hover / focus */}
              <span
                aria-hidden="true"
                className="burst pointer-events-none absolute -right-3 -top-6 z-20 h-20 w-20 rotate-6 scale-0 text-[13px] transition-transform duration-200 ease-[cubic-bezier(.2,1.6,.4,1)] group-hover:scale-100 group-focus-within:scale-100 sm:h-24 sm:w-24 sm:text-[15px]"
              >
                {burst}
              </span>
              <div
                aria-hidden="true"
                className={`bubble pointer-events-none absolute left-4 ${shot ? "top-28" : "top-16"} z-20 max-w-[72%] translate-y-2 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100`}
              >
                {quip}
              </div>
              {/* log header */}
              <div className="flex items-center justify-between border-b border-paper/40 px-5 py-3">
                <span className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-paper/60">
                  <span>
                    Log {String(i + 1).padStart(2, "0")}
                    {p.featured && <span className="ml-3 text-paper">★ Featured</span>}
                  </span>
                  {i === 0 && (
                    <span className="hidden font-hand text-sm normal-case tracking-normal text-paper/70 md:inline">
                      ← start here, pilot
                    </span>
                  )}
                </span>
                <span className="caption -rotate-3 !py-1 !text-xs">{status}</span>
              </div>

              {/* the live site, captured; otherwise the inked thumbnail */}
              {shot && p.live && (
                <LivePreview title={p.title.split(/[—(]/)[0].trim()} href={p.live + (p.livePath ?? "")} src={shot.src} full={shot.full} />
              )}
              {img && (
                <div className="relative aspect-[16/9] overflow-hidden border-b border-paper/40 bg-ink">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={`${p.title} illustration`}
                    loading="lazy"
                    className="ink-img h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="halftone pointer-events-none absolute inset-0 opacity-20 transition-all duration-300 group-hover:opacity-40 group-hover:[background-size:11px_11px]" />
                </div>
              )}

              {/* body */}
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <span
                    className="text-2xl leading-none"
                    style={{ filter: "grayscale(1) contrast(1.2)" }}
                    aria-hidden
                  >
                    {p.planet}
                  </span>
                  <h3 className="font-display text-2xl leading-tight tracking-wide text-paper">
                    {p.title}
                  </h3>
                </div>

                <p className="mt-3 flex-1 text-sm leading-relaxed text-paper/70">{p.blurb}</p>

                <div className="mt-5 flex flex-wrap gap-1.5">
                  {p.tags.map((t) => (
                    <span key={t} className="tag">
                      {t}
                    </span>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap gap-3 border-t border-paper/30 pt-4">
                  {p.github && (
                    <a
                      href={p.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.14em] text-paper/70 transition-colors hover:text-paper"
                    >
                      <Github size={14} /> Source
                    </a>
                  )}
                  {p.live && (
                    <a
                      href={p.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.14em] text-paper/70 transition-colors hover:text-paper"
                    >
                      <ExternalLink size={14} /> Visit live
                    </a>
                  )}
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <a
          href="https://github.com/marvillage"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost"
        >
          <Github size={16} /> See all repositories
        </a>
      </div>
    </section>
  );
}
