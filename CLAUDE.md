# CLAUDE.md

Guidance for working in this repository.

## What this is

The website for the **Ecohydraulics community** (ecohydraulics.org), migrated off
WordPress onto the **Twilight** Astro theme (https://github.com/Spr-Aachen/Twilight).
It is an Astro 5 static site, served from this repo (`ecohydraulics.github.io`).

- **Live site:** https://ecohydraulics.org/ (custom domain via `public/CNAME`).
- **Hosting:** GitHub Pages, `base: "/"`. `astro.config.mjs` uses the static
  (`undefined`) adapter when `GITHUB_ACTIONS` is set, and the Vercel adapter locally.
- **Deploy:** GitHub Actions (`.github/workflows/deploy.yml`, `withastro/action@v5`,
  pinned Node 24) builds `dist/` and publishes to Pages. `ci.yml` runs checks.

## Toolchain & commands

- **Node 24** (`.nvmrc` = `24`; `package.json` engines = `24.x`). The default system /
  conda node (18.x) is too old. Use `nvm use 24`.
- **Package manager: pnpm@9.14.4** (do not use npm/yarn).
- `pnpm dev` — generate icons, run Astro dev server.
- `pnpm build` — generate icons, build with Pagefind search indexing
  (`scripts/build-with-pagefind.cjs`).
- `pnpm preview` — preview the build.
- `pnpm new-post` — scaffold a new blog post (`scripts/new-post.js`).
- `pnpm check` — `astro check`; `pnpm type-check` — `tsc`.
- If native bindings (e.g. `@tailwindcss/oxide`) break after a node switch:
  `rm -rf node_modules && pnpm install` under Node 24.

## Configuration (where to change things)

- **`twilight.config.yaml`** — single source of truth for most site settings:
  title/subtitle, banner, navbar menus + dropdown panels, sidebar profile/announcement,
  music player, `siteURL`. Edit this before touching components.
- **`astro.config.mjs`** — Astro integrations, markdown/rehype/remark pipeline, adapter
  selection, `site`/`base`.
- **`src/config.ts`** + **`src/types/config.ts`** — typed config loaded from the YAML.
- **`.decap.yml` / `.pages.yml`** — CMS (Decap / PagesCMS) editing configs.

## Source layout (`src/`)

- **`content/`** — Astro content collections (schemas in `src/content.config.ts`):
  - `content/posts/` — blog posts (one `.md` per post, `YYYYMMDD-slug.md`). Rich
    frontmatter (title, published/updated, category, tags, cover, draft, encrypted…).
    Served under `/archive/`; rendered by `src/pages/posts/[...slug].astro`.
  - `content/pages/` — standalone menu pages (About, Community, Research, Journal,
    Leadership Team `lt.md`, etc.), migrated from WordPress. Slug = filename; rendered
    by `src/pages/[...slug].astro`. Schema is just `title` + `description`.
- **`pages/`** — Astro routes: `index.astro`, `archive.astro`, `404.astro`, RSS/Atom
  feeds, `robots.txt`, dynamic `[...slug].astro` (pages) + `posts/[...slug].astro`,
  and `og/[...slug].png.ts` (generated Open Graph images via Satori).
- **`components/`** — `.astro` + `.svelte` UI, grouped: `navbar/` (incl. `navLinks`,
  `navMenu`, `translator`, `search`), `sidebar/`, `post/`, `comment/`, `data/`,
  `common/`.
- **`layouts/`** — `base.astro` (root layout), `grid.astro`.
- **`i18n/`** — UI string translation. `language.ts` defines `LANGUAGE_CONFIG`
  (~20 languages); `languages/{en,ja,zh}.ts` hold strings; `i18nKey.ts`, `translation.ts`.
- **`plugins/`** — remark/rehype plugins (mermaid, admonitions, GitHub/music cards,
  reading-time, excerpt, lazy media, on-the-fly `translate.js`).
- **`utils/`**, **`constants/`** (`link-presets.ts` maps navbar `LinkPreset` numbers),
  **`styles/`** (Tailwind 4 CSS + Stylus), **`types/`**.

## Multilingual

Content is authored in **English only**. Other languages are produced **at runtime** by
a client-side translation widget (`components/navbar/translator.svelte` +
`plugins/translate.js`), which calls third-party services. There are no per-language
content files. The widget (and Google Fonts) are gated behind a consent banner
(`components/cookieConsent.astro`); choice stored in `localStorage['cookie-consent']`.

## Other directories

- **`public/`** — static assets served as-is: `assets/` (images/videos, incl. banner
  wallpapers and staff/journal images), `favicon/`, `CNAME`, search/verification files.
- **`scripts/`** — build helpers (icons, Pagefind, inline-stylus, IndexNow, new-post).
- **`dist/`** — build output (generated; do not edit).
- **`WP-backup-*/`** — WordPress export/backup reference material.

## Conventions

- Commit/push only when asked. Keep edits minimal and matched to surrounding style.
- New blog posts → `pnpm new-post`. New menu pages → add a `.md` to `content/pages/`
  and wire it into the navbar in `twilight.config.yaml`.
