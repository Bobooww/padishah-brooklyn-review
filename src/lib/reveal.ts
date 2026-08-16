/**
 * The site's ONE entrance recipe. Elements marked .reveal rise 2.5rem and fade in,
 * once, when they cross 82% of the viewport. Nothing else animates on entrance.
 */
export function observeReveals(root: ParentNode = document): () => void {
  const nodes = Array.from(root.querySelectorAll<HTMLElement>('.reveal:not(.is-in)'));
  if (nodes.length === 0) return () => undefined;

  const reduced =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || typeof IntersectionObserver === 'undefined') return () => undefined;

  // Arm only now: until this line runs, every element is already in its final state.
  nodes.forEach((n) => n.classList.add('reveal--armed'));

  // Anything already on screen animates immediately rather than waiting for a scroll.
  requestAnimationFrame(() => {
    for (const n of nodes) {
      if (n.getBoundingClientRect().top < window.innerHeight * 0.9) n.classList.add('is-in');
    }
  });

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -18% 0px', threshold: 0.08 },
  );

  nodes.forEach((n) => io.observe(n));
  return () => io.disconnect();
}

/** Stagger helper: writes --reveal-delay on each child so CSS owns the timing. */
export function stagger(container: HTMLElement, step = 70, cap = 700) {
  Array.from(container.children).forEach((child, i) => {
    (child as HTMLElement).style.setProperty('--reveal-delay', `${Math.min(i * step, cap)}ms`);
  });
}
