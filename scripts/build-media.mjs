#!/usr/bin/env node
/**
 * build-media.mjs — derive web assets from the rights-limited research media library.
 *
 * Nothing here grants rights. Every derivative inherits the source's rights status and
 * stays review-only until the owner supplies cleared originals. The review badge is drawn
 * by the UI, never baked into pixels, so it can be removed in exactly one place.
 *
 * Requires ffmpeg + ffprobe on PATH. Run: npm run media
 */

import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, statSync, existsSync, rmSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const APP = resolve(HERE, '..');
const LIB = resolve(APP, '../website-research/media-library');
const OUT = resolve(APP, 'public/media');
const TMP = resolve(APP, '.media-tmp');

const REEL_FIRE = 'selected/motion/meat-platter-story-review-only.mp4';
const REEL_SERVE = 'selected/motion/shashlik-serving-review-only.mp4';

/**
 * Cuts chosen by stepping through both reels frame by frame (see notes).
 * People-free segments only: guests appear in REEL_SERVE from ~7.4s and in REEL_FIRE's
 * dining-room shots only as an empty laid table, so no release-required frame ships.
 * `segments` are concatenated in order, so a loop can be edited out of the reel's own footage.
 */
const CUTS = [
  {
    id: 'motion/fire',
    src: REEL_FIRE,
    // A longer breath for the hero arch: ribs settling over the coals, then the
    // smoke bank rolling through the lulya rank. Both shots are people-free.
    // Segment edges verified frame-by-frame: ribs cut to tomato-cutting at
    // ~17.95, smoke cuts to the banquet board at ~22.4 — live inside both.
    segments: [[16.3, 1.55], [21.4, 0.95]],
    poster: 17.0,
    quality: 23,
    enhance: true,
    focus: 0.62,
    note: 'lamb ribs over coals, then smoke rolling over the skewers',
  },
  {
    id: 'motion/craft',
    src: REEL_FIRE,
    segments: [[18.3, 2.4]],
    poster: 19.0,
    quality: 29,
    focus: 0.5,
    note: 'tomatoes sliced on the pass',
  },
  {
    id: 'motion/room-table',
    src: REEL_FIRE,
    segments: [[25.0, 2.2]],
    poster: 25.8,
    quality: 28,
    focus: 0.46,
    note: 'the long table laid for a celebration — empty, no guests in frame',
  },
  {
    id: 'motion/platter',
    src: REEL_FIRE,
    segments: [[23.3, 1.4], [0.2, 1.8]],
    poster: 23.8,
    quality: 29,
    focus: 0.5,
    note: 'overhead sharing platters',
  },
  {
    id: 'motion/storefront',
    src: REEL_FIRE,
    segments: [[5.2, 2.4]],
    poster: 6.6,
    quality: 29,
    focus: 0.34,
    note: '1920 Avenue U storefront, daylight sign into the night neon',
  },
  {
    id: 'motion/serving',
    src: REEL_SERVE,
    segments: [[3.2, 3.4], [10.1, 0.9]],
    poster: 4.2,
    quality: 28,
    focus: 0.55,
    note: 'kebabs and red onion carried on the wooden board; lulya close-up',
  },
];

const STILLS = [
  'selected/hero/grill-skewers-smoke-review-only.jpg',
  'selected/hero/current-padishah-logo-poster-crop-review-only.png',
  'selected/hero/current-brand-grand-opening-poster-review-only.jpg',
  'selected/food/grill-skewers-closeup-review-only.jpg',
  'selected/food/kebab-on-bread-review-only.jpg',
  'selected/food/samsa-trays-review-only.jpg',
  'selected/food/kebab-smoke-review-only.jpg',
  'selected/food/chebureki-review-only.webp',
  'selected/location/storefront-2025-review-only.jpg',
  'selected/people/chef-fruit-platter-release-required.jpg',
];

/**
 * Stills lifted from single reel frames — the phone photos in the library have four
 * clashing white balances and crumpled-foil backgrounds, while the reel's composed
 * platter shots read like an actual food story. A frame is a derivative like any cut:
 * it inherits the reel's rights verbatim and ships with the same review badge.
 * Cropped to one 4:5 ratio so the kitchen strip reads as a set, not a camera roll.
 */
const FRAME_STILLS = [
  {
    id: 'food/platter-overhead',
    src: REEL_FIRE,
    t: 0.55,
    focus: 0.5,
    note: 'overhead sharing board: grilled meat, fries, cherry tomatoes',
  },
  {
    id: 'food/skewer-ranks',
    src: REEL_FIRE,
    t: 15.2,
    focus: 0.42,
    note: 'hands laying kebab skewers in ranks',
  },
  {
    id: 'food/salmon-grill',
    src: REEL_FIRE,
    t: 10.4,
    focus: 0.38,
    note: 'salmon fingers with balsamic glaze on wood',
  },
];

const ff = (args) => execFileSync('ffmpeg', ['-y', '-v', 'error', ...args], { stdio: ['ignore', 'pipe', 'pipe'] });
const probe = (file) =>
  JSON.parse(
    execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'json', file], {
      encoding: 'utf8',
    }),
  ).streams[0];

const idOf = (p) =>
  `${p.split('/')[1]}/${p
    .split('/')
    .pop()
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/-(review-only|release-required)$/, '')}`;

const size = (f) => statSync(f).size;
const rel = (f) => '/media/' + f.slice(OUT.length + 1);

rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });
for (const d of ['motion', 'hero', 'food', 'location', 'people']) mkdirSync(join(OUT, d), { recursive: true });

const assets = {};

/** Tiny blurred placeholder so nothing pops in as a grey box. */
function lqip(input) {
  const p = join(TMP, 'lqip.jpg');
  ff(['-i', input, '-frames:v', '1', '-vf', 'scale=20:-2', '-q:v', '12', p]);
  return `data:image/jpeg;base64,${readFileSync(p).toString('base64')}`;
}

/* ------------------------------------------------------------------ video */

/**
 * Build one encode by concatenating the chosen segments.
 *
 * The segments are cut with the `trim` filter, not with per-input `-ss`: input seeking
 * across several inputs of the same file landed ~2s early on these reels and silently
 * shipped the wrong shot. Frame-accurate trimming is worth the extra decode.
 */
function encodeCut(src, cut, outFile, tail) {
  const args = ['-i', src];
  const n = cut.segments.length;
  const chain = cut.segments
    .map(([ss, t], i) => `[0:v]trim=start=${ss}:end=${(ss + t).toFixed(3)},setpts=PTS-STARTPTS,${tail}[v${i}]`)
    .join(';');
  const concat = cut.segments.map((_, i) => `[v${i}]`).join('') + `concat=n=${n}:v=1:a=0[out]`;
  args.push(
    '-filter_complex', `${chain};${concat}`,
    '-map', '[out]', '-an',
    '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p',
    '-crf', String(cut.quality ?? 28), '-preset', 'slow', '-movflags', '+faststart',
    outFile,
  );
  ff(args);
}

for (const cut of CUTS) {
  const src = resolve(LIB, cut.src);
  const [group, name] = cut.id.split('/');
  const base = join(OUT, group, name);
  const duration = cut.segments.reduce((n, [, t]) => n + t, 0);

  // IG re-compression leaves mosquito noise that x264 then spends bits preserving;
  // a light denoise + gentle unsharp reads as a cleaner lens, not a filter.
  const clean = cut.enhance ? 'hqdn3d=1.5:1.5:4:4,unsharp=5:5:0.35:5:5:0,' : '';

  // Mobile / portrait master: the reels are already 9:16, so this never upscales.
  const portrait = `${base}-portrait.mp4`;
  encodeCut(src, cut, portrait, `${clean}scale=810:-2,fps=25,setsar=1,format=yuv420p`);

  // Desktop / landscape: centre-crop the 9:16 source to 16:9 and keep the food in frame.
  const landscape = `${base}-landscape.mp4`;
  // 16:9 out of a 9:16 source: the anchor decides whether we keep the coals or the ceiling.
  const focus = cut.focus ?? 0.5;
  encodeCut(
    src,
    cut,
    landscape,
    `${clean}crop=iw:iw*9/16:0:(ih-iw*9/16)*${focus},scale=1080:-2,fps=25,setsar=1,format=yuv420p`,
  );

  const poster = `${base}-poster.jpg`;
  ff(['-i', src, '-vf', `select='gte(t,${cut.poster})',scale=720:-2`, '-frames:v', '1', '-fps_mode', 'passthrough', '-q:v', '5', poster]);

  const pp = probe(portrait);
  const lp = probe(landscape);
  const po = probe(poster);

  assets[cut.id] = {
    poster: { src: rel(poster), width: po.width, height: po.height, bytes: size(poster) },
    lqip: lqip(poster),
    sources: [
      { src: rel(portrait), width: pp.width, height: pp.height, bytes: size(portrait) },
      { src: rel(landscape), width: lp.width, height: lp.height, bytes: size(landscape) },
    ],
    durationSeconds: Number(duration.toFixed(2)),
    note: cut.note,
    derivedFrom: cut.src,
    segments: cut.segments,
  };
  console.log(`video ${cut.id}: ${(size(portrait) / 1024).toFixed(0)}KB portrait / ${(size(landscape) / 1024).toFixed(0)}KB landscape`);
}

/* ------------------------------------------------------------------ image */

for (const relPath of STILLS) {
  const src = resolve(LIB, relPath);
  if (!existsSync(src)) {
    console.warn(`missing still: ${relPath}`);
    continue;
  }
  const id = idOf(relPath);
  const [group, name] = id.split('/');
  const meta = probe(src);
  const widths = [...new Set([Math.min(meta.width, 1200), Math.min(meta.width, 640)])].sort((a, b) => a - b);

  const sources = [];
  for (const w of widths) {
    // ffmpeg on this machine has no libwebp; cwebp does the WebP encode.
    const webp = join(OUT, group, `${name}-${w}.webp`);
    execFileSync('cwebp', ['-quiet', '-q', '78', '-resize', String(w), '0', src, '-o', webp]);
    const jpg = join(OUT, group, `${name}-${w}.jpg`);
    ff(['-i', src, '-vf', `scale=${w}:-2`, '-q:v', '6', jpg]);
    const p = probe(jpg);
    sources.push({ src: rel(webp), width: p.width, height: p.height, bytes: size(webp) });
    sources.push({ src: rel(jpg), width: p.width, height: p.height, bytes: size(jpg) });
  }

  assets[id] = { lqip: lqip(src), sources, derivedFrom: relPath };
  console.log(`image ${id}: ${sources.map((s) => `${(s.bytes / 1024).toFixed(0)}KB`).join(' / ')}`);
}

/* ------------------------------------------------------ stills from frames */

for (const frame of FRAME_STILLS) {
  const src = resolve(LIB, frame.src);
  const [group, name] = frame.id.split('/');

  // One frame, cropped 9:16 -> 4:5 around the composition's anchor.
  const master = join(TMP, `${name}.png`);
  ff([
    '-i', src,
    '-vf', `select='gte(t,${frame.t})',crop=iw:iw*5/4:0:(ih-iw*5/4)*${frame.focus ?? 0.5}`,
    '-frames:v', '1', '-fps_mode', 'passthrough',
    master,
  ]);

  const meta = probe(master);
  const widths = [...new Set([Math.min(meta.width, 1080), Math.min(meta.width, 640)])].sort((a, b) => a - b);
  const sources = [];
  for (const w of widths) {
    const webp = join(OUT, group, `${name}-${w}.webp`);
    execFileSync('cwebp', ['-quiet', '-q', '80', '-resize', String(w), '0', master, '-o', webp]);
    const jpg = join(OUT, group, `${name}-${w}.jpg`);
    ff(['-i', master, '-vf', `scale=${w}:-2`, '-q:v', '5', jpg]);
    const p = probe(jpg);
    sources.push({ src: rel(webp), width: p.width, height: p.height, bytes: size(webp) });
    sources.push({ src: rel(jpg), width: p.width, height: p.height, bytes: size(jpg) });
  }

  assets[frame.id] = {
    lqip: lqip(master),
    sources,
    derivedFrom: frame.src,
    frameAtSeconds: frame.t,
    note: frame.note,
  };
  console.log(`frame ${frame.id}: ${sources.map((s) => `${(s.bytes / 1024).toFixed(0)}KB`).join(' / ')}`);
}

rmSync(TMP, { recursive: true, force: true });

writeFileSync(
  join(OUT, 'derivatives.json'),
  JSON.stringify(
    {
      generatedFrom: 'website-research/media-library',
      rightsNote:
        'Every derivative is review-only. No source in this library is production-cleared. ' +
        'Replace with owner-supplied originals before launch.',
      assets,
    },
    null,
    2,
  ),
);

const total = Object.values(assets).reduce(
  (n, a) => n + (a.poster?.bytes ?? 0) + a.sources.reduce((m, s) => m + s.bytes, 0),
  0,
);
console.log(`\nmedia: ${Object.keys(assets).length} assets, ${(total / 1024 / 1024).toFixed(1)} MB on disk -> public/media/`);
