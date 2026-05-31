# ecohydraulics.github.io

Source for the **Ecohydraulics** community website, published with [GitHub Pages](https://pages.github.com/).

The site is built with [Astro](https://astro.build/) using the
[Twilight](https://github.com/Spr-Aachen/Twilight) theme. It is currently
deployed to <https://ecohydraulics.github.io/>. (The custom `ecohydraulics.org`
domain will be wired up later, once the community approves the switch from the
existing WordPress site.)

## Prerequisites

- **Node.js v24 (latest LTS)** — Astro 5 requires Node `>=18.20.8`; this project
  is built and tested on Node 24. Using [nvm](https://github.com/nvm-sh/nvm):

  ```bash
  nvm install 24
  nvm use 24
  ```

- **pnpm 9** — the package manager used by this project:

  ```bash
  corepack enable
  corepack prepare pnpm@9.14.4 --activate
  ```

## Installation

```bash
git clone https://github.com/ecohydraulics/ecohydraulics.github.io.git
cd ecohydraulics.github.io
nvm use 24
pnpm install
```

## Local development

```bash
pnpm dev        # start the dev server at http://localhost:4321
pnpm build      # production build into dist/
pnpm preview    # serve the built dist/ locally
```

## Configuration

Almost everything is controlled from a single file: **`twilight.config.yaml`** (site title, banner text, navigation menus and their dropdown panels, sidebar widgets, music player, etc.). Page content lives under `src/content/` and `src/pages/`. Static assets (images, favicons) live under `public/`.

> **Note:** `WP-backup-20260531/` is a frozen export of the old WordPress site,
> kept for reference only. It is **not** part of the live site — do not edit,
> move, or delete it.

## Adding content

> **Maintainers:** see [`CONTRIBUTING.md`](CONTRIBUTING.md) for the full,
> step-by-step workflow — cloning the repo, writing a post or page, and the
> Git **stage → commit → push** steps that publish your change to the live site.

### Blog posts

Put **future blog posts in `src/content/posts/`** — one Markdown (`.md`/`.mdx`) file per post. They appear automatically on the home page and the [Blog/archive](https://ecohydraulics.github.io/archive/). Each post starts with frontmatter:

```markdown
---
title: My post title
published: 2026-05-29
description: One-line summary shown in listings.
cover: "/assets/images/desktopWallpaper_2.jpg"   # optional
tags: [Community, Announcement]
category: News
draft: false        # set true to hide from the published site
---

Post body in Markdown…
```

You can also scaffold one with `pnpm new-post`. Images you reference go in `public/assets/images/` (e.g. `/assets/images/my-pic.jpg`).

### Menu pages

The standalone menu pages (About, Community, Research, Leadership Team, …) live in **`src/content/pages/`**. The filename is the URL slug (`history.md` → `/history/`), and each file needs `title` (and optionally `description`) frontmatter. To add a page to the navigation, also add a link in `navbar.links` in `twilight.config.yaml`.

## Deployment

### Short version

After cloning the repo (see [Installation](#installation)) and making your
edits, push them to `main` to put them online:

```bash
git pull                                         # get the latest main first
npm run build                                    # verify the build is green
git add -A && git commit -m "..."                # stage & commit your changes
git push origin main                             # pushes to main; the workflow rebuilds & deploys
```

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for the detailed workflow.

### Background
Deployment is automated by GitHub Actions (`.github/workflows/deploy.yml`): every push to `main` builds the site with Node 24 + pnpm and publishes the static output to GitHub Pages.

One-time repository setup (**Settings → Pages → Build and deployment**):
set **Source** to **GitHub Actions**.

Because this is a `<org>.github.io` repository, the site is served from the
root path (`base: "/"`) at <https://ecohydraulics.github.io/>.

### Switching to custom domain 

When the community approves using `ecohydraulics.org`:

1. Add a `public/CNAME` file containing `ecohydraulics.org`.
2. Set `site.siteURL` in `twilight.config.yaml` to `https://ecohydraulics.org/`.
3. Configure the domain's DNS and set the custom domain under
   **Settings → Pages**.

## License

Site content and configuration: BSD 3-Clause (see [`LICENSE`](LICENSE)).
The Twilight theme is MIT licensed (see [`LICENSE-Twilight`](LICENSE-Twilight)).
