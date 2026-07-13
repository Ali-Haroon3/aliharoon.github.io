# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Ali Haroon's personal portfolio — a **static site** with no build step, deployed via
**GitHub Pages** to the custom domain in `CNAME` (`www.ali-haroon.com`). Pushing to
`main` publishes; there is nothing to compile, bundle, or transpile.

The site is the **Fortnite-themed portfolio** (root `index.html`, `styles.css`,
`script.js`). It boots through CONNECTING → loading screen → lobby, then an interactive
Fortnite Reload island map where POIs open resume panels (experience, projects, skills,
education, contact, about, and a dedicated Résumé Ridge with the PDF download). The
island image loads at runtime from the public `yaelbrinkert/fortnite-archives` project
(`latest/blastberry_latest.png`); an original hand-drawn SVG island is the fallback.
**Never commit Epic Games imagery, audio, or fonts into this repo**, and keep the Epic
fan-content disclaimer visible on the page. The canonical dev copy of these files lives
in the `Ali-Haroon3/Ali-Moin-Haroon` repo under `fortnite/`; keep the two in sync.

`Ali_Haroon_Resume.pdf` and `resume.html` (a meta-refresh to the PDF) live at the repo
root; the Résumé Ridge POI links to the PDF. `me.jpg` is Ali's headshot used on the
About panel. `favicon.svg` is the A-monogram logo.

## The previous ("classic") site

The earlier BootstrapMade iPortfolio dark site used to live here at `/classic/`. It was
removed from the live site (Ali wanted only the Fortnite version) and archived to the
`Ali-Haroon3/Ali-Moin-Haroon` repo under `classic-archive/`. Do not re-add it here
unless Ali asks.

## Design rules for the Fortnite site (Ali's preferences)

- No emojis in the UI — inline SVG icons only (sprite at the top of `index.html`).
- No gradient blends — flat colors, hard-edged offset shadows, angled `clip-path`
  corners, hard-stop stripes. Matches actual Fortnite UI.
- Display font Anton (legal stand-in for Burbank; never embed pirated Burbank),
  body font Inter. Palette pinned in `styles.css` `:root` — ocean `#103a8c` and grass
  `#318218` sampled from the map; standard Fortnite rarity colors; CTA yellow; storm purple.
- Copy is short, first-person, and plain — no winking meta-jokes.
- Logo is a single bold "A" with a cut triangle counter on a purple app-icon tile
  (`#logo-ah` symbol + `favicon.svg`).

## Local preview

```bash
python3 -m http.server 8000    # repo root → http://localhost:8000/
```

The Fortnite site accepts `?mapimg=<url>` to test the map from a local image when the
network can't reach GitHub raw URLs (useful in sandboxes).
