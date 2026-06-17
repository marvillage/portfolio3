export type Certification = {
  title: string;
  issuer: string;
  date: string;
  credentialId?: string;
  tags: string[];
};

// From LinkedIn / your lovable portfolio. Add verify links later if you want.
export const certifications: Certification[] = [
  {
    title: "Applications of AI for Anomaly Detection",
    issuer: "NVIDIA",
    date: "Nov 2024",
    credentialId: "tsySqX7jSfWy5q22OMI6hw",
    tags: ["AI", "Machine Learning"],
  },
  {
    title: "Supervised Machine Learning: Regression & Classification",
    issuer: "Coursera (DeepLearning.AI / Stanford)",
    date: "Jun 2024",
    credentialId: "J5JX8YRUB3H2",
    tags: ["Machine Learning"],
  },
  {
    title: "Microsoft Certified: Azure AI Fundamentals",
    issuer: "Microsoft",
    date: "Jan 2024",
    tags: ["Azure", "AI"],
  },
  {
    title: "Programming in Python",
    issuer: "Meta · Coursera",
    date: "Jan 2024",
    credentialId: "PZP6RTFNWXKW",
    tags: ["Python"],
  },
  {
    title: "Introduction to Back-End Development",
    issuer: "Meta · Coursera",
    date: "Dec 2023",
    tags: ["Back-End", "Web Dev"],
  },
  {
    title: "Foundations of Cybersecurity",
    issuer: "Google · Coursera",
    date: "Dec 2023",
    credentialId: "MY8jKVCNZG32",
    tags: ["Cybersecurity"],
  },
  {
    title: "Our Place in the Cosmos",
    issuer: "Coursera",
    date: "Jan 2024",
    credentialId: "UEMMN8QRCJT4",
    tags: ["Astronomy", "Astrophysics"],
  },
  {
    title: "Flight Mechanics — The Basics",
    issuer: "Coursera",
    date: "Jan 2024",
    credentialId: "MSYARRCTWTTA",
    tags: ["Aeronautics", "Physics"],
  },
];
