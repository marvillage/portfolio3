"use client";

import { Github, Code2, ExternalLink } from "lucide-react";
import { profile } from "@/data/profile";
import type { Stats as StatsData } from "@/lib/stats";
import SectionHeading from "./SectionHeading";
import MissionControl from "./MissionControl";

const handles = [
  { label: "GitHub", href: `https://github.com/${profile.github}`, Icon: Github },
  { label: "Codolio", href: `https://codolio.com/profile/${profile.codolio}`, Icon: Code2 },
  { label: "CodeChef", href: `https://www.codechef.com/users/${profile.codechef}`, Icon: Code2 },
  { label: "GeeksforGeeks", href: `https://www.geeksforgeeks.org/user/${profile.gfg}`, Icon: Code2 },
];

export default function Stats({ stats, room }: { stats: StatsData; room?: string }) {
  return (
    <section id="stats" className="relative mx-auto max-w-6xl px-6 py-24">
      <SectionHeading
        index="Log 09 · Telemetry"
        title="Live Stats"
        subtitle="Auto-updating snapshots of my open-source activity and problem solving."
      />

      <MissionControl stats={stats} room={room} />

      {/* console buttons */}
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        {handles.map((h) => (
          <a key={h.label} href={h.href} target="_blank" rel="noopener noreferrer" className="btn-ghost !px-4 !py-2.5 !text-sm">
            <h.Icon size={15} /> {h.label} <ExternalLink size={12} />
          </a>
        ))}
      </div>
    </section>
  );
}
