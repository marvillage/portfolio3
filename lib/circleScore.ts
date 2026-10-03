// Point values shared by the scorer (lib/circle.ts) and the "how we score" table on the page.

export type Kind = "review" | "comment" | "commit" | "pr" | "issue";

// a review is the strongest signal, then PRs and comments; commits are capped so one
// busy co-maintainer can't drown everyone else out
export const W: Record<Kind, number> = { review: 3, pr: 3, comment: 2, issue: 2, commit: 1 };
export const COMMITS_PER_REPO = 10;
export const COMMIT_POINTS_MAX = 15;
// flat bonuses: working together in both directions, and following each other
export const BOTH_WAYS_BONUS = 5;
export const MUTUAL_BONUS = 2;
