---
title: "Hello, world"
date: 2026-08-24
summary: "Why this blog exists, and how it works under the hood."
tags: [meta]
draft: true
---

This is the first post. Mostly a placeholder so the blog has something to render,
but also a decent excuse to explain how it works.

## How posts get here

Every post is a markdown file in `src/content/blog/`. The filename becomes the URL:
this one lives at `hello-world.md`, so it's served at `/blog/hello-world`.

There's no database and no CMS. At build time, the site reads the directory, parses
the frontmatter at the top of each file, and generates a static page per post. That
means every post is plain HTML by the time it reaches you — nothing is rendered at
request time.

## Frontmatter

The block at the top of each file sets the metadata:

```yaml
---
title: "Hello, world"
date: 2026-08-24
summary: "Shown on the index page."
tags: [meta]
draft: false
---
```

Setting `draft: true` keeps a post out of the build entirely, so half-finished
writing can sit in the repo without going live.

## What renders

Standard markdown works, plus GitHub-flavored extras — tables, task lists,
strikethrough, and autolinks:

| Thing | Supported |
| --- | --- |
| Tables | yes |
| Code blocks | yes |
| ~~Strikethrough~~ | yes |

- [x] Write the blog engine
- [ ] Write something worth reading

Raw HTML is deliberately *not* supported. Markdown is rendered straight to React
elements rather than to an HTML string, so there's no path for a stray `<script>`
to end up in the page.

That's the whole system. The rest is just writing.
