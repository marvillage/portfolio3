export const profile = {
  name: "Kushagra Srivastava",
  // Short tagline shown under the name in the hero
  roles: [
    "Software Engineer",
    "Full-Stack Developer",
    "AI Builder",
    "Writer",
  ],
  location: "Ghaziabad, India",
  email: "kushagrasrivastava13119@gmail.com",
  resumeUrl: "/Kushagra_Resume.pdf",
  cgpa: "8.32",

  // Short intro for the hero
  intro:
    "Full-stack Software Engineer with 1+ years shipping production web applications end to end: React and TypeScript front ends over Spring Boot and FastAPI services on PostgreSQL, AWS and Kubernetes, with multi-tenant architecture, secure auth and CI/CD. SDE at AECAD.ai, CSE at IIIT Nagpur, and a writer of stories and essays on Medium.",

  // Paragraphs for the opening crawl. Keep each short; they scroll past.
  crawl: [
    "It is a period of rapid shipping. KUSHAGRA SRIVASTAVA, software engineer at AECAD.AI, builds production web platforms and AI systems from a hidden base in Ghaziabad.",
    "Armed with React, TypeScript, Spring Boot and FastAPI, he has built a 3D CAD viewer from its first commit, cut onboarding time by 40 percent and shipped 130+ pull requests across 12 repositories.",
    "Between missions he writes stories and essays on Medium. His next assignment awaits below…",
  ],

  about: [
    "I'm a Computer Science engineer (IIIT Nagpur, '26) who works across the full stack and the AI layer on top of it. At AECAD.ai I designed and built the web application and marketing site end to end, from Figma to production React and TypeScript, and built the platform's core 3D CAD/DWG viewer on the ODA Viewer SDK.",
    "On the backend I own services in FastAPI and Spring Boot over PostgreSQL: organization onboarding, user and plan management, auth and RBAC with Clerk and Keycloak, health probes across seven microservices on Kubernetes, and OWASP ZAP scans in CI/CD.",
    "Outside engineering, I'm a writer. I publish short stories and essays on Medium, from corporate-life reflections to horror.",
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
      role: "Software Engineer (Intern Apr – Jun 2026, then full-time)",
      period: "Apr 2026 – Present",
      location: "Remote",
      points: [
        "Designed and implemented the AECAD web application and marketing website end to end, from full UI design in Figma to production React and TypeScript, for an AI-powered CAD automation platform.",
        "Built the platform's core 3D CAD/DWG viewer from the first commit with the ODA Viewer SDK: layer and object management, tagging workflows, level-of-detail, TIN surfaces and snap points, plus render-performance work to unblock the main thread.",
        "Owned organization onboarding full-stack (React front end, FastAPI user-management service, PostgreSQL schema), delivered as coordinated cross-repository releases and cutting manual setup time by 40%.",
        "Developed user-management, plan-management and configuration REST APIs with schema migrations, and implemented authentication and role-based access control with Clerk.",
        "Drove platform reliability: health endpoints and Kubernetes probes across seven microservices, OWASP ZAP DAST in CI/CD, event-driven cache invalidation, and end-to-end release testing on every deployment.",
        "Shipped 130+ merged pull requests across 12 repositories spanning React/Next.js front ends, Python services, database migrations and Kubernetes/CI infrastructure.",
      ],
    },
    {
      company: "BeeHyv Software Solutions",
      role: "Software Developer Intern",
      period: "Jun 2025 – Mar 2026",
      location: "Hyderabad, India",
      points: [
        "Developed scalable Java and Spring Boot microservices with secure multi-tenant authentication via Keycloak.",
        "Implemented OAuth 2.0 integrations for Intentwise Connectors, enabling third-party connectivity including the Meta Marketing API.",
        "Profiled, debugged and optimized large-scale analytical queries on Amazon Redshift over secure S3 data pipelines.",
        "Built automated reporting pipelines on AWS Lambda that reduced manual reporting effort by 60%.",
      ],
    },
  ],

  achievements: [
    "🏆 Winner — Analytics Attax @ IIT Kanpur: built UniBot, lifting university support responsiveness by 85%.",
    "🥈 2nd Place — Bug Bounty Competition: identified critical vulnerabilities and shipped fixes.",
    "🥉 3rd Place — Genathon 24-Hour Hackathon, Tantrafiesta 2K24.",
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
    Data: ["PostgreSQL", "MySQL", "Redis", "Amazon Redshift", "Neo4j", "Alembic", "Query optimization"],
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
