"use client";

import { motion } from "framer-motion";
import { BookMarked, ExternalLink } from "lucide-react";
import { publications } from "@/data/publications";
import SectionHeading from "./SectionHeading";

export default function Publications() {
  return (
    <section id="publications" className="relative mx-auto max-w-6xl px-6 py-24">
      <SectionHeading
        index="06 — Archives"
        title="Publications"
        subtitle="Books I've authored — across fiction, technology and essays."
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {publications.map((p, i) => (
          <motion.a
            key={p.title}
            href={p.link || "#"}
            target={p.link && p.link !== "#" ? "_blank" : undefined}
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -6 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45, delay: i * 0.08 }}
            className="glass group relative flex flex-col rounded-2xl p-6 transition-shadow hover:shadow-glow"
          >
            {/* book cover */}
            <div className="mb-5 flex h-40 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-space-deep via-space-navy to-space-slate">
              {p.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.cover} alt={p.title} className="h-full w-full object-cover" />
              ) : (
                <BookMarked size={44} className="text-space-cyan/70" />
              )}
            </div>

            <span className="mb-2 w-fit rounded-md border border-space-violet/40 bg-space-violet/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-space-violet">
              {p.type}
            </span>
            <h3 className="font-display text-lg font-bold text-space-star transition-colors group-hover:text-space-cyan">
              {p.title}
            </h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-space-star/65">
              {p.description}
            </p>
            {p.link && p.link !== "#" && (
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-space-cyan opacity-0 transition-opacity group-hover:opacity-100">
                Read / Buy <ExternalLink size={14} />
              </span>
            )}
          </motion.a>
        ))}
      </div>
    </section>
  );
}
