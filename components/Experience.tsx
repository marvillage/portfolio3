"use client";

import { motion } from "framer-motion";
import { profile } from "@/data/profile";
import SectionHeading from "./SectionHeading";
import Note from "./Note";

/** "BeeHyv Software Solutions" → "beehyv-software-solutions"; matches /art/patches/<slug>.png */
const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export default function Experience({ patches = [] }: { patches?: string[] }) {
  const patchFor = (company: string) =>
    patches.find(
      (p) => (p.split("/").pop() ?? "").replace(/\.[a-z0-9]+$/i, "") === slug(company)
    );

  return (
    <section id="experience" className="relative mx-auto max-w-6xl px-6 py-24">
      <SectionHeading
        index="Log 02 · Missions"
        title="Experience"
        subtitle="Service record, most recent first."
      />

      <div className="relative border-l-2 border-paper/60 pl-8">
        {profile.experience.map((exp, i) => {
          const patch = patchFor(exp.company);
          return (
          <motion.div
            key={exp.company}
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="relative mb-12 last:mb-0"
          >
            <span className="absolute -left-[43px] top-3 grid h-6 w-6 place-items-center border-2 border-paper bg-ink">
              <span className="h-2 w-2 bg-paper" />
            </span>

            {i === 0 && (
              <Note text="built from the first commit" arrow="down-right" className="-top-11 right-60" />
            )}

            <div className="panel panel-hover relative p-6 sm:p-7">
              {patch && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={patch}
                  alt={`${exp.company} mission patch`}
                  className="ink-img absolute right-6 top-6 hidden h-20 w-20 rounded-full border-2 border-paper object-cover sm:block"
                />
              )}
              <div className={`flex flex-wrap items-baseline justify-between gap-3 ${patch ? "sm:pr-24" : ""}`}>
                <h3 className="font-display text-2xl tracking-wide text-paper sm:text-3xl">
                  {exp.company}
                </h3>
                <span className="tag">{exp.period}</span>
              </div>
              <p className="mt-1 font-hand text-base text-paper/80">
                {exp.role} · {exp.location}
              </p>
              <ul className="mt-5 space-y-2.5 text-sm leading-relaxed text-paper/75">
                {exp.points.map((pt, j) => (
                  <li key={j} className="flex gap-3">
                    <span className="mt-[2px] shrink-0 font-mono text-paper">▸</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
          );
        })}
      </div>
    </section>
  );
}
