import { WebGLRenderer, NoToneMapping, SRGBColorSpace } from 'three';
import { createHearth, type Hearth } from './hearth';
import { createPassage, type Passage } from './passage';
import type { Tier } from './tier';

/**
 * One canvas, one context, two scenes, one loop.
 *
 * The loop is dirty-flag driven and frame-capped: the hearth only needs 30fps, and a
 * scrubbed passage only needs to draw when the scroll position actually changed.
 * A runtime guard watches its own frame times and steps down — or tears itself out
 * entirely, leaving the static page underneath, which was always the ground truth.
 */

type Active = 'none' | 'hearth' | 'passage';

const QUALITY: Record<Exclude<Active, 'none'>, Record<Tier, number>> = {
  hearth: { 0: 0, 1: 0, 2: 0.6, 3: 0.75 },
  passage: { 0: 0, 1: 0, 2: 0, 3: 1 },
};

export function createStage(canvas: HTMLCanvasElement, tier: Tier) {
  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    powerPreference: 'low-power',
    stencil: false,
    depth: true,
  });
  renderer.toneMapping = NoToneMapping;
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  renderer.autoClear = false;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let hearth: Hearth | null = null;
  let passage: Passage | null = null;
  // The canvas is fixed to the viewport, but each scene belongs to specific
  // sections: it must never paint over the ivory page either side of them.
  const bounds: Record<Exclude<Active, 'none'>, HTMLElement[]> = { hearth: [], passage: [] };
  let active: Active = 'none';
  let dirty = true;
  let running = false;
  let dead = false;
  let raf = 0;
  let last = 0;
  let acc = 0;
  let clock = 0;
  const budget = 1000 / 30;

  // runtime guard
  const samples: number[] = [];
  let quality = 1;

  function size() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const scale = active === 'none' ? 1 : QUALITY[active][tier] * quality;
    renderer.setPixelRatio(dpr * scale);
    renderer.setSize(w, h, false);
    hearth?.setSize(w, h);
    passage?.setSize(w, h);
    dirty = true;
  }

  /** Viewport intersection of the active scene's sections, in CSS px, GL origin (bottom-left). */
  function sceneRect(): { x: number; y: number; w: number; h: number } | null {
    if (active === 'none') return null;
    const els = bounds[active];
    if (els.length === 0) return { x: 0, y: 0, w: window.innerWidth, h: window.innerHeight };
    let top = Infinity;
    let bottom = -Infinity;
    for (const el of els) {
      const r = el.getBoundingClientRect();
      top = Math.min(top, r.top);
      bottom = Math.max(bottom, r.bottom);
    }
    const vh = window.innerHeight;
    const clampedTop = Math.max(0, top);
    const clampedBottom = Math.min(vh, bottom);
    const h = clampedBottom - clampedTop;
    if (h <= 0) return null;
    return { x: 0, y: vh - clampedBottom, w: window.innerWidth, h };
  }

  function step(now: number) {
    raf = requestAnimationFrame(step);
    if (dead || active === 'none') return;

    const dt = last ? now - last : 16;
    last = now;

    if (active === 'hearth') {
      acc += dt;
      if (acc < budget) return;
      clock = (clock + acc * 0.001) % 600;
      acc = 0;
      hearth?.setTime(clock);
      dirty = true;
    }

    if (!dirty) return;
    const t0 = performance.now();

    // Clear the whole canvas first (no scissor), then draw only inside the
    // union of the active scene's sections. Without the full clear, pixels
    // painted on a previous frame would survive outside a shrinking scissor.
    renderer.setScissorTest(false);
    renderer.clear();
    const rect = sceneRect();
    if (rect) {
      renderer.setScissorTest(true);
      renderer.setScissor(rect.x, rect.y, rect.w, rect.h);
      if (active === 'hearth' && hearth) renderer.render(hearth.scene, hearth.camera);
      if (active === 'passage' && passage) renderer.render(passage.scene, passage.camera);
      renderer.setScissorTest(false);
    }
    dirty = false;

    // self-defence: a 3D layer that cannot turn itself off is a liability
    if (samples.length < 40) {
      samples.push(performance.now() - t0);
      if (samples.length === 40) {
        const sorted = [...samples].sort((a, b) => a - b);
        const p75 = sorted[Math.floor(sorted.length * 0.75)];
        if (p75 > 26 && quality > 0.5) {
          quality = 0.5;
          size();
        } else if (p75 > 34) {
          destroy();
        }
      }
    }
  }

  function start() {
    if (dead || running) return;
    running = true;
    last = 0;
    raf = requestAnimationFrame(step);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(raf);
    raf = 0;
  }

  function setScene(next: Active) {
    if (dead || next === active) return;
    active = next;
    if (next === 'hearth' && !hearth) hearth = createHearth(tier >= 3 ? 240 : 90, dpr);
    if (next === 'passage' && !passage) passage = createPassage();
    canvas.dataset.motion = next === 'none' ? 'off' : 'on';
    if (next === 'none') {
      stop();
      return;
    }
    size();
    start();
  }

  function destroy() {
    if (dead) return;
    dead = true;
    stop();
    hearth?.dispose();
    passage?.dispose();
    hearth = passage = null;
    canvas.dataset.motion = 'off';
    renderer.dispose();
    renderer.forceContextLoss();
    try {
      localStorage.setItem('padishah.gfx', 'off');
    } catch {
      /* ignore */
    }
  }

  const onResize = () => size();
  const onVisibility = () => (document.hidden ? stop() : active !== 'none' && start());
  const onLost = (e: Event) => {
    e.preventDefault();
    canvas.dataset.motion = 'off';
    stop();
  };

  window.addEventListener('resize', onResize, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);
  canvas.addEventListener('webglcontextlost', onLost);

  size();

  return {
    setScene,
    /** Register the sections a scene is allowed to paint over. */
    setBounds(scene: Exclude<Active, 'none'>, els: (HTMLElement | null)[]) {
      bounds[scene] = els.filter((el): el is HTMLElement => el !== null);
    },
    get hearth() {
      return hearth;
    },
    get passage() {
      return passage;
    },
    markDirty() {
      dirty = true;
    },
    destroy() {
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('webglcontextlost', onLost);
      destroy();
    },
  };
}

export type Stage = ReturnType<typeof createStage>;
