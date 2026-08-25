# Infrastructure

Who runs what, and which dashboard to open when something breaks.

**Last verified: 2026-08-14.**

## The short version

| Thing | Service | Dashboard |
|---|---|---|
| Domain `taiyyoson.com` | **Vercel** (registrar) | https://vercel.com/domains |
| Hosting / deploys | **Vercel** | https://vercel.com/dashboard |
| Source | **GitHub** `taiyyoson/devolio` | https://github.com/taiyyoson/devolio |

One login: Vercel. There is no database and no auth provider.

## Domain — bought at Vercel

`taiyyoson.com` was **registered through Vercel**, not bought separately and pointed
at it. Manage it at https://vercel.com/domains → `taiyyoson.com`.

**The confusing part, so you don't re-investigate it later:** a `whois taiyyoson.com`
says `Registrar: Cloudflare, Inc.` and lists Cloudflare nameservers. That is *not* a
second account. Vercel resells registrations through Cloudflare Registrar, so
Cloudflare's name appears in public records. There is no Cloudflare login for this
domain and there never was — everything is managed from the Vercel UI.

Verified facts:

- Registered **2026-02-17**, expires **2027-02-17**
- Status `clientTransferProhibited` — the normal registrar lock, not a problem
- Nameservers `mike.ns.cloudflare.com` / `tina.ns.cloudflare.com`
- `www` resolves via CNAME to a `*.vercel-dns-017.com` target; apex resolves into
  Vercel's anycast range

Because Vercel is both registrar and host, DNS is already wired to the deployment.
You don't need to touch records unless you're adding email or a subdomain.

> **Unconfirmed — worth 2 minutes:** whether auto-renew is on and the card on file is
> valid. Vercel → Domains → `taiyyoson.com`, and Settings → Billing. Domain expiry is
> the one failure here that's genuinely annoying to undo.

## Hosting — Vercel

Deploys come from the GitHub repo — pushes to `main` to production, pull requests to
preview URLs. *(This is Vercel's standard Git integration and matches the repo layout,
but I haven't opened the project settings to confirm it. Verify once and delete this
note.)*

CI runs separately in GitHub Actions (`.github/workflows/ci.yml`): lint → build →
Playwright on Chromium. A Vercel deploy succeeding does not mean CI passed, and vice
versa — they're independent.

**Environment variables live in Vercel**, not in the repo. `.env*` is gitignored. If
the deployed site loses auth or publishing but local works, suspect missing/stale env
vars in Vercel project settings first.

## Data — there isn't any

**No database.** Supabase was removed entirely and the project can be deleted. Blog
posts are markdown files in `src/content/blog/`, read at build time — see
[blogging.md](./blogging.md).

## Authentication — currently none

Supabase provided identity; it is gone, and GitHub OAuth has not been built yet.
`authenticate()` returns 503 and `isOwner()` returns false unconditionally, so
`/write` and `POST /api/posts` are closed. Publishing a post means committing a
markdown file by hand until OAuth lands.

### How it's wired

| File | Role |
|---|---|
| `src/lib/api.js` | Auth stubs, field allowlists, generic error responses. |
| `src/lib/rate-limit.js` | Per-user request cap, in-memory and per-instance. |
| `src/app/api/posts/route.js` | Commits a blog post to the repo. 503s while auth is absent. |
| `src/lib/github.js` | GitHub contents API client. Reads its token at call time. |

## Local setup

Nothing is required to run the site — `npm install && npm run dev` is enough.

Publishing needs `GITHUB_TOKEN` and `GITHUB_REPO` (see [blogging.md](./blogging.md)),
though it is closed regardless until authentication exists.

## When something breaks

| Symptom | Look here first |
|---|---|
| Site down / 404 on a route | Vercel → Deployments (did the last one fail?) |
| Domain not resolving, cert warning | Vercel → Domains |
| Renewal / billing on the domain | Vercel → Domains, and Settings → Billing |
| `/write` 503s on publish | `GITHUB_TOKEN` / `GITHUB_REPO` missing in Vercel |
| Published post not live | Check the commit landed, then Vercel → Deployments |
| Works locally, broken deployed | Vercel env vars |
| CI red but site is fine | GitHub Actions — separate from deploys |
