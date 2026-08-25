# Worklog

## 2026-08-24 — Phase 1 & 2: kanban removed, markdown blog added

### Goal

Remove the kanban feature, keep Supabase auth, and add a blog. Chosen architecture
("Shape B"): posts are markdown **files in git**, and a login-gated browser editor
commits new files back to the repo through the GitHub API. This was picked over
storing posts in Postgres so the blog stays static and portable — if the editor or
Supabase goes away, every post still renders.

### Phase 1 — kanban removal (committed)

- `91c1e33` removed the board: 3 API routes, 5 components, `useKanban.js`,
  `e2e/kanban.spec.js`, and the `@dnd-kit/*` packages (3).
- `f4b9258` restored `/kanban` as a **pure auth gate** — the command still exists
  and still says "Access denied — admin only", but there is no board behind it.
  This was a deliberate request, not an oversight.
- `supabase/schema.sql` now contains only `DROP TABLE` statements.
  **Not yet run against the live Supabase project — the tables still exist there.**

### Phase 2 — blog (in progress, uncommitted at time of writing)

New:
- `src/lib/blog.js` — reads `src/content/blog/*.md`, parses frontmatter, filters
  drafts, sorts by date. Exports `isValidSlug`, used as the path-traversal guard.
- `src/lib/github.js` — GitHub contents API client. Reads config at **call time**,
  not module scope, so a missing token surfaces as a handled 503 rather than
  breaking the build.
- `src/app/api/posts/route.js` — POST, authenticated, builds frontmatter + body and
  commits the file.
- `src/app/blog/page.js`, `src/app/blog/[slug]/page.js` — static index and post
  pages. `params` is awaited (Next 16 made it a Promise).
- `src/app/write/page.js` — editor, **server-side** auth check that redirects before
  rendering.
- `src/components/blog/PostEditor.js` — client editor with live preview.
- `src/components/blog/BlogShell.js` — shared chrome.
- `src/lib/commands/write.js` — `/write` terminal command.
- `src/content/blog/hello-world.md` — seed post.
- `e2e/blog.spec.js` — 8 specs.
- `docs/blogging.md`.

Changed: `src/lib/api.js` (post field validators + null-client guard),
`src/lib/supabase/server.js` (returns `null` when unconfigured, matching
`client.js` — it previously would have thrown), `src/app/sitemap.js` (posts
included), `PortfolioView.js` (Blogs tab is now a `<Link>` to `/blog`, not tab
state), `.env.example`, `CLAUDE.md`, `docs/README.md`, `docs/infrastructure.md`.

### Verified (observed output, not assumed)

- `npm run lint` — clean.
- `npm run build` — passes. Route table shows `● /blog/hello-world` (SSG),
  `○ /blog`, `ƒ /write`, `ƒ /api/posts`.
- `npx playwright test --project=chromium` — **28 passed**.
- Manual curl against `npm run dev`:
  - `POST /api/posts` unauthenticated → **401**, and 401 for a malformed body too,
    i.e. auth is checked before parsing.
  - `GET /blog/..%2f..%2f.env` → **404**.

- Draft filtering, tested with a temporary `draft: true` fixture containing a canary
  string: not prerendered (canary absent from `.next`), `/blog/<slug>` → **404**,
  absent from the index and from `sitemap.xml`. Fixture removed after.
- YAML frontmatter injection, tested against the real `escapeYaml` extracted from
  `route.js`: 8 payloads (LF, CRLF, `---` terminator, U+2028, U+2029, U+0085,
  quotes, backslash) all contained — no extra frontmatter keys, body intact.

### Bug found and fixed during this session

`buildMarkdown()` escaped quotes and backslashes but **not line terminators**, so a
title or summary containing a newline could close the quoted scalar and inject
arbitrary frontmatter keys — or a `---` terminator, taking over the body. Only an
authenticated admin can reach it, so impact was low, but it also meant any title
with a stray newline silently produced a corrupt file. Fixed in `escapeYaml`.

Note for future edits: the first fix pasted **literal** U+2028/U+2029 into the regex,
which JS treats as line terminators — it broke the parse ("Unterminated regular
expression") and lint caught it. They must be written as `\u2028`/`\u2029` escapes.

### NOT verified — read this before trusting the publish path

**The GitHub commit has never been executed.** No token exists in this environment
and creating one is the owner's call, so `commitFile()` is written but unproven
end-to-end. What is proven is everything around it: the route 401s when
unauthenticated, and returns 503 when the token is absent. The first real publish
should be treated as a test.

### Decisions

- **Files in git over Postgres.** Portability and zero attack surface for the read
  path. Cost: publishing needs a rebuild (~1 min), not instant.
- **Blog as real routes, not a portfolio tab.** Posts need shareable URLs, SEO, and
  a working back button. The rail entry is a `<Link>`.
- **`react-markdown` without `rehype-raw`.** Markdown renders to React elements, so
  no HTML string is ever produced and there is no `dangerouslySetInnerHTML`. This
  matters more than usual because the CSP carries `'unsafe-inline'` in `script-src`,
  so CSP would *not* stop an injected inline script — the renderer is the control.
- **Fine-grained token, Contents-only, no Workflows scope** (documented in
  `.env.example`). Bounds the blast radius of a leak away from CI takeover.

### Security review and fixes (post-review)

A `code-review-debugger` pass found a **critical** issue I had missed, plus 10
others. All fixed in this session.

**Critical — authentication without authorization.** `authenticate()` accepted *any*
Supabase user. `NEXT_PUBLIC_SUPABASE_ANON_KEY` ships in the browser bundle by
design, so with signups enabled in the Supabase project the chain was:
scrape anon key → self-signup → valid session → `POST /api/posts` → **commit lands
in the repo**. Anonymous-to-repo-write. The "single admin" property existed only as
Supabase dashboard state, enforced nowhere in code.

Fixed by adding an `OWNER_USER_ID` comparison in `authenticate()` and a new
`isOwner()` used by `/write`. **Fails closed when the var is unset** — better to
lock the owner out than to leave it open. Verified by extracting the real predicate
from `api.js` and testing all six combinations: no-session→401, session with owner
unset→403, empty→403, mismatched→403, matching→200.

**High — YAML breakout via `date`.** `date: ${date}` was interpolated *unquoted* and
its validator was `!Number.isNaN(Date.parse(v))`. `Date.parse` is not a validator:
V8 accepts a trailing parenthesized comment and ignores its contents, newlines
included. Confirmed locally — `Date.parse("2026-08-24 GMT+0000 (\n---\nX\n---\nfoo)")`
returns a valid timestamp. A crafted date could close the frontmatter early, take
over the body, and discard `draft: true` so a post submitted as a draft published.
Fixed twice over: the validator now requires `^\d{4}-\d{2}-\d{2}$` first, and the
hand-rolled YAML is gone entirely — replaced with `matter.stringify`, which quotes
every scalar itself. `escapeYaml`/`buildMarkdown` deleted.

**High — silent publish failure.** `if (res.status === 404) return null` lived in the
shared `request()` helper, so a 404 on the **PUT** (wrong repo, token missing
Contents:write, deleted branch) produced `{ committed: true, url: null }` → HTTP 200
→ editor showed "Committed …". Now `allow404` is opt-in and set only on the
existence check.

Also fixed: `overwrite` read straight off the raw body bypassing `pick()` (any
authenticated caller could silently overwrite any post); the publish endpoint
inheriting the generic 120/min cap (120 commits = 120 deploys → now 10/min);
`new Date(data.date).toISOString()` throwing on a hand-written bad date and failing
the whole build; unvalidated filenames producing permanently-broken links;
`readPostFile` having no try/catch so one malformed post broke `next build`;
`slugify` trimming before truncating and re-introducing a trailing hyphen;
`lib/github.js` lacking a `server-only` guard.

**Enforced, not just documented:** an ESLint `no-restricted-imports` rule now blocks
`rehype-raw` with an explanation. Verified it fires by temporarily importing it.

Cleared by the review with evidence, worth not re-litigating: path traversal via
slug (JS `$` is end-of-input without `/m`; the newline bypass that works in Python
does not apply), XSS through markdown (raw HTML renders as text, `javascript:` and
`data:` URLs stripped to `""`), draft leakage, token reaching the client bundle, and
error responses leaking internals.

### Open / next

**Required before publishing works at all:**

1. Set `OWNER_USER_ID` (Supabase → Authentication → Users → your UID), locally and
   in Vercel. Until then `/write` redirects and `/api/posts` 403s — by design.
2. Set `GITHUB_TOKEN` / `GITHUB_REPO` / `GITHUB_BRANCH`. Fine-grained PAT, this repo
   only, Contents: read+write, **Workflows: no access**.
3. Disable email signups in Supabase → Authentication → Providers.
4. Run the `DROP TABLE` statements in `supabase/schema.sql` in the Supabase SQL
   editor — the kanban tables still exist in the live project.

**Still unproven:** the GitHub commit itself. No token in this environment, so
`commitFile()` has never executed against the real API. The first publish is the
test. Everything around it is verified: 401 without a session, 403 without owner
match, 503 without a token.

**Open question raised by the user, not yet acted on:** why Supabase at all, given
the GitHub API is already in play. They are different jobs — Supabase authenticates
the *browser user*, the GitHub token is the server's *write credential* and cannot
identify a caller. But GitHub OAuth could replace Supabase entirely and leave one
provider instead of two. Not started; worth costing before more is built on
Supabase.

## 2026-08-24 (later) — Supabase removed entirely

User directive: rip Supabase out now, as its own change, before building GitHub
OAuth. Done in `b11e061` (code, user-committed) + `35dfbf1` (docs).

**Deleted:** `src/lib/supabase/`, `src/proxy.js`, `supabase/`, `@supabase/ssr`,
`@supabase/supabase-js`, `.env.example`, the `*.supabase.co` CSP `connect-src`
entries, and the whole email/password login state machine in `Terminal.js` /
`TerminalInput.js` (`loginMode`, `loginEmail`, `_pendingLogin`, `LOGIN_SUCCESS`,
`LOGIN_FAILURE`, both masked inputs, ~9 conditional branches).

**Auth is deliberately closed, not degraded.** `authenticate()` returns 503 and
`isOwner()` returns false unconditionally in `src/lib/api.js`. `/login` prints
"no authentication provider configured". These two functions are the seam the OAuth
work slots into — same signatures, same return shapes, so `/api/posts` and
`/write` need no changes when it lands.

Note `/write` flipped from `ƒ` (dynamic) to `○` (static) in the build output,
because `isOwner()` no longer reads cookies so Next prerenders the redirect. It
returns to dynamic automatically once cookie reads come back.

**Verified:** lint clean, build ✓, **31/31 E2E**, `npm audit` 0 vulnerabilities.

**Next:** GitHub OAuth. A full design exists from a Plan agent — session cookie
format, four routes, the terminal-return mechanism, and a ranked risk list. Key
points not to lose:
- Both cookies must be `SameSite=Lax`. `Strict` breaks the callback 100% of the
  time, because the redirect chain from github.com counts as cross-site.
- GitHub returns **HTTP 200 with `{"error":...}`** on a bad verification code —
  checking `res.ok` alone silently accepts a failed exchange.
- The return hash (`/#login=ok`) is attacker-controllable. It may drive the view and
  a message from a fixed allowlist, never `isAuthenticated` — that comes only from
  `/api/auth/me`.
- Verify the HMAC over the raw payload string *before* base64-decoding it.
