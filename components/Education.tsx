"use client";

import { Telescope, Star } from "lucide-react";
import { education } from "@/data/education";
import SectionHeading from "./SectionHeading";
import { Timeline, TimelineItem } from "./Timeline";

export default function Education({ crest }: { crest?: string }) {
  return (
    <section id="education" className="relative mx-auto max-w-6xl px-6 py-24">
      <SectionHeading
        index="Log 04 · Star Charts"
        title="Academic Journey"
        subtitle="The path that brought me here."
      />

      <Timeline>
        {education.map((e, i) => {
          const Icon = i === 0 ? Telescope : Star;
          return (
            <TimelineItem
              key={e.degree}
              index={i}
              total={education.length}
              icon={<Icon size={15} />}
              startLabel="latest"
              endLabel="first steps"
            >
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
            </TimelineItem>
          );
        })}
      </Timeline>
    </section>
  );
}
