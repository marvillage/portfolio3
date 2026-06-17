# Kushagra Srivastava — Portfolio 🌌

A modern, space-themed personal portfolio — black & navy blue, with a 3D black hole,
orbiting planets and a starfield. Built with **Next.js 14**, **TypeScript**,
**Tailwind CSS**, **react-three-fiber** and **framer-motion**.

## Sections
- **Hero** — intro, roles, résumé, social links
- **About** — bio, skills, experience timeline, achievements
- **Projects** — featured work with live + GitHub links
- **Writing** — curated Medium articles
- **Live Stats** — auto-updating GitHub & LeetCode/Codolio cards
- **Contact** — form backed by an online database (Supabase) + email

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

Build for production:

```bash
npm run build && npm start
```

## Editing content
All content lives in plain data files — no need to touch components:

| File | What it holds |
|------|----------------|
| `data/profile.ts`  | name, intro, about, skills, experience, achievements, handles |
| `data/projects.ts` | project cards (title, blurb, tags, github, live) |
| `data/articles.ts` | Medium articles |
| `data/socials.ts`  | social links |

> **LeetCode:** confirm your exact username in `data/profile.ts` (`leetcode`).
> **Résumé:** drop `Kushagra_Resume.pdf` into `public/`.

## Contact form → online database (Supabase)

1. Create a free project at https://supabase.com
2. SQL Editor → run `supabase/schema.sql`
3. Project Settings → API → copy the URL and the **service_role** key
4. Add them to `.env.local` (see `.env.example`):

```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

Submissions appear in the **messages** table. Without these vars the form
gracefully falls back to opening the visitor's email client (`mailto:`).

*(Optional)* set `FORMSPREE_ENDPOINT` to also receive submissions by email.

## Deploy (Vercel)
1. Push to GitHub (already set up under `marvillage`).
2. Import the repo at https://vercel.com/new
3. Add the same env vars in **Project → Settings → Environment Variables**.
4. Deploy. 🚀

---
Built with Next.js & three.js.
