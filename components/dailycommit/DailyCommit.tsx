"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, Github, Scissors } from "lucide-react";
import type { Board } from "@/lib/circle";
import { fmt } from "@/lib/edition";
import Edition, { ScoreTable } from "./Edition";

const TRY = ["marvillage", "sindresorhus", "gaearon"];

// accepts "name", "@name" or a pasted profile URL
const clean = (s: string) =>
  s
    .trim()
    .replace(/^https?:\/\/(www\.)?github\.com\//i, "")
    .replace(/^@/, "")
    .split(/[/?#\s]/)[0];

// rolls a number up from zero once it arrives
function useCountUp(target: number | null, ms = 1200) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (target === null) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(target);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / ms);
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return n;
}

function Ear({ label, value }: { label: string; value: string }) {
  return (
    <div className="hidden w-[132px] shrink-0 flex-col items-center justify-center border-2 border-[var(--dc-ink)] px-2 py-2 text-center md:flex">
      <span className="dc-label !text-[9.5px]">{label}</span>
      <span className="dc-num mt-1 text-[28px] font-black leading-none">{value}</span>
    </div>
  );
}

// landing "by the numbers": what one edition is built from and what it prints
const SOURCES: [string, string][] = [
  ["40", "latest pull requests"],
  ["40", "latest issues"],
  ["100", "of your comments"],
  ["1 yr", "of your reviews"],
  ["12", "most active repos"],
];
const PRINTS: [string, string][] = [
  ["1", "headline from your ratio"],
  ["6", "key numbers"],
  ["1", "collaborator of the year"],
  ["10", "rows of standings"],
  ["2", "charts: direction & work mix"],
];

function NumberList({ rows }: { rows: [string, string][] }) {
  return (
    <ul>
      {rows.map(([n, t]) => (
        <li key={t} className="grid grid-cols-[72px_minmax(0,1fr)] items-baseline gap-3 border-b border-[var(--dc-ink)]/25 py-1.5">
          <span className="dc-num text-right text-[30px] font-black leading-none">{n}</span>
          <span className="dc-serif text-[15px]">{t}</span>
        </li>
      ))}
    </ul>
  );
}

export default function DailyCommit({
  initialBoard,
  initialError,
  initialLogin,
  owner,
  ownerName,
  ownerX,
  today,
}: {
  initialBoard: Board | null;
  initialError: string | null;
  initialLogin: string;
  owner: string;
  ownerName: string;
  ownerX: string | null;
  today: string;
}) {
  const [login, setLogin] = useState(initialLogin);
  const [board, setBoard] = useState(initialBoard);
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState<string | null>(null);
  const [views, setViews] = useState<number | null>(null);
  const [viewsOff, setViewsOff] = useState(false);
  const shownViews = useCountUp(views);
  const input = useRef<HTMLInputElement>(null);
  const top = useRef<HTMLDivElement>(null);
  const counted = useRef(false);

  // one page view per load
  useEffect(() => {
    if (counted.current) return;
    counted.current = true;
    fetch("/api/daily-commit/views", { method: "POST" })
      .then((r) => r.json())
      .then((d: { views: number | null }) => (d.views === null ? setViewsOff(true) : setViews(d.views)))
      .catch(() => setViewsOff(true));
  }, []);

  async function print(e?: FormEvent, value?: string) {
    e?.preventDefault();
    if (loading) return;
    const u = clean(value ?? login);
    if (!u) {
      setError("Type a GitHub username first.");
      input.current?.focus();
      return;
    }
    setLogin(u);
    setLoading(u);
    setError(null);
    try {
      const res = await fetch(`/api/daily-commit?u=${encodeURIComponent(u)}`);
      const data = (await res.json()) as { ok: boolean; board?: Board; error?: string };
      if (!data.ok || !data.board) throw new Error(data.error);
      setBoard(data.board);
      window.history.replaceState(null, "", `/daily-commit?u=${encodeURIComponent(data.board.login)}`);
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "The press jammed. Try again.");
    } finally {
      setLoading(null);
    }
  }

  const newEdition = () => {
    setBoard(null);
    setError(null);
    setLogin("");
    window.history.replaceState(null, "", "/daily-commit");
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => input.current?.focus(), 350);
  };

  return (
    <div className="dc-root min-h-[100svh]">
      <div ref={top} className="mx-auto w-full max-w-[1180px] px-4 pb-14 sm:px-8">
        {/* utility strip */}
        <div className="dc-label flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-[var(--dc-ink)]/40 py-2.5 !text-[10.5px]">
          <a href="/" className="inline-flex items-center gap-1.5 py-1.5 hover:underline">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Kushagra&rsquo;s portfolio
          </a>
          <a href={`https://github.com/${owner}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 py-1.5 hover:underline">
            <Github className="h-3.5 w-3.5" aria-hidden /> A @{owner} publication
          </a>
          {!viewsOff && (
            <span>
              Page views <b className="font-medium">{views === null ? "…" : fmt(shownViews)}</b>
            </span>
          )}
        </div>

        {/* masthead */}
        <header className="pt-5">
          <div className="flex items-center justify-between gap-4">
            {viewsOff ? <Ear label="Price" value="Free" /> : <Ear label="Page views" value={views === null ? "…" : fmt(shownViews)} />}
            <a href="/daily-commit" className="dc-black min-w-0 flex-1 text-center text-[clamp(40px,9vw,112px)] leading-[1.05]">
              The Daily Commit
            </a>
            <Ear label={board ? "Followers" : "Edition"} value={board ? fmt(board.followers) : "GitHub"} />
          </div>
          <div className="mt-3 flex items-center justify-center gap-3 bg-[var(--dc-ink)] px-4 py-2 text-[var(--dc-paper)]">
            <Github className="h-5 w-5 shrink-0" aria-hidden />
            <span className="dc-head text-[clamp(15px,2.4vw,24px)] font-black uppercase tracking-[0.22em]">GitHub Edition</span>
            <Github className="h-5 w-5 shrink-0" aria-hidden />
          </div>
          <div className="dc-label mt-1.5 flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-y-[3px] border-double border-[var(--dc-ink)] py-2 !text-[10.5px]">
            <span>Vol. 1 · {board?.no ? `No. ${String(board.no).padStart(3, "0")}` : "Today's paper"}</span>
            <span>{today}</span>
            <span>
              Editor-in-chief{" "}
              <a href={`https://github.com/${owner}`} target="_blank" rel="noreferrer" className="font-medium underline underline-offset-2">
                @{owner}
              </a>
            </span>
          </div>
        </header>

        {/* landing front page */}
        {!board && !loading && (
          <section className="dc-set mt-10 text-center" aria-labelledby="dc-front">
            <p className="dc-label text-[var(--dc-red)]">Extra! Extra!</p>
            <h1 id="dc-front" className="dc-head mx-auto mt-3 max-w-[16ch] text-[clamp(40px,8vw,100px)] font-black uppercase leading-[0.92] [text-wrap:balance]">
              Who actually shows up for you on GitHub?
            </h1>
            <p className="dc-serif mt-4 text-[18px] italic text-[var(--dc-ink-2)] sm:text-[20px]">Followers are just a number. Print the real standings.</p>
          </section>
        )}

        {/* the coupon */}
        <form onSubmit={print} className={`dc-coupon relative mx-auto px-4 pb-4 pt-5 sm:px-6 ${board ? "mt-6 max-w-[860px]" : "mt-9 max-w-[760px]"}`}>
          <Scissors className="absolute -top-[11px] left-5 h-5 w-5 bg-[var(--dc-paper)] px-0.5" aria-hidden />
          <label htmlFor="dc-u" className="dc-label block !text-[11px]">
            {board ? "Print another edition" : "Clip & fill in: look up any GitHub user"}
          </label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <div className="flex h-12 min-w-0 shrink-0 items-center border-b-2 border-[var(--dc-ink)] sm:flex-1">
              <span className="dc-serif shrink-0 text-[17px] text-[var(--dc-ink-2)]">github.com/</span>
              <input
                id="dc-u"
                ref={input}
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="username"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                className="dc-serif h-full min-w-0 flex-1 bg-transparent pl-1 text-[20px] font-bold text-[var(--dc-ink)] outline-none placeholder:font-normal placeholder:text-[var(--dc-ink)]/35"
              />
            </div>
            <button
              type="submit"
              disabled={!!loading}
              className="dc-head h-12 shrink-0 bg-[var(--dc-ink)] px-6 text-[15px] font-black uppercase tracking-[0.08em] text-[var(--dc-paper)] transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--dc-red)] disabled:cursor-wait disabled:opacity-60"
            >
              {loading ? "Printing…" : "Print edition"}
            </button>
          </div>
          <p className="dc-label mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 !text-[10.5px] text-[var(--dc-ink-2)]">
            <span>Try</span>
            {TRY.map((t) => (
              <button key={t} type="button" onClick={() => print(undefined, t)} className="py-1.5 text-[var(--dc-ink)] underline underline-offset-2 hover:text-[var(--dc-red)]">
                @{t}
              </button>
            ))}
          </p>
        </form>

        {error && !loading && (
          <div role="alert" className="mx-auto mt-6 flex max-w-[760px] flex-wrap items-baseline gap-x-3 gap-y-1 border-l-4 border-[var(--dc-red)] bg-[var(--dc-paper-2)] px-4 py-3">
            <span className="dc-head text-[16px] font-black uppercase tracking-[0.08em] text-[var(--dc-red)]">Correction</span>
            <span className="dc-serif text-[16px]">{error}</span>
          </div>
        )}

        {loading && (
          <div className="mt-16 text-center" role="status">
            <p className="dc-head text-[clamp(36px,7vw,80px)] font-black uppercase leading-none">Stop the presses</p>
            <p className="dc-label mt-4">Printing @{loading}&rsquo;s edition</p>
            <div className="dc-press mx-auto mt-5 h-2 w-[min(360px,80%)]" />
          </div>
        )}

        {/* landing numbers */}
        {!board && !loading && (
          <div className="dc-set mt-14 grid gap-10 border-t-[3px] border-double border-[var(--dc-ink)] pt-8 md:grid-cols-3 md:gap-8 [animation-delay:0.1s]">
            <section>
              <h2 className="dc-head border-b-2 border-[var(--dc-ink)] pb-1.5 text-[19px] font-black uppercase tracking-[0.04em]">Each edition reads</h2>
              <div className="mt-2">
                <NumberList rows={SOURCES} />
              </div>
            </section>
            <section>
              <h2 className="dc-head border-b-2 border-[var(--dc-ink)] pb-1.5 text-[19px] font-black uppercase tracking-[0.04em]">Each edition prints</h2>
              <div className="mt-2">
                <NumberList rows={PRINTS} />
              </div>
            </section>
            <section>
              <h2 className="dc-head border-b-2 border-[var(--dc-ink)] pb-1.5 text-[19px] font-black uppercase tracking-[0.04em]">How we score</h2>
              <div className="mt-2">
                <ScoreTable />
              </div>
            </section>
          </div>
        )}

        {board && !loading && <Edition key={board.login} board={board} owner={owner} ownerX={ownerX} onNewEdition={newEdition} />}

        <footer className="dc-label mt-14 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-[var(--dc-ink)]/40 pt-4 text-center !text-[10.5px] text-[var(--dc-ink-2)]">
          <span>
            Printed &amp; published by {ownerName} ·{" "}
            <a href={`https://github.com/${owner}`} target="_blank" rel="noreferrer" className="text-[var(--dc-ink)] underline underline-offset-2">
              @{owner}
            </a>
          </span>
          <span aria-hidden>·</span>
          <span>Public GitHub data only · free</span>
          <span aria-hidden>·</span>
          <a href="/" className="inline-block py-1.5 text-[var(--dc-ink)] underline underline-offset-2">
            Back to the portfolio
          </a>
        </footer>
      </div>
    </div>
  );
}
