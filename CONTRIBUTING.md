# Contributing to the Ecohydraulics website

This site is built with [Astro](https://astro.build) on top of the
[Twilight](https://github.com/Spr-Aachen/Twilight) theme. Content lives in
Markdown files under `src/content/`, and the navigation menu is defined in
`twilight.config.yaml`. This guide explains how maintainers create blog posts,
edit pages, and add new pages to the menu.

## Get the repository (one-time setup)

Clone the repo from GitHub, then install dependencies:

```bash
git clone git@github.com:Ecohydraulics/ecohydraulics.github.io.git
# or, over HTTPS:
# git clone https://github.com/Ecohydraulics/ecohydraulics.github.io.git
cd ecohydraulics.github.io
nvm use 24        # the project is pinned to Node 24 (see .nvmrc)
pnpm install
```

If you already have a clone, pull the latest `main` before you start editing so
you don't work on a stale copy:

```bash
git checkout main
git pull
```

## Prerequisites & local preview

- **Node.js 24** is required (the project is pinned via `.nvmrc` and
  `package.json` `engines`; older versions fail the build). With
  [nvm](https://github.com/nvm-sh/nvm): `nvm install 24 && nvm use 24`.
- Install dependencies once with `pnpm install` (the repo uses pnpm; npm also
  works).
- Preview your changes locally before committing:

  ```bash
  npm run dev        # live-reload dev server at http://localhost:4321
  npm run build      # full production build (run this to catch errors before pushing)
  ```

  `npm run build` is what the deploy uses, so a green build locally means your
  change will deploy.

## Repository layout (the parts you'll touch)

| Path | What it holds |
| --- | --- |
| `src/content/posts/` | Blog posts (one Markdown file per post) |
| `src/content/pages/` | Standalone menu pages (About, Community, Research, …) |
| `public/assets/images/` | Images referenced by posts and pages |
| `twilight.config.yaml` | Site config, **including the navigation menu** |
| `src/content.config.ts` | Frontmatter schema for posts and pages |
| `WP-backup-20260531/` | **Archive — do not edit.** Frozen export of the old WordPress site, kept for reference only. |

> ⚠️ **Leave `WP-backup-20260531/` untouched.** It is a one-time backup of the
> previous WordPress page and is not part of the live site. Do not edit, move,
> or delete its contents.

---

## 1. Create a new blog post

### Quick start with the helper script

```bash
npm run new-post -- my-post-title
```

This creates `src/content/posts/my-post-title.md` with an empty frontmatter
template. **Recommended naming:** prefix the filename with the date, matching
the existing posts, e.g. `20260531-my-post-title.md`. The filename becomes part
of the URL (`/posts/20260531-my-post-title/`).

You can also just copy an existing file in `src/content/posts/` and edit it.

### Frontmatter fields

Every post starts with a YAML frontmatter block between `---` fences:

```yaml
---
title: A Clear, Human-Readable Title
published: 2026-05-31
author: Sebastian            # blogger's first name — shows as the byline
description: One or two sentences shown in listings and previews.
cover: "/assets/images/banner-conferences.jpg"
coverInContent: false        # true = also show the cover at the top of the article
tags: [Community, Announcement]
category: News
draft: false                 # true = hidden from the site (work in progress)
---
```

- **`title`** (required) — wrap in quotes if it contains a colon (`:`).
- **`published`** (required) — `YYYY-MM-DD`.
- **`author`** — the blogger's name. We use **first name only** (e.g.
  `Sebastian`). This appears as the byline on the post and in post listings. If
  omitted, no byline is shown.
- **`description`** — used for previews and SEO; keep it short.
- **`cover`** — path to an image under `public/` (so `/assets/images/…`). The
  existing posts reuse `/assets/images/banner-conferences.jpg`; add your own
  image to `public/assets/images/` if you want a custom one.
- **`tags`** / **`category`** — free-form; reuse existing ones where possible
  for consistency (browse current posts to see what's in use).
- **`draft: true`** — keeps the post out of the build until you're ready.

### Write the body

Everything below the closing `---` is standard Markdown (headings, links,
images, lists, code blocks). To embed an image stored in `public/`:

```markdown
![Alt text](/assets/images/my-figure.jpg)
```

### Where it shows up

Posts appear automatically — no menu edit needed:

- On the **Blog** menu item (which points to `/archive/`).
- In the homepage carousel / recent-posts list.
- At their own URL: `/posts/<filename-without-extension>/`.

Preview with `npm run dev`, confirm it looks right, then commit.

---

## 2. Edit an existing page

The menu pages (About, History, Conferences, Journal, etc.) are Markdown files
in `src/content/pages/`. The filename is the URL slug — e.g.
`src/content/pages/history.md` is served at `/history/`.

To edit one, just open the file and change the frontmatter or body:

```yaml
---
title: History
description: Short summary shown under the page title.
---

Markdown body goes here…
```

Pages support the same Markdown features as posts. Save, run `npm run dev`, and
check the page at its URL.

---

## 3. Add a new page and plug it into the menu

Adding a page is **two steps**: create the content file, then add a menu link.

### Step 1 — Create the page file

Create `src/content/pages/<slug>.md`, where `<slug>` is the URL you want. For a
page at `/resources/`:

```markdown
---
title: Resources
description: Helpful links and downloads for the community.
---

Your content here…
```

The route `/resources/` is generated automatically from the filename — you do
**not** need to create anything under `src/pages/`.

### Step 2 — Add it to the navigation menu

Open `twilight.config.yaml` and find the `navbar:` → `links:` section. Add a
link either as a **top-level item** or nested under an existing menu's
`children:`.

Top-level item:

```yaml
        - # Resources (top-level link)
            name: "Resources"
            url: "/resources/"
            icon: "material-symbols:folder"
            description: "Community resources"
```

As a child of an existing dropdown (e.g. under **Research**):

```yaml
            children:
                - name: "Resources"
                  url: "/resources/"
                  icon: "material-symbols:folder"
```

Notes:

- **`url`** must match your page slug with leading and trailing slashes
  (`/resources/`).
- **`icon`** uses [Material Symbols](https://fonts.google.com/icons) names in
  the form `material-symbols:<name>`, or any other
  [Iconify](https://icon-sets.iconify.design/) set already bundled (e.g.
  `fa6-brands:youtube` for external/brand links).
- `url` can also point to an **external** site (e.g. a YouTube channel) — see
  the existing "Video Channel" entry.

Run `npm run build` to confirm everything resolves, then commit both the new
content file and the `twilight.config.yaml` change together.

---

## 4. Publish your changes (Git → live site)

The site auto-deploys: **every push to the `main` branch** triggers a GitHub
Actions workflow (`.github/workflows/deploy.yml`) that rebuilds the site with
Node 24 and publishes it to GitHub Pages. There is **no manual upload step** —
pushing to `main` is what puts your change online (live within a minute or two).

Once you've made and previewed your edits:

```bash
# 1. Make sure your local main is current (avoids merge conflicts)
git checkout main
git pull

# 2. Build locally to catch errors before they reach the deploy
npm run build

# 3. Stage your changes
git add -A
#    (or stage specific files, e.g.)
# git add src/content/posts/20260531-my-post.md public/assets/images/my-pic.jpg

# 4. Commit with a short, descriptive message
git commit -m "Add blog post: my post title"

# 5. Push to GitHub — this kicks off the automatic deploy
git push origin main
```

After pushing, watch the **Actions** tab on GitHub
(<https://github.com/Ecohydraulics/ecohydraulics.github.io/actions>) to confirm
the build/deploy succeeds. The live site is <https://ecohydraulics.github.io/>.

Tips:

- Keep commits focused (one post, or one page + its menu link).
- Always run `npm run build` before pushing, so a typo in frontmatter or
  config doesn't break the deploy.
- **Never commit changes inside `WP-backup-20260531/`** — that folder is a
  frozen archive of the old WordPress site (see the table above).

## Site credits & footer

The footer (web-content creators, copyright, license links) lives in
`src/components/footer.astro`.
