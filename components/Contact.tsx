"use client";

import { useState } from "react";
import { Send, Mail, Loader2, CheckCircle2 } from "lucide-react";
import { profile } from "@/data/profile";
import { socials } from "@/data/socials";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";

type Status = "idle" | "sending" | "sent" | "error";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<Status>("idle");
  const [note, setNote] = useState("");

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
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
        index="05 — Transmit"
        title="Get In Touch"
        subtitle="Have a project, role, or idea? Send a signal across the void."
      />

      <div className="grid gap-10 md:grid-cols-2">
        {/* Left: direct details */}
        <Reveal>
          <div className="space-y-6">
            <p className="text-space-star/70 leading-relaxed">
              I&apos;m open to full-time roles, internships, freelance work and
              collaborations. The fastest way to reach me is email — or use the
              form and it lands directly in my inbox.
            </p>

            <a
              href={`mailto:${profile.email}`}
              className="glass group flex items-center gap-4 rounded-xl p-4 transition-all hover:shadow-glow"
            >
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-space-accent/15 text-space-cyan">
                <Mail size={20} />
              </span>
              <span>
                <span className="block text-xs uppercase tracking-wider text-space-star/50">
                  Email
                </span>
                <span className="text-space-star group-hover:text-space-cyan">
                  {profile.email}
                </span>
              </span>
            </a>

            <div className="flex flex-wrap gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm text-space-star/80 transition-all hover:-translate-y-0.5 hover:text-space-cyan"
                >
                  <s.icon size={16} /> {s.label}
                </a>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Right: form */}
        <Reveal delay={0.1}>
          <form onSubmit={onSubmit} className="glass space-y-4 rounded-2xl p-6">
            <div>
              <label className="mb-1.5 block text-sm text-space-star/70">Name</label>
              <input
                required
                value={form.name}
                onChange={update("name")}
                placeholder="Your name"
                className="w-full rounded-lg border border-space-accent/20 bg-space-void/60 px-4 py-2.5 text-space-star outline-none transition-colors placeholder:text-space-star/30 focus:border-space-cyan"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-space-star/70">Email</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={update("email")}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-space-accent/20 bg-space-void/60 px-4 py-2.5 text-space-star outline-none transition-colors placeholder:text-space-star/30 focus:border-space-cyan"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-space-star/70">Message</label>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={update("message")}
                placeholder="Tell me about it…"
                className="w-full resize-none rounded-lg border border-space-accent/20 bg-space-void/60 px-4 py-2.5 text-space-star outline-none transition-colors placeholder:text-space-star/30 focus:border-space-cyan"
              />
            </div>

            <button
              type="submit"
              disabled={status === "sending" || status === "sent"}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-space-accent to-space-violet px-6 py-3 font-semibold text-white shadow-glow transition-transform hover:scale-[1.02] disabled:opacity-60"
            >
              {status === "sending" && <Loader2 size={18} className="animate-spin" />}
              {status === "sent" && <CheckCircle2 size={18} />}
              {status === "idle" && <Send size={18} />}
              {status === "error" && <Send size={18} />}
              {status === "sent"
                ? "Message sent — thank you!"
                : status === "sending"
                ? "Sending…"
                : "Send message"}
            </button>

            {note && (
              <p
                className={`text-center text-sm ${
                  status === "error" ? "text-rose-300" : "text-space-cyan"
                }`}
              >
                {note}
              </p>
            )}
          </form>
        </Reveal>
      </div>
    </section>
  );
}
