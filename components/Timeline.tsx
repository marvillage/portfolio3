"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useInView, useMotionValue, useReducedMotion, useScroll, useSpring } from "framer-motion";

// A flight-path timeline: a faint dotted rail with a comet that rides it as the
// page scrolls, inking the trail behind it. Each station ring locks as the comet
// reaches it, and the card beside it docks (see useStation). Docking replays each
// time a card comes back into view; hand-lettered labels mark the first and last
// stations, and the rail ends at the last ring.

// The comet sits on this line of the viewport (fraction from the top).
const READ_LINE = 0.65;

const StationCtx = createContext({ docked: true, reduced: false });

/** Whether this station's card has docked (the comet has reached it). */
export const useStation = () => useContext(StationCtx);

export function Timeline({ children }: { children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const reduced = !!useReducedMotion();
  // rail span inside the box, from the first station ring to the last one (px)
  const [rail, setRail] = useState<{ top: number; bottom: number } | null>(null);
  const span = useRef({ top: 0, bottom: 0, h: 1 });

  const { scrollYProgress } = useScroll({ target: box, offset: [`start ${READ_LINE * 100}%`, `end ${READ_LINE * 100}%`] });
  // comet distance down the rail (px): the reading line, clamped to the rail
  const head = useMotionValue(0);
  const smooth = useSpring(head, { stiffness: 140, damping: 26, mass: 0.5 });

  useEffect(() => {
    const update = (p: number) => {
      const { top, bottom, h } = span.current;
      head.set(Math.min(bottom, Math.max(top, p * h)) - top);
    };
    const el = box.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      const nodes = el.querySelectorAll<HTMLElement>("[data-rail-node]");
      if (!nodes.length) return;
      const centre = (n: HTMLElement) => {
        const b = n.getBoundingClientRect();
        return Math.round(b.top + b.height / 2 - r.top);
      };
      const top = centre(nodes[0]);
      const bottom = centre(nodes[nodes.length - 1]);
      span.current = { top, bottom, h: r.height || 1 };
      setRail({ top, bottom });
      update(scrollYProgress.get());
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const off = scrollYProgress.on("change", update);
    return () => {
      ro.disconnect();
      off();
    };
  }, [scrollYProgress, head]);

  return (
    // extra left room on wide screens so the start/end labels have space beside the rail
    <div ref={box} className="relative pl-12 sm:pl-14 md:ml-24">
      {rail && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-[17px] w-[2px] sm:left-[23px]"
          style={{ top: rail.top, height: rail.bottom - rail.top }}
        >
          {/* the route ahead */}
          <div className="absolute inset-0 bg-[repeating-linear-gradient(to_bottom,rgba(243,241,234,0.32)_0_5px,transparent_5px_11px)]" />
          {/* the inked trail behind the comet */}
          <motion.div
            className="absolute inset-x-0 top-0 bg-paper shadow-[0_0_8px_1px_rgba(243,241,234,0.55)]"
            style={{ height: reduced ? "100%" : smooth }}
          />
          {!reduced && (
            <motion.div className="absolute left-1/2 top-0 z-[5]" style={{ y: smooth }}>
              <span className="absolute bottom-0 left-1/2 h-16 w-[5px] -translate-x-1/2 rounded-full bg-gradient-to-t from-paper via-paper/35 to-transparent blur-[0.5px]" />
              <span className="tl-spark absolute -top-5 left-[5px] h-1 w-1 rounded-full bg-paper" />
              <span className="tl-spark absolute -top-9 -left-[6px] h-[3px] w-[3px] rounded-full bg-paper [animation-delay:0.4s]" />
              <span className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-paper shadow-[0_0_14px_4px_rgba(243,241,234,0.75)]" />
            </motion.div>
          )}
        </div>
      )}
      {children}
    </div>
  );
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
  const reduced = !!useReducedMotion();
  const item = useRef<HTMLDivElement>(null);
  const node = useRef<HTMLSpanElement>(null);

  // the comet has reached this station once its ring is above the reading line
  // (a huge top margin also counts stations already scrolled past)
  // (the -35% bottom margin is 1 - READ_LINE)
  const reached = useInView(node, { margin: "100000px 0px -35% 0px" });
  // undock only once the whole card has left the screen, so it never vanishes mid-read
  const present = useInView(item);
  const [docked, setDocked] = useState(false);
  useEffect(() => {
    if (reached && present) setDocked(true);
  }, [reached, present]);
  useEffect(() => {
    if (!present) setDocked(false);
  }, [present]);
  const on = reduced || docked;

  return (
    <StationCtx.Provider value={{ docked: on, reduced }}>
      <div ref={item} className="relative pb-14 last:pb-0">
        {/* station ring: dim until the comet arrives, then locks with a ping */}
        <motion.span
          ref={node}
          data-rail-node
          aria-hidden="true"
          className="absolute -left-[46px] top-1 z-10 grid h-8 w-8 place-items-center rounded-full border-2 bg-ink sm:-left-[48px]"
          initial={false}
          animate={
            on
              ? { scale: 1, borderColor: "rgba(243,241,234,1)", color: "rgba(243,241,234,1)" }
              : { scale: 0.82, borderColor: "rgba(243,241,234,0.35)", color: "rgba(243,241,234,0.35)" }
          }
          transition={{ type: "spring", stiffness: 320, damping: 18 }}
        >
          {icon}
          {on && !reduced && (
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-paper"
              initial={{ scale: 1, opacity: 0.9 }}
              animate={{ scale: 2.6, opacity: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            />
          )}
          {first && on && <span className="beacon absolute inset-0 rounded-full border-2 border-paper" />}
        </motion.span>

        {/* start / end labels on the rail */}
        {first && startLabel && (
          <span
            aria-hidden="true"
            className="note absolute z-10 !text-xs max-md:-left-[64px] max-md:-top-7 max-md:w-[66px] max-md:text-center md:right-full md:top-0 md:mr-[46px] md:w-max md:whitespace-nowrap md:text-right"
          >
            {startLabel}
          </span>
        )}
        {/* the last station is the end of the line: the label hangs just below its ring,
            to the left of the rail so the card never covers it */}
        {last && endLabel && (
          <span
            aria-hidden="true"
            className="note absolute z-10 !text-xs !leading-tight max-md:-left-[72px] max-md:top-[42px] max-md:w-[82px] max-md:text-center md:right-full md:top-[34px] md:mr-[46px] md:w-max md:max-w-[120px] md:whitespace-nowrap md:text-right"
          >
            {endLabel}
          </span>
        )}

        {children}
      </div>
    </StationCtx.Provider>
  );
}
