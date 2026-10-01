"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import InkWipe, { useInkWipe } from "./InkWipe";

const links = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Code & Content", href: "#code-content" },
  { label: "Education", href: "#education" },
  { label: "Certs", href: "#certifications" },
  { label: "Projects", href: "#projects" },
  { label: "Writing", href: "#writing" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { phase, label, navigate } = useInkWipe();

  // Ink-splatter wipe with the section name, then jump to the section
  const go = (href: string, name?: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setOpen(false);
    navigate(href, name ?? links.find((l) => l.href === href)?.label ?? "");
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "border-b-2 border-paper bg-ink/95 py-2" : "bg-transparent py-4"
      }`}
    >
      <InkWipe phase={phase} label={label} />
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6">
        <a href="#home" onClick={go("#home")} className="caption" aria-label="Back to top">
          KS · DEV
        </a>

        <ul className="hidden items-center gap-5 xl:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                onClick={go(l.href)}
                className="font-mono text-[11px] uppercase tracking-[0.16em] text-paper/65 transition-colors hover:text-paper"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <a href="#contact" onClick={go("#contact")} className="btn-ink hidden !px-4 !py-2 !text-sm xl:inline-flex">
          Let&apos;s talk
        </a>

        <button
          aria-label="Toggle menu"
          aria-expanded={open}
          className="grid h-10 w-10 place-items-center border-2 border-paper text-paper xl:hidden"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {open && (
        <div className="panel mx-4 mt-3 p-4 xl:hidden">
          <ul className="flex flex-col gap-1">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={go(l.href)}
                  className="block px-3 py-2 font-mono text-xs uppercase tracking-[0.16em] text-paper/80 hover:bg-paper hover:text-ink"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
