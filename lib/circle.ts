import { kvGet, kvHit, kvIncr, kvSet } from "./kv";
import { BOTH_WAYS_BONUS, COMMIT_POINTS_MAX, COMMITS_PER_REPO, MUTUAL_BONUS, W, type Kind } from "./circleScore";

// The Daily Commit: who actually shows up for someone on GitHub. Three small GraphQL queries (a few
// of the token's 5,000 hourly points) read their latest PRs and issues, the comments
// and reviews on them, their own comments and reviews elsewhere, and the people
// committing to and filing on their repos. Follows alone never count as interaction.

export type { Kind };

export type Person = {
  login: string;
  name?: string;
  avatar: string;
  score: number;
  inbound: number; // weight of what they did on your stuff
  outbound: number; // weight of what you did on theirs
  mutual: boolean;
  counts: Partial<Record<Kind, number>>;
};

export type Board = {
  no: number | null;
  login: string;
  name: string | null;
  avatar: string;
  followers: number;
  following: number;
  circle: number; // anyone with at least one interaction, either direction
  showUp: number; // people who came to your PRs, issues or repos
  bothWays: number; // ...and you went to theirs too
  mutuals: number;
  top: Person[];
  rest: { login: string; avatar: string }[];
  builtAt: string;
};

export class CircleError extends Error {
  constructor(
    public code: "invalid" | "not_found" | "no_token" | "rate_limited" | "upstream",
    message: string
  ) {
    super(message);
  }
}

const LOGIN_RE = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;
export const validLogin = (s: string) => LOGIN_RE.test(s);

const ACTOR = "author { __typename login avatarUrl ... on User { name } }";

// Three smaller queries run side by side: one big query times out (504) on very active
// accounts. Each part retries once at roughly half size before giving up.
type Size = { items: number; comments: number; reviews: number; mine: number; repos: number; perRepo: number; commits: number };
const FULL: Size = { items: 40, comments: 40, reviews: 20, mine: 100, repos: 12, perRepo: 20, commits: 60 };
const LITE: Size = { items: 20, comments: 20, reviews: 10, mine: 50, repos: 6, perRepo: 10, commits: 30 };

// their PRs and issues, and who commented on or reviewed them
const PROFILE = (z: Size) => `query($login: String!) {
  user(login: $login) {
    login name avatarUrl
    followers(first: 100) { totalCount nodes { login } }
    following(first: 100) { totalCount nodes { login } }
    pullRequests(first: ${z.items}, orderBy: {field: CREATED_AT, direction: DESC}) {
      nodes {
        repository { owner { __typename login avatarUrl } }
        comments(first: ${z.comments}) { nodes { ${ACTOR} } }
        reviews(first: ${z.reviews}) { nodes { ${ACTOR} } }
      }
    }
    issues(first: ${z.items}, orderBy: {field: CREATED_AT, direction: DESC}) {
      nodes { comments(first: ${z.comments}) { nodes { ${ACTOR} } } }
    }
  }
}`;
// what they commented on and reviewed elsewhere
const OUTBOUND = (z: Size) => `query($login: String!) {
  user(login: $login) {
    issueComments(last: ${z.mine}) { nodes { issue { ${ACTOR} } } }
    contributionsCollection {
      pullRequestReviewContributions(first: ${z.mine}) { nodes { pullRequest { ${ACTOR} } } }
    }
  }
}`;
// who files on and commits to their repos
const REPOS = (z: Size) => `query($login: String!) {
  user(login: $login) {
    repositories(first: ${z.repos}, ownerAffiliations: OWNER, isFork: false, orderBy: {field: PUSHED_AT, direction: DESC}) {
      nodes {
        pullRequests(last: ${z.perRepo}) { nodes { ${ACTOR} } }
        issues(last: ${z.perRepo}) { nodes { ${ACTOR} } }
        defaultBranchRef { target { ... on Commit { history(first: ${z.commits}) { nodes { author { user { login name avatarUrl } } } } } } }
      }
    }
  }
}`;

type Actor = { __typename?: string; login: string; avatarUrl: string; name?: string | null } | null;
type Nodes<T> = { nodes: T[] };
type Profile = {
  login: string;
  name: string | null;
  avatarUrl: string;
  followers: { totalCount: number; nodes: { login: string }[] };
  following: { totalCount: number; nodes: { login: string }[] };
  pullRequests: Nodes<{ repository: { owner: Actor }; comments: Nodes<{ author: Actor }>; reviews: Nodes<{ author: Actor }> }>;
  issues: Nodes<{ comments: Nodes<{ author: Actor }> }>;
};
type Outbound = {
  issueComments: Nodes<{ issue: { author: Actor } | null }>;
  contributionsCollection: { pullRequestReviewContributions: Nodes<{ pullRequest: { author: Actor } | null }> };
};
type Repos = {
  repositories: Nodes<{
    pullRequests: Nodes<{ author: Actor }>;
    issues: Nodes<{ author: Actor }>;
    defaultBranchRef: { target: { history?: Nodes<{ author: { user: Actor } | null }> } | null } | null;
  }>;
};
type Raw = { profile: Profile; outbound: Outbound | null; repos: Repos | null };

const BOTS = /(\[bot\]|-bot)$|^(github-actions|dependabot|renovate|vercel|netlify|codecov|copilot|sonarcloud|allcontributors|imgbot|greenkeeper|snyk-bot|web-flow|ghost)$/i;
const avatar = (url: string) => `${url}${url.includes("?") ? "&" : "?"}s=160`;

class Slow extends Error {}

// AbortSignal.timeout isn't available in every runtime this runs in (the share image is edge)
function timeout(ms: number) {
  const ctl = new AbortController();
  setTimeout(() => ctl.abort(), ms);
  return ctl.signal;
}

async function gql<T>(query: string, login: string): Promise<T> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new CircleError("no_token", "The press is offline: this site has no GitHub token set up yet.");
  let res: Response;
  try {
    res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "User-Agent": "daily-commit" },
      body: JSON.stringify({ query, variables: { login } }),
      cache: "no-store",
      signal: timeout(15000),
    });
  } catch {
    throw new Slow();
  }
  if (res.status === 401) throw new CircleError("no_token", "The press is offline: the site's GitHub token was rejected.");
  if (res.status === 403 || res.status === 429) throw new CircleError("rate_limited", "The press is busy. Try again in a few minutes.");
  if (res.status >= 500) throw new Slow();
  if (!res.ok) throw new CircleError("upstream", `GitHub answered ${res.status}. Try again.`);
  const json = (await res.json()) as { data?: { user: T | null }; errors?: { type?: string; message: string }[] };
  if (json.errors?.some((e) => e.type === "RATE_LIMITED")) throw new CircleError("rate_limited", "The press is busy. Try again in a few minutes.");
  if (!json.data?.user) {
    if (json.errors?.some((e) => e.type === "NOT_FOUND")) throw new CircleError("not_found", `No GitHub user called @${login}. (Organisations don't get editions.)`);
    throw new Slow();
  }
  return json.data.user;
}

async function part<T>(build: (z: Size) => string, login: string): Promise<T> {
  try {
    return await gql<T>(build(FULL), login);
  } catch (e) {
    if (!(e instanceof Slow)) throw e;
    try {
      return await gql<T>(build(LITE), login);
    } catch (e2) {
      if (e2 instanceof Slow) throw new CircleError("upstream", "GitHub is slow right now. Try again in a moment.");
      throw e2;
    }
  }
}

// the profile part is required; the other two only enrich the board
async function fetchRaw(login: string): Promise<Raw> {
  const [profile, outbound, repos] = await Promise.all([
    part<Profile>(PROFILE, login),
    part<Outbound>(OUTBOUND, login).catch(() => null),
    part<Repos>(REPOS, login).catch(() => null),
  ]);
  return { profile, outbound, repos };
}


function score({ profile: raw, outbound, repos }: Raw): Omit<Board, "no" | "builtAt"> {
  const me = raw.login.toLowerCase();
  const people = new Map<string, Person & { commitPts: number }>();

  const add = (a: Actor, kind: Kind, dir: "in" | "out", times = 1) => {
    if (!a?.login || (a.__typename && a.__typename !== "User")) return;
    const key = a.login.toLowerCase();
    if (key === me || BOTS.test(a.login)) return;
    let p = people.get(key);
    if (!p) {
      p = { login: a.login, name: a.name ?? undefined, avatar: avatar(a.avatarUrl), score: 0, inbound: 0, outbound: 0, mutual: false, counts: {}, commitPts: 0 };
      people.set(key, p);
    }
    if (!p.name && a.name) p.name = a.name;
    let pts = W[kind] * times;
    if (kind === "commit") {
      pts = Math.min(pts, COMMIT_POINTS_MAX - p.commitPts);
      p.commitPts += pts;
    }
    if (dir === "in") p.inbound += pts;
    else p.outbound += pts;
    p.counts[kind] = (p.counts[kind] ?? 0) + times;
  };

  for (const pr of raw.pullRequests.nodes) {
    if (pr.repository.owner?.__typename === "User") add(pr.repository.owner, "pr", "out");
    pr.comments.nodes.forEach((c) => add(c.author, "comment", "in"));
    pr.reviews.nodes.forEach((r) => add(r.author, "review", "in"));
  }
  for (const issue of raw.issues.nodes) issue.comments.nodes.forEach((c) => add(c.author, "comment", "in"));
  outbound?.issueComments.nodes.forEach((c) => add(c.issue?.author ?? null, "comment", "out"));
  outbound?.contributionsCollection.pullRequestReviewContributions.nodes.forEach((r) => add(r.pullRequest?.author ?? null, "review", "out"));
  for (const repo of repos?.repositories.nodes ?? []) {
    repo.pullRequests.nodes.forEach((x) => add(x.author, "pr", "in"));
    repo.issues.nodes.forEach((x) => add(x.author, "issue", "in"));
    const perAuthor = new Map<string, { a: Actor; n: number }>();
    for (const c of repo.defaultBranchRef?.target?.history?.nodes ?? []) {
      const u = c.author?.user;
      if (!u) continue;
      const e = perAuthor.get(u.login) ?? { a: { ...u, __typename: "User" }, n: 0 };
      e.n += 1;
      perAuthor.set(u.login, e);
    }
    perAuthor.forEach(({ a, n }) => add(a, "commit", "in", Math.min(n, COMMITS_PER_REPO)));
  }

  const followers = new Set(raw.followers.nodes.map((n) => n.login.toLowerCase()));
  const following = new Set(raw.following.nodes.map((n) => n.login.toLowerCase()));
  const all = [...people.entries()].map(([key, { commitPts: _, ...p }]) => {
    p.mutual = followers.has(key) && following.has(key);
    p.score = p.inbound + p.outbound + (p.inbound > 0 && p.outbound > 0 ? BOTH_WAYS_BONUS : 0) + (p.mutual ? MUTUAL_BONUS : 0);
    return p;
  });
  all.sort((a, b) => b.score - a.score || a.login.localeCompare(b.login));

  return {
    login: raw.login,
    name: raw.name,
    avatar: avatar(raw.avatarUrl),
    followers: raw.followers.totalCount,
    following: raw.following.totalCount,
    circle: all.length,
    showUp: all.filter((p) => p.inbound > 0).length,
    bothWays: all.filter((p) => p.inbound > 0 && p.outbound > 0).length,
    mutuals: [...followers].filter((l) => following.has(l)).length,
    top: all.slice(0, 10),
    rest: all.slice(10, 58).map(({ login, avatar }) => ({ login, avatar })),
  };
}

const BOARD_TTL = 12 * 3600;

// Fresh editions spend the site's GitHub quota, so they're rationed: per visitor, and a
// site-wide hourly ceiling well under the token's limit. Cached editions are always free.
const PER_VISITOR = 12; // per 10 minutes
const SITE_PER_HOUR = 600;

async function ration(visitor: string | null) {
  try {
    if (visitor && (await kvHit(`dc:rl:${visitor}`, 600)) > PER_VISITOR) {
      throw new CircleError("rate_limited", "That's a lot of new editions from one reader. Try again in 10 minutes.");
    }
    if ((await kvHit("dc:rl:site", 3600)) > SITE_PER_HOUR) {
      throw new CircleError("rate_limited", "The press is busy. Try again within the hour.");
    }
  } catch (e) {
    if (e instanceof CircleError) throw e;
    // the store is down: don't block readers over it
  }
}

// Cached for 12 hours. A login's first edition gets the next number; refreshes keep it.
// `visitor` is a hashed address for rationing; null skips the per-visitor limit (the
// share-image route, which link previews from X hit from shared addresses).
export async function getBoard(input: string, visitor: string | null): Promise<Board> {
  const login = input.trim().replace(/^@/, "");
  if (!validLogin(login)) throw new CircleError("invalid", "That doesn't look like a GitHub username.");
  const key = login.toLowerCase();

  const cached = await kvGet(`dc:board:${key}`).catch(() => null);
  if (cached) return JSON.parse(cached) as Board;

  await ration(visitor);
  const board: Board = { ...score(await fetchRaw(login)), no: null, builtAt: new Date().toISOString() };
  try {
    const known = await kvGet(`dc:no:${key}`);
    if (known) board.no = Number(known);
    else {
      board.no = await kvIncr("dc:seq");
      await kvSet(`dc:no:${key}`, String(board.no));
    }
    await kvSet(`dc:board:${key}`, JSON.stringify(board), BOARD_TTL);
  } catch {
    // the store is optional: a board still renders, just without a number or cache
  }
  return board;
}
