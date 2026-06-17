export type Publication = {
  title: string;
  type: string;
  description: string;
  link?: string; // Amazon / Goodreads / read link — fill in
  cover?: string; // optional cover image URL
};

// ⚠️ Titles & links are placeholders pulled from your old portfolio's
// "three books" description. Replace with the real titles + purchase/read
// links (Amazon, Goodreads, etc.) and cover images.
export const publications: Publication[] = [
  {
    title: "Futuristic Fiction",
    type: "Fiction",
    description:
      "A fiction work exploring futuristic themes — technology, identity and what comes next.",
    link: "#",
  },
  {
    title: "Emerging Technologies — A Practical Guide",
    type: "Technical",
    description:
      "A technical guide breaking down emerging technologies and how to build with them.",
    link: "#",
  },
  {
    title: "Essays on Digital Transformation",
    type: "Essays",
    description:
      "A collection of essays on digital transformation and its impact on how we live and work.",
    link: "#",
  },
];
