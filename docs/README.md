# devolio docs

Notes to my future self. Read this first after time away.

## Start here

```
npm install
npm run dev        # http://localhost:3000
```

If that works, you're back. Everything else is detail.

Supabase-backed features (`/login`, `/write`) need `.env.local` — see
[infrastructure.md](./infrastructure.md#local-setup). Without it the site still runs;
the terminal, portfolio view, the blog, and all static content work fine. Only
`/login` and browser publishing go dark.

## What this project is

A terminal-style developer portfolio. Type commands to navigate like a filesystem;
`gui` switches to a traditional portfolio view. A markdown blog lives at `/blog`,
and `/write` is a login-gated editor that commits posts back to this repo.

Stack: Next.js 16 · React 19 · Tailwind v4 · Supabase.

## The pages

| Doc | What's in it |
|---|---|
| [content.md](./content.md) | Editing the About text, projects, and experience; adding a left-rail tab |
| [blogging.md](./blogging.md) | Writing posts — as files or through the `/write` editor |
| [infrastructure.md](./infrastructure.md) | Domain, hosting, database — who runs what, which dashboard to open |

## Commands worth remembering

| Command | Does |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | Production build (same as CI) |
| `npm run lint` | ESLint |
| `npm test` | Playwright E2E |
| `npm run test:ui` | Playwright in watch/UI mode |

## Where things live

```
src/app/          page.js is the portfolio; blog/ and write/ are real routes
src/components/   Terminal.js is the core; portfolio/ is the gui view
src/data/         content: projects.json, contact.js — edit these, not components
src/lib/api.js    auth, validation, and error helpers for the API routes
src/lib/blog.js   reads and parses the markdown posts
src/lib/github.js commits posts back to the repo
src/lib/supabase/ client.js (browser) + server.js (server)
src/proxy.js      refreshes the Supabase session on every request
src/content/blog/  markdown posts — one file per post
supabase/         schema.sql — DROP statements for the removed kanban tables
e2e/              Playwright specs
```

**To change portfolio content**, start in `src/data/`. That's usually the answer.
