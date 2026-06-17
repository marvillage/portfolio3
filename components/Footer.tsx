import { socials } from "@/data/socials";
import { profile } from "@/data/profile";

export default function Footer() {
  return (
    <footer className="relative mx-auto max-w-6xl px-6 pb-10 pt-6">
      <div className="section-line mb-6 w-full" />
      <div className="flex flex-col items-center justify-between gap-4 text-sm text-space-star/50 sm:flex-row">
        <p>
          © {`2026`} {profile.name}. Built across the universe with Next.js &amp;
          Tailwind.
        </p>
        <div className="flex gap-4">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className="transition-colors hover:text-space-cyan"
            >
              <s.icon size={18} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
