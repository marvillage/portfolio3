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

// The X post: what the page is, in two plain sentences, then a visible link where anyone
// can check their own. The sharer's edition link goes last (X turns the last link into the
// preview card), so this one stays in the text. No numbers or names in the words.
export function shareText(by: string | null, checkUrl: string): string {
  const credit = by ? ` by @${by}` : "";
  return [
    `Got my GitHub circle printed as a front page${credit} 🗞️`,
    "It ranks the people who actually review, comment and commit with me on GitHub, not just who follows.",
    "",
    `Check yours now 👉 ${checkUrl}`,
  ].join("\n");
}
