"use client";

import { motion } from "framer-motion";
import { BadgeCheck } from "lucide-react";
import { certifications } from "@/data/certifications";
import SectionHeading from "./SectionHeading";

export default function Certifications() {
  return (
    <section id="certifications" className="relative mx-auto max-w-6xl px-6 py-24">
      <SectionHeading
        index="Log 05 · Credentials"
        title="Certifications & Courses"
        subtitle="Verified coursework across AI/ML, web, cloud, security, and a little astrophysics."
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {certifications.map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: (i % 3) * 0.06 }}
            className="panel-thin flex flex-col p-5"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="grid h-9 w-9 place-items-center border-2 border-paper bg-paper text-ink">
                <BadgeCheck size={18} />
              </span>
              <span className="font-mono text-[11px] text-paper/50">{c.date}</span>
            </div>
            <h3 className="font-medium leading-snug text-paper">{c.title}</h3>
            <p className="mt-1 font-hand text-sm text-paper/70">{c.issuer}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {c.tags.map((t) => (
                <span key={t} className="tag">
                  {t}
                </span>
              ))}
            </div>
            {c.credentialId && (
              <p className="mt-3 truncate font-mono text-[10px] text-paper/35">
                ID: {c.credentialId}
              </p>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
