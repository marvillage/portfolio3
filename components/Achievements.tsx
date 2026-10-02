"use client";

import { motion } from "framer-motion";
import { profile } from "@/data/profile";
import SectionHeading from "./SectionHeading";
import Counter from "./Counter";
import ArtStrip from "./ArtStrip";
import MedalWall, { type AwardArt } from "./MedalWall";

const stats = [
  { to: 4, suffix: "+", label: "Competition wins" },
  { to: 8, suffix: "+", label: "Articles published" },
  { to: 20, suffix: "+", label: "Projects shipped" },
  { to: 0, suffix: "", label: "CGPA", raw: profile.cgpa },
];

export default function Achievements({ banner, awards, wall }: { banner?: string; awards?: AwardArt; wall?: string }) {
  return (
    <section id="achievements" className="relative mx-auto max-w-6xl px-6 py-24">
      <SectionHeading
        index="Log 07 · Milestones"
        title="Achievements"
        subtitle="Wins, ranks and recognitions along the way."
      />

      {banner && <ArtStrip src={banner} alt="Trophy wall aboard a ship" caption="Trophy shelf" />}

      {/* stat band */}
      <div className="mb-12 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className={`${i % 2 === 0 ? "panel-paper" : "panel"} p-5 text-center`}
          >
            <div className="font-display text-4xl tracking-wide sm:text-5xl">
              {s.raw ? s.raw : <Counter to={s.to} suffix={s.suffix} />}
            </div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] opacity-70">
              {s.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* medal wall */}
      <MedalWall art={awards} wall={wall} />
    </section>
  );
}
