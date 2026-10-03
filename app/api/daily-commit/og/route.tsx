import { ImageResponse } from "next/og";
import { getBoard, type Board } from "@/lib/circle";
import { fmt, headline, pad3 } from "@/lib/edition";
import { profile } from "@/data/profile";

// The share picture: each edition's front page as a 1200x630 PNG. Link previews on X use
// it (summary_large_image), and the page's Download button saves it.

// edge: the Node build of next/og cannot load its bundled font on Windows dev machines
export const runtime = "edge";
export const dynamic = "force-dynamic";

const W = 1200;
const H = 630;
const PAPER = "#e8e5dd";
const INK = "#161513";
const INK2 = "#55524b";
const RED = "#b3261e";
const SITE = "portfolio3-kappa-rosy.vercel.app/daily-commit";

// literal URLs, so the bundler ships the font files with the route
const font = (url: URL) => fetch(url).then((r) => r.arrayBuffer());
let fonts: Promise<{ name: string; data: ArrayBuffer; weight: 400 | 500 | 900; style: "normal" }[]> | null = null;
const loadFonts = () =>
  (fonts ??= Promise.all([
    font(new URL("../../../../assets/og/unifrakturmaguntia-latin-400-normal.woff", import.meta.url)),
    font(new URL("../../../../assets/og/playfair-display-latin-900-normal.woff", import.meta.url)),
    font(new URL("../../../../assets/og/ibm-plex-mono-latin-500-normal.woff", import.meta.url)),
  ]).then(([black, head, mono]) => [
    { name: "Blackletter", data: black, weight: 400, style: "normal" },
    { name: "Headline", data: head, weight: 900, style: "normal" },
    { name: "Mono", data: mono, weight: 500, style: "normal" },
  ]));

// Avatars come from GitHub's avatar CDN only. Each is fetched with a timeout and inlined;
// one that fails falls back to initials instead of breaking the picture.
async function inline(url: string): Promise<string | null> {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:" || u.hostname !== "avatars.githubusercontent.com") return null;
    u.searchParams.set("s", "120");
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 8000);
    const res = await fetch(u, { signal: ctl.signal }).finally(() => clearTimeout(timer));
    const type = (res.headers.get("content-type") ?? "").split(";")[0];
    if (!res.ok || !/^image\/(png|jpeg)$/.test(type)) return null;
    const bytes = new Uint8Array(await res.arrayBuffer());
    if (bytes.length > 300_000) return null;
    let bin = "";
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return `data:${type};base64,${btoa(bin)}`;
  } catch {
    return null;
  }
}

const cut = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

function Masthead({ right }: { right: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", width: 250, fontFamily: "Mono", fontSize: 15, letterSpacing: 2 }}>A @{profile.github.toUpperCase()} PUBLICATION</div>
        <div style={{ display: "flex", fontFamily: "Blackletter", fontSize: 66, lineHeight: 1.1 }}>The Daily Commit</div>
        <div style={{ display: "flex", width: 250, justifyContent: "flex-end", fontFamily: "Mono", fontSize: 15, letterSpacing: 2 }}>{right}</div>
      </div>
      <div style={{ display: "flex", marginTop: 6, height: 7, borderTop: `2px solid ${INK}`, borderBottom: `2px solid ${INK}` }} />
    </div>
  );
}

function Band({ text }: { text: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: 12, padding: "8px 0", background: INK, color: PAPER, fontFamily: "Headline", fontSize: 22, letterSpacing: 6 }}>
      {text}
    </div>
  );
}

function Front({ b, avatars, date }: { b: Board; avatars: (string | null)[]; date: string }) {
  const [h1, h2] = headline(b);
  const stats: [string, string][] = [
    ["FOLLOWERS", fmt(b.followers)],
    ["IN THE CIRCLE", fmt(b.circle)],
    ["SHOW UP FOR YOU", fmt(b.showUp)],
    ["BOTH WAYS", fmt(b.bothWays)],
  ];
  return (
    <div style={{ width: W, height: H, display: "flex", flexDirection: "column", background: PAPER, color: INK, padding: "26px 44px" }}>
      <Masthead right="GITHUB EDITION" />
      <Band text={`CIRCLE REPORT · @${b.login.toUpperCase()}${b.no ? ` · NO. ${pad3(b.no)}` : ""}`} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 14, fontFamily: "Headline", fontSize: 58, lineHeight: 1, textTransform: "uppercase" }}>
        <div style={{ display: "flex" }}>{h1}</div>
        <div style={{ display: "flex", marginTop: 4 }}>{h2}</div>
      </div>
      <div style={{ display: "flex", marginTop: 16, borderTop: `2px solid ${INK}`, borderBottom: `2px solid ${INK}` }}>
        {stats.map(([k, v], i) => (
          <div key={k} style={{ display: "flex", flex: 1, flexDirection: "column", alignItems: "center", padding: "10px 0", borderLeft: i ? `1px solid ${INK2}` : "none" }}>
            <div style={{ display: "flex", fontFamily: "Headline", fontSize: 44, lineHeight: 1 }}>{v}</div>
            <div style={{ display: "flex", marginTop: 6, fontFamily: "Mono", fontSize: 13, letterSpacing: 2, color: INK2 }}>{k}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", marginTop: 16, justifyContent: "center" }}>
        {b.top.slice(0, 10).map((p, i) => (
          <div key={p.login} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 96, marginLeft: i ? 14 : 0 }}>
            <div style={{ display: "flex", position: "relative", width: 76, height: 76, border: `3px solid ${INK}`, background: "#dcd8ce" }}>
              {avatars[i] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatars[i]!} width={70} height={70} alt="" style={{ width: 70, height: 70 }} />
              ) : (
                <div style={{ display: "flex", width: 70, height: 70, alignItems: "center", justifyContent: "center", fontFamily: "Headline", fontSize: 30 }}>{p.login.slice(0, 1).toUpperCase()}</div>
              )}
              <div style={{ display: "flex", position: "absolute", top: -3, left: -3, padding: "1px 6px", background: i < 3 ? RED : INK, color: PAPER, fontFamily: "Mono", fontSize: 13 }}>{i + 1}</div>
            </div>
            <div style={{ display: "flex", marginTop: 6, fontFamily: "Mono", fontSize: 12 }}>@{cut(p.login, 12)}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", marginTop: "auto", justifyContent: "space-between", fontFamily: "Mono", fontSize: 14, letterSpacing: 1.5, color: INK2 }}>
        <div style={{ display: "flex" }}>{date.toUpperCase()}</div>
        <div style={{ display: "flex" }}>{SITE.toUpperCase()}</div>
      </div>
    </div>
  );
}

function Generic({ date }: { date: string }) {
  return (
    <div style={{ width: W, height: H, display: "flex", flexDirection: "column", background: PAPER, color: INK, padding: "26px 44px" }}>
      <Masthead right="FREE" />
      <Band text="GITHUB EDITION" />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 34, fontFamily: "Headline", fontSize: 74, lineHeight: 1 }}>
        <div style={{ display: "flex" }}>WHO ACTUALLY</div>
        <div style={{ display: "flex", marginTop: 6 }}>SHOWS UP FOR YOU</div>
        <div style={{ display: "flex", marginTop: 6 }}>ON GITHUB?</div>
      </div>
      <div style={{ display: "flex", marginTop: "auto", justifyContent: "space-between", fontFamily: "Mono", fontSize: 14, letterSpacing: 1.5, color: INK2 }}>
        <div style={{ display: "flex" }}>{date.toUpperCase()}</div>
        <div style={{ display: "flex" }}>{SITE.toUpperCase()}</div>
      </div>
    </div>
  );
}

export async function GET(req: Request) {
  const u = new URL(req.url).searchParams.get("u") ?? "";
  const date = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" }).format(new Date());
  let board: Board | null = null;
  if (u) {
    try {
      board = await getBoard(u, null);
    } catch {
      board = null;
    }
  }
  const avatars = board ? await Promise.all(board.top.slice(0, 10).map((p) => inline(p.avatar))) : [];
  return new ImageResponse(board ? <Front b={board} avatars={avatars} date={date} /> : <Generic date={date} />, {
    width: W,
    height: H,
    fonts: await loadFonts(),
    headers: {
      // editions refresh every 12 hours; let the CDN hold the picture for that long
      "Cache-Control": board ? "public, max-age=3600, s-maxage=43200, stale-while-revalidate=86400" : "public, max-age=600, s-maxage=3600",
    },
  });
}
