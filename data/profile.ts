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

  // Short intro for the hero / about section
  intro:
    "Currently a Software Engineer (SDE) at AECAD.ai. I build production-grade web platforms and AI systems — from FastAPI onboarding flows and Spring Boot microservices to multi-agent LLM pipelines. CSE @ IIIT Nagpur. When I'm not shipping code, I write stories and essays on Medium.",

  about: [
    "I'm a Computer Science engineer (IIIT Nagpur, '26) who enjoys working across the full stack and the AI layer on top of it. I've built onboarding systems with FastAPI, multi-tenant backends with Spring Boot + Keycloak, and CAD visualization workflows with the ODA Viewer SDK.",
    "Lately I've been deep in LLM tooling — fine-tuning LLaMA, orchestrating LangGraph multi-agent systems, and wiring up data pipelines on AWS (Lambda, S3, Redshift).",
    "Outside engineering, I'm a writer. I publish short stories and essays on Medium — everything from corporate-life reflections to horror.",
  ],

  // Coding handles
  github: "marvillage",
  leetcode: "marvillageman",
  codolio: "marvillage",

  experience: [
    {
      company: "AECAD.ai",
      role: "Software Engineer Intern → SDE (Full-time)",
      period: "Jan 2026 – Present",
      location: "Remote",
      points: [
        "Promoted from Software Engineer Intern (Jan–May 2026) to full-time SDE.",
        "Built a FastAPI onboarding system, reducing manual setup time by 40%.",
        "Designed UI flows in Figma and shipped production interfaces with React + TypeScript.",
        "Integrated authentication and RBAC using Clerk with PostgreSQL-backed REST APIs.",
        "Enhanced CAD visualization workflows using the ODA Viewer SDK for 2D/3D editing.",
      ],
    },
    {
      company: "Beehyv",
      role: "Software Developer Intern",
      period: "Jun 2025 – Dec 2025",
      location: "Hyderabad, India",
      points: [
        "Built scalable Spring Boot microservices with secure multi-tenant auth via Keycloak.",
        "Optimized large-scale analytical queries on Amazon Redshift; managed secure pipelines via S3.",
        "Implemented OAuth 2.0 integrations under Intentwise Connectors for third-party connectivity.",
        "Built automated reporting pipelines with AWS Lambda, cutting manual reporting effort by 60%.",
      ],
    },
  ],

  achievements: [
    "🏆 Winner — Analytics Attax @ IIT Kanpur: built UniBot, lifting university support responsiveness by 85%.",
    "🥉 3rd Rank — Innovative Ideas for Sustainable Startup @ IIIT Nagpur: pitched Krishi Seva, an AI farming app.",
    "🥉 3rd Rank — Genathon 24-Hour Hackathon, Tantrafiesta 2K24.",
    "🥈 2nd Rank — Bug Bounty Competition: identified critical vulnerabilities & shipped fixes.",
  ],

  skills: {
    Languages: ["Java", "C++", "JavaScript", "TypeScript", "Python", "SQL"],
    Frameworks: [
      "React",
      "Next.js",
      "Spring Boot",
      "FastAPI",
      "Node.js",
      "Express",
      "Streamlit",
      "Keycloak",
    ],
    "AI / ML": [
      "LangChain",
      "LangGraph",
      "TensorFlow",
      "Keras",
      "scikit-learn",
      "XGBoost",
      "CatBoost",
      "OpenCV",
      "spaCy",
    ],
    "Cloud / Data": ["AWS Lambda", "S3", "Redshift", "PostgreSQL", "Neo4j", "Firebase"],
  },
};
