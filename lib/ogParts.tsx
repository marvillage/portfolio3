import { profile } from "@/data/profile";

// Pieces shared by the two share pictures (the 1200x630 link card and the full-page
// image). Font files stay in each route so every edge function ships only its own.

export const PAPER = "#e8e5dd";
export const PAPER2 = "#dcd8ce";
export const INK = "#161513";
export const INK2 = "#55524b";
export const RED = "#b3261e";
export const SITE = "portfolio3-kappa-rosy.vercel.app/daily-commit";

export const cut = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

export const editionDate = () =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" }).format(new Date());

// Avatars come from GitHub's avatar CDN only. Each is fetched with a timeout and inlined;
// one that fails falls back to initials instead of breaking the picture.
export async function inline(url: string, size = 120): Promise<string | null> {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:" || u.hostname !== "avatars.githubusercontent.com") return null;
    u.searchParams.set("s", String(size));
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

// fetch avatars a few at a time with one retry each: a burst of 20+ requests tends to
// time out, and a timed-out avatar would print as initials
export async function inlineAll(urls: string[], sizeAt: (i: number) => number, limit = 5): Promise<(string | null)[]> {
  const out: (string | null)[] = new Array(urls.length).fill(null);
  let next = 0;
  const worker = async () => {
    while (next < urls.length) {
      const i = next++;
      out[i] = (await inline(urls[i], sizeAt(i))) ?? (await inline(urls[i], sizeAt(i)));
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, urls.length) }, worker));
  return out;
}

export function Masthead({ right, size = 66 }: { right: string; size?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", width: 250, fontFamily: "Mono", fontSize: 15, letterSpacing: 2 }}>A @{profile.github.toUpperCase()} PUBLICATION</div>
        <div style={{ display: "flex", fontFamily: "Blackletter", fontSize: size, lineHeight: 1.1 }}>The Daily Commit</div>
        <div style={{ display: "flex", width: 250, justifyContent: "flex-end", fontFamily: "Mono", fontSize: 15, letterSpacing: 2 }}>{right}</div>
      </div>
      <div style={{ display: "flex", marginTop: 6, height: 7, borderTop: `2px solid ${INK}`, borderBottom: `2px solid ${INK}` }} />
    </div>
  );
}

export function Band({ text, size = 22 }: { text: string; size?: number }) {
  return (
    <div style={{ display: "flex", flexShrink: 0, justifyContent: "center", marginTop: 12, padding: "8px 0", background: INK, color: PAPER, fontFamily: "Headline", fontSize: size, letterSpacing: 6 }}>
      {text}
    </div>
  );
}

export function Portrait({ src, size, initial, border = 2 }: { src: string | null; size: number; initial: string; border?: number }) {
  const inner = size - border * 2;
  return (
    <div style={{ display: "flex", width: size, height: size, border: `${border}px solid ${INK}`, background: PAPER2 }}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} width={inner} height={inner} alt="" style={{ width: inner, height: inner, filter: "grayscale(100%) contrast(115%)" }} />
      ) : (
        <div style={{ display: "flex", width: inner, height: inner, alignItems: "center", justifyContent: "center", fontFamily: "Headline", fontSize: Math.round(inner * 0.42) }}>
          {initial.toUpperCase()}
        </div>
      )}
    </div>
  );
}
