# Infrastructure

Who runs what, and which dashboard to open when something breaks.

**Last verified: 2026-08-14.**

## The short version

| Thing | Service | Dashboard |
|---|---|---|
| Domain `taiyyoson.com` | **Vercel** (registrar) | https://vercel.com/domains |
| Hosting / deploys | **Vercel** | https://vercel.com/dashboard |
| Database + auth | **Supabase** | https://supabase.com/dashboard |
| Source | **GitHub** `taiyyoson/devolio` | https://github.com/taiyyoson/devolio |

Two logins total: Vercel and Supabase. That's the whole surface area.

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

## Database — Supabase

Project ref: **`jkqazldcmdynmpetjjdu`**
Dashboard: https://supabase.com/dashboard/project/jkqazldcmdynmpetjjdu

(That ref is safe to write down — it's part of the `NEXT_PUBLIC_SUPABASE_URL` and
already ships in the browser bundle. The keys are not here; they live in `.env.local`
and in Vercel.)

Used for **auth only**. The terminal's `/login` command signs in via
`supabase.auth.signInWithPassword`; a valid session is what unlocks `/write`.
Single admin user, that's you.

### Schema

**No application tables are in use.** The kanban board was removed and its tables
(`boards`, `columns`, `cards`) are abandoned —
[`supabase/schema.sql`](../supabase/schema.sql) now holds the `DROP TABLE`
statements to clean them up. Nothing there is auto-applied; paste it into the
Supabase SQL editor by hand.

Blog posts are **not** in the database. They're markdown files in git — see
[blogging.md](./blogging.md).

### How it's wired

| File | Role |
|---|---|
| `src/lib/supabase/client.js` | Browser client. Returns `null` if env vars are missing. |
| `src/lib/supabase/server.js` | Server client. |
| `src/proxy.js` | Refreshes the session on every request. Skips cleanly if env vars are absent. |
| `src/lib/api.js` | Auth guard, field allowlists, generic error responses. |
| `src/lib/rate-limit.js` | Per-user request cap, in-memory and per-instance. |
| `src/app/api/posts/route.js` | Commits a blog post to the repo. 401s before parsing the body. |
| `src/lib/github.js` | GitHub contents API client. Reads its token at call time. |

The `null`-when-unconfigured pattern is deliberate: the site degrades to a working
static portfolio instead of crashing when Supabase isn't set up.

## Local setup

`.env.local` is gitignored and holds:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Both values come from Supabase → Project Settings → API. `.env.example` has the
shape without the values.

## When something breaks

| Symptom | Look here first |
|---|---|
| Site down / 404 on a route | Vercel → Deployments (did the last one fail?) |
| Domain not resolving, cert warning | Vercel → Domains |
| Renewal / billing on the domain | Vercel → Domains, and Settings → Billing |
| Login fails | Supabase → Auth (is the user still there?) |
| `/write` 503s on publish | `GITHUB_TOKEN` / `GITHUB_REPO` missing in Vercel |
| Published post not live | Check the commit landed, then Vercel → Deployments |
| Works locally, broken deployed | Vercel env vars |
| CI red but site is fine | GitHub Actions — separate from deploys |
