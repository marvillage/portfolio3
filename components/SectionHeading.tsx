import Reveal from "./Reveal";

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
      <p className="mb-2 font-mono text-sm text-space-cyan">{index}</p>
      <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
        <span className="gradient-text">{title}</span>
      </h2>
      {subtitle && (
        <p className="mt-3 max-w-2xl text-space-star/60">{subtitle}</p>
      )}
      <div className="section-line mt-6 w-full" />
    </Reveal>
  );
}
