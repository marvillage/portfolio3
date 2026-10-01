"use client";

import { motion } from "framer-motion";
import { Code2, PenLine, Users } from "lucide-react";
import { involvement } from "@/data/involvement";
import SectionHeading from "./SectionHeading";
import ArtStrip from "./ArtStrip";

const kindIcon: Record<string, typeof Code2> = {
  Content: PenLine,
  Tech: Code2,
  Leadership: Users,
};

export default function CodeContent({ banner }: { banner?: string }) {
  return (
    <section id="code-content" className="relative mx-auto max-w-6xl px-6 py-24">
      <SectionHeading
        index="Log 03 · Dual Orbit"
        title="Crafted in Code & Content"
        subtitle="Two sides of the same orbit — building software and leading content, editorial and creative teams at IIIT Nagpur."
      />

      {banner && <ArtStrip src={banner} alt="A pilot coding and a pilot on stage" caption="Dual orbit" />}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {involvement.map((r, i) => {
          const Icon = kindIcon[r.kind] ?? Code2;
          return (
            <motion.div
              key={`${r.title}-${r.org}-${i}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.06 }}
              className="panel-thin flex flex-col p-5"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="grid h-9 w-9 place-items-center border-2 border-paper bg-paper text-ink">
                  <Icon size={16} />
                </span>
                <span className="font-mono text-[11px] text-paper/50">{r.period}</span>
              </div>
              <h3 className="font-display text-xl tracking-wide text-paper">{r.title}</h3>
              <p className="mt-1 font-hand text-sm text-paper/70">{r.org}</p>
              <span className="tag mt-4 w-fit">{r.kind}</span>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
