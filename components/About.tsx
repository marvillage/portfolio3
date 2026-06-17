"use client";

import { profile } from "@/data/profile";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";
import { GraduationCap, MapPin, Briefcase, PenLine } from "lucide-react";

const facts = [
  { icon: GraduationCap, label: "Education", value: "B.Tech CSE · IIIT Nagpur ('26)" },
  { icon: Briefcase, label: "Current", value: "SDE @ AECAD.ai" },
  { icon: MapPin, label: "Based in", value: "Ghaziabad, India" },
  { icon: PenLine, label: "Also", value: "Writer on Medium" },
];

export default function About() {
  return (
    <section id="about" className="relative mx-auto max-w-6xl px-6 py-24">
      <SectionHeading index="01 — Origin" title="About Me" />

      <div className="grid gap-10 md:grid-cols-5">
        <div className="md:col-span-3">
          <Reveal>
            <div className="space-y-4 leading-relaxed text-space-star/75">
              {profile.about.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="md:col-span-2">
          <Reveal delay={0.15}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-1">
              {facts.map((f) => (
                <div
                  key={f.label}
                  className="glass flex items-center gap-3 rounded-xl p-4 transition-all hover:-translate-y-0.5 hover:shadow-glow"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-space-accent/15 text-space-cyan">
                    <f.icon size={18} />
                  </span>
                  <span>
                    <span className="block text-xs uppercase tracking-wider text-space-star/45">
                      {f.label}
                    </span>
                    <span className="text-sm text-space-star">{f.value}</span>
                  </span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      {/* Skills */}
      <Reveal delay={0.2} className="mt-12">
        <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-space-cyan">
          Tech I work with
        </h3>
        <div className="space-y-4">
          {Object.entries(profile.skills).map(([group, items]) => (
            <div key={group} className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <span className="w-28 shrink-0 text-sm text-space-star/50">{group}</span>
              <div className="flex flex-wrap gap-2">
                {items.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-space-accent/20 bg-space-navy/40 px-3 py-1 text-xs text-space-star/85 transition-colors hover:border-space-cyan/50 hover:text-space-cyan"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
