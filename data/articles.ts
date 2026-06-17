export type Article = {
  title: string;
  url: string;
  date: string;
  tag: "Tech" | "Essay" | "Story" | "Horror";
  excerpt?: string;
  image?: string; // Medium cover image
};

// Cover images pulled live from the medium.com/@KUSH_24 RSS feed.
export const articles: Article[] = [
  {
    title: "Is Vibe Coding a New Skill or a Curse?",
    url: "https://medium.com/@KUSH_24/is-vibe-coding-a-new-skill-or-a-curse-75190f785e67",
    date: "2026",
    tag: "Tech",
    excerpt: "I've been thinking about this topic for quite some time now.",
    image: "https://cdn-images-1.medium.com/max/1024/1*Y3Ie37Bg_VESqHPOZfXDgQ.png",
  },
  {
    title: "The Day I Met My Second Self",
    url: "https://medium.com/@KUSH_24/the-day-i-met-my-second-self-5c0d8f792173",
    date: "Nov 2025",
    tag: "Story",
    image: "https://cdn-images-1.medium.com/max/768/1*0fjbeYMIvt5-WRxM5iiibw@2x.jpeg",
  },
  {
    title: "SCARY SUNDAY #6: The Haunting of Hyderabad",
    url: "https://medium.com/@KUSH_24/scary-sunday-6-the-haunting-of-hyderabad-cfb12fc47115",
    date: "Nov 2025",
    tag: "Horror",
    image: "https://cdn-images-1.medium.com/max/1024/1*TpO3PJwAuJfI4Wbm-ru42Q.png",
  },
  {
    title: "SCARY SUNDAY #5: The Witch Who Lived With Her",
    url: "https://medium.com/no-time/scary-sunday-5-the-witch-who-lived-with-her-be9dd089c86a",
    date: "Nov 2025",
    tag: "Horror",
    image: "https://cdn-images-1.medium.com/max/1024/1*PdOOB94xPL65siFlVghNwg.png",
  },
  {
    title: "How I Learned to Survive Corporate Life (Without Losing My Mind)",
    url: "https://medium.com/@KUSH_24/how-i-learned-to-survive-corporate-life-without-losing-my-mind-73cbd191ab59",
    date: "Nov 2025",
    tag: "Essay",
    image: "https://cdn-images-1.medium.com/max/1024/1*Ud-JXwYPs4x5p83aBQV0gA.png",
  },
  {
    title: "2025 Wasn't Kind, but It Was Honest",
    url: "https://medium.com/no-time/2025-wasnt-kind-but-it-was-honest-bc59fee0994f",
    date: "Dec 2025",
    tag: "Essay",
    image: "https://cdn-images-1.medium.com/max/1024/1*jw4rdoWDqcWeXe2Yk-l1sw.png",
  },
  {
    title: "Struggles Are Necessary: Learning How to Handle Life",
    url: "https://medium.com/the-masterpiece/struggles-are-necessary-learning-how-to-handle-life-ec153d13db41",
    date: "Mar 2025",
    tag: "Essay",
    image: "https://cdn-images-1.medium.com/max/1024/1*AaPZsuNQgctaqoeQrZdtkw.png",
  },
  {
    title: "Unfiltered Friday #3: Stranger Things Might Be Fiction, but Its Roots Are Stranger",
    url: "https://medium.com/@KUSH_24/unfiltered-friday-3-stranger-things-might-be-fiction-but-its-roots-are-stranger-than-you-think-f4d18fb19376",
    date: "2025",
    tag: "Essay",
    image: "https://cdn-images-1.medium.com/max/768/1*xdCBeKiywO9pnrjfWglxyg@2x.jpeg",
  },
];

export const mediumProfile = "https://medium.com/@KUSH_24";
