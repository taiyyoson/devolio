# Blogging

Posts are markdown files in `src/content/blog/`. The filename is the URL slug:
`hello-world.md` serves at `/blog/hello-world`.

There is no database. The site reads the directory at build time and generates a
static page per post.

## Two ways to write

### 1. Write a file (no setup)

Create `src/content/blog/my-post.md`, commit, push. Vercel rebuilds and it's live.

```markdown
---
title: "Something I think"
date: 2026-08-24
summary: "One line shown on the index page."
tags: [systems, caching]
draft: false
---

Body goes here.
```

`draft: true` keeps a post out of the build entirely — safe to commit unfinished
work.

### 2. Write in the browser (`/write`)

Log in through the terminal (`/login`), then run `/write` or visit `/write`
directly. The editor has a live preview and commits a markdown file to this repo
through the GitHub API. The post is live after the deploy that commit triggers —
roughly a minute, not instant.

Both paths produce the same thing: a `.md` file in git. The editor is a convenience,
not a separate system. If it breaks, or you delete it, every existing post still
renders.

## Setup for the browser editor

**The editor is currently closed.** Supabase provided authentication and has been
removed; GitHub OAuth is not built yet, so `/write` redirects and `POST /api/posts`
returns 503. Until then, publish by writing a file and pushing (path #1 above).

When auth returns, publishing will also need `GITHUB_TOKEN` and `GITHUB_REPO`.

The token must be a **fine-grained** personal access token:

- scoped to **this repository only**
- **Contents: Read and write**
- **Workflows: No access** — this is the important one. Without it, a leaked token
  cannot modify `.github/workflows/` and take over CI.

Set the same three variables in the Vercel project settings, or `/write` will render
with a warning banner and publishing will return 503.

## Security notes

**Markdown never becomes an HTML string.** `react-markdown` renders straight to React
elements and `rehype-raw` is deliberately not installed, so raw HTML in a post is
displayed as text rather than executed. There is no `dangerouslySetInnerHTML`
anywhere in the blog path.

This matters more than usual here: the site's CSP includes `'unsafe-inline'` in
`script-src` (the App Router needs it), so an injected inline script would not be
blocked by the CSP. The renderer is the control.

**Slugs are validated before touching the filesystem.** `isValidSlug` in
`src/lib/blog.js` enforces `^[a-z0-9]+(?:-[a-z0-9]+)*$`, and `getPostBySlug` also
checks the resolved path stays inside the posts directory — a route param otherwise
reaches `path.join` and `../../.env` resolves fine.

**`/write` is gated server-side.** The page checks in a server component and
redirects before rendering, so the editor is never sent to an anonymous visitor.
`POST /api/posts` gates independently, before it parses the body — the UI gate is
not the security boundary.

**Frontmatter is serialised by `gray-matter`, not string concatenation.** An earlier
version hand-built the YAML; an unescaped newline in a field could close the
frontmatter early and take over the post body. `matter.stringify` quotes every
scalar itself.

**Never add `rehype-raw`.** It is the one change that would reintroduce a raw-HTML
path into the renderer and make the CSP's `'unsafe-inline'` reachable.

**External images will not load.** The CSP is `img-src 'self' data: blob:`, so an
image hotlinked from another domain is blocked. Put images in `public/` and
reference them as `/images/foo.png`.

## Gotchas

- The editor's "Commit post" writes to the configured branch directly. There is no
  preview deploy step.
- Committing a slug that already exists returns 409 unless `overwrite` is set.
- `date` defaults to today if omitted.
- Posts are sorted by `date` descending; a missing date sorts last.
