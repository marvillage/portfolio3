"use client";

import { ArrowUpRight, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { articles, mediumProfile, mediumStats, type Article } from "@/data/articles";
import SectionHeading from "./SectionHeading";
import ArtStrip from "./ArtStrip";
import Note from "./Note";

export default function Articles({
  banner,
  posts,
  live = false,
  published = mediumStats.published,
}: {
  banner?: string;
  posts?: Article[];
  live?: boolean;
  published?: number;
}) {
  const list = posts && posts.length > 0 ? posts : articles;
  return (
    <section id="writing" className="relative mx-auto max-w-6xl px-6 py-24">
      <SectionHeading
        index="Log 08 · Transmissions"
        title="Writing"
        subtitle="Beyond code, I write essays, reflections and horror stories on Medium."
      />

      {banner && <ArtStrip src={banner} alt="Writing desk aboard a space station" caption="Transmissions" />}

      <div className="relative mb-10 flex flex-wrap items-stretch gap-4">
        <Note text="and counting…" arrow="down-left" className="-top-14 left-36" />
        {[
          { n: `${published}+`, l: "Stories published" },
          { n: String(list.length), l: live ? "Latest · synced hourly" : "Stories featured" },
          { n: "4", l: "Genres" },
          { n: "@KUSH_24", l: "on Medium" },
        ].map((s) => (
          <div key={s.l} className="panel-thin px-5 py-3 text-center">
            <div className="font-display text-2xl tracking-wide text-paper">{s.n}</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper/55">
              {s.l}
            </div>
          </div>
        ))}
        {live && (
          <div className="flex items-center">
            <span className="caption animate-flicker">● Live feed</span>
          </div>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((a, i) => (
          <motion.a
            key={a.url}
            href={a.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45, delay: (i % 3) * 0.07 }}
            className="panel-thin group flex flex-col overflow-hidden"
          >
            {/* cover image, inked */}
            <div className="relative h-44 overflow-hidden border-b border-paper/40 bg-ink">
              {a.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={a.image}
                  alt={a.title}
                  loading="lazy"
                  className="ink-img h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="halftone h-full w-full opacity-30" />
              )}
              <div className="halftone pointer-events-none absolute inset-0 opacity-15" />
              <span className="caption absolute left-3 top-3 !py-0.5 !text-[11px]">{a.tag}</span>
            </div>

            {/* body */}
            <div className="flex flex-1 flex-col p-5">
              <span className="mb-1.5 font-mono text-[11px] text-paper/45">{a.date}</span>
              <h3 className="font-medium leading-snug text-paper">{a.title}</h3>
              {a.excerpt && <p className="mt-2 text-sm text-paper/60">{a.excerpt}</p>}
              <span className="mt-4 inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.14em] text-paper/60 transition-colors group-hover:text-paper">
                Read story
                <ArrowUpRight size={14} />
              </span>
            </div>
          </motion.a>
        ))}
      </div>

      <div className="mt-12 text-center">
        <a href={mediumProfile} target="_blank" rel="noopener noreferrer" className="btn-ghost">
          <BookOpen size={16} /> Read more on Medium
        </a>
      </div>
    </section>
  );
}
