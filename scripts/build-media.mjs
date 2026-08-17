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
import { basename, dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const APP = resolve(HERE, '..');
const LIB = resolve(APP, '../website-research/media-library');
const OUT = resolve(APP, 'public/media');
const TMP = resolve(APP, '.media-tmp');

const REEL_FIRE = 'selected/motion/meat-platter-story-review-only.mp4';
const REEL_SERVE = 'selected/motion/shashlik-serving-review-only.mp4';
/** 4K originals supplied by the owner's side over Telegram, 2026-08-16. */
/** The client-curated definitive folder, 2026-08-16. The sites use ONLY this. */
const CS = 'originals/client-supplied/2026-08-16-padishah-final';

const CUTS = [
  {
    id: 'motion/fire',
    src: `${CS}/IMG_6572.MOV`,
    segments: [[3.0, 2.2], [14.0, 1.8]],
    poster: 4.0,
    quality: 23,
    focus: 0.5,
    note: 'lulya kebabs over coals in heavy smoke — 4K',
  },
  {
    id: 'motion/mangal',
    src: `${CS}/IMG_5911.MOV`,
    segments: [[0.8, 3.0]],
    poster: 1.6,
    quality: 23,
    focus: 0.55,
    note: 'shashlik over glowing red coals — 4K',
  },
  {
    id: 'motion/raw-rank',
    src: `${CS}/IMG_6584.MOV`,
    segments: [[2.0, 3.0]],
    poster: 3.0,
    quality: 23,
    focus: 0.5,
    note: 'raw lamb skewers in ranks, headed for the grill — 4K',
  },
  {
    id: 'motion/ribs-fries',
    src: `${CS}/IMG_6593.MOV`,
    segments: [[0.6, 2.6]],
    poster: 1.4,
    quality: 23,
    focus: 0.5,
    note: 'cooked ribs piled over fries — 4K',
  },
  {
    id: 'motion/meat-board',
    src: `${CS}/IMG_6595 (1).MOV`,
    segments: [[1.2, 2.8]],
    poster: 2.4,
    quality: 23,
    focus: 0.5,
    note: 'overhead pan of the shashlik board — 4K',
  },
  {
    id: 'motion/banquet-grand',
    src: `${CS}/IMG_0013.MOV`,
    // the long pan, sampled where the table reads clean (no soda in frame)
    segments: [[34.0, 3.2], [50.0, 2.8]],
    poster: 35.4,
    quality: 24,
    focus: 0.45,
    note: 'the grand banquet table pan — 4K, chairs empty',
  },
  {
    id: 'motion/storefront-walk',
    src: `${CS}/IMG_1734.MOV`,
    segments: [[0.3, 3.0], [4.6, 2.6]],
    poster: 1.0,
    quality: 26,
    focus: 0.45,
    note: 'the Padishah storefront, then a walk into the room (352px source)',
  },
  {
    id: 'motion/terrace',
    src: `${CS}/IMG_1732.MOV`,
    segments: [[0.3, 3.0]],
    poster: 1.2,
    quality: 26,
    focus: 0.45,
    note: 'the flower terrace (352px source)',
  },
  {
    id: 'motion/plated-spin',
    // client swap 2026-08-17: the table take replaces the kitchen take
    src: `${CS}/IMG_5309.MOV`,
    segments: [[0.6, 4.2]],
    poster: 1.6,
    quality: 25,
    focus: 0.5,
    note: 'the pedestal salad on the laid table (720px source)',
  },
  {
    id: 'motion/dessert-glasses',
    src: `${CS}/IMG_9913.MOV`,
    segments: [[2.0, 3.6]],
    poster: 3.0,
    quality: 26,
    focus: 0.5,
    note: 'dessert glasses and fruit plates (352px source)',
  },
  {
    id: 'motion/furshet',
    src: `${CS}/IMG_9722.MP4`,
    segments: [[3.0, 3.2]],
    poster: 4.0,
    quality: 26,
    focus: 0.5,
    note: 'furshet salads with potato nests (352px source, caterer watermark)',
  },
  {
    id: 'motion/meat-platter',
    src: `${CS}/document_4911352440789403409.mp4`,
    segments: [[0.8, 3.2]],
    poster: 1.6,
    quality: 26,
    focus: 0.5,
    note: 'meat platter closeups (464px source)',
  },
  {
    id: 'motion/table-cards',
    src: `${CS}/IMG_0995.MOV`,
    segments: [[1.0, 3.4]],
    poster: 2.0,
    quality: 26,
    focus: 0.5,
    note: 'banquet setting closeups (352px source)',
  },
  {
    id: 'motion/hall-sign',
    src: `${CS}/IMG_1341.MOV`,
    segments: [[6.5, 3.4]],
    poster: 8.0,
    quality: 26,
    focus: 0.45,
    note: 'the hall under the glowing gold sign (352px source)',
  },
];

const STILLS = [
  'selected/hero/current-padishah-logo-poster-crop-review-only.png',
  'selected/hero/current-brand-grand-opening-poster-review-only.jpg',
  `${CS}/IMG_5846.HEIC`,
  `${CS}/IMG_5907.HEIC`,
  `${CS}/photo_4904754040042884388_y.jpg`,
  `${CS}/photo_4904754040042884390_y.jpg`,
  `${CS}/photo_4904754040042884391_y.jpg`,
];

const STILL_ID_OVERRIDES = {
  [`${CS}/IMG_5846.HEIC`]: 'food/samsa-trays-new',
  [`${CS}/IMG_5907.HEIC`]: 'food/cold-platter-new',
  [`${CS}/photo_4904754040042884388_y.jpg`]: 'food/noodle-tower',
  [`${CS}/photo_4904754040042884390_y.jpg`]: 'food/salad-crown',
  [`${CS}/photo_4904754040042884391_y.jpg`]: 'food/noodle-plate',
};

/** Fractional region crops for stills whose edges carry clutter. */
const STILL_CROPS = {};

const FRAME_STILLS = [
  {
    id: 'food/lulya-smoke',
    src: `${CS}/IMG_6572.MOV`,
    t: 8.0,
    focus: 0.5,
    note: 'the lulya rank in smoke — 4K frame',
  },
  {
    id: 'food/board-overhead',
    src: `${CS}/IMG_6595 (1).MOV`,
    t: 3.4,
    focus: 0.5,
    note: 'the shashlik board from above — 4K frame',
  },
  {
    id: 'food/storefront-print',
    src: `${CS}/IMG_1734.MOV`,
    t: 0.8,
    focus: 0.25,
    note: 'the Padishah sign over the flowered entrance — for the hero print',
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
  let src = resolve(LIB, relPath);
  if (!existsSync(src)) {
    console.warn(`missing still: ${relPath}`);
    continue;
  }
  // ffmpeg on this machine cannot decode HEIC; sips can.
  if (/\.heic$/i.test(src)) {
    const converted = join(TMP, basename(src).replace(/\.heic$/i, '.jpg'));
    execFileSync('sips', ['-s', 'format', 'jpeg', src, '--out', converted], { stdio: 'ignore' });
    src = converted;
  }
  const id = STILL_ID_OVERRIDES[relPath] ?? idOf(relPath);
  const [group, name] = id.split('/');
  if (STILL_CROPS[relPath] !== undefined) {
    // bake EXIF rotation first: ffprobe reports sensor dims, ffmpeg decodes rotated
    const baked = join(TMP, `baked-${basename(src)}.jpg`);
    ff(['-i', src, '-q:v', '2', baked]);
    src = baked;
    const dims = probe(src);
    const r = STILL_CROPS[relPath];
    const cw = Math.round(dims.width * r.w);
    const ch = Math.round(dims.height * r.h);
    const cx = Math.round(dims.width * r.x);
    const cy = Math.round(dims.height * r.y);
    const cropped = join(TMP, `crop-${basename(src)}.jpg`);
    ff(['-i', src, '-vf', `crop=${cw}:${ch}:${cx}:${cy}`, '-q:v', '3', cropped]);
    src = cropped;
  }
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
