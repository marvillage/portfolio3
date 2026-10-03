import type { Board } from "./circle";

// Pure helpers shared by the page and the share image.

export const fmt = (n: number) => n.toLocaleString("en-US");
export const pad3 = (n: number) => String(n).padStart(3, "0");

// The headline is written from the numbers: followers against the people who show up.
export function headline(b: Board): [string, string] {
  if (b.circle === 0) return ["QUIET WEEK:", "NOBODY IN THE CIRCLE YET"];
  if (b.showUp === 0) return [`${fmt(b.followers)} FOLLOWERS.`, "NONE SHOW UP. YET."];
  if (b.showUp < b.followers) return [`${fmt(b.followers)} FOLLOWERS.`, `ONLY ${fmt(b.showUp)} SHOW UP.`];
  return [`${fmt(b.showUp)} SHOW UP`, `FOR ${fmt(b.followers)} FOLLOWERS.`];
}

// share of followers who actually show up
export function showUpRate(b: Board) {
  if (!b.followers) return "—";
  const r = (b.showUp / b.followers) * 100;
  return `${r < 1 ? r.toFixed(2) : Math.round(r)}%`;
}

// The X post. X builds its preview card from the first link and hides a link that ends
// the post, so the one link sits mid-post: it stays visible, and its card shows the
// sharer's front page while the link itself opens a blank page to print your own.
export function shareText(by: string | null, checkUrl: string): string {
  const credit = by ? ` by @${by}` : "";
  return [
    `Got my GitHub circle printed as a front page${credit} 🗞️`,
    `Check yours now 👉 ${checkUrl}`,
    "",
    "It ranks the people who actually review, comment and commit with you on GitHub, not just who follows.",
  ].join("\n");
}
