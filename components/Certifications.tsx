"use client";

import { motion } from "framer-motion";
import { BadgeCheck } from "lucide-react";
import { certifications } from "@/data/certifications";
import SectionHeading from "./SectionHeading";

export default function Certifications() {
  return (
    <section id="certifications" className="relative mx-auto max-w-6xl px-6 py-24">
      <SectionHeading
        index="05 — Credentials"
        title="Certifications & Courses"
        subtitle="Verified coursework across AI/ML, web, cloud, security — and a little astrophysics."
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {certifications.map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: (i % 3) * 0.06 }}
            className="glass flex flex-col rounded-2xl p-5 transition-shadow hover:shadow-glow"
          >
            <div className="mb-3 flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-space-accent/20 to-space-cyan/20 text-space-cyan">
                <BadgeCheck size={20} />
              </span>
              <span className="text-xs text-space-star/45">{c.date}</span>
            </div>
            <h3 className="font-medium leading-snug text-space-star">{c.title}</h3>
            <p className="mt-1 text-sm text-space-cyan/90">{c.issuer}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {c.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-md bg-space-deep/60 px-2 py-0.5 text-[10px] text-space-star/70"
                >
                  {t}
                </span>
              ))}
            </div>
            {c.credentialId && (
              <p className="mt-3 truncate text-[10px] text-space-star/35">
                ID: {c.credentialId}
              </p>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
