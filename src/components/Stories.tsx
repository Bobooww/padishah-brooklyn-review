'use client';

import { useRef } from 'react';
import { media } from '@/lib/review-mode';
import { Loop } from '@/components/Media';
import type { Lang } from '@/content/copy';

/**
 * Stories — the swipe rail. Vertical cards, native horizontal scroll with
 * snap points (the shawarma-stop pattern: no JS carousel, the platform does
 * swiping). Each card is a Loop, so it plays only while on screen; labels
 * describe only what is visibly in frame.
 */

const CARDS: { id: string; label: { en: string; ru: string } }[] = [
  { id: 'motion/storefront-walk', label: { en: 'Off Avenue U', ru: 'С Avenue U' } },
  { id: 'motion/mangal', label: { en: 'Over the coals', ru: 'Над углями' } },
  { id: 'motion/raw-rank', label: { en: 'To the fire', ru: 'На огонь' } },
  { id: 'motion/plated-spin', label: { en: 'From the chef', ru: 'От шефа' } },
  { id: 'motion/dessert-glasses', label: { en: 'The sweet table', ru: 'Сладкий стол' } },
  { id: 'motion/banquet-grand', label: { en: 'The grand table', ru: 'Гранд-стол' } },
  { id: 'motion/terrace', label: { en: 'The terrace', ru: 'Терраса' } },
  { id: 'motion/furshet', label: { en: 'The furshet', ru: 'Фуршет' } },
  { id: 'motion/meat-platter', label: { en: 'The platter', ru: 'Мясное блюдо' } },
  { id: 'motion/ribs-fries', label: { en: 'Ribs and fries', ru: 'Рёбрышки и фри' } },
];

export function Stories({ lang }: { lang: Lang }) {
  const rail = useRef<HTMLDivElement>(null);
  const nudge = (dir: 1 | -1) => {
    const el = rail.current;
    if (!el) return;
    const card = el.querySelector('.stories__card');
    const step = card ? card.getBoundingClientRect().width + 18 : 320;
    el.scrollBy({ left: dir * step * 2, behavior: 'smooth' });
  };
  return (
    <section id="stories" className="section section--cream stories" aria-label={lang === 'ru' ? 'Видео с кухни' : 'Kitchen stories'}>
      <div className="rail">
        <header className="stories__head stories__headrow reveal">
          <div>
            <p className="eyebrow">{lang === 'ru' ? 'Листайте' : 'Swipe through'}</p>
            <h2>{lang === 'ru' ? 'Кухня в движении.' : 'The kitchen, moving.'}</h2>
          </div>
          {/* pointer-only affordance: touch users already have the swipe */}
          <div className="stories__nav">
            <button type="button" className="stories__arrow" onClick={() => nudge(-1)} aria-label={lang === 'ru' ? 'Назад' : 'Previous'}>
              ←
            </button>
            <button type="button" className="stories__arrow" onClick={() => nudge(1)} aria-label={lang === 'ru' ? 'Вперёд' : 'Next'}>
              →
            </button>
          </div>
        </header>
      </div>
      <div className="stories__rail" role="list" ref={rail}>
        {CARDS.map((card, i) => (
          <div key={card.id} className="stories__card reveal" role="listitem" style={{ ['--i' as string]: i }}>
            <Loop asset={media(card.id)} alt="" orientation="portrait" lang={lang} />
            <p className="stories__label">{card.label[lang]}</p>
          </div>
        ))}
      </div>
      <p className="rail micro stories__note reveal">
        {lang === 'ru'
          ? 'Всё снято самим рестораном, август 2026.'
          : 'All filmed by the restaurant itself, August 2026.'}
      </p>
    </section>
  );
}
