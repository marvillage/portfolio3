"use client";

import { motion } from "framer-motion";
import { profile } from "@/data/profile";
import SectionHeading from "./SectionHeading";

export default function Experience() {
  return (
    <section id="experience" className="relative mx-auto max-w-6xl px-6 py-24">
      <SectionHeading
        index="02 — Trajectory"
        title="Experience"
        subtitle="Where I've been building."
      />

      <div className="relative border-l border-space-accent/20 pl-8">
        {profile.experience.map((exp, i) => (
          <motion.div
            key={exp.company}
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="relative mb-10 last:mb-0"
          >
            <span className="absolute -left-[41px] top-2 grid h-5 w-5 place-items-center rounded-full bg-space-void ring-2 ring-space-cyan">
              <span className="h-2 w-2 rounded-full bg-space-cyan shadow-glow-cyan" />
            </span>

            <div className="glass rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-glow">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-display text-xl font-bold text-space-star">
                  {exp.company}
                </h3>
                <span className="rounded-full bg-space-accent/10 px-3 py-1 text-xs text-space-cyan">
                  {exp.period}
                </span>
              </div>
              <p className="mt-0.5 text-sm font-medium text-space-violet">
                {exp.role} · {exp.location}
              </p>
              <ul className="mt-4 space-y-2 text-sm text-space-star/70">
                {exp.points.map((pt, j) => (
                  <li key={j} className="flex gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-space-cyan/70" />
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
