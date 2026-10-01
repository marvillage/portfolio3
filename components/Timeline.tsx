"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

// A flight-path timeline: dashed rail segments that draw themselves as they
// scroll into view, round station markers that pop in, a pulsing beacon on the
// first (most recent) node, and hand-lettered start/end labels so the path has
// a clear beginning and end.

export function Timeline({ children }: { children: ReactNode }) {
  return <div className="relative pl-12 sm:pl-14">{children}</div>;
}

export function TimelineItem({
  icon,
  index,
  total,
  startLabel,
  endLabel,
  children,
}: {
  icon: ReactNode;
  index: number;
  total: number;
  startLabel?: string;
  endLabel?: string;
  children: ReactNode;
}) {
  const first = index === 0;
  const last = index === total - 1;
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay: 0.05 }}
      className="relative pb-12 last:pb-0"
    >
      {/* rail segment to the next station */}
      {!last && (
        <motion.span
          aria-hidden="true"
          className="absolute -left-[31px] top-10 -bottom-2 w-0 origin-top border-l-2 border-dashed border-paper/70 sm:-left-[33px]"
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.25 }}
        />
      )}

      {/* station marker */}
      <motion.span
        aria-hidden="true"
        className="absolute -left-[46px] top-1 grid h-8 w-8 place-items-center rounded-full border-2 border-paper bg-ink text-paper sm:-left-[48px]"
        initial={{ scale: 0, rotate: -40 }}
        whileInView={{ scale: 1, rotate: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 }}
      >
        {icon}
        {first && <span className="beacon absolute inset-0 rounded-full border-2 border-paper" />}
      </motion.span>

      {/* start / end labels on the rail */}
      {first && startLabel && (
        <span
          aria-hidden="true"
          className="note absolute -left-[62px] -top-7 w-16 text-center !text-xs sm:-left-[64px]"
        >
          {startLabel}
        </span>
      )}
      {last && endLabel && (
        <>
          <span
            aria-hidden="true"
            className="absolute -left-[31px] top-10 h-6 w-0 border-l-2 border-dashed border-paper/70 sm:-left-[33px]"
          />
          <span
            aria-hidden="true"
            className="absolute -left-[36px] top-[62px] h-3 w-3 rounded-full border-2 border-paper bg-paper sm:-left-[38px]"
          />
          <span
            aria-hidden="true"
            className="note absolute -left-[80px] top-[78px] w-24 text-center !text-xs sm:-left-[82px]"
          >
            {endLabel}
          </span>
        </>
      )}

      {children}
    </motion.div>
  );
}
