"use client";

import { useState } from "react";
import { Send, Mail, Loader2, CheckCircle2 } from "lucide-react";
import { profile } from "@/data/profile";
import { socials } from "@/data/socials";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";
import ArtStrip from "./ArtStrip";

type Status = "idle" | "sending" | "sent" | "error";

export default function Contact({ art }: { art?: string }) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<Status>("idle");
  const [note, setNote] = useState("");

  const update =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const mailtoFallback = () => {
    const subject = encodeURIComponent(`Portfolio contact from ${form.name}`);
    const bodyText = encodeURIComponent(`${form.message}\n\n— ${form.name} (${form.email})`);
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${bodyText}`;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setNote("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.ok) {
        setStatus("sent");
        setForm({ name: "", email: "", message: "" });
      } else if (data.fallback) {
        mailtoFallback();
        setStatus("idle");
        setNote("Opening your email app…");
      } else {
        setStatus("error");
        setNote(data.error ?? "Something went wrong.");
      }
    } catch {
      mailtoFallback();
      setStatus("idle");
      setNote("Opening your email app…");
    }
  };

  return (
    <section id="contact" className="relative mx-auto max-w-6xl px-6 py-24">
      <SectionHeading
        index="Log 10 · Transmit"
        title="Get In Touch"
        subtitle="Have a project, role, or idea? Send a signal across the void."
      />

      <div className="grid gap-10 md:grid-cols-2">
        {/* Left: direct details */}
        <Reveal>
          <div className="space-y-6">
            <p className="leading-relaxed text-paper/70">
              I&apos;m open to full-time roles, internships, freelance work and
              collaborations. The fastest way to reach me is email — or use the form and
              it lands directly in my inbox.
            </p>

            <a
              href={`mailto:${profile.email}`}
              className="panel-thin group flex items-center gap-4 p-4"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center border-2 border-paper bg-paper text-ink">
                <Mail size={20} />
              </span>
              <span className="min-w-0">
                <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-paper/50">
                  Email
                </span>
                <span className="block break-all text-paper">{profile.email}</span>
              </span>
            </a>

            <div className="flex flex-wrap gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="panel-thin flex items-center gap-2 px-4 py-2.5 font-mono text-xs uppercase tracking-[0.14em] text-paper/80"
                >
                  <s.icon size={15} /> {s.label}
                </a>
              ))}
            </div>

            {art && (
              <ArtStrip
                src={art}
                alt="Comms dish beaming a signal across space"
                caption="Signal"
                ratio="aspect-[16/9]"
                className="mt-2"
              />
            )}
          </div>
        </Reveal>

        {/* Right: form */}
        <Reveal delay={0.1}>
          <form onSubmit={onSubmit} className="panel space-y-4 p-6">
            <div>
              <label htmlFor="contact-name" className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.16em] text-paper/70">
                Name
              </label>
              <input
                id="contact-name"
                required
                value={form.name}
                onChange={update("name")}
                placeholder="Your name"
                className="field"
              />
            </div>
            <div>
              <label htmlFor="contact-email" className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.16em] text-paper/70">
                Email
              </label>
              <input
                id="contact-email"
                required
                type="email"
                value={form.email}
                onChange={update("email")}
                placeholder="you@example.com"
                className="field"
              />
            </div>
            <div>
              <label htmlFor="contact-message" className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.16em] text-paper/70">
                Message
              </label>
              <textarea
                id="contact-message"
                required
                rows={5}
                value={form.message}
                onChange={update("message")}
                placeholder="Tell me about it…"
                className="field resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={status === "sending" || status === "sent"}
              className="btn-ink w-full justify-center disabled:opacity-60"
            >
              {status === "sending" && <Loader2 size={18} className="animate-spin" />}
              {status === "sent" && <CheckCircle2 size={18} />}
              {(status === "idle" || status === "error") && <Send size={18} />}
              {status === "sent"
                ? "Message sent — thank you!"
                : status === "sending"
                ? "Sending…"
                : "Send message"}
            </button>

            {note && (
              <p className="text-center font-hand text-sm text-paper/80">{note}</p>
            )}
          </form>
        </Reveal>
      </div>
    </section>
  );
}
