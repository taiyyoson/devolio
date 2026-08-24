# Editing content

How to change what the site says, without hunting through components.

## The rule

**Edit `src/data/`. Not components.** Two exceptions, both listed below.

## What is shared between the two views

The site has two front ends — the terminal and the GUI portfolio. Most content
feeds both from one file, but not all of it.

| Section | Terminal reads | GUI reads | Shared? |
|---|---|---|---|
| Projects | `src/data/projects.json` | `src/data/projects.json` | yes |
| Experience | `src/data/experience.json` | `src/data/experience.json` | yes |
| Contact | `src/data/contact.js` | `src/components/portfolio/PortfolioFooter.js` | no |
| **About** | `src/data/about.js` | `src/components/portfolio/PortfolioHero.js` | **no** |

`src/lib/filesystem.js` is what turns the shared JSON into the terminal's fake
filesystem, which is why one edit updates both views.

## Projects — one file

`src/data/projects.json`, one object per project:

```json
{
  "slug": "nala",
  "title": "Nala",
  "description": "One-liner shown in the GUI list and the terminal README.",
  "longDescription": "Long text. Terminal only — cat projects/<slug>/README.md.",
  "tags": ["Python", "RAG"],
  "github": "https://github.com/...",
  "live": null,
  "image": null,
  "featured": true
}
```

- `title` and `description` are what appear in both views
- `github`, if set, turns the title into a link in the GUI
- `featured: true` renders a `*` next to it
- `slug` is the terminal path: `cd projects/<slug>`

## Experience — one file

`src/data/experience.json`, keys: `role`, `company`, `location`, `startDate`,
`endDate`, `description`, `tags`. Omit `endDate` to render "Present".

**Trap:** `src/lib/filesystem.js` holds an `EXPERIENCE_SLUGS` map keyed by the exact
`role` string. Rename a role in the JSON and its terminal path silently changes to
an auto-generated slug. Update the map at the same time.

## About — two files, keep them in sync

There is no single source for the About text.

1. `src/data/about.js` — plain text, drives `cat about.txt` in the terminal
2. `src/components/portfolio/PortfolioHero.js` — JSX, drives the GUI

The GUI version is JSX because it carries inline links (USF, Nala, Fastly) that
plain text can't express. Changing one and not the other is the most likely way for
this site to start contradicting itself.

In `PortfolioHero.js`: the `<h1>` is the title, the `<p>` blocks are the body.

## The left rail

Not its own component — it's the `<aside>` inside
`src/components/portfolio/PortfolioView.js`, rendered from an array at the top of
that file:

```js
const TABS = [
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
];
```

`PortfolioNav.js` is a different thing — the top bar with the name, theme toggle,
and terminal button.

### Adding a tab

1. Create `src/components/portfolio/Portfolio<Name>.js` exporting a `<section>`
2. Add `{ id: "<id>", label: "<Label>" }` to `TABS`
3. Add `{tab === "<id>" && <Portfolio<Name> />}` alongside the others, and import it

The rail renders from `TABS`, so the button appears on its own. Nothing else to wire.

This adds the tab to the **GUI only**. To give it a terminal equivalent, add a node
in `buildFileSystem()` in `src/lib/filesystem.js`.

## Adding a terminal command

Different system. `src/lib/commands/<name>.js`, then register it in the `commands`
object in `src/lib/commands/index.js` — that object also drives tab completion.
Handlers return `{ output, newCwd?, action?, actionData? }`. Names starting with `/`
are the auth-gated ones.
