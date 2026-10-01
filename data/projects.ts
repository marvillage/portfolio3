export type Project = {
  title: string;
  blurb: string;
  tags: string[];
  github?: string;
  live?: string;
  // emoji/planet used as the visual marker
  planet: string;
  // optional inked thumbnail, e.g. /art/projects/zentro.png (auto-detected by slug when omitted)
  image?: string;
  featured?: boolean;
};

// Edit freely — each project renders as a card. `featured: true` cards show first.
export const projects: Project[] = [
  {
    title: "ZENTRO — Multi-Tenant Digital Workplace Platform",
    blurb:
      "Modular FastAPI + PostgreSQL backend behind a React/TypeScript workplace: a transactional outbox event bus with at-least-once delivery and dead-letter replay, a durable job scheduler and async full-text search. Three-tier tenant isolation (JWT-scoped org context, repository filtering, row-level security), capability-based auth, TOTP step-up, a hash-chained audit log and Redis rate limiting that fails closed. Ships an approval workflow engine, idempotent payment release, an authorizing WebSocket gateway and HMAC-verified GitHub webhooks.",
    tags: ["Python", "FastAPI", "SQLAlchemy", "PostgreSQL", "Redis", "Docker", "React", "TypeScript", "WebSockets", "S3"],
    live: "https://zentro-app.vercel.app",
    planet: "🛰️",
    featured: true,
  },
  {
    title: "CivicFix — Civic Issue Reporting & Resolution",
    blurb:
      "Citizens report issues with photos, voice notes and GPS; municipalities resolve them. React 19 + Leaflet front end over 57 REST endpoints in Express 5, TypeScript, Prisma and PostgreSQL. Google Gemini vision classifies photos by category and severity (output validated, not trusted), Cloudinary handles media, and the issue lifecycle is a transactional state machine with append-only history, self-escalating SLA deadlines and JWT role-based access for citizen, authority and admin.",
    tags: ["React 19", "TypeScript", "Vite", "Leaflet", "Express 5", "Prisma", "PostgreSQL", "Gemini", "Cloudinary"],
    // repo is private; no public link yet
    planet: "🏙️",
    featured: true,
  },
  {
    title: "AstroNexus — Space Intelligence Platform",
    blurb:
      "One dashboard for space weather, near-Earth asteroids, live ISS and satellite passes, a launch calendar, space news, an exoplanet explorer and the NASA picture of the day. Next.js App Router pulls NOAA SWPC, NASA NeoWs, Launch Library 2, Spaceflight News and the Exoplanet Archive, proxies and caches them server-side, and exposes a public JSON API. MVP live.",
    tags: ["Next.js", "TypeScript", "Tailwind", "NASA / NOAA APIs", "Redis cache", "Recharts", "Leaflet"],
    github: "https://github.com/marvillage/astronexus",
    live: "https://astronexus-three.vercel.app",
    planet: "🌠",
    featured: true,
  },
  {
    title: "AgriGuard — Smart Irrigation & Crop Intelligence",
    blurb:
      "AI + IoT platform for Indian farmers. ESP32 field nodes stream soil moisture, NPK, flow and energy data to an Express + Prisma + PostgreSQL decision engine (FAO-56 water balance, weather forecasts, ML disease risk) that switches pumps on and off automatically. A Next.js PWA dashboard in English, Hindi, Marathi and Telugu proves the savings in litres, kWh, CO₂ and rupees. Built for EcoLogic 1.0 with team Mavestorm.",
    tags: ["Next.js", "Express", "Prisma", "PostgreSQL", "IoT / ESP32", "AI / ML", "PWA"],
    github: "https://github.com/marvillage/AgriGuard",
    planet: "🌱",
    featured: true,
  },
  {
    title: "Momentum — Daily Operator Waitlist",
    blurb:
      "SaaS landing page and beta waitlist for Momentum, a personal daily operator. Animated dashboard mockup, feature grid and FAQ; waitlist form with validation and duplicate prevention, confirmation emails via Resend, a live signup counter and launch countdown, and a Basic-auth admin dashboard with CSV export. Companion app in progress with Prisma and web push.",
    tags: ["Next.js 16", "Tailwind v4", "Supabase", "Resend", "Prisma", "Web Push"],
    github: "https://github.com/marvillage/momentum-waitlist",
    live: "https://momentum-waitlist-sepia.vercel.app",
    planet: "⏱️",
  },
  {
    title: "AthleteInsight — Anti-Doping Monitoring",
    blurb:
      "Full-stack athlete integrity dashboard. Sports authorities register athletes, track doping-risk scores and biological-passport markers, and flag athletes for review — backed by a real Postgres database with row-level security and Supabase email/password auth.",
    tags: ["React", "TypeScript", "Supabase", "Postgres", "Auth", "Dashboard"],
    github: "https://github.com/marvillage/AthleteInsight",
    live: "https://athlete-insight-gamma.vercel.app",
    planet: "🏅",
    featured: true,
  },
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
    live: "https://mindrelic2-yy5z.vercel.app",
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
