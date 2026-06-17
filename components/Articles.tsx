"use client";

import { ArrowUpRight, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { articles, mediumProfile } from "@/data/articles";
import SectionHeading from "./SectionHeading";

const tagColor: Record<string, string> = {
  Tech: "text-space-cyan border-space-cyan/40 bg-space-cyan/10",
  Essay: "text-space-violet border-space-violet/40 bg-space-violet/10",
  Story: "text-emerald-300 border-emerald-400/40 bg-emerald-400/10",
  Horror: "text-rose-300 border-rose-400/40 bg-rose-400/10",
};

export default function Articles() {
  return (
    <section id="writing" className="relative mx-auto max-w-6xl px-6 py-24">
      <SectionHeading
        index="05 — Signals"
        title="Writing"
        subtitle="Beyond code, I write essays, reflections and horror stories on Medium."
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a, i) => (
          <motion.a
            key={a.url}
            href={a.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -6 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45, delay: (i % 3) * 0.07 }}
            className="glass group flex flex-col overflow-hidden rounded-2xl transition-shadow duration-300 hover:shadow-glow"
          >
            {/* cover image */}
            <div className="relative h-44 overflow-hidden">
              {a.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={a.image}
                  alt={a.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-space-deep to-space-navy" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-space-void via-space-void/20 to-transparent" />
              <span
                className={`absolute left-3 top-3 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide backdrop-blur ${
                  tagColor[a.tag] ?? tagColor.Essay
                }`}
              >
                {a.tag}
              </span>
            </div>

            {/* body */}
            <div className="flex flex-1 flex-col p-5">
              <span className="mb-1.5 text-xs text-space-star/40">{a.date}</span>
              <h3 className="font-medium leading-snug text-space-star transition-colors group-hover:text-space-cyan">
                {a.title}
              </h3>
              {a.excerpt && (
                <p className="mt-2 text-sm text-space-star/55">{a.excerpt}</p>
              )}
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-space-cyan opacity-0 transition-opacity group-hover:opacity-100">
                Read story
                <ArrowUpRight size={14} />
              </span>
            </div>
          </motion.a>
        ))}
      </div>

      <div className="mt-10 text-center">
        <a
          href={mediumProfile}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-space-accent/40 px-6 py-3 text-sm font-medium text-space-star transition-colors hover:bg-space-accent/15"
        >
          <BookOpen size={16} /> Read more on Medium
        </a>
      </div>
    </section>
  );
}
