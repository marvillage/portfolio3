import snapshot from "@/data/statsSnapshot.json";

// Live telemetry for the mission-control screens. Each source is fetched on the
// server (cached for an hour with the page) and, if it fails or is rate-limited,
// falls back to the committed snapshot in data/statsSnapshot.json, so the deck
// never renders empty. Set GITHUB_TOKEN in the environment for a higher GitHub limit.

export type Day = { date: string; count: number; level: number };

export type Stats = {
  fetchedAt: string;
  live: { github: boolean; contributions: boolean; leetcode: boolean };
  github: {
    repos: number;
    followers: number;
    stars: number;
    forks: number;
    prs: number;
    issues: number;
    commits: number;
    languages: { name: string; pct: number }[];
  };
  contributions: {
    total: number; // last 365 days
    allTime: number;
    since: string | null; // first contribution
    currentStreak: number;
    lastActive: string | null;
    longestStreak: number; // all-time
    longestStart: string | null;
    longestEnd: string | null;
    activeDays: number; // last 365 days
    days: Day[]; // last 53 weeks, for the grid
  };
  leetcode: {
    solved: number;
    easy: number;
    medium: number;
    hard: number;
    totalEasy: number;
    totalMedium: number;
    totalHard: number;
    ranking: number;
  };
};

const SNAP = snapshot as Stats;
const HOUR = { next: { revalidate: 3600 } };

function ghHeaders(): HeadersInit {
  const h: Record<string, string> = { Accept: "application/vnd.github+json", "User-Agent": "portfolio-mission-control" };
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return h;
}

async function getJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...HOUR, ...init });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json() as Promise<T>;
}

/* ---------- GitHub ---------- */

type Repo = { name: string; fork: boolean; stargazers_count: number; forks_count: number; pushed_at: string };

async function github(user: string): Promise<Stats["github"]> {
  const headers = ghHeaders();
  const [u, repos, prs, issues, commits] = await Promise.all([
    getJson<{ public_repos: number; followers: number }>(`https://api.github.com/users/${user}`, { headers }),
    getJson<Repo[]>(`https://api.github.com/users/${user}/repos?per_page=100&type=owner`, { headers }),
    getJson<{ total_count: number }>(`https://api.github.com/search/issues?q=author:${user}+type:pr&per_page=1`, { headers }),
    getJson<{ total_count: number }>(`https://api.github.com/search/issues?q=author:${user}+type:issue&per_page=1`, { headers }),
    getJson<{ total_count: number }>(`https://api.github.com/search/commits?q=author:${user}&per_page=1`, { headers }),
  ]);
  const own = repos.filter((r) => !r.fork);
  // language bytes across the most recently pushed repos (keeps the request count small)
  const recent = [...own].sort((a, b) => b.pushed_at.localeCompare(a.pushed_at)).slice(0, 12);
  const langMaps = await Promise.all(
    recent.map((r) =>
      getJson<Record<string, number>>(`https://api.github.com/repos/${user}/${r.name}/languages`, { headers }).catch(() => ({}))
    )
  );
  const bytes = new Map<string, number>();
  langMaps.forEach((m) => Object.entries(m).forEach(([k, v]) => bytes.set(k, (bytes.get(k) ?? 0) + v)));
  const total = Array.from(bytes.values()).reduce((s, v) => s + v, 0) || 1;
  const sorted = Array.from(bytes.entries()).sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, 5).map(([name, v]) => ({ name, pct: Math.round((v / total) * 1000) / 10 }));
  const rest = Math.round((100 - top.reduce((s, l) => s + l.pct, 0)) * 10) / 10;
  if (rest > 0.4) top.push({ name: "Other", pct: rest });
  return {
    repos: u.public_repos,
    followers: u.followers,
    stars: own.reduce((s, r) => s + r.stargazers_count, 0),
    forks: own.reduce((s, r) => s + r.forks_count, 0),
    prs: prs.total_count,
    issues: issues.total_count,
    commits: commits.total_count,
    languages: top,
  };
}

/* ---------- contribution calendar ---------- */

async function contributions(user: string): Promise<Stats["contributions"]> {
  const d = await getJson<{ contributions: Day[] }>(`https://github-contributions-api.jogruber.de/v4/${user}?y=all`);
  const today = new Date().toISOString().slice(0, 10);
  // the API returns years in no particular order and pads the current year with future days
  const all = d.contributions.filter((x) => x.date <= today).sort((a, b) => a.date.localeCompare(b.date));

  let longest = 0;
  let longestStart: string | null = null;
  let longestEnd: string | null = null;
  let run = 0;
  let runStart: string | null = null;
  for (const x of all) {
    if (x.count > 0) {
      run += 1;
      if (run === 1) runStart = x.date;
      if (run > longest) {
        longest = run;
        longestStart = runStart;
        longestEnd = x.date;
      }
    } else run = 0;
  }
  // current streak: count back from today (a quiet today does not break yesterday's streak)
  let i = all.length - 1;
  if (i >= 0 && all[i].count === 0) i -= 1;
  let current = 0;
  for (; i >= 0 && all[i].count > 0; i--) current += 1;

  const year = all.slice(-365);
  const active = [...all].reverse().find((x) => x.count > 0);
  return {
    total: year.reduce((t, x) => t + x.count, 0),
    allTime: all.reduce((t, x) => t + x.count, 0),
    since: all.find((x) => x.count > 0)?.date ?? null,
    currentStreak: current,
    lastActive: active?.date ?? null,
    longestStreak: longest,
    longestStart,
    longestEnd,
    activeDays: year.filter((x) => x.count > 0).length,
    days: all.slice(-371),
  };
}

/* ---------- LeetCode ---------- */

type LcCount = { difficulty: string; count: number };

async function leetcode(user: string): Promise<Stats["leetcode"]> {
  const query = `query($u:String!){allQuestionsCount{difficulty count} matchedUser(username:$u){submitStatsGlobal{acSubmissionNum{difficulty count}} profile{ranking}}}`;
  const d = await getJson<{
    data: { allQuestionsCount: LcCount[]; matchedUser: { submitStatsGlobal: { acSubmissionNum: LcCount[] }; profile: { ranking: number } } | null };
  }>("https://leetcode.com/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json", Referer: "https://leetcode.com", "User-Agent": "Mozilla/5.0" },
    body: JSON.stringify({ query, variables: { u: user } }),
  });
  const m = d.data.matchedUser;
  if (!m) throw new Error("leetcode user not found");
  const solved = (k: string) => m.submitStatsGlobal.acSubmissionNum.find((x) => x.difficulty === k)?.count ?? 0;
  const all = (k: string) => d.data.allQuestionsCount.find((x) => x.difficulty === k)?.count ?? 0;
  return {
    solved: solved("All"),
    easy: solved("Easy"),
    medium: solved("Medium"),
    hard: solved("Hard"),
    totalEasy: all("Easy"),
    totalMedium: all("Medium"),
    totalHard: all("Hard"),
    ranking: m.profile.ranking,
  };
}

/* ---------- all together ---------- */

export async function getStats(githubUser: string, leetcodeUser: string): Promise<Stats> {
  const [g, c, l] = await Promise.allSettled([github(githubUser), contributions(githubUser), leetcode(leetcodeUser)]);
  return {
    fetchedAt: new Date().toISOString(),
    live: { github: g.status === "fulfilled", contributions: c.status === "fulfilled", leetcode: l.status === "fulfilled" },
    github: g.status === "fulfilled" ? g.value : SNAP.github,
    contributions: c.status === "fulfilled" ? c.value : SNAP.contributions,
    leetcode: l.status === "fulfilled" ? l.value : SNAP.leetcode,
  };
}
