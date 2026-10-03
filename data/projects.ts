export type Project = {
  title: string;
  blurb: string;
  tags: string[];
  github?: string;
  live?: string;
  // emoji/planet used as the visual marker
  planet: string;
  // optional inked thumbnail, e.g. /art/projects/zentro.png (auto-detected by slug when omitted);
  // a capture of the live site in /art/projects/live/<slug>.webp is shown instead when present
  image?: string;
  // page of the live site shown in that capture, when it is not the home page
  livePath?: string;
  // one-line speech-bubble quip shown on hover (comic-strip dialogue)
  quip?: string;
  featured?: boolean;
  // shown after every other card, featured or not
  last?: boolean;
};

// Edit freely — each project renders as a card. `featured: true` cards show first.
export const projects: Project[] = [
  {
    title: "ZENTRO — Multi-Tenant Digital Workplace Platform",
    quip: "Three tiers of isolation. Nobody boards without a badge.",
    blurb:
      "Modular FastAPI + PostgreSQL backend behind a React/TypeScript workplace: a transactional outbox event bus with at-least-once delivery and dead-letter replay, a durable job scheduler and async full-text search. Three-tier tenant isolation (JWT-scoped org context, repository filtering, row-level security), capability-based auth, TOTP step-up, a hash-chained audit log and Redis rate limiting that fails closed. Ships an approval workflow engine, idempotent payment release, an authorizing WebSocket gateway and HMAC-verified GitHub webhooks.",
    tags: ["Python", "FastAPI", "SQLAlchemy", "PostgreSQL", "Redis", "Docker", "React", "TypeScript", "WebSockets", "S3"],
    github: "https://github.com/marvillage/zentro",
    live: "https://zentro-umber.vercel.app",
    livePath: "/dashboard",
    planet: "🛰️",
    featured: true,
  },
  {
    title: "CivicFix — Civic Issue Reporting & Resolution",
    quip: "Report a pothole from orbit. City hall gets the ping.",
    blurb:
      "Citizens report issues with photos, voice notes and GPS; municipalities resolve them. React 19 + Leaflet front end over 57 REST endpoints in Express 5, TypeScript, Prisma and PostgreSQL. Google Gemini vision classifies photos by category and severity (output validated, not trusted), Cloudinary handles media, and the issue lifecycle is a transactional state machine with append-only history, self-escalating SLA deadlines and JWT role-based access for citizen, authority and admin.",
    tags: ["React 19", "TypeScript", "Vite", "Leaflet", "Express 5", "Prisma", "PostgreSQL", "Gemini", "Cloudinary"],
    github: "https://github.com/marvillage/civicfix",
    live: "https://civicfix-ruby.vercel.app",
    livePath: "/issues",
    planet: "🏙️",
    featured: true,
  },
  {
    title: "Judiciary Copilot — CaseGraph Litigation Intelligence",
    quip: "Objection overruled. The graph has receipts.",
    blurb:
      "Litigation intelligence for Indian courts: four products on one Neo4j knowledge graph — case pendency prediction, legal research with a citation graph, undertrial bail monitoring and consumer-complaint drafting. FastAPI with LangChain retrieval and LangGraph agents behind human review gates, ML classifiers and regressors for disposal time, local embeddings and drafting through Ollama, built on open eCourts, Supreme Court judgment and IndiaCode data. Drafts are released only after a person approves them.",
    tags: ["React", "TypeScript", "Vite", "FastAPI", "Neo4j", "LangGraph", "LangChain", "Ollama", "ML"],
    github: "https://github.com/marvillage/judiciary-copilot",
    live: "https://judiciary-copilot.vercel.app",
    livePath: "/app",
    planet: "⚖️",
    featured: true,
  },
  {
    title: "AgriGuard — Smart Irrigation & Crop Intelligence",
    quip: "The pump runs when the soil says so.",
    blurb:
      "AI + IoT platform for Indian farmers. ESP32 field nodes stream soil moisture, NPK, flow and energy data to an Express + Prisma + PostgreSQL decision engine (FAO-56 water balance, weather forecasts, ML disease risk) that switches pumps on and off automatically. A Next.js PWA dashboard in English, Hindi, Marathi and Telugu proves the savings in litres, kWh, CO₂ and rupees. Built for EcoLogic 1.0 with team Mavestorm.",
    tags: ["Next.js", "Express", "Prisma", "PostgreSQL", "IoT / ESP32", "AI / ML", "PWA"],
    github: "https://github.com/marvillage/AgriGuard",
    live: "https://mavestorm-agriguard.onrender.com",
    planet: "🌱",
    featured: true,
  },
  {
    title: "Call Insight",
    quip: "Every call summarised before you hang up.",
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
    quip: "One ship's junk is a recycler's cargo.",
    blurb:
      "Real-time e-waste analytics dashboard. Fine-tuned LLaMA 3.2 + Gemini 1.5 Flash chatbot, a LangGraph multi-agent system for ESG/EPR compliance reporting, and XGBoost/CatBoost hazard-score prediction.",
    tags: ["Python", "Streamlit", "Neo4j", "LLaMA", "LangGraph", "XGBoost"],
    github: "https://github.com/marvillage/G-TRON-2.O",
    live: "https://mindrelic2-yy5z.vercel.app",
    planet: "🌑",
    featured: true,
  },
  {
    title: "Dendrite AI — Whiteboard ML Studio",
    quip: "Sketch it. The model names it.",
    blurb:
      "A collaborative whiteboard with built-in machine learning. Users draw and sketch together in real time over WebSockets, with on-the-fly image classification powered by TensorFlow.js MobileNet.",
    tags: ["TypeScript", "Vite", "Fabric.js", "TensorFlow.js", "WebSocket"],
    github: "https://github.com/marvillage/dendrite_AI",
    live: "https://dendrite-ai.vercel.app",
    planet: "🌌",
  },
  {
    title: "DevRishi 2.0",
    quip: "Ancient texts, modern search.",
    blurb:
      "An intelligent Ayurvedic recommendation system. It surfaces drugs and formulations for given diseases/symptoms by searching classical Ayurvedic texts, while accounting for patient constitution, comorbidities and ingredient contraindications.",
    tags: ["React", "Python", "Node.js", "NLP", "Healthcare"],
    github: "https://github.com/marvillage/DevRishi2.0",
    live: "https://dev-rishi2-0.vercel.app",
    planet: "☄️",
  },
  {
    title: "AstroNexus — Space Intelligence Platform",
    quip: "Solar flare inbound. Your coffee is safe. Probably.",
    blurb:
      "One dashboard for space weather, near-Earth asteroids, live ISS and satellite passes, a launch calendar, space news, an exoplanet explorer and the NASA picture of the day. Next.js App Router pulls NOAA SWPC, NASA NeoWs, Launch Library 2, Spaceflight News and the Exoplanet Archive, proxies and caches them server-side, and exposes a public JSON API. MVP live.",
    tags: ["Next.js", "TypeScript", "Tailwind", "NASA / NOAA APIs", "Redis cache", "Recharts", "Leaflet"],
    github: "https://github.com/marvillage/astronexus",
    live: "https://astronexus-three.vercel.app",
    livePath: "/dashboard",
    planet: "🌠",
    featured: true,
    last: true,
  },
];
