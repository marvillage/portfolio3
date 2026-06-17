"use client";

import { Github, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { projects } from "@/data/projects";
import SectionHeading from "./SectionHeading";

export default function Projects() {
  const ordered = [...projects].sort(
    (a, b) => Number(!!b.featured) - Number(!!a.featured)
  );

  return (
    <section id="projects" className="relative mx-auto max-w-6xl px-6 py-24">
      <SectionHeading
        index="06 — Constellations"
        title="Projects"
        subtitle="Things I've designed, built and shipped. Each one links to its live deployment or source."
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {ordered.map((p, i) => (
          <motion.article
            key={p.title}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8, scale: 1.02 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
            className="glass group relative flex flex-col rounded-2xl p-6 transition-shadow duration-300 hover:shadow-glow"
          >
            <div className="mb-4 flex items-start justify-between">
              <span className="text-3xl" aria-hidden>
                {p.planet}
              </span>
              <div className="flex gap-3">
                {p.github && (
                  <a
                    href={p.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${p.title} source on GitHub`}
                    className="text-space-star/55 transition-colors hover:text-space-cyan"
                  >
                    <Github size={18} />
                  </a>
                )}
                {p.live && (
                  <a
                    href={p.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${p.title} live site`}
                    className="text-space-star/55 transition-colors hover:text-space-cyan"
                  >
                    <ExternalLink size={18} />
                  </a>
                )}
              </div>
            </div>

            <h3 className="font-display text-xl font-bold text-space-star">
              {p.title}
              {p.featured && (
                <span className="ml-2 align-middle text-[10px] uppercase tracking-wider text-space-cyan">
                  ★ featured
                </span>
              )}
            </h3>

            <p className="mt-3 flex-1 text-sm leading-relaxed text-space-star/65">
              {p.blurb}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {p.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-md bg-space-deep/60 px-2 py-1 text-[11px] text-space-cyan/80"
                >
                  {t}
                </span>
              ))}
            </div>

            {p.live && (
              <a
                href={p.live}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-space-cyan opacity-0 transition-opacity group-hover:opacity-100"
              >
                Visit live <ExternalLink size={14} />
              </a>
            )}
          </motion.article>
        ))}
      </div>

      <div className="mt-10 text-center">
        <a
          href="https://github.com/marvillage"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-space-accent/40 px-6 py-3 text-sm font-medium text-space-star transition-colors hover:bg-space-accent/15"
        >
          <Github size={16} /> See all repositories
        </a>
      </div>
    </section>
  );
}
