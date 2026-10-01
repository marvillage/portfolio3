"use client";

import { profile } from "@/data/profile";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";
import OriginStrip from "./OriginStrip";
import { GraduationCap, MapPin, Briefcase, PenLine } from "lucide-react";

const facts = [
  {
    icon: GraduationCap,
    label: "Education",
    value: `B.Tech CSE · IIIT Nagpur ('26) · CGPA ${profile.cgpa}`,
  },
  { icon: Briefcase, label: "Current", value: "SDE @ AECAD.ai" },
  { icon: MapPin, label: "Based in", value: profile.location },
  { icon: PenLine, label: "Also", value: "Writer on Medium" },
];

export default function About({
  portraitArt,
  originArt = [],
}: {
  portraitArt?: string;
  originArt?: (string | undefined)[];
}) {
  return (
    <section id="about" className="relative mx-auto max-w-6xl px-6 py-24">
      <SectionHeading index="Log 01 · Origin" title="About Me" />

      <div className="grid gap-10 md:grid-cols-5">
        <div className="md:col-span-3">
          <Reveal>
            <div className="space-y-4 leading-relaxed text-paper/75">
              <p className="font-medium text-paper/90">{profile.summary}</p>
              {profile.about.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="md:col-span-2">
          <Reveal delay={0.15}>
            {portraitArt && (
              <div className="panel relative mb-6 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={portraitArt}
                  alt="Pencil portrait of Kushagra Srivastava"
                  className="ink-img block w-full"
                />
                <div className="halftone pointer-events-none absolute inset-0 opacity-20" />
                <span className="caption absolute left-3 top-3">Pilot ID</span>
              </div>
            )}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-1">
              {facts.map((f) => (
                <div key={f.label} className="panel-thin flex items-center gap-3 p-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center border-2 border-paper bg-paper text-ink">
                    <f.icon size={18} />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-paper/50">
                      {f.label}
                    </span>
                    <span className="text-sm text-paper">{f.value}</span>
                  </span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      {/* Origin story strip */}
      <Reveal delay={0.1}>
        <OriginStrip images={originArt} />
      </Reveal>

      {/* Skills */}
      <Reveal delay={0.2} className="mt-14">
        <span className="caption-ink">Loadout · Tech I work with</span>
        <div className="mt-5 space-y-4">
          {Object.entries(profile.skills).map(([group, items]) => (
            <div key={group} className="flex flex-col gap-2 sm:flex-row sm:items-start">
              <span className="w-32 shrink-0 pt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-paper/50">
                {group}
              </span>
              <div className="flex flex-wrap gap-2">
                {items.map((s) => (
                  <span key={s} className="tag">
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
