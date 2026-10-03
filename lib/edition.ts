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

// The X post: a hook from the numbers, the #1 collaborator, then an invitation to check
// your own. Collaborators are named without "@" so nobody unrelated gets tagged on X.
export function shareText(b: Board, by: string | null): string {
  const hook =
    b.circle === 0
      ? "My GitHub circle is empty.\nTime to open some PRs 😅"
      : b.showUp === 0
        ? `${fmt(b.followers)} people follow me on GitHub.\nNone of them have shown up yet 💀`
        : b.followers === 0
          ? `0 followers on GitHub.\n${fmt(b.showUp)} people show up for me anyway 😤`
          : b.showUp < b.followers
            ? `${fmt(b.followers)} people follow me on GitHub.\nOnly ${fmt(b.showUp)} actually show up 👀`
            : `${fmt(b.showUp)} people show up for me on GitHub.\nOnly ${fmt(b.followers)} follow me 😅`;
  const top = b.top[0];
  const lead = top ? `\n\nMy #1 collaborator: ${top.name ?? top.login}` : "";
  return `${hook}${lead}\n\nGot my circle printed as a front page${by ? ` by @${by}` : ""} 🗞️\nWho really shows up for you? Check yours now 👇`;
}
