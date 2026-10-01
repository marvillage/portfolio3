"use client";

import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";
import { education } from "@/data/education";
import SectionHeading from "./SectionHeading";

export default function Education({ crest }: { crest?: string }) {
  return (
    <section id="education" className="relative mx-auto max-w-6xl px-6 py-24">
      <SectionHeading
        index="Log 04 · Star Charts"
        title="Academic Journey"
        subtitle="The path that brought me here."
      />

      <div className="relative border-l-2 border-paper/60 pl-8">
        {education.map((e, i) => (
          <motion.div
            key={e.degree}
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="relative mb-8 last:mb-0"
          >
            <span className="absolute -left-[43px] top-3 grid h-6 w-6 place-items-center border-2 border-paper bg-paper text-ink">
              <GraduationCap size={13} />
            </span>
            <div className="panel-thin flex gap-5 p-6">
              {i === 0 && crest && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={crest}
                  alt="Academy crest"
                  className="ink-img hidden h-20 w-20 shrink-0 border-2 border-paper object-cover sm:block"
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h3 className="font-display text-xl tracking-wide text-paper sm:text-2xl">
                    {e.degree}
                  </h3>
                  <span className="tag">{e.period}</span>
                </div>
                <p className="mt-1 font-hand text-base text-paper/85">{e.institution}</p>
                <p className="mt-1 font-mono text-xs text-paper/55">{e.detail}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
