// Hand-lettered marginalia with a curved ink arrow. Hidden on small screens
// (md by default, or xl when `from="xl"`) so phones never lose readability to
// decoration. Position it with `className` inside a `relative` parent.
type Arrow = "down-right" | "down-left" | "up-right" | "up-left" | "right" | "down";

const paths: Record<Arrow, string> = {
  "down-right": "M4 4 C 26 6, 40 22, 54 44",
  "down-left": "M56 4 C 34 6, 20 22, 6 44",
  "up-right": "M4 44 C 26 42, 40 26, 54 4",
  "up-left": "M56 44 C 34 42, 20 26, 6 4",
  right: "M4 24 C 20 14, 38 34, 56 24",
  down: "M30 4 C 22 18, 38 30, 30 44",
};

export default function Note({
  text,
  arrow = "down-right",
  from = "md",
  className = "",
}: {
  text: string;
  arrow?: Arrow;
  from?: "md" | "xl";
  className?: string;
}) {
  const show = from === "xl" ? "hidden xl:block" : "hidden md:block";
  return (
    <div
      aria-hidden="true"
      className={`note pointer-events-none absolute z-20 max-w-[190px] ${show} ${className}`}
    >
      <span className="block">{text}</span>
      <svg viewBox="0 0 60 48" className="mt-1 h-10 w-14 text-paper/80">
        <path
          d={paths[arrow]}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          markerEnd="url(#note-arrowhead)"
        />
        <defs>
          <marker
            id="note-arrowhead"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M0 0 L10 5 L0 10 Z" fill="currentColor" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}
