# Padishah Restaurant — review build

A private preview of the website for **Padishah Restaurant, 1920 Avenue U, Brooklyn, NY 11229**.
It is not the restaurant's published site and it is `noindex` on every page.

Design contract: [`../DESIGN-BIBLE.md`](../DESIGN-BIBLE.md).
Facts, menu, media rights and the approval checklist live in [`../website-research/`](../website-research/).

## Run it

```bash
npm install
npm run media     # ffmpeg: cuts the loops and stills out of the research library (~2 min)
npm run dev       # http://localhost:4480
```

```bash
npm run build && npm test    # static export into out/ + 18 compliance assertions
```

`npm run media` only needs re-running when the cuts in `scripts/build-media.mjs` change or the
restaurant supplies new originals. `npm run content` (run automatically before dev and build)
regenerates the typed content modules from the research JSON.

## How it is put together

```
scripts/build-content.mjs   research JSON  ->  src/content/generated/*.ts   (the only bridge)
scripts/build-media.mjs     reels + stills ->  public/media/*               (ffmpeg)
scripts/check-production-gate.mjs           the fail-closed launch gate
src/content/copy.ts         every string, EN + RU, drafts marked
src/components/motion/      tier detection, one canvas, two WebGL scenes
public/fonts/               self-hosted Cormorant Garamond + Manrope, Cyrillic included
test/                       claims, prices, rights, private data, banner
```

Nothing on the site is hand-copied from the research package. Correct a fact in
`website-research/data/*.json`, re-run the content build, and the site follows.

## Content flow

The generator reads business facts, menu data, production approvals, review snapshots, the media
manifest and the bilingual alt-text file. It never reads the private NYC health snapshot.

Research menu prices are kept only as `researchPriceCents`; the public `priceCents` stays `null`
until `website-research/data/production-approvals.json` carries a menu approval date. In review
mode one explicit control on `/menu` reveals the dated research prices, labelled as research.
Beef Soup — listed publicly at `$0.00` — can never render a price at all.

## What the WebGL layer does

- **Hearth** (hero + fire chapter, desktop and mobile): procedural smoke, coal glow and embers
  composited over the restaurant's own grill footage. Two draw calls, no textures, no lights.
- **Passage** (desktop only): the crowned cartouche of the restaurant's mark, extruded and lit by
  a hand-painted gold matcap, that the page travels through between the fire and the room.

It never runs under `prefers-reduced-motion`, save-data, a WebGL failure, or on a device that
measures too slow — and the page is complete without it. Turn it off for a session with
`localStorage.setItem('padishah.motion','off')`.

## Build gates

`npm run build` checks `src/` and `public/` before building and the exported `out/` afterwards.
It rejects private health-data references and Instagram CDN URLs in both modes.

`SITE_REVIEW_MODE=false npm run build` additionally rejects every referenced media asset unless
its manifest entry is `production_approved: true` with an approved rights status, and requires
the explicit owner values in `production-approvals.json`. Production cannot ship by accident.

Restaurant JSON-LD is omitted entirely in review mode. In production it carries only the verified
name, address, phone, Instagram and directions; unapproved hours, ratings, cuisine, reservations
and certifications are excluded.

## Still blocking launch

Everything in `../website-research/CLIENT-APPROVAL-CHECKLIST.md`, and specifically:

1. **Media.** No file in the library is cleared. The site needs current 2026 originals: storefront,
   dining room, 6–10 dish photos, one clean vertical grill video. Every identifiable person needs a
   release. Ask for watermark-free exports.
2. **Logo.** Only a raster crop of the June 2026 poster exists. Ask for SVG/AI/EPS.
3. **Menu.** Confirm all 42 names, prices and availability; resolve Beef Soup's `$0.00`, the
   duplicate Samsa, and the spellings of Guja, Mastava, Chalahach and Jiz-Biz.
4. **Hours** and the **cuisine wording**. Note that the storefront sign in the restaurant's own
   footage reads *"Uzbek & European Cuisine"*, which does not match the wording proposed here —
   the owner should pick one.
5. **Halal.** The 2026 poster claims all dishes are halal. Publish only with owner-approved wording;
   no independent certification was found.
6. **Ordering and reservations.** Choose the canonical link and the booking process.
7. **Ratings.** Decide whether public ratings may be shown at all (currently they are not).

`data/nyc-health-snapshot.json` is private launch due diligence and must never become site
content — the build, the gate and a test all enforce that.
