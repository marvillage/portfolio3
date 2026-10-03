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

// The X post, with two links. X builds its preview card from the first link, so the
// sharer's edition goes first (the card shows their front page and the link stays
// visible), then the link to print a new edition. No numbers or names in the words.
export function shareText(by: string | null, mineUrl: string, newUrl: string): string {
  const credit = by ? ` by @${by}` : "";
  return [
    `Got my GitHub circle printed as a front page${credit} 🗞️`,
    "",
    `My stats 👉 ${mineUrl}`,
    `Check yours now 👉 ${newUrl}`,
    "",
    "It ranks the people who actually review, comment and commit with you on GitHub, not just who follows.",
  ].join("\n");
}
