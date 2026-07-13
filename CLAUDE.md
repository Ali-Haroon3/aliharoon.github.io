# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Ali Haroon's personal portfolio — a **static site** with no build step, deployed via
**GitHub Pages** to the custom domain in `CNAME` (`www.ali-haroon.com`). Pushing to
`main` publishes; there is nothing to compile, bundle, or transpile.

Two sites live here:

- **Root (`index.html`, `styles.css`, `script.js`)** — the Fortnite-themed portfolio,
  now the main site. Vanilla HTML/CSS/JS. It boots through CONNECTING → loading screen →
  lobby, then an interactive Reload-island map where six POIs open resume panels.
  The island image loads at runtime from the public `yaelbrinkert/fortnite-archives`
  project (`latest/blastberry_latest.png`); an original hand-drawn SVG island is the
  fallback. **Never commit Epic Games imagery, audio, or fonts into this repo**, and
  keep the Epic fan-content disclaimer visible on the page. The canonical dev copy of
  these three files lives in the `Ali-Haroon3/Ali-Moin-Haroon` repo under `fortnite/`;
  keep the two in sync when editing (root copy points its Classic links at `/classic/`).
- **`classic/`** — the previous BootstrapMade iPortfolio site, fully intact and served
  at `/classic/`. Everything under it is self-contained (its `assets/`, `forms/`, and a
  copy of the resume PDF moved with it). See the notes below before editing it.
- **`fortnite/`** — just a meta-refresh redirect to `/` (the old URL of the Fortnite
  site; keep it so shared links don't break).

`Ali_Haroon_Resume.pdf` and `resume.html` (a meta-refresh to the PDF) stay at the
repo root. Keep the root PDF and `classic/Ali_Haroon_Resume.pdf` in sync.

## Design rules for the Fortnite site (Ali's preferences)

- No emojis in the UI — inline SVG icons only (sprite at the top of `index.html`).
- No gradient blends — flat colors, hard-edged offset shadows, angled `clip-path`
  corners, hard-stop stripes. Matches actual Fortnite UI.
- Display font Anton (legal stand-in for Burbank; never embed pirated Burbank),
  body font Inter. Palette pinned in `styles.css` `:root` — ocean `#103a8c` and grass
  `#318218` sampled from the map; standard Fortnite rarity colors; CTA yellow; storm purple.
- Copy is short, first-person, and plain — no winking meta-jokes.

## Notes on the classic site (`classic/`)

Built on the BootstrapMade iPortfolio template. `classic/index.html` is a one-page
layout; the active stylesheet/script are `classic/assets/css/style.css` and
`classic/assets/js/main.js` (a `# SPATIAL DARK OVERHAUL` block at the end of the CSS
owns the current dark look; the hero is a three.js canvas in
`classic/assets/js/hero3d.js`, gated behind WebGL + reduced-motion checks).
`classic/style.css` and `classic/script.js` are orphaned pre-template files — editing
them does nothing. Vendored libraries under `classic/assets/vendor/` are read-only.
The contact form stub (`classic/forms/contact.php`) is non-functional; contact is the
copy-email button.

## Local preview

```bash
python3 -m http.server 8000    # repo root → http://localhost:8000/ (fortnite) and /classic/
```

The Fortnite site accepts `?mapimg=<url>` to test the map from a local image when the
network can't reach GitHub raw URLs (useful in sandboxes; headless browsers also can't
render the classic hero's WebGL — check it in a real browser).
