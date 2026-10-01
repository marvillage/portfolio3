import { mediumStats } from "./articles";

export const profile = {
  name: "Kushagra Srivastava",
  // Short tagline shown under the name in the hero
  roles: [
    "Software Engineer",
    "Full-Stack Developer",
    "AI / ML Builder",
    "Writer",
  ],
  location: "Ghaziabad, India",
  email: "kushagrasrivastava13119@gmail.com",
  resumeUrl: "/Kushagra_Resume.pdf",
  cgpa: "8.32",

  // Short intro for the hero (original wording)
  intro:
    "Currently a Software Engineer (SDE) at AECAD.ai. I build production-grade web platforms and AI systems — from FastAPI onboarding flows and Spring Boot microservices to multi-agent LLM pipelines. CSE @ IIIT Nagpur. When I'm not shipping code, I write stories and essays on Medium.",

  // Résumé summary, shown as the lead paragraph in About
  summary:
    "Full-stack Software Engineer with 1+ years shipping production web applications end to end: React and TypeScript front ends over Java (Spring Boot) and Python (FastAPI) services on PostgreSQL, AWS and Kubernetes, with multi-tenant architecture, secure auth (OAuth 2.0, RBAC, MFA) and CI/CD.",

  // Opening sequence: incoming transmission (typed opener) → title card → crawl.
  // "Flight Log" script, first person. Keep each paragraph short; they scroll past.
  crawlOpener: "Pilot's log. Coordinates: Ghaziabad. Status: shipping.",
  crawlTitle: { ep: "Flight Log · Year One and Counting", big: "Callsign Mavestorm" },
  crawl: [
    "I fly full-stack. React and TypeScript up front, FastAPI and Spring Boot behind, PostgreSQL in the hold, Kubernetes keeping the lights on across seven decks. I trained at Nagpur Academy, Sector IIIT, and I have been in the air one year and counting.",
    "My current posting is Station AECAD, orbit of Titan-1Ab. I built its 3D CAD viewer from the first commit, took onboarding time down 40 percent, and left 130+ pull requests across 12 repositories on the way.",
    `When the console is quiet I switch to the Medium frequency. ${mediumStats.published}+ stories so far: essays, horror, and whatever the night suggests. The flight log continues below.`,
  ],

  about: [
    "I'm a Computer Science engineer (IIIT Nagpur, '26) who enjoys working across the full stack and the AI layer on top of it. I've built onboarding systems with FastAPI, multi-tenant backends with Spring Boot + Keycloak, and CAD visualization workflows with the ODA Viewer SDK.",
    "At AECAD.ai I designed and built the web application and marketing site end to end, from Figma to production React and TypeScript, and built the platform's core 3D CAD/DWG viewer on the ODA Viewer SDK.",
    "On the backend I own services in FastAPI and Spring Boot over PostgreSQL: organization onboarding, user and plan management, auth and RBAC with Clerk and Keycloak, health probes across seven microservices on Kubernetes, and OWASP ZAP scans in CI/CD.",
    "Lately I've been deep in LLM tooling — fine-tuning LLaMA, orchestrating LangGraph multi-agent systems, and wiring up data pipelines on AWS (Lambda, S3, Redshift).",
    "Outside engineering, I'm a writer. I publish short stories and essays on Medium — everything from corporate-life reflections to horror.",
  ],

  // Coding handles
  github: "marvillage",
  leetcode: "marvillageman",
  codolio: "marvillage",
  codechef: "marvillageman",
  gfg: "kushsrlq43",

  experience: [
    {
      company: "AECAD.ai",
      role: "Software Engineer Intern → SDE (Full-time) · intern Apr – Jun 2026",
      period: "Apr 2026 – Present",
      location: "Remote",
      points: [
        "Promoted from Software Engineer Intern to full-time SDE.",
        "Designed and implemented the AECAD web application and marketing website end to end, from full UI design in Figma to production React and TypeScript, for an AI-powered CAD automation platform.",
        "Built the platform's core 3D CAD/DWG viewer from the first commit with the ODA Viewer SDK: layer and object management, tagging workflows, level-of-detail, TIN surfaces and snap points, plus render-performance work to unblock the main thread, enhancing CAD visualization workflows for 2D/3D editing.",
        "Owned organization onboarding full-stack (React front end, FastAPI user-management service, PostgreSQL schema), delivered as coordinated cross-repository releases and cutting manual setup time by 40%.",
        "Developed user-management, plan-management and configuration REST APIs with schema migrations, and integrated authentication and role-based access control (RBAC) using Clerk with PostgreSQL-backed REST APIs.",
        "Drove platform reliability: health endpoints and Kubernetes probes across seven microservices, OWASP ZAP DAST in CI/CD, event-driven cache invalidation, and end-to-end release testing on every deployment.",
        "Shipped 130+ merged pull requests across 12 repositories spanning React/Next.js front ends, Python services, database migrations and Kubernetes/CI infrastructure.",
      ],
    },
    {
      company: "BeeHyv Software Solutions (Beehyv)",
      role: "Software Developer Intern",
      period: "Jun 2025 – Mar 2026",
      location: "Hyderabad, India",
      points: [
        "Developed scalable Java and Spring Boot microservices with secure multi-tenant authentication via Keycloak.",
        "Implemented OAuth 2.0 integrations for Intentwise Connectors, enabling third-party connectivity including the Meta Marketing API.",
        "Profiled, debugged and optimized large-scale analytical queries on Amazon Redshift; managed secure data pipelines via S3.",
        "Built automated reporting pipelines on AWS Lambda that reduced manual reporting effort by 60%.",
      ],
    },
  ],

  achievements: [
    "🏆 Winner — Analytics Attax @ IIT Kanpur: built UniBot, lifting university support responsiveness by 85%.",
    "🥈 2nd Rank — Bug Bounty Competition: identified critical vulnerabilities & shipped fixes.",
    "🥉 3rd Rank — Genathon 24-Hour Hackathon, Tantrafiesta 2K24.",
    "🥉 3rd Rank — Innovative Ideas for Sustainable Startup @ IIIT Nagpur: pitched Krishi Seva, an AI farming app.",
  ],

  skills: {
    Languages: ["Java", "Python", "TypeScript", "JavaScript", "C++", "SQL", "HTML5", "CSS3"],
    "Front End": [
      "React",
      "Next.js",
      "React Query",
      "Zustand",
      "Redux",
      "React Router",
      "Tailwind CSS",
      "Vite",
    ],
    "Back End": [
      "Spring Boot",
      "FastAPI",
      "Node.js",
      "Express",
      "Flask",
      "REST APIs",
      "Microservices",
      "WebSockets",
      "SQLAlchemy",
    ],
    "AI / ML": [
      "LangChain",
      "LangGraph",
      "LLaMA fine-tuning",
      "TensorFlow",
      "Keras",
      "scikit-learn",
      "XGBoost",
      "CatBoost",
      "OpenCV",
      "spaCy",
      "Streamlit",
    ],
    Data: ["PostgreSQL", "MySQL", "Redis", "Amazon Redshift", "Neo4j", "Firebase", "Alembic", "Query optimization"],
    "Cloud / DevOps": [
      "AWS Lambda",
      "S3",
      "Docker",
      "Kubernetes",
      "CI/CD",
      "GitHub Actions",
      "Linux",
    ],
    Security: ["OAuth 2.0", "JWT", "Keycloak", "Clerk", "RBAC", "TOTP MFA", "Row-level security", "OWASP ZAP"],
    Practices: ["DSA", "System Design", "OOD", "Unit testing", "Agile/Scrum", "Code review"],
  },
};
