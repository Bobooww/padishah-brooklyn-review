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

      const hero = document.getElementById('hero');
      const fire = document.getElementById('fire');
      const passage = document.getElementById('passage');

      // --- Scene A: the hearth breathes under the hero, then flares in the fire chapter
      if (hero) {
        triggers.push(
          ScrollTrigger.create({
            trigger: hero,
            start: 'top top',
            end: 'bottom center',
            onToggle: (self: { isActive: boolean }) => stage.setScene(self.isActive ? 'hearth' : 'none'),
            onUpdate: (self: { progress: number }) => {
              stage.hearth?.setIntensity(0.3 + self.progress * 0.25);
              stage.hearth?.setHearth(0.5, 0.3 - self.progress * 0.08);
              stage.markDirty();
            },
          }),
        );
      }

      if (fire) {
        triggers.push(
          ScrollTrigger.create({
            trigger: fire,
            start: 'top bottom',
            end: 'bottom top',
            onToggle: (self: { isActive: boolean }) => stage.setScene(self.isActive ? 'hearth' : 'none'),
            onUpdate: (self: { progress: number }) => {
              const p = self.progress;
              // rise to full over the first half, ease back so the section can end quietly
              stage.hearth?.setIntensity(p < 0.5 ? 0.55 + p * 0.9 : 1.0 - (p - 0.5) * 0.6);
              stage.hearth?.setHearth(0.5, 0.24);
              stage.markDirty();
            },
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
