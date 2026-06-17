"use client";

import { profile } from "@/data/profile";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";

export default function About() {
  return (
    <section id="about" className="relative mx-auto max-w-6xl px-6 py-24">
      <SectionHeading index="01 — Origin" title="About Me" />

      <div className="grid gap-10 md:grid-cols-5">
        {/* Bio + skills */}
        <div className="md:col-span-3">
          <Reveal>
            <div className="space-y-4 text-space-star/75 leading-relaxed">
              {profile.about.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-8 space-y-4">
              {Object.entries(profile.skills).map(([group, items]) => (
                <div key={group}>
                  <p className="mb-2 text-sm font-semibold text-space-cyan">
                    {group}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {items.map((s) => (
                      <span
                        key={s}
                        className="rounded-full border border-space-accent/20 bg-space-navy/40 px-3 py-1 text-xs text-space-star/80"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Experience timeline */}
        <div className="md:col-span-2">
          <Reveal delay={0.2}>
            <div className="relative space-y-6 border-l border-space-accent/20 pl-6">
              {profile.experience.map((exp) => (
                <div key={exp.company} className="relative">
                  <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-space-cyan shadow-glow-cyan" />
                  <div className="glass rounded-xl p-4">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-semibold text-space-star">
                        {exp.company}
                      </h3>
                      <span className="text-xs text-space-star/50">
                        {exp.period}
                      </span>
                    </div>
                    <p className="text-sm text-space-cyan">{exp.role}</p>
                    <ul className="mt-2 space-y-1.5 text-xs text-space-star/65">
                      {exp.points.slice(0, 3).map((pt, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-space-violet">▹</span>
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="glass mt-6 rounded-xl p-4">
              <p className="mb-2 text-sm font-semibold text-space-cyan">
                Achievements
              </p>
              <ul className="space-y-2 text-xs text-space-star/70">
                {profile.achievements.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
