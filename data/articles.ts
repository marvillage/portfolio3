export type Article = {
  title: string;
  url: string;
  date: string;
  tag: "Tech" | "Essay" | "Story" | "Horror";
  excerpt?: string;
};

// Curated from medium.com/@KUSH_24 — newest/most relevant first.
export const articles: Article[] = [
  {
    title: "Is Vibe Coding a New Skill or a Curse?",
    url: "https://medium.com/@KUSH_24/is-vibe-coding-a-new-skill-or-a-curse-75190f785e67",
    date: "2026",
    tag: "Tech",
    excerpt: "I've been thinking about this topic for quite some time now.",
  },
  {
    title: "How I Learned to Survive Corporate Life (Without Losing My Mind)",
    url: "https://medium.com/@KUSH_24/how-i-learned-to-survive-corporate-life-without-losing-my-mind-73cbd191ab59",
    date: "Nov 2025",
    tag: "Essay",
  },
  {
    title: "2025 Wasn't Kind, but It Was Honest",
    url: "https://medium.com/no-time/2025-wasnt-kind-but-it-was-honest-bc59fee0994f",
    date: "Dec 2025",
    tag: "Essay",
  },
  {
    title: "Why Relentless Effort Always Wins",
    url: "https://medium.com/@KUSH_24/why-relentless-effort-always-wins-00a3a2b0ba25",
    date: "Jul 2025",
    tag: "Essay",
  },
  {
    title: "The Day I Met My Second Self",
    url: "https://medium.com/@KUSH_24/the-day-i-met-my-second-self-5c0d8f792173",
    date: "Nov 2025",
    tag: "Story",
  },
  {
    title: "SCARY SUNDAY #6: The Haunting of Hyderabad",
    url: "https://medium.com/@KUSH_24/scary-sunday-6-the-haunting-of-hyderabad-cfb12fc47115",
    date: "Nov 2025",
    tag: "Horror",
  },
  {
    title: "The Haunted Bungalow of Ghaziabad",
    url: "https://medium.com/no-time/the-haunted-bungalow-of-ghaziabad-063fdbc83619",
    date: "Jul 2025",
    tag: "Horror",
  },
  {
    title: "Struggles Are Necessary: Learning How to Handle Life",
    url: "https://medium.com/the-masterpiece/struggles-are-necessary-learning-how-to-handle-life-ec153d13db41",
    date: "Mar 2025",
    tag: "Essay",
  },
];

export const mediumProfile = "https://medium.com/@KUSH_24";
