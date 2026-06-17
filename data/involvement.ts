export type Role = {
  title: string;
  org: string;
  period: string;
  kind: "Content" | "Tech" | "Leadership";
};

// Club / content / leadership roles at IIIT Nagpur — the "writer + builder" side.
export const involvement: Role[] = [
  {
    title: "Lead of Content & Anchoring",
    org: "Abhivyakti, IIIT Nagpur",
    period: "Jan 2025 – Mar 2025",
    kind: "Leadership",
  },
  {
    title: "Lead of Script & Content Writing",
    org: "Estória — Drama & Poetry Club, IIITN",
    period: "Nov 2023 – Aug 2024",
    kind: "Leadership",
  },
  {
    title: "Editor in Chief",
    org: "Campus Pulse Newsletter, CRISPR IIITN",
    period: "Nov 2023 – Jul 2024",
    kind: "Leadership",
  },
  {
    title: "Lead of Prototype & Development",
    org: "UDYAM — E-Cell, IIITN",
    period: "Aug 2023 – Aug 2024",
    kind: "Tech",
  },
  {
    title: "Head of Alumni & Public Relations",
    org: "CRISPR IIIT Nagpur",
    period: "Sep 2023 – Jul 2024",
    kind: "Leadership",
  },
  {
    title: "Web Developer",
    org: "CRISPR IIIT Nagpur",
    period: "Jan 2023 – Jul 2024",
    kind: "Tech",
  },
  {
    title: "Content Writer",
    org: "Skills Nights — Elevate, IIITN",
    period: "Sep 2023 – Jul 2024",
    kind: "Content",
  },
  {
    title: "Script Writer",
    org: "Estória — Drama & Poetry Club, IIITN",
    period: "Feb 2023 – Nov 2023",
    kind: "Content",
  },
  {
    title: "Content Member",
    org: "Abhivyakti 2024, IIITN",
    period: "Jan 2024 – Mar 2024",
    kind: "Content",
  },
  {
    title: "Content Writer",
    org: "Abhivyakti, IIIT Nagpur",
    period: "Dec 2023 – Feb 2024",
    kind: "Content",
  },
  {
    title: "Content Writer",
    org: "TantraFiesta, IIITN",
    period: "Aug 2023 – Nov 2023",
    kind: "Content",
  },
];
