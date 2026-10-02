"use client";

import { Rocket, Satellite } from "lucide-react";
import { profile } from "@/data/profile";
import SectionHeading from "./SectionHeading";
import Note from "./Note";
import { Timeline, TimelineItem } from "./Timeline";

/** "BeeHyv Software Solutions" → "beehyv-software-solutions"; matches /art/patches/<slug>.png */
const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/\s*\(.*?\)\s*/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Station stickers: cut-out skyline art shown beside each posting. */
export type StationArt = Partial<Record<"aecad" | "beehyv", string>>;

export default function Experience({ patches = [], stations = {} }: { patches?: string[]; stations?: StationArt }) {
  const patchFor = (company: string) =>
    patches.find(
      (p) => (p.split("/").pop() ?? "").replace(/\.[a-z0-9]+$/i, "") === slug(company)
    );

  return (
    <section id="experience" className="relative mx-auto max-w-6xl px-6 py-24">
      <SectionHeading
        index="Log 02 · Trajectory"
        title="Experience"
        subtitle="Where I've been building. Service record, most recent first."
      />

      <Timeline>
        {profile.experience.map((exp, i) => {
          const patch = patchFor(exp.company);
          const station = i === 0 ? stations.aecad : stations.beehyv;
          const Icon = i === 0 ? Rocket : Satellite;
          return (
            <TimelineItem
              key={exp.company}
              index={i}
              total={profile.experience.length}
              icon={<Icon size={15} />}
              startLabel="now"
              endLabel="where it began"
            >
              {i === 0 && (
                <Note text="built from the first commit" arrow="down-right" className="-top-11 right-60" />
              )}

              <div className="panel panel-hover relative p-6 sm:p-7">
                {station && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={station}
                    alt=""
                    aria-hidden="true"
                    className="animate-float pointer-events-none absolute -right-6 -top-14 hidden w-56 drop-shadow-[0_0_20px_rgba(243,241,234,0.28)] lg:block"
                  />
                )}
                {patch && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={patch}
                    alt={`${exp.company} mission patch`}
                    className={`ink-img absolute right-6 hidden h-20 w-20 rounded-full border-2 border-paper object-cover sm:block ${station ? "-bottom-8" : "top-6"}`}
                  />
                )}
                <div className={`flex flex-wrap items-baseline justify-between gap-3 ${patch && !station ? "sm:pr-24" : ""} ${station ? "lg:pr-56" : ""}`}>
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
            </TimelineItem>
          );
        })}
      </Timeline>
    </section>
  );
}
