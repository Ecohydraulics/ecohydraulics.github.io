# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The website for the **Ecohydraulics community** (ecohydraulics.org), migrated off
WordPress onto the **Twilight** Astro theme (https://github.com/Spr-Aachen/Twilight).
It is an Astro 5 static site, served from this repo (`ecohydraulics.github.io`).

- **Live site:** https://ecohydraulics.org/ (custom domain via `public/CNAME`; the
  README's "custom domain will be wired up later" note is stale).
- **Hosting:** GitHub Pages, `base: "/"`, `trailingSlash: "always"` — internal links
  must keep their trailing slash or Astro will 404 them.
- **Deploy:** `.github/workflows/deploy.yml` runs on every push to `main` (and
  `workflow_dispatch`): `withastro/action@v6` with Node 24 + pnpm 9.14.4 builds and
  publishes to Pages, then an `indexnow` job diffs the push and submits changed URLs
  via `scripts/indexnow-submit.mjs`.
- **CI:** `.github/workflows/ci.yml` builds every PR, then squash-merges non-major
  Dependabot PRs and explicitly dispatches `deploy.yml` (a `GITHUB_TOKEN` merge does
  not trigger the push-based deploy).

## Toolchain & commands

- **Node 24** (`.nvmrc` = `24`; `package.json` engines = `24.x`). The default system /
  conda node (18.x) is too old. Use `nvm use 24`.
- **Package manager: pnpm@9.14.4** (do not use npm/yarn; CI uses `--frozen-lockfile`).
- `pnpm dev` — generate icons, run Astro dev server (http://localhost:4321).
- `pnpm build` — generate icons, build + Pagefind index (`scripts/build-with-pagefind.cjs`).
- `pnpm preview` — preview the build.
- `pnpm new-post <slug>` — scaffold a blog post (`scripts/new-post.js`).
- `pnpm check` — `astro check`; `pnpm type-check` — `tsc --noEmit --isolatedDeclarations`;
  `pnpm check-stylus` — compile inline Stylus blocks.
- **There is no test suite.** `pnpm build` is the real gate — it is exactly what deploy
  runs, so a green local build means the deploy will succeed. Run it before pushing.
- If native bindings (e.g. `@tailwindcss/oxide`) break after a node switch:
  `rm -rf node_modules && pnpm install` under Node 24.

## Configuration (where to change things)

- **`twilight.config.yaml`** — single source of truth for most site settings:
  title/subtitle, banner, navbar menus + dropdown panels, sidebar profile/announcement,
  footer, particles, music player, `siteURL`. Edit this before touching components.
- **`src/config.ts`** imports the YAML with `?raw` + `js-yaml` and exports typed config
  (`siteConfig`, `navbarConfig`, `profileConfig`, `postConfig`, …); types live in
  **`src/types/config.ts`**. A navbar entry may be an object, or a bare string naming a
  `LinkPreset` (`Home`, `Archive`, `About`, …) resolved via
  `src/constants/link-presets.ts` — an unknown name throws at build time.
- **`astro.config.mjs`** — integrations, the remark/rehype pipeline, Expressive Code
  theming, and adapter selection: `GITHUB_ACTIONS` → static (`undefined` adapter),
  else `CF_PAGES` / `NETLIFY` / `EDGEONE` → their adapters, else Vercel serverless.
  `scripts/build-with-pagefind.cjs` mirrors that same platform detection to find the
  output dir to index.
- **`.decap.yml` / `.pages.yml`** — CMS (Decap / PagesCMS) editing configs. Decap OAuth
  is currently `enable: false`; `/admin/` is excluded from the sitemap.
- `Dockerfile`, `docker-compose.yml`, `vercel.json`, `esa.jsonc` are upstream-theme
  leftovers for other hosts; the live deploy does not use them.

## Content model

Two Astro content collections, both schema'd in **`src/content.config.ts`** (the
authority — check it before adding frontmatter fields):

- **`src/content/posts/`** — blog posts, one `.md` per post, named `YYYYMMDD-slug.md`.
  Rich frontmatter: `title`, `published`, `updated`, `description`, `cover`,
  `coverInContent`, `category`, `tags`, `author`, `pinned`, `draft`, license fields,
  `encrypted`/`password`, and `routeName` for a custom permalink.
  Rendered by `src/pages/posts/[...slug].astro` at **`/posts/<filename-without-ext>/`**
  (a `routeName` adds a second path under `/posts/`). `/archive/` is the *listing* page.
  Convention: `author` is a **first name only** — it renders as the byline.
- **`src/content/pages/`** — standalone menu pages (About, Community, Research, Journal,
  Leadership Team `lt.md`, …), migrated from WordPress. Schema is only `title` +
  `description`. Filename = slug; rendered by `src/pages/[...slug].astro`.
  A new page needs **two** edits: the `.md` file *and* a `navbar.links` entry in
  `twilight.config.yaml`.

## Source layout (`src/`)

- **`pages/`** — routes: `index.astro`, `archive.astro`, `404.astro`, RSS/Atom feeds,
  `robots.txt.ts`, the two dynamic `[...slug]` routes, and `og/[...slug].png.ts`
  (Open Graph images generated with Satori).
- **`components/`** — `.astro` + `.svelte` UI grouped into `navbar/`, `sidebar/`,
  `post/`, `comment/`, `data/`, `common/`. The footer (credits, copyright, license)
  is `components/footer.astro`.
- **`layouts/`** — `base.astro` (root) and `grid.astro` (used by most pages).
- **`plugins/`** — remark/rehype plugins wired into `astro.config.mjs`: mermaid,
  admonitions, GitHub/music cards, reading-time, excerpt, lazy media, plus
  Expressive Code plugins in `plugins/expressive-code/` and the runtime `translate.js`.
- **`utils/`**, **`constants/`**, **`styles/`** (Tailwind 4 CSS + two `.styl` files),
  **`i18n/`** — `language.ts` holds `LANGUAGE_CONFIG` (~20 languages), UI strings in
  `languages/{en,ja,zh}.ts`, keyed by `i18nKey.ts`.
- **`src/utils/icons.ts` is generated** by `scripts/generate-icons.js` on every
  `dev`/`build` — never hand-edit it. It scans `.astro`/`.svelte` for `icon="prefix:name"`
  and inlines the SVG; using an icon from a set not listed in that script's `ICON_SETS`
  requires adding the set there (and to the `icon()` integration in `astro.config.mjs`).

**Import aliases** (tsconfig `paths`): `@/*` → `src/*`, plus `@components/*`,
`@layouts/*`, `@utils/*`, `@constants/*`, `@i18n/*`, `@styles/*`, `@pages/*`,
`@assets/*`. Use these rather than deep relative paths.

## Multilingual

Content is authored in **English only**. Other languages are produced **at runtime** by
a client-side translation widget (`components/navbar/translator.svelte` +
`plugins/translate.js`) calling third-party services. There are no per-language content
files. The widget (and Google Fonts) are gated behind a consent banner
(`components/cookieConsent.astro`); the choice is stored in `localStorage['cookie-consent']`.

## Search

Pagefind indexes `dist/` after the Astro build. `pagefind.yml` excludes KaTeX spans,
the search panel, and anything marked `data-pagefind-ignore`. Search only works against
a real build (`pnpm build && pnpm preview`), not `pnpm dev`.

## Other directories

- **`public/`** — served as-is: `assets/` (images/videos, banner wallpapers, staff and
  journal images), `favicon/`, `CNAME`, `_headers`, search-engine verification files.
  Post/page images go in `public/assets/images/` and are referenced as `/assets/images/…`.
- **`WP-backup-20260531/`** — frozen WordPress export, reference only. **Never edit,
  move, or delete it, and never commit changes inside it.**
- **`dist/`** — build output (generated; do not edit).

## Conventions

- Commit/push only when asked. Keep edits minimal and matched to surrounding style
  (4-space indent, tabs in `package.json`, double quotes in `.astro`/`.ts`).
- Pushing to `main` publishes the live site — there is no staging environment.
- `CONTRIBUTING.md` is the maintainer-facing version of the content workflow; keep it
  in sync when the authoring process changes.
