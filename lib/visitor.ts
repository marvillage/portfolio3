import { createHash } from "node:crypto";

// What a request says about its visitor, without keeping anything identifying:
// country and city come from Vercel's edge headers, device/browser/OS from the
// user agent, and the visitor key is a salted hash of IP + user agent that
// changes every day (so no IP is stored and nobody is followed across days).

const BOT =
  /bot|crawl|spider|slurp|archiver|facebookexternalhit|embedly|preview|headless|lighthouse|pagespeed|pingdom|uptime|monitor|curl|wget|python|axios|node-fetch|go-http|java\/|vercel/i;

export const isBot = (ua: string) => !ua || BOT.test(ua);

function decode(v: string | null) {
  if (!v) return null;
  try {
    return decodeURIComponent(v).slice(0, 80);
  } catch {
    return v.slice(0, 80);
  }
}

export function parseAgent(ua: string) {
  const device = /iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(ua)
    ? "tablet"
    : /Mobi|iPhone|iPod|Android|BlackBerry|IEMobile|Opera Mini/i.test(ua)
      ? "mobile"
      : "desktop";
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /OPR\/|Opera/.test(ua)
      ? "Opera"
      : /SamsungBrowser/.test(ua)
        ? "Samsung Internet"
        : /Firefox\/|FxiOS/.test(ua)
          ? "Firefox"
          : /Chrome\/|CriOS/.test(ua)
            ? "Chrome"
            : /Safari\//.test(ua)
              ? "Safari"
              : "Other";
  const os = /Windows/.test(ua)
    ? "Windows"
    : /iPhone|iPad|iPod/.test(ua)
      ? "iOS"
      : /Mac OS X|Macintosh/.test(ua)
        ? "macOS"
        : /Android/.test(ua)
          ? "Android"
          : /CrOS/.test(ua)
            ? "ChromeOS"
            : /Linux/.test(ua)
              ? "Linux"
              : "Other";
  return { device, browser, os };
}

export function requestInfo(req: Request) {
  const h = req.headers;
  const ua = h.get("user-agent") ?? "";
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "";
  return {
    ua,
    ip,
    country: h.get("x-vercel-ip-country") || null,
    city: decode(h.get("x-vercel-ip-city")),
    ...parseAgent(ua),
  };
}

/** Daily-rotating, salted visitor key. */
export function visitorKey(ip: string, ua: string) {
  const salt = process.env.ADMIN_SECRET ?? process.env.DATABASE_URL ?? "portfolio";
  const day = new Date().toISOString().slice(0, 10);
  return createHash("sha256").update(`visitor|${salt}|${day}|${ip}|${ua}`).digest("base64url").slice(0, 22);
}

/** Referrer reduced to its host; empty for direct visits and same-site navigation. */
export function referrerHost(raw: unknown, ownHost: string | null) {
  if (typeof raw !== "string" || !raw) return null;
  try {
    const host = new URL(raw).host.replace(/^www\./, "");
    if (!host || (ownHost && host === ownHost.replace(/^www\./, ""))) return null;
    return host.slice(0, 120);
  } catch {
    return null;
  }
}

/** A tiny fixed-window limiter (per server instance; enough to blunt floods). */
export function limiter(max: number, windowMs: number) {
  const hits = new Map<string, { n: number; until: number }>();
  return (key: string) => {
    const now = Date.now();
    const h = hits.get(key);
    if (!h || h.until < now) {
      if (hits.size > 5000) hits.clear();
      hits.set(key, { n: 1, until: now + windowMs });
      return true;
    }
    h.n += 1;
    return h.n <= max;
  };
}
