/**
 * The cartouche — the crowned frame from Padishah's own mark, traced as an outline.
 *
 * HARD RULE: the frame only. No letterforms. "PADISHAH" is artwork supplied by the
 * restaurant and is never re-drawn, extruded or typed. What lives here is a shape:
 * lobed shoulders rising to a crowned point, with an aperture the page travels through.
 *
 * One source of truth: the path strings below feed both the static SVG fallback and the
 * extruded WebGL geometry, through the small parser at the bottom.
 */

export const VIEWBOX = { w: 1000, h: 560 };

/** Outer silhouette, drawn clockwise from the left shoulder. */
export const OUTER_D = [
  'M 44 176',
  'C 44 118 88 74 146 74',
  'L 372 74',
  'C 396 74 412 64 421 44',
  'L 436 12',
  'C 442 0 456 0 462 12',
  'L 474 38',
  'C 480 51 489 57 500 57',
  'C 511 57 520 51 526 38',
  'L 538 12',
  'C 544 0 558 0 564 12',
  'L 579 44',
  'C 588 64 604 74 628 74',
  'L 854 74',
  'C 912 74 956 118 956 176',
  'L 956 398',
  'C 956 456 912 500 854 500',
  'L 146 500',
  'C 88 500 44 456 44 398',
  'Z',
].join(' ');

/** The aperture. Same language, inset — this is the hole the page comes through. */
export const INNER_D = [
  'M 92 186',
  'C 92 148 122 118 160 118',
  'L 386 118',
  'C 414 118 434 104 444 82',
  'C 452 64 466 62 478 78',
  'C 486 89 492 93 500 93',
  'C 508 93 514 89 522 78',
  'C 534 62 548 64 556 82',
  'C 566 104 586 118 614 118',
  'L 840 118',
  'C 878 118 908 148 908 186',
  'L 908 388',
  'C 908 426 878 456 840 456',
  'L 160 456',
  'C 122 456 92 426 92 388',
  'Z',
].join(' ');

/* ------------------------------------------------------------------ parser */

type Ctx = {
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  bezierCurveTo(a: number, b: number, c: number, d: number, e: number, f: number): void;
  closePath(): void;
};

/**
 * Walks the tiny subset of SVG path syntax used above (M, L, C, Z — absolute only)
 * into anything with a canvas-like path API. THREE.Shape and THREE.Path both qualify,
 * so no SVGLoader is shipped.
 *
 * Y is flipped and the box is normalised to roughly [-0.5, 0.5] so the geometry drops
 * straight into an orthographic-ish scene without a magic scale factor downstream.
 */
export function tracePath(ctx: Ctx, scale = 1 / VIEWBOX.w, flipY = true) {
  const cx = VIEWBOX.w / 2;
  const cy = VIEWBOX.h / 2;
  const px = (v: number) => (v - cx) * scale;
  const py = (v: number) => (flipY ? -(v - cy) : v - cy) * scale;

  for (const seg of (OUTER_D.match(/[MLCZ][^MLCZ]*/g) ?? [])) {
    const cmd = seg[0];
    const n = (seg.slice(1).match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
    if (cmd === 'M') ctx.moveTo(px(n[0]), py(n[1]));
    else if (cmd === 'L') ctx.lineTo(px(n[0]), py(n[1]));
    else if (cmd === 'C') ctx.bezierCurveTo(px(n[0]), py(n[1]), px(n[2]), py(n[3]), px(n[4]), py(n[5]));
    else if (cmd === 'Z') ctx.closePath();
  }
}

export function traceHole(ctx: Ctx, scale = 1 / VIEWBOX.w, flipY = true) {
  const cx = VIEWBOX.w / 2;
  const cy = VIEWBOX.h / 2;
  const px = (v: number) => (v - cx) * scale;
  const py = (v: number) => (flipY ? -(v - cy) : v - cy) * scale;

  for (const seg of (INNER_D.match(/[MLCZ][^MLCZ]*/g) ?? [])) {
    const cmd = seg[0];
    const n = (seg.slice(1).match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
    if (cmd === 'M') ctx.moveTo(px(n[0]), py(n[1]));
    else if (cmd === 'L') ctx.lineTo(px(n[0]), py(n[1]));
    else if (cmd === 'C') ctx.bezierCurveTo(px(n[0]), py(n[1]), px(n[2]), py(n[3]), px(n[4]), py(n[5]));
    else if (cmd === 'Z') ctx.closePath();
  }
}
