export type Project = {
  title: string;
  blurb: string;
  tags: string[];
  github?: string;
  live?: string;
  // emoji/planet used as the visual marker
  planet: string;
  featured?: boolean;
};

// Edit freely — each project renders as a card. `featured: true` cards show first.
export const projects: Project[] = [
  {
    title: "Call Insight",
    blurb:
      "End-to-end call-center analytics platform. Speech-to-text + NLP for automated conversation summarization and sentiment analysis, with a web admin panel and interactive dashboards for real-time call metrics.",
    tags: ["React", "TypeScript", "NLP", "Speech-to-Text", "Dashboards"],
    github: "https://github.com/marvillage/CalInsight5",
    live: "https://cal-insight5.vercel.app",
    planet: "🪐",
    featured: true,
  },
  {
    title: "E-Waste Management (G-Tron)",
    blurb:
      "Real-time e-waste analytics dashboard. Fine-tuned LLaMA 3.2 + Gemini 1.5 Flash chatbot, a LangGraph multi-agent system for ESG/EPR compliance reporting, and XGBoost/CatBoost hazard-score prediction.",
    tags: ["Python", "Streamlit", "Neo4j", "LLaMA", "LangGraph", "XGBoost"],
    github: "https://github.com/marvillage/G-TRON-2.O",
    planet: "🌑",
    featured: true,
  },
  {
    title: "MindRelic — Web3 AI Memory Vault",
    blurb:
      "A cyberpunk journaling app that turns thoughts into AI-analyzed 'memory relics.' Detects mood and keyword themes on-device (no API key needed), with optional Claude-powered analysis, voice journaling via the Web Speech API, and a searchable relic gallery. Explore instantly in guest mode or connect a Web3 wallet.",
    tags: ["Next.js", "React", "TypeScript", "Web3", "AI", "Tailwind"],
    github: "https://github.com/marvillage/mindrelic2",
    live: "https://mindrelic2.vercel.app",
    planet: "🧠",
  },
  {
    title: "Dendrite AI — Whiteboard ML Studio",
    blurb:
      "A collaborative whiteboard with built-in machine learning. Users draw and sketch together in real time over WebSockets, with on-the-fly image classification powered by TensorFlow.js MobileNet.",
    tags: ["TypeScript", "Vite", "Fabric.js", "TensorFlow.js", "WebSocket"],
    github: "https://github.com/marvillage/dendrite_AI",
    live: "https://dendrite-ai.vercel.app",
    planet: "🌌",
  },
  {
    title: "DevRishi 2.0",
    blurb:
      "An intelligent Ayurvedic recommendation system. It surfaces drugs and formulations for given diseases/symptoms by searching classical Ayurvedic texts, while accounting for patient constitution, comorbidities and ingredient contraindications.",
    tags: ["React", "Python", "Node.js", "NLP", "Healthcare"],
    github: "https://github.com/marvillage/DevRishi2.0",
    live: "https://dev-rishi2-0.vercel.app",
    planet: "☄️",
  },
  {
    title: "College Predictor",
    blurb:
      "Tool that lets Indian students predict colleges from their exam ranks, with an integrated scholarship search.",
    tags: ["Python", "Jupyter", "Data"],
    github: "https://github.com/marvillage/college-predictor",
    live: "https://futures.avantifellows.org",
    planet: "🛰️",
  },
  {
    title: "Constitution (SIH 24)",
    blurb:
      "Smart India Hackathon 2024 project — an interactive web experience around the Indian Constitution.",
    tags: ["Web", "Next.js", "Hackathon"],
    github: "https://github.com/marvillage/SIH24",
    live: "https://constitution-sable.vercel.app",
    planet: "✨",
  },
];
