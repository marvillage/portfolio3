import { socials } from "@/data/socials";
import { profile } from "@/data/profile";

export default function Footer() {
  return (
    <footer className="relative mx-auto max-w-6xl px-6 pb-10 pt-6">
      <div className="mb-8 text-center">
        <span className="caption !text-base">To be continued…</span>
      </div>
      <div className="flex flex-col items-center justify-between gap-4 border-t-2 border-paper/60 pt-6 font-mono text-xs text-paper/55 sm:flex-row">
        <p>
          © 2026 {profile.name}. Built across the universe with Next.js, Tailwind &amp;
          Three.js.
        </p>
        <div className="flex gap-4">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className="transition-colors hover:text-paper"
            >
              <s.icon size={18} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
