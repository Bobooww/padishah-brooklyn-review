/**
 * Capability tiers. Decided once, before anything heavy is fetched.
 *
 *  0 — no motion at all (reduced motion, save-data, user opt-out). Canvas never created.
 *  1 — CSS entrances only (no WebGL, or a low-end device).
 *  2 — mobile / tablet: the hearth scene only.
 *  3 — desktop: hearth + the cartouche passage.
 */
export type Tier = 0 | 1 | 2 | 3;

export const MOTION_KEY = 'padishah.motion';
export const GFX_KEY = 'padishah.gfx';

type Conn = { saveData?: boolean; effectiveType?: string };

function hasWebGL(): boolean {
  try {
    const cv = document.createElement('canvas');
    const gl = (cv.getContext('webgl2') ?? cv.getContext('webgl')) as WebGLRenderingContext | null;
    if (!gl) return false;
    const ok = gl.getParameter(gl.MAX_TEXTURE_SIZE) >= 2048;
    (gl.getExtension('WEBGL_lose_context') as { loseContext(): void } | null)?.loseContext();
    return ok;
  } catch {
    return false;
  }
}

export function detectTier(): Tier {
  if (typeof window === 'undefined') return 0;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 0;
  try {
    if (localStorage.getItem(MOTION_KEY) === 'off' || localStorage.getItem(GFX_KEY) === 'off') return 0;
  } catch {
    /* private mode — ignore */
  }

  const conn = (navigator as Navigator & { connection?: Conn }).connection;
  if (conn?.saveData) return 0;
  if (conn?.effectiveType && /^(slow-2g|2g)$/.test(conn.effectiveType)) return 0;

  if (!hasWebGL()) return 1;

  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  const cpu = navigator.hardwareConcurrency ?? 8;
  if (mem <= 4 || cpu <= 4) return 1;

  const wide = window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches;
  return wide ? 3 : 2;
}
