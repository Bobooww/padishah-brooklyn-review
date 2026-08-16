'use client';

import { useEffect, useRef } from 'react';
import { detectTier } from './tier';

/**
 * Mounts the WebGL layer — and only if the device, the user and the network all agree.
 * Nothing here is required for the page to be complete: every section below the canvas
 * is already finished before this file is fetched.
 */
export default function Stage() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const tier = detectTier();
    document.documentElement.dataset.tier = String(tier);
    if (tier < 2) return;

    let teardown: (() => void) | null = null;
    let cancelled = false;

    const boot = async () => {
      const [{ createStage }, gsapMod, stMod] = await Promise.all([
        import('./renderer'),
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);
      if (cancelled) return;

      const gsap = gsapMod.gsap ?? gsapMod.default;
      const ScrollTrigger = stMod.ScrollTrigger ?? stMod.default;
      gsap.registerPlugin(ScrollTrigger);

      const stage = createStage(canvas, tier);
      const triggers: { kill(): void }[] = [];

      const fire = document.getElementById('fire');
      const passage = document.getElementById('passage');

      // Each scene may only paint inside its own sections — the canvas is
      // viewport-fixed, and the daylight page either side must stay untouched.
      // Since the hero turned to paper, the hearth lives in the fire chapter only:
      // dark smoke composited over ivory reads as dirt, not atmosphere.
      stage.setBounds('hearth', [fire]);
      stage.setBounds('passage', [passage]);

      // --- Scene A: the hearth flares across the fire chapter
      if (fire) {
        // The hearth is born at intensity 0 (it only ever glows as hard as the
        // scroll says). Seed it the moment the scene wakes, or a fast scroll can
        // create it invisible and leave it that way until the next scroll tick.
        const flare = (p: number) => {
          stage.hearth?.setIntensity(p < 0.5 ? 0.55 + p * 0.9 : 1.0 - (p - 0.5) * 0.6);
          stage.hearth?.setHearth(0.5, 0.24);
          stage.markDirty();
        };
        triggers.push(
          ScrollTrigger.create({
            trigger: fire,
            start: 'top bottom',
            end: 'bottom top',
            onToggle: (self: { isActive: boolean; progress: number }) => {
              stage.setScene(self.isActive ? 'hearth' : 'none');
              if (self.isActive) flare(self.progress);
            },
            onUpdate: (self: { progress: number }) => flare(self.progress),
          }),
        );
      }

      // --- Scene B: the page travels through the restaurant's own cartouche (desktop only)
      if (passage && tier >= 3) {
        triggers.push(
          ScrollTrigger.create({
            trigger: passage,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.6,
            onToggle: (self: { isActive: boolean }) => stage.setScene(self.isActive ? 'passage' : 'none'),
            onUpdate: (self: { progress: number }) => {
              stage.passage?.setProgress(self.progress);
              stage.markDirty();
            },
          }),
        );

        const onPointer = (e: PointerEvent) => {
          stage.passage?.setPointer((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
          stage.markDirty();
        };
        window.addEventListener('pointermove', onPointer, { passive: true });
        triggers.push({ kill: () => window.removeEventListener('pointermove', onPointer) });
      }

      // The review banner changes height when it wraps; without this the triggers drift.
      const banner = document.querySelector('.reviewbar');
      const ro = banner
        ? new ResizeObserver(() => ScrollTrigger.refresh())
        : null;
      if (banner && ro) ro.observe(banner);

      teardown = () => {
        ro?.disconnect();
        triggers.forEach((t) => t.kill());
        stage.destroy();
      };
    };

    const idle = (cb: () => void) => {
      const w = window as Window & { requestIdleCallback?: (c: () => void, o?: { timeout: number }) => number };
      if (typeof w.requestIdleCallback === 'function') w.requestIdleCallback(cb, { timeout: 1800 });
      else window.setTimeout(cb, 400);
    };

    idle(() => void boot());

    return () => {
      cancelled = true;
      teardown?.();
    };
  }, []);

  return <canvas id="stage" ref={ref} aria-hidden="true" data-motion="off" />;
}
