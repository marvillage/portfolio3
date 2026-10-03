"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { Board, Kind, Person } from "@/lib/circle";
import { BOTH_WAYS_BONUS, COMMIT_POINTS_MAX, MUTUAL_BONUS, W } from "@/lib/circleScore";
import { fmt, headline, pad3, showUpRate } from "@/lib/edition";

const KINDS: { k: Kind; short: string; one: string; many: string }[] = [
  { k: "review", short: "REV", one: "review", many: "reviews" },
  { k: "comment", short: "COM", one: "comment", many: "comments" },
  { k: "pr", short: "PR", one: "PR", many: "PRs" },
  { k: "issue", short: "ISS", one: "issue", many: "issues" },
  { k: "commit", short: "CMT", one: "commit", many: "commits" },
];
const way = (p: Person) => (p.inbound > 0 && p.outbound > 0 ? "↔" : p.inbound > 0 ? "←" : "→");
const WAY_LABEL: Record<string, string> = { "↔": "both ways", "←": "they come to you", "→": "you go to them" };
const moves = (p: Person) =>
  KINDS.filter(({ k }) => p.counts[k])
    .sort((a, b) => (p.counts[b.k] ?? 0) - (p.counts[a.k] ?? 0))
    .slice(0, 3)
    .map(({ k, one, many }) => `${p.counts[k]} ${p.counts[k] === 1 ? one : many}`)
    .join(" · ");
const pts = (s: number) => fmt(Math.round(s));

function Halftone({ src, className }: { src: string; className: string }) {
  return (
    <span className={`dc-halftone block ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" loading="lazy" />
    </span>
  );
}

function Head({ children }: { children: ReactNode }) {
  return (
    <h3 className="dc-head border-b-2 border-[var(--dc-ink)] pb-1.5 text-[19px] font-black uppercase tracking-[0.04em]">{children}</h3>
  );
}

// a labelled bar row for the sidebar charts; widths share one scale per chart
function Bar({ label, value, max, delay }: { label: string; value: number; max: number; delay: number }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1">
      <span className="dc-label !text-[10.5px] !tracking-[0.1em] text-[var(--dc-ink-2)]">{label}</span>
      <span className="dc-num text-[20px] font-black leading-none">{fmt(value)}</span>
      <span className="col-span-2 block h-3 bg-[var(--dc-paper-2)]">
        <span className="dc-bar block h-full bg-[var(--dc-ink)]" style={{ width: `${max ? (value / max) * 100 : 0}%`, animationDelay: `${delay}s` }} />
      </span>
    </div>
  );
}

function ago(iso: string) {
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  return `${Math.round(m / 60)} h ago`;
}

export function ScoreTable() {
  const rows: [string, string][] = [
    ["Review", `${W.review} pts`],
    ["Pull request", `${W.pr} pts`],
    ["Comment", `${W.comment} pts`],
    ["Issue", `${W.issue} pts`],
    ["Commit", `${W.commit} pt · max ${COMMIT_POINTS_MAX}`],
    ["Both ways bonus", `+${BOTH_WAYS_BONUS} pts`],
    ["Mutual follow", `+${MUTUAL_BONUS} pts`],
  ];
  return (
    <table className="w-full border-collapse">
      <tbody>
        {rows.map(([k, v]) => (
          <tr key={k} className="border-b border-[var(--dc-ink)]/25">
            <td className="dc-serif py-1.5 text-[15px]">{k}</td>
            <td className="dc-label py-1.5 text-right !text-[12px] !tracking-[0.06em]">{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const BTN =
  "dc-head flex items-center justify-center text-center border-2 border-[var(--dc-ink)] px-3 py-2.5 text-[13px] sm:px-5 sm:text-[14px] font-black uppercase tracking-[0.06em] transition-colors hover:bg-[var(--dc-ink)] hover:text-[var(--dc-paper)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--dc-red)]";

export default function Edition({ board, owner, ownerX, onNewEdition }: { board: Board; owner: string; ownerX: string | null; onNewEdition: () => void }) {
  const [printed, setPrinted] = useState("");
  const [copied, setCopied] = useState(false);
  useEffect(() => setPrinted(ago(board.builtAt)), [board.builtAt]);

  const [h1, h2] = headline(board);
  const lead = board.top[0];
  const inOnly = board.showUp - board.bothWays;
  const outOnly = board.circle - board.showUp;
  const youGo = outOnly + board.bothWays;
  const mix = KINDS.map(({ k, many }) => ({ label: many, value: board.top.reduce((s, p) => s + (p.counts[k] ?? 0), 0) }));
  const mixMax = Math.max(...mix.map((m) => m.value), 1);
  const wayMax = Math.max(board.bothWays, inOnly, outOnly, 1);
  const more = Math.max(0, board.circle - board.top.length - board.rest.length);

  const link = () => `${window.location.origin}/daily-commit?u=${encodeURIComponent(board.login)}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copy this link", link());
    }
  };
  const share = () => {
    // X turns the link into a card showing the front page (see the share-image route)
    const text = `My GitHub circle: ${h1.toLowerCase()} ${h2.toLowerCase()} 🗞️ The Daily Commit${ownerX ? ` by @${ownerX}` : ""}`;
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link())}`, "_blank", "noopener");
  };

  return (
    <article aria-labelledby="dc-headline">
      {/* kicker + headline */}
      <div className="dc-set mt-8 text-center">
        <p className="dc-label flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[var(--dc-red)]">
          <span>Circle report</span>
          <span aria-hidden>·</span>
          <span>@{board.login}</span>
          {board.no && (
            <>
              <span aria-hidden>·</span>
              <span>Edition no. {pad3(board.no)}</span>
            </>
          )}
        </p>
        <h1 id="dc-headline" className="dc-head mx-auto mt-3 max-w-[18ch] text-[clamp(40px,8.4vw,104px)] font-black uppercase leading-[0.92] tracking-[-0.01em] [text-wrap:balance]">
          {h1}
          <br />
          {h2}
        </h1>
        <p className="dc-serif mt-4 text-[17px] italic text-[var(--dc-ink-2)] sm:text-[19px]">
          {board.name ? `${board.name} (@${board.login})` : `@${board.login}`} · {fmt(board.circle)} in the circle · {fmt(board.bothWays)} both ways · {fmt(board.mutuals)} mutuals
        </p>
      </div>

      {/* by the numbers */}
      <section aria-label="By the numbers" className="dc-set mt-8 border-y-[3px] border-double border-[var(--dc-ink)] [animation-delay:0.08s]">
        <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {[
            ["Followers", fmt(board.followers)],
            ["In the circle", fmt(board.circle)],
            ["Show up for you", fmt(board.showUp)],
            ["You show up for", fmt(youGo)],
            ["Both ways", fmt(board.bothWays)],
            ["Show-up rate", showUpRate(board)],
          ].map(([k, v], i) => (
            <div key={k} className={`flex flex-col-reverse items-center gap-1 px-2 py-4 text-center ${i ? "border-l border-[var(--dc-ink)]/30" : ""} sm:max-lg:[&:nth-child(4)]:border-l-0 max-sm:[&:nth-child(odd)]:border-l-0`}>
              <dt className="dc-label !text-[10.5px] text-[var(--dc-ink-2)]">{k}</dt>
              <dd className="dc-num text-[clamp(34px,4.6vw,52px)] font-black leading-none">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      {board.circle === 0 ? (
        <p className="dc-head dc-set mt-12 text-center text-[28px] font-black uppercase">No reviews, comments or commits with anyone yet</p>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-0">
          <div className="min-w-0 lg:border-r lg:border-[var(--dc-ink)]/40 lg:pr-8">
            {/* collaborator of the year */}
            {lead && (
              <section className="dc-set [animation-delay:0.14s]" aria-labelledby="dc-lead">
                <Head>Collaborator of the year</Head>
                <div className="mt-4 grid gap-5 sm:grid-cols-[180px_minmax(0,1fr)]">
                  <a href={`https://github.com/${lead.login}`} target="_blank" rel="noreferrer" className="block">
                    <Halftone src={lead.avatar} className="aspect-square w-[140px] border-2 border-[var(--dc-ink)] sm:w-full" />
                  </a>
                  <div className="min-w-0">
                    <p id="dc-lead" className="dc-head break-words text-[clamp(30px,4.4vw,48px)] font-black uppercase leading-[0.95]">
                      <a href={`https://github.com/${lead.login}`} target="_blank" rel="noreferrer" className="hover:underline">
                        @{lead.login}
                      </a>
                    </p>
                    {lead.name && <p className="dc-serif mt-1 text-[18px] italic text-[var(--dc-ink-2)]">{lead.name}</p>}
                    <dl className="mt-4 grid grid-cols-3 border-t-2 border-[var(--dc-ink)]">
                      <div className="py-3">
                        <dt className="dc-label !text-[10px] text-[var(--dc-ink-2)]">Points</dt>
                        <dd className="dc-num text-[36px] font-black leading-none">{pts(lead.score)}</dd>
                      </div>
                      <div className="border-l border-[var(--dc-ink)]/30 py-3 pl-3">
                        <dt className="dc-label !text-[10px] text-[var(--dc-ink-2)]">Rank</dt>
                        <dd className="dc-num text-[36px] font-black leading-none">
                          1<span className="text-[18px] text-[var(--dc-ink-2)]">/{fmt(board.circle)}</span>
                        </dd>
                      </div>
                      <div className="border-l border-[var(--dc-ink)]/30 py-3 pl-3">
                        <dt className="dc-label !text-[10px] text-[var(--dc-ink-2)]">Direction</dt>
                        <dd className="dc-num text-[36px] font-black leading-none" title={WAY_LABEL[way(lead)]}>
                          {way(lead)}
                        </dd>
                      </div>
                    </dl>
                    <p className="dc-label mt-1 !text-[11px] !tracking-[0.08em] text-[var(--dc-ink-2)]">
                      {moves(lead)} · {WAY_LABEL[way(lead)]}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* the standings, as a box score */}
            <section className="dc-set mt-10 [animation-delay:0.2s]" aria-labelledby="dc-standings">
              <Head>
                <span id="dc-standings">The standings</span>
              </Head>
              <table className="mt-2 w-full table-fixed border-collapse">
                <thead>
                  <tr className="dc-label border-b border-[var(--dc-ink)] !text-[10px] text-[var(--dc-ink-2)]">
                    <th className="w-9 py-2 pr-2 text-left font-medium">Rk</th>
                    <th className="py-2 text-left font-medium">Player</th>
                    {KINDS.map(({ k, short }) => (
                      <th key={k} className="hidden w-11 py-2 text-right font-medium sm:table-cell">
                        {short}
                      </th>
                    ))}
                    <th className="w-10 py-2 text-center font-medium">Way</th>
                    <th className="w-12 py-2 text-right font-medium">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {board.top.map((p, i) => (
                    <tr key={p.login} className={`border-b border-[var(--dc-ink)]/20 ${i < 3 ? "font-semibold" : ""}`}>
                      <td className="dc-num py-2.5 pr-2 align-top text-[20px] font-black leading-none">{i + 1}</td>
                      <td className="overflow-hidden py-2 align-top">
                        <a href={`https://github.com/${p.login}`} target="_blank" rel="noreferrer" className="group flex min-w-0 items-center gap-3">
                          <Halftone src={p.avatar} className="h-9 w-9 shrink-0 border border-[var(--dc-ink)]" />
                          <span className="min-w-0">
                            <span className="dc-serif block truncate text-[16px] font-bold group-hover:underline">
                              @{p.login}
                              {p.mutual && (
                                <span className="ml-1.5 text-[var(--dc-red)]" title="you follow each other">
                                  ♥
                                </span>
                              )}
                            </span>
                            <span className="dc-label block truncate !text-[10px] !tracking-[0.06em] text-[var(--dc-ink-2)] sm:hidden">{moves(p)}</span>
                            {p.name && <span className="dc-serif hidden truncate text-[13px] italic text-[var(--dc-ink-2)] sm:block">{p.name}</span>}
                          </span>
                        </a>
                      </td>
                      {KINDS.map(({ k }) => (
                        <td key={k} className="dc-label hidden py-2.5 text-right align-top !text-[13px] !tracking-normal sm:table-cell">
                          {p.counts[k] ?? <span className="text-[var(--dc-ink)]/30">–</span>}
                        </td>
                      ))}
                      <td className="dc-num py-2.5 text-center align-top text-[18px]" title={WAY_LABEL[way(p)]}>
                        {way(p)}
                      </td>
                      <td className="dc-num py-2.5 text-right align-top text-[20px] font-black leading-none">{pts(p.score)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="dc-label mt-2 !text-[10px] !tracking-[0.08em] text-[var(--dc-ink-2)]">↔ both ways · ← they come to you · → you go to them · ♥ follow each other</p>
            </section>
          </div>

          {/* sidebar */}
          <aside className="min-w-0 space-y-10 lg:pl-8">
            <section className="dc-set [animation-delay:0.24s]">
              <Head>Who goes where</Head>
              <div className="mt-4 space-y-3">
                <Bar label="Both ways" value={board.bothWays} max={wayMax} delay={0.3} />
                <Bar label="Only they come to you" value={inOnly} max={wayMax} delay={0.38} />
                <Bar label="Only you go to them" value={outOnly} max={wayMax} delay={0.46} />
              </div>
            </section>
            <section className="dc-set [animation-delay:0.3s]">
              <Head>Work mix · top 10</Head>
              <div className="mt-4 space-y-3">
                {mix.map((m, i) => (
                  <Bar key={m.label} label={m.label} value={m.value} max={mixMax} delay={0.4 + i * 0.07} />
                ))}
              </div>
            </section>
            {board.rest.length > 0 && (
              <section className="dc-set [animation-delay:0.36s]">
                <Head>The rest of the circle</Head>
                <ul className="mt-4 grid grid-cols-8 gap-1.5 sm:grid-cols-10 lg:grid-cols-6">
                  {board.rest.map((p) => (
                    <li key={p.login}>
                      <a href={`https://github.com/${p.login}`} target="_blank" rel="noreferrer" title={`@${p.login}`} className="block outline-offset-1 hover:outline hover:outline-2 hover:outline-[var(--dc-ink)]">
                        <Halftone src={p.avatar} className="aspect-square w-full" />
                      </a>
                    </li>
                  ))}
                </ul>
                <p className="dc-label mt-2 !text-[10.5px] text-[var(--dc-ink-2)]">
                  {fmt(board.rest.length + more)} more {more > 0 ? `· ${fmt(board.rest.length)} pictured` : ""}
                </p>
              </section>
            )}
            <section className="dc-set [animation-delay:0.42s]">
              <Head>How we score</Head>
              <div className="mt-2">
                <ScoreTable />
              </div>
            </section>
          </aside>
        </div>
      )}

      {/* clip and share */}
      <div className="mt-12 grid grid-cols-2 gap-3 border-t-[3px] border-double border-[var(--dc-ink)] pt-6 sm:flex sm:flex-wrap sm:items-center sm:justify-center">
        <button type="button" onClick={copy} className={BTN}>
          {copied ? "Link copied" : "Copy link"}
        </button>
        <button type="button" onClick={share} className={BTN}>
          Share on X
        </button>
        <a href={`/api/daily-commit/og?u=${encodeURIComponent(board.login)}`} download={`daily-commit-${board.login}.png`} className={BTN}>
          Download image
        </a>
        <button type="button" onClick={onNewEdition} className={BTN}>
          New edition
        </button>
      </div>
      <p className="dc-label mt-5 text-center !text-[10.5px] text-[var(--dc-ink-2)]">
        {printed && `Printed ${printed} · `}next edition in 12 h · scored from the latest 40 PRs & issues, 100 comments, 1 year of reviews, 12 repos · edited by @{owner}
      </p>
    </article>
  );
}
