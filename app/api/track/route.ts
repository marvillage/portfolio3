import { db } from "@/lib/db";
import { isAdmin } from "@/lib/adminAuth";
import { isBot, limiter, referrerHost, requestInfo, visitorKey } from "@/lib/visitor";

// Receives batched visit events from components/Analytics.tsx (sendBeacon) and
// stores them in portfolio.events. Bots, the signed-in owner, preview deploys and
// local dev (unless ANALYTICS_DEV=1) are skipped, so the numbers are real visitors.

export const runtime = "nodejs";

const KINDS = new Set(["view", "section", "click", "leave"]);
const allow = limiter(120, 60_000);

type Incoming = { kind?: unknown; path?: unknown; name?: unknown; value?: unknown };

const clip = (v: unknown, n: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, n) : null);

export async function POST(req: Request) {
  const done = new Response(null, { status: 204 });
  const sql = db();
  if (!sql) return done;
  if (process.env.VERCEL_ENV === "preview") return done;
  if (process.env.NODE_ENV !== "production" && process.env.ANALYTICS_DEV !== "1") return done;

  const info = requestInfo(req);
  if (isBot(info.ua) || isAdmin()) return done;

  let body: { events?: Incoming[]; referrer?: unknown; session?: unknown };
  try {
    body = JSON.parse(await req.text());
  } catch {
    return done;
  }
  const visitor = visitorKey(info.ip, info.ua);
  if (!allow(visitor)) return done;

  const events = (Array.isArray(body.events) ? body.events : [])
    .slice(0, 40)
    .filter((e) => typeof e?.kind === "string" && KINDS.has(e.kind))
    .map((e) => ({
      kind: e.kind as string,
      path: clip(e.path, 200) ?? "/",
      name: clip(e.name, 120),
      value: typeof e.value === "number" && Number.isFinite(e.value) ? Math.max(0, Math.min(86_400, Math.round(e.value))) : null,
    }));
  if (!events.length) return done;

  const referrer = referrerHost(body.referrer, req.headers.get("host"));
  const session = clip(body.session, 40);

  // one multi-row insert, fully parameterised
  const cols = 12;
  const params: unknown[] = [];
  const rows = events.map((e, i) => {
    params.push(e.kind, e.path, e.name, e.value, e.kind === "view" ? referrer : null, info.country, info.city, info.device, info.browser, info.os, visitor, session);
    return `(${Array.from({ length: cols }, (_, j) => `$${i * cols + j + 1}`).join(", ")})`;
  });
  try {
    await sql.query(
      `insert into portfolio.events (kind, path, name, value, referrer, country, city, device, browser, os, visitor, session) values ${rows.join(", ")}`,
      params
    );
  } catch (e) {
    console.error("track insert failed:", e);
  }
  return done;
}
