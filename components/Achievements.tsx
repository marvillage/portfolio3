"use client";

import { motion } from "framer-motion";
import { Trophy, Medal, Award, Bug } from "lucide-react";
import { profile } from "@/data/profile";
import SectionHeading from "./SectionHeading";
import Counter from "./Counter";

const icons = [Trophy, Medal, Award, Bug];

const stats = [
  { to: 4, suffix: "+", label: "Competition wins" },
  { to: 8, suffix: "+", label: "Articles published" },
  { to: 20, suffix: "+", label: "Projects shipped" },
  { to: 8, suffix: ".19", label: "CGPA", raw: true },
];

export default function Achievements() {
  return (
    <section id="achievements" className="relative mx-auto max-w-6xl px-6 py-24">
      <SectionHeading
        index="04 — Milestones"
        title="Achievements"
        subtitle="Wins, ranks and recognitions along the way."
      />

      {/* animated stat band */}
      <div className="mb-12 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="glass rounded-2xl p-5 text-center"
          >
            <div className="font-display text-3xl font-bold gradient-text">
              {s.raw ? "8.19" : <Counter to={s.to} suffix={s.suffix} />}
            </div>
            <div className="mt-1 text-xs uppercase tracking-wider text-space-star/55">
              {s.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* achievement cards */}
      <div className="grid gap-5 sm:grid-cols-2">
        {profile.achievements.map((a, i) => {
          const Icon = icons[i % icons.length];
          // strip the leading emoji from the data string for clean display
          const text = a.replace(/^[^\sA-Za-z]+\s*/, "");
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -4 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: (i % 2) * 0.08 }}
              className="glass flex gap-4 rounded-2xl p-5 transition-shadow hover:shadow-glow"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-space-accent/20 to-space-violet/20 text-space-cyan">
                <Icon size={20} />
              </span>
              <p className="text-sm leading-relaxed text-space-star/80">{text}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
