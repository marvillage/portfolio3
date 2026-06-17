"use client";

import { ArrowUpRight, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { articles, mediumProfile } from "@/data/articles";
import SectionHeading from "./SectionHeading";

const tagColor: Record<string, string> = {
  Tech: "text-space-cyan border-space-cyan/30 bg-space-cyan/5",
  Essay: "text-space-violet border-space-violet/30 bg-space-violet/5",
  Story: "text-emerald-300 border-emerald-400/30 bg-emerald-400/5",
  Horror: "text-rose-300 border-rose-400/30 bg-rose-400/5",
};

export default function Articles() {
  return (
    <section id="writing" className="relative mx-auto max-w-6xl px-6 py-24">
      <SectionHeading
        index="03 — Signals"
        title="Writing"
        subtitle="Beyond code, I write essays, reflections and horror stories on Medium."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {articles.map((a, i) => (
          <motion.a
            key={a.url}
            href={a.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45, delay: (i % 2) * 0.06 }}
            className="glass group flex items-start justify-between gap-4 rounded-xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow"
          >
            <div>
              <div className="mb-2 flex items-center gap-3">
                <span
                  className={`rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                    tagColor[a.tag] ?? tagColor.Essay
                  }`}
                >
                  {a.tag}
                </span>
                <span className="text-xs text-space-star/40">{a.date}</span>
              </div>
              <h3 className="font-medium leading-snug text-space-star transition-colors group-hover:text-space-cyan">
                {a.title}
              </h3>
              {a.excerpt && (
                <p className="mt-1.5 text-sm text-space-star/55">{a.excerpt}</p>
              )}
            </div>
            <ArrowUpRight
              size={18}
              className="mt-1 shrink-0 text-space-star/40 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-space-cyan"
            />
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
