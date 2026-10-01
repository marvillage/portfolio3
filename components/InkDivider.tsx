// Ink splatter divider between sections: a ragged white line with spatter dots.
// Deterministic positions so server and client render the same markup.
const dots = Array.from({ length: 28 }, (_, i) => ({
  cx: (i * 137.5 + 20) % 1000,
  cy: 6 + ((i * 53) % 17),
  r: 0.7 + ((i * 7) % 5) * 0.45,
}));

export default function InkDivider() {
  return (
    <div aria-hidden="true" className="mx-auto max-w-6xl px-6">
      <svg viewBox="0 0 1000 28" className="h-auto w-full text-paper/70">
        <path
          d="M0 14 Q60 8 120 14 T240 14 T360 14 T480 14 T600 14 T720 14 T840 14 T1000 14"
          stroke="currentColor"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        {dots.map((d, i) => (
          <circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill="currentColor" />
        ))}
      </svg>
    </div>
  );
}
