"use client";

import SectionHeading from "./SectionHeading";
import ArtStrip from "./ArtStrip";
import Trajectory, { type StopArt, type YearArt } from "./Trajectory";

export default function CodeContent({
  banner,
  stopArt = {},
  yearArt = {},
}: {
  banner?: string;
  stopArt?: StopArt;
  yearArt?: YearArt;
}) {
  return (
    <section id="code-content" className="relative mx-auto max-w-6xl px-6 py-24">
      <SectionHeading
        index="Log 03 · Dual Orbit"
        title="Crafted in Code & Content"
        subtitle="Two sides of the same orbit — building software and leading content, editorial and creative teams at IIIT Nagpur."
      />

      {banner && <ArtStrip src={banner} alt="A pilot coding and a pilot on stage" caption="Dual orbit" />}

      <Trajectory stopArt={stopArt} yearArt={yearArt} />
    </section>
  );
}
