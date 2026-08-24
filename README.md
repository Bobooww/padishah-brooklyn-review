# Padishah Restaurant — private review build

A private preview of the website for **Padishah Restaurant, 1920 Avenue U, Brooklyn, NY 11229**.
It is not the restaurant's published site: every page is `noindex`, and the deploy also sends
`X-Robots-Tag: noindex, nofollow`.

**About the media.** Everything in `public/media/` is the restaurant's own footage and photography,
supplied by the owner, who has agreed to this repository being public (2026-08-24, relayed by the
project owner). Two notes remain for whoever ships this to production:

- `motion/plated-spin` is derived from a clip where hands appear at the frame edges; the media
  ledger still marks it `people_release_required`, and the site renders that badge on it.
- The two `hero/` brand images are crops of the restaurant's own poster and social artwork.

The machine-readable rights ledger (`website-research/media-library/manifest.json`) and the
production gate still record every asset as **not production-approved** — that flag flips only when
written owner approval with a date is filed in `production-approvals.json`. Publishing this
repository does not change what the site is allowed to launch with.

Live review link: https://padishah-brooklyn-review.netlify.app

## Run it

```bash
npm install
npm run media     # ffmpeg: cuts the loops and stills out of the research library
npm run dev       # http://localhost:4480
npm run build && npm test   # static export into out/ + 18 compliance assertions
```

Deploy: `npx netlify deploy --prod --dir=out` (Netlify project `padishah-brooklyn-review`).

## How it is put together

```
scripts/build-content.mjs   research JSON  ->  src/content/generated/*.ts   (the only bridge)
scripts/build-media.mjs     originals      ->  public/media/*              (ffmpeg)
scripts/check-production-gate.mjs           the fail-closed launch gate
src/content/copy.ts         every string, EN + RU
src/components/Chapters.tsx the tabbed kitchen gallery
src/components/Stories.tsx  the swipe rail
src/lib/cinema.ts           GSAP scroll choreography (off under reduced motion)
src/components/motion/      WebGL hearth + cartouche passage, tier-gated
test/                       claims, prices, rights, private data, banner
```

Nothing on the site is hand-copied. Correct a fact in the research package, re-run the content
build, and the site follows.

Menu and prices come from the restaurant's own Clover inventory export (2026-08-17): 143 dishes
across eight categories.

## Still blocking a public launch

Written owner approval for hours, the logo master, the canonical ordering link and the
reservation process. The production gate refuses to build with `SITE_REVIEW_MODE=false` until
those are filled in, and refuses any media that is not explicitly cleared.

The design contract is `DESIGN-BIBLE.md` in the parent folder; facts, menu data, media rights and
the approval checklist live in the `website-research/` package next to it.
