"use client";

import { Github, Code2, ExternalLink } from "lucide-react";
import { profile } from "@/data/profile";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";

// External stat cards themed to ink and paper; `ink-img` greys out anything left over.
const gh = profile.github;
const statsUrl = `https://github-readme-stats.vercel.app/api?username=${gh}&show_icons=true&hide_border=true&bg_color=0a0a0c&title_color=f3f1ea&text_color=f3f1ea&icon_color=8c8a84&ring_color=f3f1ea`;
const langsUrl = `https://github-readme-stats.vercel.app/api/top-langs/?username=${gh}&layout=compact&hide_border=true&bg_color=0a0a0c&title_color=f3f1ea&text_color=f3f1ea&langs_count=8`;
const streakUrl = `https://streak-stats.demolab.com?user=${gh}&hide_border=true&background=0a0a0c&ring=f3f1ea&fire=f3f1ea&currStreakLabel=f3f1ea&sideLabels=f3f1ea&currStreakNum=f3f1ea&sideNums=f3f1ea&dayLabels=c9c6bc&dates=8c8a84`;
const leetUrl = `https://leetcard.jacoblin.cool/${profile.leetcode}?theme=dark&font=IBM%20Plex%20Mono&ext=heatmap&bg=0a0a0c`;

const cards = [
  { src: statsUrl, alt: "GitHub stats" },
  { src: langsUrl, alt: "Most used languages" },
  { src: streakUrl, alt: "GitHub contribution streak" },
  { src: leetUrl, alt: "LeetCode stats" },
];

const handles = [
  { label: "GitHub", href: `https://github.com/${profile.github}`, Icon: Github },
  { label: "Codolio", href: `https://codolio.com/profile/${profile.codolio}`, Icon: Code2 },
  { label: "CodeChef", href: `https://www.codechef.com/users/${profile.codechef}`, Icon: Code2 },
  { label: "GeeksforGeeks", href: `https://www.geeksforgeeks.org/user/${profile.gfg}`, Icon: Code2 },
];

export default function Stats() {
  return (
    <section id="stats" className="relative mx-auto max-w-6xl px-6 py-24">
      <SectionHeading
        index="Log 09 · Telemetry"
        title="Live Stats"
        subtitle="Auto-updating snapshots of my open-source activity and problem solving."
      />

      <div className="grid gap-6 md:grid-cols-2">
        {cards.map((c, i) => (
          <Reveal key={c.alt} delay={i * 0.05}>
            <div className="panel-thin overflow-hidden p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.src}
                alt={c.alt}
                loading="lazy"
                className="ink-img mx-auto w-full max-w-md"
              />
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        {handles.map((h) => (
          <a
            key={h.label}
            href={h.href}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost !px-4 !py-2.5 !text-sm"
          >
            <h.Icon size={15} /> {h.label} <ExternalLink size={12} />
          </a>
        ))}
      </div>
    </section>
  );
}
