"use client";

import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";
import { education } from "@/data/education";
import SectionHeading from "./SectionHeading";

export default function Education() {
  return (
    <section id="education" className="relative mx-auto max-w-6xl px-6 py-24">
      <SectionHeading
        index="04 — Star Charts"
        title="Academic Journey"
        subtitle="The path that brought me here."
      />

      <div className="relative border-l border-space-accent/20 pl-8">
        {education.map((e, i) => (
          <motion.div
            key={e.degree}
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="relative mb-8 last:mb-0"
          >
            <span className="absolute -left-[41px] top-2 grid h-5 w-5 place-items-center rounded-full bg-space-void ring-2 ring-space-accent">
              <GraduationCap size={11} className="text-space-accent" />
            </span>
            <div className="glass rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-glow">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-display text-lg font-bold text-space-star">
                  {e.degree}
                </h3>
                <span className="rounded-full bg-space-accent/10 px-3 py-1 text-xs text-space-accent">
                  {e.period}
                </span>
              </div>
              <p className="mt-1 text-sm font-medium text-space-cyan">{e.institution}</p>
              <p className="mt-1 text-sm text-space-star/60">{e.detail}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
