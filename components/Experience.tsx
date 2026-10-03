"use client";

import { motion } from "framer-motion";
import { Rocket, Satellite } from "lucide-react";
import { profile } from "@/data/profile";
import SectionHeading from "./SectionHeading";
import Note from "./Note";
import { Timeline, TimelineItem, useStation } from "./Timeline";

/** Station stickers: cut-out skyline art shown beside each posting. */
export type StationArt = Partial<Record<"aecad" | "beehyv", string>>;

type Exp = (typeof profile.experience)[number];

// A service-record card that docks when the comet reaches its station: it glides
// in, its comic shadow plate pops out, the company name inks in, the dates stamp
// down, the bullets file in one by one and the station sticker drops onto its
// corner, with a light sweep across the panel. Hover lifts it and sweeps again.
function StationCard({ exp, station, note }: { exp: Exp; station?: string; note?: boolean }) {
  const { docked, reduced } = useStation();
  const spring = { type: "spring" as const, stiffness: 150, damping: 20, mass: 0.9 };
  const after = (s: number) => (docked && !reduced ? s : 0);

  return (
    <>
      {note && (
        <motion.div initial={false} animate={{ opacity: docked ? 1 : 0 }} transition={{ duration: 0.4, delay: after(1.1) }}>
          <Note text="built from the first commit" arrow="down-right" className="-top-11 right-60" />
        </motion.div>
      )}

      <motion.div
        className="group relative"
        initial={false}
        animate={docked ? { opacity: 1, x: 0, rotate: 0 } : { opacity: 0, x: 56, rotate: 1.5 }}
        transition={reduced ? { duration: 0 } : spring}
      >
        {/* comic shadow plate: slides out once the card has landed */}
        <span
          aria-hidden="true"
          className={`absolute inset-0 bg-paper transition-transform duration-300 ease-out ${
            docked ? "translate-x-[6px] translate-y-[6px] group-hover:translate-x-[9px] group-hover:translate-y-[9px]" : ""
          }`}
          style={{ transitionDelay: docked && !reduced ? "0.35s" : "0s" }}
        />

        <div className="relative border-2 border-paper bg-ink-2 p-6 transition-transform duration-300 ease-out group-hover:-translate-x-[2px] group-hover:-translate-y-[2px] sm:p-7">
          {/* light sweep: once on docking, again on hover */}
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <span
              key={docked ? "in" : "out"}
              className={`glint absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-paper/[0.09] to-transparent ${
                docked && !reduced ? "glint-run" : "opacity-0"
              }`}
            />
          </span>

          {station && (
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute -right-6 -top-14 hidden w-56 lg:block"
              initial={false}
              animate={docked ? { opacity: 1, y: 0, rotate: 0 } : { opacity: 0, y: -40, rotate: -9 }}
              transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 13, delay: after(0.3) }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={station}
                alt=""
                className="animate-float w-full drop-shadow-[0_0_20px_rgba(243,241,234,0.28)] transition-transform duration-500 group-hover:rotate-[-3deg]"
              />
            </motion.div>
          )}

          <div className={`flex flex-wrap items-baseline justify-between gap-3 ${station ? "lg:pr-56" : ""}`}>
            <motion.h3
              className="font-display text-2xl tracking-wide text-paper sm:text-3xl"
              initial={false}
              animate={{ clipPath: docked ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)" }}
              transition={{ duration: reduced ? 0 : 0.55, ease: [0.65, 0, 0.35, 1], delay: after(0.18) }}
            >
              {exp.company}
            </motion.h3>
            <motion.span
              className="tag"
              initial={false}
              animate={docked ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0, scale: 1.8, rotate: -10 }}
              transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 15, delay: after(0.42) }}
            >
              {exp.period}
            </motion.span>
          </div>
          <motion.p
            className="mt-1 font-hand text-base text-paper/80"
            initial={false}
            animate={docked ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
            transition={{ duration: reduced ? 0 : 0.35, delay: after(0.5) }}
          >
            {exp.role} · {exp.location}
          </motion.p>
          <ul className="mt-5 space-y-2.5 text-sm leading-relaxed text-paper/75">
            {exp.points.map((pt, j) => (
              <motion.li
                key={j}
                className="flex gap-3"
                initial={false}
                animate={docked ? { opacity: 1, x: 0 } : { opacity: 0, x: -14 }}
                transition={{ duration: reduced ? 0 : 0.38, ease: "easeOut", delay: after(0.6 + j * 0.08) }}
              >
                <span className="mt-[2px] shrink-0 font-mono text-paper transition-transform duration-300 group-hover:translate-x-[3px]">▸</span>
                <span>{pt}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </motion.div>
    </>
  );
}

export default function Experience({ stations = {} }: { stations?: StationArt }) {
  return (
    <section id="experience" className="relative mx-auto max-w-6xl overflow-x-clip px-6 py-24">
      <SectionHeading
        index="Log 02 · Trajectory"
        title="Experience"
        subtitle="Where I've been building. Service record, most recent first."
      />

      <Timeline>
        {profile.experience.map((exp, i) => {
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
              <StationCard exp={exp} station={station} note={i === 0} />
            </TimelineItem>
          );
        })}
      </Timeline>
    </section>
  );
}
