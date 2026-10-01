// Three-panel comic strip for the About section. Uses /art/origin/1..3 when the
// files exist, otherwise a line-art placeholder per panel so the strip still reads.

const panels = [
  {
    kicker: "Panel 1 · Home coordinates",
    caption: "Ghaziabad Outpost. A kid, a keyboard, and a window full of stars.",
    alt: "The Ghaziabad outpost",
    sketch: (
      <svg viewBox="0 0 200 150" className="h-full w-full text-paper/80" aria-hidden="true">
        <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M20 120 H180" />
          <path d="M50 120 V78 Q100 30 150 78 V120" />
          <path d="M85 120 V96 H115 V120" />
          <circle cx="100" cy="70" r="9" />
          <path d="M30 118 L26 100 M170 118 L174 100" />
          <circle cx="40" cy="40" r="1.6" fill="currentColor" />
          <circle cx="160" cy="30" r="1.6" fill="currentColor" />
          <circle cx="120" cy="22" r="1.2" fill="currentColor" />
        </g>
      </svg>
    ),
  },
  {
    kicker: "Panel 2 · Flight school",
    caption: "Nagpur Academy, Sector IIIT. Four years of late-night builds and a CGPA of 8.32.",
    alt: "Nagpur Academy",
    sketch: (
      <svg viewBox="0 0 200 150" className="h-full w-full text-paper/80" aria-hidden="true">
        <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M20 120 H180" />
          <path d="M40 120 V70 H160 V120" />
          <path d="M34 70 L100 38 L166 70" />
          <path d="M60 120 V84 M85 120 V84 M115 120 V84 M140 120 V84" />
          <path d="M100 38 V24 L116 30 L100 36" />
        </g>
      </svg>
    ),
  },
  {
    kicker: "Panel 3 · Current posting",
    caption: "Station AECAD, orbit of Titan-1Ab. Full-stack, AI systems, and a 3D CAD viewer built from the first commit.",
    alt: "Station AECAD",
    sketch: (
      <svg viewBox="0 0 200 150" className="h-full w-full text-paper/80" aria-hidden="true">
        <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <ellipse cx="100" cy="75" rx="70" ry="22" />
          <circle cx="100" cy="75" r="26" />
          <path d="M100 49 V30 M100 101 V120" />
          <path d="M74 75 H40 M126 75 H160" />
          <rect x="36" y="68" width="10" height="14" />
          <rect x="154" y="68" width="10" height="14" />
          <circle cx="170" cy="30" r="1.6" fill="currentColor" />
          <circle cx="30" cy="120" r="1.4" fill="currentColor" />
        </g>
      </svg>
    ),
  },
];

export default function OriginStrip({ images = [] }: { images?: (string | undefined)[] }) {
  return (
    <div className="mt-12">
      <span className="caption-ink">Origin story</span>
      <div className="mt-5 grid gap-3 bg-paper p-3 sm:grid-cols-3">
        {panels.map((p, i) => {
          const src = images[i];
          return (
            <figure key={p.kicker} className="relative m-0 flex flex-col bg-ink">
              <div className="relative aspect-[4/3] overflow-hidden border-b-2 border-paper/60">
                {src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src} alt={p.alt} loading="lazy" className="ink-img h-full w-full object-cover" />
                ) : (
                  <div className="halftone h-full w-full p-6 opacity-90" style={{ backgroundSize: "7px 7px" }}>
                    {p.sketch}
                  </div>
                )}
                <div className="halftone pointer-events-none absolute inset-0 opacity-15" />
                <span className="caption absolute left-2 top-2 !py-0.5 !text-[11px]">{p.kicker}</span>
              </div>
              <figcaption className="p-3 font-hand text-sm leading-snug text-paper/85">{p.caption}</figcaption>
            </figure>
          );
        })}
      </div>
    </div>
  );
}
