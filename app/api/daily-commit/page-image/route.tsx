import { ImageResponse } from "next/og";
import { getBoard, type Board, type Kind, type Person } from "@/lib/circle";
import { BOTH_WAYS_BONUS, COMMIT_POINTS_MAX, MUTUAL_BONUS, W as POINTS } from "@/lib/circleScore";
import { fmt, headline, pad3, showUpRate } from "@/lib/edition";
import { Band, cut, editionDate, INK, INK2, inlineAll, Masthead, PAPER, PAPER2, Portrait, RED, SITE } from "@/lib/ogParts";

// The whole edition as one portrait picture (1200x1600), laid out like the page: headline,
// the six numbers, collaborator of the year, the standings, and the sidebar. Share on X
// attaches it to the post; Download saves it.

export const runtime = "edge";
export const dynamic = "force-dynamic";

const W = 1200;
const H = 1600;

const font = (url: URL) => fetch(url).then((r) => r.arrayBuffer());
type Font = { name: string; data: ArrayBuffer; weight: 400 | 500 | 700 | 900; style: "normal" | "italic" };
let fonts: Promise<Font[]> | null = null;
const loadFonts = () =>
  (fonts ??= Promise.all([
    font(new URL("../../../../assets/og/unifrakturmaguntia-latin-400-normal.woff", import.meta.url)),
    font(new URL("../../../../assets/og/playfair-display-latin-900-normal.woff", import.meta.url)),
    font(new URL("../../../../assets/og/ibm-plex-mono-latin-500-normal.woff", import.meta.url)),
    font(new URL("../../../../assets/og/libre-caslon-text-latin-400-normal.woff", import.meta.url)),
    font(new URL("../../../../assets/og/libre-caslon-text-latin-400-italic.woff", import.meta.url)),
    font(new URL("../../../../assets/og/libre-caslon-text-latin-700-normal.woff", import.meta.url)),
  ]).then(([black, head, mono, cas, casI, casB]): Font[] => [
    { name: "Blackletter", data: black, weight: 400, style: "normal" },
    { name: "Headline", data: head, weight: 900, style: "normal" },
    { name: "Mono", data: mono, weight: 500, style: "normal" },
    { name: "Caslon", data: cas, weight: 400, style: "normal" },
    { name: "Caslon", data: casI, weight: 400, style: "italic" },
    { name: "Caslon", data: casB, weight: 700, style: "normal" },
  ]));

const KINDS: { k: Kind; short: string; many: string }[] = [
  { k: "review", short: "REV", many: "reviews" },
  { k: "comment", short: "COM", many: "comments" },
  { k: "pr", short: "PR", many: "PRs" },
  { k: "issue", short: "ISS", many: "issues" },
  { k: "commit", short: "CMT", many: "commits" },
];
type Way = "both" | "in" | "out";
const way = (p: Person): Way => (p.inbound > 0 && p.outbound > 0 ? "both" : p.inbound > 0 ? "in" : "out");
const WAY_LABEL: Record<Way, string> = { both: "BOTH WAYS", in: "THEY COME TO YOU", out: "YOU GO TO THEM" };

// direction arrows drawn as vectors: the renderer swaps "↔" for an emoji
function Arrow({ w, size = 24 }: { w: Way; size?: number }) {
  const head = (x: number, dir: 1 | -1) => `M${x - 6 * dir} 6 L${x} 12 L${x - 6 * dir} 18`;
  return (
    <svg width={size * 1.6} height={size} viewBox="0 0 38 24" fill="none" stroke={INK} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12 H34" />
      {w !== "in" && <path d={head(34, 1)} />}
      {w !== "out" && <path d={head(4, -1)} />}
    </svg>
  );
}
const moves = (p: Person) =>
  KINDS.filter(({ k }) => p.counts[k])
    .sort((a, b) => (p.counts[b.k] ?? 0) - (p.counts[a.k] ?? 0))
    .slice(0, 3)
    .map(({ k, many }) => `${p.counts[k]} ${many}`)
    .join(" · ")
    .toUpperCase();

function Head({ children, top = 0 }: { children: string; top?: number }) {
  return (
    <div style={{ display: "flex", marginTop: top, paddingBottom: 6, borderBottom: `2px solid ${INK}`, fontFamily: "Headline", fontSize: 21, letterSpacing: 1 }}>{children}</div>
  );
}

function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", marginTop: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div style={{ display: "flex", fontFamily: "Mono", fontSize: 12, letterSpacing: 1.5, color: INK2 }}>{label}</div>
        <div style={{ display: "flex", fontFamily: "Headline", fontSize: 24, lineHeight: 1 }}>{fmt(value)}</div>
      </div>
      <div style={{ display: "flex", marginTop: 5, height: 11, background: PAPER2 }}>
        <div style={{ display: "flex", height: 11, width: `${max ? Math.max(0, (value / max) * 100) : 0}%`, background: INK }} />
      </div>
    </div>
  );
}

function Edition({ b, pics, rest, date }: { b: Board; pics: (string | null)[]; rest: (string | null)[]; date: string }) {
  const [h1, h2] = headline(b);
  const lead = b.top[0];
  const inOnly = b.showUp - b.bothWays;
  const outOnly = b.circle - b.showUp;
  const numbers: [string, string][] = [
    ["FOLLOWERS", fmt(b.followers)],
    ["IN THE CIRCLE", fmt(b.circle)],
    ["SHOW UP FOR YOU", fmt(b.showUp)],
    ["YOU SHOW UP FOR", fmt(outOnly + b.bothWays)],
    ["BOTH WAYS", fmt(b.bothWays)],
    ["SHOW-UP RATE", showUpRate(b)],
  ];
  const mix = KINDS.map(({ k, many }) => ({ label: many.toUpperCase(), value: b.top.reduce((s, p) => s + (p.counts[k] ?? 0), 0) }));
  const mixMax = Math.max(...mix.map((m) => m.value), 1);
  const wayMax = Math.max(b.bothWays, inOnly, outOnly, 1);
  const more = Math.max(0, b.circle - b.top.length - rest.length);
  const scoring: [string, string][] = [
    ["Review", `${POINTS.review} PTS`],
    ["Pull request", `${POINTS.pr} PTS`],
    ["Comment", `${POINTS.comment} PTS`],
    ["Issue", `${POINTS.issue} PTS`],
    ["Commit", `${POINTS.commit} PT · MAX ${COMMIT_POINTS_MAX}`],
    ["Both ways bonus", `+${BOTH_WAYS_BONUS} PTS`],
    ["Mutual follow", `+${MUTUAL_BONUS} PTS`],
  ];
  const col = { display: "flex", width: 44, justifyContent: "flex-end" } as const;

  return (
    <div style={{ width: W, height: H, display: "flex", flexDirection: "column", background: PAPER, color: INK, padding: "36px 48px" }}>
      <Masthead right="GITHUB EDITION" size={70} />
      <Band text={`CIRCLE REPORT · @${b.login.toUpperCase()}${b.no ? ` · NO. ${pad3(b.no)}` : ""}`} />

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 22, fontFamily: "Headline", fontSize: 82, lineHeight: 0.98, textTransform: "uppercase" }}>
        <div style={{ display: "flex" }}>{h1}</div>
        <div style={{ display: "flex" }}>{h2}</div>
      </div>
      <div style={{ display: "flex", justifyContent: "center", marginTop: 12, fontFamily: "Caslon", fontStyle: "italic", fontSize: 22, color: INK2 }}>
        {`${b.name ? `${b.name} (@${b.login})` : `@${b.login}`} · ${fmt(b.circle)} in the circle · ${fmt(b.bothWays)} both ways · ${fmt(b.mutuals)} mutuals`}
      </div>

      <div style={{ display: "flex", flexShrink: 0, marginTop: 22, borderTop: `4px solid ${INK}`, borderBottom: `4px solid ${INK}` }}>
        {numbers.map(([k, v], i) => (
          <div key={k} style={{ display: "flex", flex: 1, flexDirection: "column", alignItems: "center", padding: "14px 0 12px", borderLeft: i ? `1px solid ${INK2}` : "none" }}>
            <div style={{ display: "flex", fontFamily: "Headline", fontSize: 50, lineHeight: 1 }}>{v}</div>
            <div style={{ display: "flex", marginTop: 8, fontFamily: "Mono", fontSize: 12, letterSpacing: 1.5, color: INK2 }}>{k}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexShrink: 0, marginTop: 28 }}>
        {/* left: collaborator of the year + standings */}
        <div style={{ display: "flex", flexDirection: "column", width: 690, paddingRight: 30, borderRight: `1px solid ${INK2}` }}>
          {lead && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Head>COLLABORATOR OF THE YEAR</Head>
              <div style={{ display: "flex", marginTop: 14 }}>
                <Portrait src={pics[0]} size={150} initial={lead.login.slice(0, 1)} border={3} />
                <div style={{ display: "flex", flexDirection: "column", marginLeft: 22, flex: 1 }}>
                  <div style={{ display: "flex", fontFamily: "Headline", fontSize: 44, lineHeight: 1 }}>@{cut(lead.login.toUpperCase(), 17)}</div>
                  {lead.name && <div style={{ display: "flex", marginTop: 4, fontFamily: "Caslon", fontStyle: "italic", fontSize: 19, color: INK2 }}>{cut(lead.name, 40)}</div>}
                  <div style={{ display: "flex", marginTop: 12, borderTop: `2px solid ${INK}` }}>
                    {[
                      ["POINTS", fmt(Math.round(lead.score))],
                      ["RANK", `1/${fmt(b.circle)}`],
                      ["DIRECTION", ""],
                    ].map(([k, v], i) => (
                      <div key={k} style={{ display: "flex", flexDirection: "column", flex: 1, padding: "8px 0 0 12px", paddingLeft: i ? 12 : 0, borderLeft: i ? `1px solid ${INK2}` : "none" }}>
                        <div style={{ display: "flex", fontFamily: "Mono", fontSize: 11, letterSpacing: 1.5, color: INK2 }}>{k}</div>
                        <div style={{ display: "flex", marginTop: 4, height: 38, alignItems: "center", fontFamily: "Headline", fontSize: 38, lineHeight: 1 }}>
                          {k === "DIRECTION" ? <Arrow w={way(lead)} size={30} /> : v}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", marginTop: 8, fontFamily: "Mono", fontSize: 12, letterSpacing: 1, color: INK2 }}>
                    {`${moves(lead)} · ${WAY_LABEL[way(lead)]}`}
                  </div>
                </div>
              </div>
            </div>
          )}

          <Head top={lead ? 26 : 0}>THE STANDINGS</Head>
          <div style={{ display: "flex", alignItems: "center", height: 30, borderBottom: `1px solid ${INK}`, fontFamily: "Mono", fontSize: 11, letterSpacing: 1.2, color: INK2 }}>
            <div style={{ display: "flex", width: 40 }}>RK</div>
            <div style={{ display: "flex", flex: 1 }}>PLAYER</div>
            {KINDS.map(({ short }) => (
              <div key={short} style={col}>
                {short}
              </div>
            ))}
            <div style={{ display: "flex", width: 50, justifyContent: "center" }}>WAY</div>
            <div style={{ display: "flex", width: 46, justifyContent: "flex-end" }}>PTS</div>
          </div>
          {b.top.map((p, i) => (
            <div key={p.login} style={{ display: "flex", alignItems: "center", height: 47, borderBottom: `1px solid ${PAPER2}` }}>
              <div style={{ display: "flex", width: 40, fontFamily: "Headline", fontSize: 24 }}>{i + 1}</div>
              <div style={{ display: "flex", flex: 1, alignItems: "center" }}>
                <Portrait src={pics[i]} size={32} initial={p.login.slice(0, 1)} border={1} />
                <div style={{ display: "flex", flexDirection: "column", marginLeft: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", fontFamily: "Caslon", fontWeight: 700, fontSize: 18 }}>
                    @{cut(p.login, 24)}
                    {p.mutual && <span style={{ color: RED, marginLeft: 6 }}>♥</span>}
                  </div>
                  {p.name && <div style={{ display: "flex", fontFamily: "Caslon", fontStyle: "italic", fontSize: 13, color: INK2 }}>{cut(p.name, 34)}</div>}
                </div>
              </div>
              {KINDS.map(({ k }) => (
                <div key={k} style={{ ...col, fontFamily: "Mono", fontSize: 15, color: p.counts[k] ? INK : "#b3afa6" }}>
                  {p.counts[k] ? String(p.counts[k]) : "–"}
                </div>
              ))}
              <div style={{ display: "flex", width: 50, justifyContent: "center" }}>
                <Arrow w={way(p)} size={16} />
              </div>
              <div style={{ display: "flex", width: 46, justifyContent: "flex-end", fontFamily: "Headline", fontSize: 24 }}>{fmt(Math.round(p.score))}</div>
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", marginTop: 8, fontFamily: "Mono", fontSize: 11, letterSpacing: 1, color: INK2 }}>
            <Arrow w="both" size={12} />
            <span style={{ marginLeft: 4, marginRight: 12 }}>BOTH WAYS</span>
            <Arrow w="in" size={12} />
            <span style={{ marginLeft: 4, marginRight: 12 }}>THEY COME TO YOU</span>
            <Arrow w="out" size={12} />
            <span style={{ marginLeft: 4, marginRight: 12 }}>YOU GO TO THEM</span>
            <span style={{ color: RED, marginRight: 4 }}>♥</span>
            <span>FOLLOW EACH OTHER</span>
          </div>
        </div>

        {/* right: sidebar */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, paddingLeft: 30 }}>
          <Head>WHO GOES WHERE</Head>
          <Bar label="BOTH WAYS" value={b.bothWays} max={wayMax} />
          <Bar label="ONLY THEY COME TO YOU" value={inOnly} max={wayMax} />
          <Bar label="ONLY YOU GO TO THEM" value={outOnly} max={wayMax} />

          <Head top={20}>WORK MIX · TOP 10</Head>
          {mix.map((m) => (
            <Bar key={m.label} label={m.label} value={m.value} max={mixMax} />
          ))}

          {b.rest.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Head top={20}>THE REST OF THE CIRCLE</Head>
              <div style={{ display: "flex", flexWrap: "wrap", marginTop: 12 }}>
                {b.rest.slice(0, rest.length).map((p, i) => (
                  <div key={p.login} style={{ display: "flex", marginRight: 6, marginBottom: 6 }}>
                    <Portrait src={rest[i]} size={40} initial={p.login.slice(0, 1)} border={1} />
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", fontFamily: "Mono", fontSize: 11, letterSpacing: 1.5, color: INK2 }}>{`${fmt(more)} MORE`}</div>
            </div>
          )}

          <Head top={20}>HOW WE SCORE</Head>
          {scoring.map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 27, borderBottom: `1px solid ${PAPER2}` }}>
              <div style={{ display: "flex", fontFamily: "Caslon", fontSize: 17 }}>{k}</div>
              <div style={{ display: "flex", fontFamily: "Mono", fontSize: 11, letterSpacing: 1 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", marginTop: "auto", paddingTop: 12, borderTop: `4px solid ${INK}`, justifyContent: "space-between", alignItems: "center", fontFamily: "Mono", fontSize: 15, letterSpacing: 1.5 }}>
        <div style={{ display: "flex", color: INK2 }}>{date.toUpperCase()}</div>
        <div style={{ display: "flex" }}>CHECK YOURS FREE → {SITE.toUpperCase()}</div>
      </div>
    </div>
  );
}

export async function GET(req: Request) {
  const u = new URL(req.url).searchParams.get("u") ?? "";
  let board: Board | null = null;
  try {
    board = await getBoard(u, null);
  } catch {
    board = null;
  }
  if (!board) return new Response("No such edition", { status: 404 });

  const urls = [...board.top.map((p) => p.avatar), ...board.rest.slice(0, 8).map((p) => p.avatar)];
  const all = await inlineAll(urls, (i) => (i === 0 ? 300 : 64));
  const pics = all.slice(0, board.top.length);
  const rest = all.slice(board.top.length);
  return new ImageResponse(<Edition b={board} pics={pics} rest={rest} date={editionDate()} />, {
    width: W,
    height: H,
    fonts: await loadFonts(),
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=43200, stale-while-revalidate=86400",
      "Content-Disposition": `inline; filename="daily-commit-${board.login}.png"`,
    },
  });
}
