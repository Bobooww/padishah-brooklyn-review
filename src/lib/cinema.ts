/**
 * cinema.ts — the scroll choreography layer.
 *
 * Four scrubbed moments on top of the page's entrance system:
 *  1. the hero grid eases out as the page leaves it (single-wrapper transform,
 *     so it never fights the per-scrap drift underneath);
 *  2. the fire chapter pins for one extra beat while the embers flare —
 *     the WebGL scissor follows the pinned rect on its own;
 *  3. on pointer desktops the Stories rail pins and the page's vertical
 *     scroll drives it horizontally (the arrows stay for everyone else);
 *  4. a giant outlined tagline band slides against the scroll before Visit,
 *     and the menu-preview counters count up once.
 *
 * Everything lives inside gsap.matchMedia gated on prefers-reduced-motion:
 * without JS, on save-data or reduced motion the page is simply complete.
 */

export async function bootCinema(): Promise<() => void> {
  const [gsapMod, stMod] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')]);
  const gsap = (gsapMod as { gsap?: typeof import('gsap').gsap }).gsap ?? gsapMod.default;
  const ScrollTrigger = (stMod as { ScrollTrigger?: typeof import('gsap/ScrollTrigger').ScrollTrigger }).ScrollTrigger ?? stMod.default;
  gsap.registerPlugin(ScrollTrigger);

  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    // -- 1 · hero exit -----------------------------------------------------
    const heroGrid = document.querySelector('.hero__grid');
    if (heroGrid) {
      gsap.to(heroGrid, {
        y: -70,
        scale: 0.965,
        autoAlpha: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: 'bottom 20%',
          scrub: true,
        },
      });
    }

    // -- 2 · the fire holds ------------------------------------------------
    const fire = document.getElementById('fire');
    if (fire) {
      ScrollTrigger.create({
        trigger: fire,
        start: 'top top',
        end: '+=55%',
        pin: true,
        pinSpacing: true,
      });
      const media = fire.querySelector('.fire__media .frame__core video, .fire__media .frame__core img');
      if (media) {
        gsap.fromTo(
          media,
          { scale: 1 },
          {
            scale: 1.07,
            ease: 'none',
            scrollTrigger: { trigger: fire, start: 'top top', end: '+=55%', scrub: true },
          },
        );
      }
    }

    // -- 4a · the tagline band ----------------------------------------------
    const band = document.querySelector('.band__track');
    if (band) {
      gsap.fromTo(
        band,
        { xPercent: 4 },
        {
          xPercent: -24,
          ease: 'none',
          scrollTrigger: {
            trigger: '.band',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        },
      );
    }

    // -- 4b · menu counters count up once ------------------------------------
    document.querySelectorAll<HTMLElement>('.catcard__count').forEach((el) => {
      const target = Number(el.textContent);
      if (!Number.isFinite(target) || target <= 0) return;
      const state = { n: 0 };
      gsap.to(state, {
        n: target,
        duration: 0.9,
        ease: 'power2.out',
        snap: { n: 1 },
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        onUpdate: () => {
          el.textContent = String(Math.round(state.n));
        },
      });
    });
  });

  // -- 3 · stories rail: vertical scroll drives it sideways (desktop only) --
  mm.add('(prefers-reduced-motion: no-preference) and (min-width: 900px) and (hover: hover) and (pointer: fine)', () => {
    const section = document.getElementById('stories');
    const rail = section?.querySelector<HTMLElement>('.stories__rail');
    if (!section || !rail) return;

    section.classList.add('stories--cinema');
    const distance = () => Math.max(0, rail.scrollWidth - rail.clientWidth);

    const tween = gsap.to(rail, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => '+=' + distance(),
        pin: true,
        scrub: 0.6,
        invalidateOnRefresh: true,
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      section.classList.remove('stories--cinema');
      gsap.set(rail, { clearProps: 'x' });
    };
  });

  // Reveal-system rises and video lazy-loads shift layout after boot;
  // one refresh once the page settles keeps pin positions honest.
  const settle = window.setTimeout(() => ScrollTrigger.refresh(), 1200);

  return () => {
    window.clearTimeout(settle);
    mm.revert();
  };
}
