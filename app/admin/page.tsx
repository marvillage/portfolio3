import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, ExternalLink, LogOut, Mail, Minus, Reply } from "lucide-react";
import { adminConfigured, isAdmin } from "@/lib/adminAuth";
import { db } from "@/lib/db";
import { RANGES, isRange, loadDashboard, type Dashboard, type FeedItem, type Range, type Row } from "@/lib/adminData";
import TrafficChart from "@/components/admin/TrafficChart";
import { deleteMessage, login, logout, setRead } from "./actions";

// Private owner dashboard: the "Let's talk" inbox and cookieless visit stats.
// Signed-out visitors only ever see the sign-in panel; nothing here is indexed.

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Mission Control · Admin",
  robots: { index: false, follow: false, nocache: true },
};

const TZ = "Asia/Kolkata";
const regions = new Intl.DisplayNames(["en"], { type: "region" });
const countryName = (code: string | null) => {
  if (!code || code === "??") return "Unknown";
  try {
    return regions.of(code) ?? code;
  } catch {
    return code;
  }
};
const cap = (s: string | null) => (s ? s[0].toUpperCase() + s.slice(1) : "");
const num = (n: number) => n.toLocaleString("en-IN");

function duration(s: number | null) {
  if (s === null || s === undefined) return "–";
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

function ago(iso: string) {
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: TZ });
}
const stamp = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: TZ });

/* ---------- shell pieces ---------- */

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-ink text-paper">
      <div className="halftone pointer-events-none fixed inset-x-0 top-0 h-[40vh] opacity-[0.06]" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">{children}</div>
    </main>
  );
}

function Panel({ title, note, children, className = "" }: { title: string; note?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`border-2 border-paper bg-ink-2 p-5 shadow-[5px_5px_0_#f3f1ea] ${className}`}>
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="font-display text-2xl uppercase tracking-wide text-paper">{title}</h2>
        {note && <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-paper/50">{note}</span>}
      </div>
      {children}
    </section>
  );
}

function SignIn({ error }: { error?: string }) {
  const msg = error === "wrong" ? "That username or password didn't match." : error === "slow" ? "Too many attempts. Try again in 15 minutes." : null;
  return (
    <Frame>
      <div className="mx-auto mt-[10vh] max-w-sm">
        <span className="caption">Restricted · owner only</span>
        <h1 className="title-solid mt-4 text-5xl">Mission Control</h1>
        <form action={login} className="mt-8 space-y-4 border-2 border-paper bg-ink-2 p-6 shadow-[6px_6px_0_#f3f1ea]">
          <div>
            <label htmlFor="u" className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.16em] text-paper/70">Username</label>
            <input id="u" name="username" required autoComplete="username" className="field" />
          </div>
          <div>
            <label htmlFor="p" className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.16em] text-paper/70">Password</label>
            <input id="p" name="password" type="password" required autoComplete="current-password" className="field" />
          </div>
          {msg && <p role="alert" className="border border-paper/50 px-3 py-2 text-sm text-paper">{msg}</p>}
          <button type="submit" className="btn-ink w-full justify-center">Sign in</button>
        </form>
        <Link href="/" className="mt-6 inline-block font-mono text-xs uppercase tracking-[0.14em] text-paper/60 hover:text-paper">← Back to the site</Link>
      </div>
    </Frame>
  );
}

function NotReady({ what }: { what: string }) {
  return (
    <Frame>
      <div className="mx-auto mt-[10vh] max-w-lg border-2 border-paper bg-ink-2 p-6 shadow-[6px_6px_0_#f3f1ea]">
        <h1 className="font-display text-3xl uppercase">Admin isn&apos;t ready</h1>
        <p className="mt-3 text-paper/75">{what}</p>
      </div>
    </Frame>
  );
}

/* ---------- figures ---------- */

function Delta({ now, prev, range }: { now: number; prev: number; range: Range }) {
  const period = RANGES[range].label.replace("Last", "previous");
  if (!prev) return <p className="mt-2 text-xs text-paper/50">{now ? `none in the ${period}` : " "}</p>;
  const pct = Math.round(((now - prev) / prev) * 100);
  const Icon = pct > 0 ? ArrowUpRight : pct < 0 ? ArrowDownRight : Minus;
  return (
    <p className="mt-2 flex items-center gap-1 text-xs text-paper/70">
      <Icon size={13} aria-hidden />
      <span>
        {pct > 0 ? "+" : ""}
        {pct}% vs {period}
      </span>
    </p>
  );
}

function Stat({ label, value, children, hero }: { label: string; value: string; children?: React.ReactNode; hero?: boolean }) {
  return (
    <div className={`border-2 border-paper bg-ink-2 p-4 shadow-[4px_4px_0_#8c8a84] ${hero ? "bg-paper text-ink shadow-[4px_4px_0_#f3f1ea]" : ""}`}>
      <p className={`font-mono text-[11px] uppercase tracking-[0.16em] ${hero ? "text-ink/70" : "text-paper/60"}`}>{label}</p>
      <p className={`mt-1 font-sans font-semibold leading-none ${hero ? "text-5xl" : "text-4xl"}`}>{value}</p>
      <div className={hero ? "[&_p]:text-ink/75" : ""}>{children}</div>
    </div>
  );
}

function Bars({ rows, total, unit, empty, format }: { rows: Row[]; total?: number; unit?: string; empty: string; format?: (r: Row) => string }) {
  const max = Math.max(1, total ?? 0, ...rows.map((r) => r.n));
  if (!rows.some((r) => r.n)) return <p className="text-sm text-paper/50">{empty}</p>;
  return (
    <ul className="space-y-2.5">
      {rows.map((r) => (
        <li key={r.name} className="group">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate text-paper/85" title={r.name}>{format ? format(r) : r.name}</span>
            <span className="shrink-0 font-mono text-xs text-paper [font-variant-numeric:tabular-nums]">
              {total ? `${Math.round((r.n / total) * 100)}%` : num(r.n)}
              {total ? <span className="ml-1.5 text-paper/50">{num(r.n)}{unit ? ` ${unit}` : ""}</span> : unit ? ` ${unit}` : ""}
            </span>
          </div>
          <div className="mt-1 h-2 w-full bg-paper/[0.07]">
            <div className="h-full rounded-r-[4px] bg-paper/70 transition-colors group-hover:bg-paper" style={{ width: `${(r.n / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function feedLine(f: FeedItem, sections: Map<string, string>) {
  if (f.kind === "view") return `Opened the site${f.referrer ? ` from ${f.referrer}` : ""}`;
  if (f.kind === "section") return `Reached ${sections.get(f.name ?? "") ?? f.name}`;
  if (f.kind === "click") return `Clicked ${f.name}`;
  return `Left after ${duration(f.value)}`;
}

/* ---------- the dashboard ---------- */

function Inbox({ messages }: { messages: Dashboard["messages"] }) {
  const unread = messages.filter((m) => !m.read).length;
  return (
    <Panel title="Inbox" note={`${messages.length} messages · ${unread} unread`} className="lg:col-span-2">
      {!messages.length ? (
        <p className="text-sm text-paper/55">No messages yet. Everything sent through &quot;Let&apos;s talk&quot; lands here.</p>
      ) : (
        <ul className="max-h-[640px] space-y-3 overflow-y-auto pr-1">
          {messages.map((m) => (
            <li key={m.id} className={`border-l-4 bg-ink/60 p-4 ${m.read ? "border-paper/20" : "border-paper"}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <p className="flex items-center gap-2 font-semibold text-paper">
                  {m.name}
                  {!m.read && <span className="bg-paper px-1.5 py-px font-mono text-[10px] uppercase tracking-[0.14em] text-ink">New</span>}
                </p>
                <time dateTime={m.at} title={stamp(m.at)} className="font-mono text-[11px] text-paper/55">{ago(m.at)} · {stamp(m.at)}</time>
              </div>
              <a href={`mailto:${m.email}`} className="mt-0.5 inline-flex items-center gap-1.5 text-sm text-paper/80 underline decoration-paper/30 underline-offset-2 hover:text-paper">
                <Mail size={13} aria-hidden /> {m.email}
              </a>
              {(m.country || m.device) && (
                <p className="mt-0.5 font-mono text-[11px] text-paper/45">
                  {[m.city, m.country ? countryName(m.country) : null].filter(Boolean).join(", ")}
                  {m.device ? ` · ${cap(m.device)}` : ""}
                </p>
              )}
              <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-paper/85">{m.message}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <a
                  href={`mailto:${m.email}?subject=${encodeURIComponent("Re: your message on my portfolio")}`}
                  className="inline-flex items-center gap-1.5 border border-paper/60 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-paper hover:bg-paper hover:text-ink"
                >
                  <Reply size={12} aria-hidden /> Reply
                </a>
                <form action={setRead}>
                  <input type="hidden" name="id" value={m.id} />
                  <input type="hidden" name="read" value={m.read ? "0" : "1"} />
                  <button className="border border-paper/40 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-paper/80 hover:border-paper hover:text-paper">
                    {m.read ? "Mark unread" : "Mark read"}
                  </button>
                </form>
                <details className="group/del">
                  <summary className="cursor-pointer list-none border border-paper/25 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-paper/55 hover:border-paper/60 hover:text-paper">
                    Delete
                  </summary>
                  <form action={deleteMessage} className="mt-2 flex items-center gap-2">
                    <input type="hidden" name="id" value={m.id} />
                    <span className="text-xs text-paper/70">Delete for good?</span>
                    <button className="bg-paper px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-ink">Yes, delete</button>
                  </form>
                </details>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

export default async function AdminPage({ searchParams }: { searchParams: { range?: string; e?: string } }) {
  if (!adminConfigured()) return <NotReady what="Set ADMIN_USERNAME, ADMIN_PASSWORD and ADMIN_SECRET in the project's environment, then redeploy." />;
  if (!isAdmin()) return <SignIn error={searchParams.e} />;
  if (!db()) return <NotReady what="The database isn't connected (DATABASE_URL is missing)." />;

  const range: Range = isRange(searchParams.range) ? searchParams.range : "7d";
  const d = await loadDashboard(range);
  if (!d) return <NotReady what="The database isn't connected (DATABASE_URL is missing)." />;
  const sectionNames = new Map([
    ["home", "Hero"], ["about", "About"], ["experience", "Experience"], ["code-content", "Code & Content"], ["education", "Academic Journey"],
    ["certifications", "Certifications"], ["projects", "Projects"], ["achievements", "Achievements"], ["writing", "Writing"], ["stats", "Live Stats"], ["contact", "Contact"],
  ]);
  const unread = d.messages.filter((m) => !m.read).length;
  const inRange = d.messages.filter((m) => Date.now() - new Date(m.at).getTime() <= RANGES[range].hours * 3_600_000).length;

  return (
    <Frame>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="caption">Log 00 · Mission Control</span>
          <h1 className="title-solid mt-3 text-5xl sm:text-6xl">Admin</h1>
          <p className="mt-2 text-paper/65">Who&apos;s been by, what they read, and who wrote in.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/" target="_blank" className="inline-flex items-center gap-1.5 border border-paper/50 px-3 py-1.5 font-mono text-xs uppercase tracking-[0.12em] text-paper/80 hover:border-paper hover:text-paper">
            View site <ExternalLink size={12} aria-hidden />
          </Link>
          <form action={logout}>
            <button className="inline-flex items-center gap-1.5 border border-paper/50 px-3 py-1.5 font-mono text-xs uppercase tracking-[0.12em] text-paper/80 hover:border-paper hover:text-paper">
              <LogOut size={12} aria-hidden /> Sign out
            </button>
          </form>
        </div>
      </header>

      {/* one filter row scopes everything below */}
      <nav aria-label="Date range" className="mt-8 flex flex-wrap items-center gap-2">
        {(Object.keys(RANGES) as Range[]).map((r) => (
          <Link
            key={r}
            href={`/admin?range=${r}`}
            aria-current={r === range ? "page" : undefined}
            className={`border-2 px-3 py-1 font-mono text-xs uppercase tracking-[0.12em] ${
              r === range ? "border-paper bg-paper text-ink" : "border-paper/40 text-paper/75 hover:border-paper hover:text-paper"
            }`}
          >
            {RANGES[r].label.replace("Last ", "")}
          </Link>
        ))}
        <span className="ml-1 font-mono text-[11px] uppercase tracking-[0.14em] text-paper/45">India time · bots and your own visits excluded</span>
      </nav>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Visitors" value={num(d.now.visitors)} hero>
          <Delta now={d.now.visitors} prev={d.prev.visitors} range={range} />
        </Stat>
        <Stat label="Page views" value={num(d.now.views)}>
          <Delta now={d.now.views} prev={d.prev.views} range={range} />
        </Stat>
        <Stat label="Avg time on site" value={duration(d.now.avgSeconds)}>
          <p className="mt-2 text-xs text-paper/50">{num(d.now.sessions)} visits</p>
        </Stat>
        <Stat label="Messages" value={num(inRange)}>
          <p className="mt-2 text-xs text-paper/70">{unread ? `${unread} unread` : "all read"} · {num(d.messages.length)} total</p>
        </Stat>
      </div>

      <Panel title="Traffic" note={RANGES[range].label} className="mt-6">
        <TrafficChart data={d.series} />
      </Panel>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-3">
        <Inbox messages={d.messages} />
        <div className="space-y-6">
          <Panel title="How far they read" note="share of visits">
            <Bars rows={d.sections} total={d.now.sessions} empty="No scrolling recorded yet." />
          </Panel>
          <Panel title="Clicked" note="links out">
            <Bars rows={d.clicks} empty="No outbound clicks yet." />
          </Panel>
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Panel title="Came from" note="visitors">
          <Bars rows={d.referrers} empty="No visits yet." />
        </Panel>
        <Panel title="Countries" note="visitors">
          <Bars rows={d.countries} empty="No visits yet." format={(r) => countryName(r.name)} />
        </Panel>
        <Panel title="Devices" note="visitors">
          <Bars rows={d.devices} empty="No visits yet." format={(r) => cap(r.name)} />
          <div className="mt-5 border-t border-paper/15 pt-4">
            <Bars rows={d.browsers} empty="" />
          </div>
        </Panel>
      </div>

      <Panel title="Live feed" note="latest activity" className="mt-6">
        {!d.feed.length ? (
          <p className="text-sm text-paper/55">Nothing yet. Visits show up here as they happen.</p>
        ) : (
          <ul className="divide-y divide-paper/10">
            {d.feed.map((f, i) => (
              <li key={i} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 py-2 text-sm">
                <span className="text-paper/85">{feedLine(f, sectionNames)}</span>
                <span className="font-mono text-[11px] text-paper/45">
                  {[f.city, countryName(f.country)].filter((x) => x && x !== "Unknown").join(", ") || "Unknown place"}
                  {f.device ? ` · ${cap(f.device)}` : ""}
                  {f.browser ? ` · ${f.browser}` : ""} · {ago(f.at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </Frame>
  );
}
