// Optional inked illustration strip under a section heading or inside a column.
// Rendered only when the caller found a matching file in /public/art.
export default function ArtStrip({
  src,
  alt,
  caption,
  ratio = "aspect-[3/1]",
  className = "mb-10",
}: {
  src: string;
  alt: string;
  caption?: string;
  ratio?: string;
  className?: string;
}) {
  return (
    <div className={`panel-thin relative overflow-hidden bg-ink ${ratio} ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} loading="lazy" className="ink-img h-full w-full object-cover" />
      <div className="halftone pointer-events-none absolute inset-0 opacity-15" />
      {caption && <span className="caption absolute left-3 top-3">{caption}</span>}
    </div>
  );
}
