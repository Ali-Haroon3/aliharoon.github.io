# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Ali Haroon's personal portfolio — a **static site** with no build step, deployed via **GitHub Pages** to the custom domain in `CNAME` (`www.ali-haroon.com`). Pushing to `main` publishes; there is nothing to compile, bundle, or transpile.

It is built on the BootstrapMade **iPortfolio** Bootstrap template (see the header comment in `assets/js/main.js`). Most of `assets/` is vendored, third-party template code.

## Commands

There are no build/lint/test tools. To preview locally, serve the repo root with any static server:

```bash
python3 -m http.server 8000      # then open http://localhost:8000
```

The repo also ships a Replit config (`.replit` + `.config/static-web-server.toml`) that runs `static-web-server` on port 80 with all caching disabled — that path is Replit-specific and not needed for normal local work.

## Architecture

- **`index.html` is the entire site.** It is a one-page layout; the navbar links (`#hero`, `#about`, `#resume`, `#portfolio`, `#contact`) are in-page anchors, and `assets/js/main.js` drives the scrollspy that highlights the active section. To change site content, edit the corresponding `<section>` in `index.html`.
- **`portfolio-details.html`** and **`inner-page.html`** are secondary template pages (portfolio project detail view / generic inner page). `resume.html` is just a meta-refresh redirect to `/Ali_Haroon_Resume.pdf`.
- **Active stylesheet/script:** every page links `assets/css/style.css` and loads `assets/js/main.js`. These are the files to edit.
- **Design system (custom):** `assets/css/style.css` is the stock iPortfolio CSS retrofitted with a design system. A `:root` token block near the top defines the palette (`--accent` vermillion, `--bg`/`--paper*` warm neutrals, `--ink*`) and fonts (`--font-display` Bricolage Grotesque, `--font-body` IBM Plex Sans, `--font-mono` IBM Plex Mono). The template's hardcoded colors/fonts were globally replaced with these tokens, and an appended **`# UPGRADE LAYER`** block at the end of the file owns the hero poster treatment, motion (CSS hero entrance + tuned AOS), and micro-interactions. When restyling, change tokens or extend the UPGRADE LAYER — do **not** reintroduce the stock cyan (`#149ddd`) or generic fonts. Fonts load via the Google Fonts `<link>` in each page's `<head>`.
- **3D / depth layer:** a `# 3D / DEPTH LAYER` block at the very end of `style.css` plus a second self-contained IIFE at the end of `main.js` add pointer-tilt project cards (`.portfolio-wrap[data-tilt]` inside a `.tilt-scene` perspective wrapper, depth via `translateZ` planes + cursor sheen), `rotateX` scroll reveals (`[data-reveal]` → `.in-view`, hidden state scoped to `.js-reveal` so no-JS stays visible), the mono `01 / SECTION` ribs (`.section-title[data-index]::before`), and hero mouse-parallax. All pointer motion is gated behind `matchMedia('(hover:hover) and (pointer:fine)')` + `prefers-reduced-motion`; touch/reduced-motion get flat, fully-functional cards. The project cards are flat (no hover-reveal overlay): `.portfolio-media-link` (whole tile is a real link) + always-visible `.portfolio-body` (desc, tech chips, labeled `.card-link` action buttons). The second IIFE in `main.js` **must** stay prefixed with `;` — the template's first IIFE has no trailing semicolon.
- **Spatial-dark overhaul (current look):** the site was redesigned away from the iPortfolio sidebar into a **full-bleed dark** layout. A `# SPATIAL DARK OVERHAUL` block at the very end of `style.css` flips the `:root` tokens to a dark palette (so every var-based rule re-themes) and re-styles layout: the old fixed `#header` sidebar is `display:none` and replaced by a fixed **`#topnav`** (brand + `#navbar` links + social/CTA + `.mobile-nav-toggle`); `#main`'s `margin-left` is zeroed; surfaces (skills/portfolio/contact cards) become translucent "glass". Scrollspy still keys off `#navbar .scrollto`; the mobile menu still toggles `body.mobile-nav-active`. **The hero** is a `<canvas id="hero-canvas">` driven by **`assets/js/hero3d.js`** — an ES module (`<script type="module">`) that imports **three.js from the jsDelivr CDN** and renders an interactive point-field. It is gated by a WebGL probe + `prefers-reduced-motion` and wrapped in try/catch, so no-WebGL / reduced-motion / offline all fall back silently to the CSS hero (overlay gradient + `body::before` glow). Note: a **headless browser without a GPU cannot render the WebGL hero** — verify it in a real browser.
- **Vendored libraries** live under `assets/vendor/` (Bootstrap, AOS, typed.js, isotope, swiper, glightbox, purecounter, boxicons, bootstrap-icons). Treat these as read-only — do not hand-edit; the page wires them up in `main.js`.

### Gotchas specific to this repo

- **`/style.css` and `/script.js` at the repo root are orphaned.** No HTML file references them (they predate the iPortfolio template). Editing them has no effect on the live site — change `assets/css/style.css` and `assets/js/main.js` instead.
- **`assets/js/main.js` mixes template code with custom code.** The bulk is stock iPortfolio (scrollspy, mobile nav toggle, typed.js intro, isotope portfolio filtering, glightbox, swiper, AOS, purecounter). The custom additions are appended at the end — notably the **`#copy-email-btn` clipboard handler** (~line 265). Add new custom behavior there rather than mid-file.
- **The contact section has no working form.** `forms/contact.php` is a non-functional template stub (requires the template's paid "PHP Email Form" library, which is absent — and GitHub Pages cannot run PHP regardless). Contact is handled client-side via the Copy Email button and social links.
- **The resume PDF (`Ali_Haroon_Resume.pdf`) lives at the repo root** and is what `resume.html` and the resume links point to. A second copy exists under `attached_assets/` — keep the root one in sync when updating the resume.
