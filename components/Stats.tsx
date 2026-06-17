"use client";

import { Github, Code2, ExternalLink } from "lucide-react";
import { profile } from "@/data/profile";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";

// github-readme-stats themed to the space palette
const gh = profile.github;
const statsUrl = `https://github-readme-stats.vercel.app/api?username=${gh}&show_icons=true&hide_border=true&bg_color=0a0e27&title_color=38bdf8&text_color=e6ecff&icon_color=7c5cff&ring_color=7c5cff`;
const langsUrl = `https://github-readme-stats.vercel.app/api/top-langs/?username=${gh}&layout=compact&hide_border=true&bg_color=0a0e27&title_color=38bdf8&text_color=e6ecff&langs_count=8`;
const streakUrl = `https://streak-stats.demolab.com?user=${gh}&hide_border=true&background=0a0e27&ring=7c5cff&fire=38bdf8&currStreakLabel=38bdf8&sideLabels=e6ecff&currStreakNum=e6ecff&sideNums=e6ecff&dayLabels=e6ecff&dates=8899bb`;
const leetUrl = `https://leetcard.jacoblin.cool/${profile.leetcode}?theme=dark&font=Inter&ext=heatmap&bg=0a0e27`;

export default function Stats() {
  return (
    <section id="stats" className="relative mx-auto max-w-6xl px-6 py-24">
      <SectionHeading
        index="04 — Telemetry"
        title="Live Stats"
        subtitle="Auto-updating snapshots of my open-source activity and problem solving."
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Reveal>
          <div className="glass overflow-hidden rounded-2xl p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={statsUrl}
              alt="GitHub stats"
              loading="lazy"
              className="mx-auto w-full max-w-md"
            />
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="glass overflow-hidden rounded-2xl p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={langsUrl}
              alt="Most used languages"
              loading="lazy"
              className="mx-auto w-full max-w-md"
            />
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="glass overflow-hidden rounded-2xl p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={streakUrl}
              alt="GitHub contribution streak"
              loading="lazy"
              className="mx-auto w-full max-w-md"
            />
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="glass flex flex-col overflow-hidden rounded-2xl p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={leetUrl}
              alt="LeetCode stats"
              loading="lazy"
              className="mx-auto w-full max-w-md"
            />
          </div>
        </Reveal>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <a
          href={`https://github.com/${profile.github}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-space-accent/40 px-5 py-2.5 text-sm font-medium text-space-star transition-colors hover:bg-space-accent/15"
        >
          <Github size={16} /> GitHub
        </a>
        <a
          href={`https://codolio.com/profile/${profile.codolio}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-space-accent/40 px-5 py-2.5 text-sm font-medium text-space-star transition-colors hover:bg-space-accent/15"
        >
          <Code2 size={16} /> Codolio — full coding profile <ExternalLink size={14} />
        </a>
      </div>
    </section>
  );
}
