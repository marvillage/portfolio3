"use client";

import { motion } from "framer-motion";
import Reveal from "./Reveal";

// Comic caption box for the log number, display title with ash drop shadow,
// and a saber line that wipes in from the left.
export default function SectionHeading({
  index,
  title,
  subtitle,
}: {
  index: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <Reveal className="mb-12">
      <span className="caption">{index}</span>
      <h2 className="title-solid mt-4 text-4xl sm:text-5xl md:text-6xl">{title}</h2>
      {subtitle && <p className="mt-4 max-w-2xl text-paper/65">{subtitle}</p>}
      <motion.div
        className="saber mt-6 w-full"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      />
    </Reveal>
  );
}
