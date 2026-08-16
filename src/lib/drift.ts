/**
 * drift.ts — the site's one parallax.
 *
 * Elements marked `data-drift` translate a few pixels against the scroll while
 * they are on screen; `data-drift-rotate` adds a fraction of a degree of tilt.
 * The factor is the fraction of scroll delta the element gives up (positive
 * drifts slower than the page, negative slightly faster).
 *
 * Rules it obeys, in line with the design bible's motion law:
 *  - transform-only, rAF-driven, one passive scroll listener for the page;
 *  - does nothing under prefers-reduced-motion, and undoes itself on teardown;
 *  - default state == final state: with no JavaScript nothing ever moved.
 */

const MAX_PX = 60;

export function observeDrift(root: Document): () => void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => undefined;

  const els = Array.from(root.querySelectorAll<HTMLElement>('[data-drift]'));
  if (els.length === 0) return () => undefined;

  const tracked = new Set<HTMLElement>();
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) tracked.add(e.target as HTMLElement);
        else tracked.delete(e.target as HTMLElement);
      }
      schedule();
    },
    { rootMargin: '80px' },
  );
  els.forEach((el) => io.observe(el));

  let raf = 0;
  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(apply);
  };

  const apply = () => {
    raf = 0;
    const vh = window.innerHeight;
    for (const el of tracked) {
      const f = Number(el.dataset.drift ?? '0');
      if (!f) continue;
      const r = el.getBoundingClientRect();
      // -1 when the element's centre is at the viewport bottom, +1 at the top.
      const progress = 1 - (r.top + r.height / 2) / (vh / 2);
      const y = Math.max(-MAX_PX, Math.min(MAX_PX, progress * f * vh));
      const rot = Number(el.dataset.driftRotate ?? '0') * progress;
      el.style.transform = rot
        ? `translate3d(0, ${y.toFixed(1)}px, 0) rotate(${rot.toFixed(2)}deg)`
        : `translate3d(0, ${y.toFixed(1)}px, 0)`;
    }
  };

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  schedule();

  return () => {
    io.disconnect();
    cancelAnimationFrame(raf);
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
    els.forEach((el) => {
      el.style.transform = '';
    });
  };
}
