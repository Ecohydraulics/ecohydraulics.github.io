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

## Deployment

### Short version

```
git add -A && git commit -m "..." && git push   # pushes to main, workflow rebuilds
```

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
