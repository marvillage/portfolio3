// Tiny key-value store for The Daily Commit page: board cache, game numbers and the
// page-view counter. Uses Upstash Redis over REST
// (free tier; Vercel → Storage → Upstash for Redis injects the env vars). Without it the
// store lives in memory, which is fine for local dev but resets on every restart.

const URL = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

export const kvPersistent = Boolean(URL && TOKEN);

type Cmd = (string | number)[];

async function redis(cmds: Cmd[]): Promise<unknown[]> {
  const res = await fetch(`${URL}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(cmds.map((c) => c.map(String))),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`kv ${res.status}`);
  const out = (await res.json()) as { result?: unknown; error?: string }[];
  return out.map((r) => {
    if (r.error) throw new Error(r.error);
    return r.result;
  });
}

// in-memory stand-in, kept on globalThis so dev hot reloads don't wipe it
type Entry = { v: string; exp?: number };
const mem: Map<string, Entry> = ((globalThis as { __dcKv?: Map<string, Entry> }).__dcKv ??= new Map());
const live = (k: string) => {
  const e = mem.get(k);
  if (e?.exp && e.exp < Date.now()) {
    mem.delete(k);
    return undefined;
  }
  return e;
};

export async function kvGet(key: string): Promise<string | null> {
  if (kvPersistent) return ((await redis([["GET", key]]))[0] as string | null) ?? null;
  return live(key)?.v ?? null;
}

export async function kvSet(key: string, value: string, ttlSec?: number) {
  if (kvPersistent) {
    await redis([ttlSec ? ["SET", key, value, "EX", ttlSec] : ["SET", key, value]]);
    return;
  }
  mem.set(key, { v: value, exp: ttlSec ? Date.now() + ttlSec * 1000 : undefined });
}

export async function kvIncr(key: string): Promise<number> {
  if (kvPersistent) return Number((await redis([["INCR", key]]))[0]);
  const n = Number(live(key)?.v ?? 0) + 1;
  mem.set(key, { v: String(n) });
  return n;
}

// fixed-window counter: bumps `key` and returns the count inside the current window
export async function kvHit(key: string, windowSec: number): Promise<number> {
  if (kvPersistent) {
    const [n] = await redis([
      ["INCR", key],
      ["EXPIRE", key, windowSec, "NX"],
    ]);
    return Number(n);
  }
  const e = live(key);
  const n = Number(e?.v ?? 0) + 1;
  mem.set(key, { v: String(n), exp: e?.exp ?? Date.now() + windowSec * 1000 });
  return n;
}

// set only if absent; true when this call created the key
export async function kvSetOnce(key: string, ttlSec: number): Promise<boolean> {
  if (kvPersistent) return (await redis([["SET", key, "1", "NX", "EX", ttlSec]]))[0] === "OK";
  if (live(key)) return false;
  mem.set(key, { v: "1", exp: Date.now() + ttlSec * 1000 });
  return true;
}
