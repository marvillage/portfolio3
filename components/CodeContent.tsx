"use client";

import { motion } from "framer-motion";
import { Code2, PenLine, Users } from "lucide-react";
import { involvement } from "@/data/involvement";
import SectionHeading from "./SectionHeading";

const kindMeta: Record<string, { color: string; Icon: typeof Code2 }> = {
  Content: { color: "text-space-cyan border-space-cyan/40 bg-space-cyan/10", Icon: PenLine },
  Tech: { color: "text-space-accent border-space-accent/40 bg-space-accent/10", Icon: Code2 },
  Leadership: { color: "text-amber-300 border-amber-400/40 bg-amber-400/10", Icon: Users },
};

export default function CodeContent() {
  return (
    <section id="code-content" className="relative mx-auto max-w-6xl px-6 py-24">
      <SectionHeading
        index="03 — Dual Orbit"
        title="Crafted in Code & Content"
        subtitle="Two sides of the same orbit — building software and leading content, editorial and creative teams at IIIT Nagpur."
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {involvement.map((r, i) => {
          const meta = kindMeta[r.kind];
          return (
            <motion.div
              key={`${r.title}-${r.org}-${i}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.06 }}
              className="glass flex flex-col rounded-2xl p-5 transition-shadow hover:shadow-glow"
            >
              <div className="mb-3 flex items-center justify-between">
                <span
                  className={`grid h-9 w-9 place-items-center rounded-lg border ${meta.color}`}
                >
                  <meta.Icon size={16} />
                </span>
                <span className="text-xs text-space-star/45">{r.period}</span>
              </div>
              <h3 className="font-medium leading-snug text-space-star">{r.title}</h3>
              <p className="mt-1 text-sm text-space-star/60">{r.org}</p>
              <span
                className={`mt-3 w-fit rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${meta.color}`}
              >
                {r.kind}
              </span>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
