import { db } from "./db";

// Every number on /admin comes from here. Times are bucketed in India time.

export type Range = "24h" | "7d" | "30d" | "90d";
export const RANGES: Record<Range, { hours: number; label: string; bucket: "hour" | "day" }> = {
  "24h": { hours: 24, label: "Last 24 hours", bucket: "hour" },
  "7d": { hours: 24 * 7, label: "Last 7 days", bucket: "day" },
  "30d": { hours: 24 * 30, label: "Last 30 days", bucket: "day" },
  "90d": { hours: 24 * 90, label: "Last 90 days", bucket: "day" },
};
export const isRange = (v: unknown): v is Range => typeof v === "string" && v in RANGES;

const TZ = "Asia/Kolkata";
const IST_MS = 5.5 * 3_600_000;

// sections in page order, with the names shown on the dashboard
export const SECTIONS: [string, string][] = [
  ["home", "Hero"],
  ["about", "About"],
  ["experience", "Experience"],
  ["code-content", "Code & Content"],
  ["education", "Academic Journey"],
  ["certifications", "Certifications"],
  ["projects", "Projects"],
  ["achievements", "Achievements"],
  ["writing", "Writing"],
  ["stats", "Live Stats"],
  ["contact", "Contact"],
];

export type Totals = { views: number; visitors: number; sessions: number; avgSeconds: number | null };
export type Bucket = { key: string; label: string; views: number; visitors: number };
export type Row = { name: string; n: number };
export type FeedItem = {
  at: string;
  kind: string;
  name: string | null;
  value: number | null;
  referrer: string | null;
  country: string | null;
  city: string | null;
  device: string | null;
  browser: string | null;
};
export type Message = {
  id: number;
  at: string;
  name: string;
  email: string;
  message: string;
  country: string | null;
  city: string | null;
  device: string | null;
  read: boolean;
};

async function totals(fromHours: number, toHours: number): Promise<Totals> {
  const sql = db()!;
  const [r] = (await sql`
    with ev as (
      select * from portfolio.events
      where created_at >= now() - make_interval(hours => ${fromHours})
        and created_at < now() - make_interval(hours => ${toHours})
    )
    select
      (count(*) filter (where kind = 'view'))::int as views,
      (count(distinct visitor) filter (where kind = 'view'))::int as visitors,
      (count(distinct coalesce(session, visitor)) filter (where kind = 'view'))::int as sessions,
      (select round(avg(m))::int from (
        select max(value) as m from ev
        where kind = 'leave' and value between 1 and 14400
        group by coalesce(session, visitor)
      ) t) as avg_seconds
    from ev`) as Record<string, number | null>[];
  return { views: r.views ?? 0, visitors: r.visitors ?? 0, sessions: r.sessions ?? 0, avgSeconds: r.avg_seconds };
}

function bucketsFor(range: Range): { key: string; label: string }[] {
  const { hours, bucket } = RANGES[range];
  const nowIst = new Date(Date.now() + IST_MS);
  const out: { key: string; label: string }[] = [];
  const steps = bucket === "hour" ? hours : hours / 24;
  for (let i = steps - 1; i >= 0; i--) {
    const d = new Date(nowIst.getTime() - i * (bucket === "hour" ? 3_600_000 : 86_400_000));
    const iso = d.toISOString();
    if (bucket === "hour") {
      out.push({ key: iso.slice(0, 13), label: `${iso.slice(11, 13)}:00` });
    } else {
      const label = d.toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });
      out.push({ key: `${iso.slice(0, 10)}T00`, label });
    }
  }
  return out;
}

export async function loadDashboard(range: Range) {
  const sql = db();
  if (!sql) return null;
  const { hours, bucket } = RANGES[range];

  const [now, prev, seriesRows, sectionRows, referrers, countries, devices, browsers, clicks, feed, messages] = await Promise.all([
    totals(hours, 0),
    totals(hours * 2, hours),
    sql`
      select to_char(date_trunc(${bucket}, created_at at time zone ${TZ}), 'YYYY-MM-DD"T"HH24') as k,
        (count(*) filter (where kind = 'view'))::int as views,
        (count(distinct visitor) filter (where kind = 'view'))::int as visitors
      from portfolio.events
      where created_at >= now() - make_interval(hours => ${hours})
      group by 1`,
    sql`
      select name, count(distinct coalesce(session, visitor))::int as n
      from portfolio.events
      where kind = 'section' and created_at >= now() - make_interval(hours => ${hours})
      group by name`,
    sql`
      select coalesce(referrer, 'Direct / unknown') as name, count(distinct visitor)::int as n
      from portfolio.events
      where kind = 'view' and created_at >= now() - make_interval(hours => ${hours})
      group by 1 order by 2 desc limit 8`,
    sql`
      select coalesce(country, '??') as name, count(distinct visitor)::int as n
      from portfolio.events
      where kind = 'view' and created_at >= now() - make_interval(hours => ${hours})
      group by 1 order by 2 desc limit 8`,
    sql`
      select coalesce(device, 'unknown') as name, count(distinct visitor)::int as n
      from portfolio.events
      where kind = 'view' and created_at >= now() - make_interval(hours => ${hours})
      group by 1 order by 2 desc`,
    sql`
      select coalesce(browser, 'Other') as name, count(distinct visitor)::int as n
      from portfolio.events
      where kind = 'view' and created_at >= now() - make_interval(hours => ${hours})
      group by 1 order by 2 desc limit 6`,
    sql`
      select name, count(*)::int as n
      from portfolio.events
      where kind = 'click' and name is not null and created_at >= now() - make_interval(hours => ${hours})
      group by name order by 2 desc limit 10`,
    sql`
      select created_at as at, kind, name, value, referrer, country, city, device, browser
      from portfolio.events
      where created_at >= now() - make_interval(hours => ${hours})
      order by created_at desc limit 40`,
    sql`
      select id, created_at as at, name, email, message, country, city, device, read_at is not null as read
      from portfolio.messages
      order by created_at desc limit 200`,
  ]);

  const byKey = new Map((seriesRows as { k: string; views: number; visitors: number }[]).map((r) => [r.k, r]));
  const series: Bucket[] = bucketsFor(range).map((b) => {
    const r = byKey.get(b.key);
    return { ...b, views: r?.views ?? 0, visitors: r?.visitors ?? 0 };
  });

  const sectionMap = new Map((sectionRows as Row[]).map((r) => [r.name, r.n]));
  const sections = SECTIONS.map(([id, label]) => ({ name: label, n: sectionMap.get(id) ?? 0 }));

  const iso = (v: unknown) => (v instanceof Date ? v.toISOString() : String(v));
  return {
    now,
    prev,
    series,
    sections,
    referrers: referrers as Row[],
    countries: countries as Row[],
    devices: devices as Row[],
    browsers: browsers as Row[],
    clicks: clicks as Row[],
    feed: (feed as FeedItem[]).map((f) => ({ ...f, at: iso(f.at) })),
    messages: (messages as Message[]).map((m) => ({ ...m, id: Number(m.id), at: iso(m.at) })),
  };
}

export type Dashboard = NonNullable<Awaited<ReturnType<typeof loadDashboard>>>;
