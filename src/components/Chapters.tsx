'use client';

import { useEffect, useState } from 'react';
import { media } from '@/lib/review-mode';
import { Loop, Still } from '@/components/Media';
import { VERIFIED } from '@/content/generated/facts';
import Link from 'next/link';
import type { Lang } from '@/content/copy';

/**
 * The kitchen, chapter by chapter — the site's interactive heart.
 *
 * One tab strip, six departments, every panel a small collage of the owner's
 * own 2026 footage. Switching chapters remounts the panel, so the tiles play
 * their entrance again (CSS-only; still under reduced motion). Labels stay
 * at the category level — the honesty law forbids captioning a frame with a
 * dish name, so no tile ever claims one.
 */

type Tile = {
  kind: 'loop' | 'still';
  id: string;
  portrait?: boolean;
  big?: boolean;
};

type Chapter = {
  id: string;
  label: { en: string; ru: string };
  line: { en: string; ru: string };
  tiles: Tile[];
  cta?: 'call' | 'menu';
  note?: { en: string; ru: string };
};

const CHAPTERS: Chapter[] = [
  {
    id: 'meat',
    label: { en: 'The grill', ru: 'Мясное' },
    line: {
      en: 'Raw ranks head for the coals; lulya breathes in the smoke. Sixteen kebab entries on the restaurant’s own menu.',
      ru: 'Сырые ряды идут на угли; люля дышит в дыму. Шестнадцать позиций шашлыка в собственном меню ресторана.',
    },
    tiles: [
      { kind: 'loop', id: 'motion/mangal', portrait: true, big: true },
      { kind: 'loop', id: 'motion/raw-rank', portrait: true },
      { kind: 'still', id: 'food/board-overhead', portrait: true },
    ],
    cta: 'menu',
  },
  {
    id: 'plated',
    label: { en: 'From the chef', ru: 'От шефа' },
    line: {
      en: 'Salad crowns on pedestals, crispy noodles draped on chopsticks — the kitchen plates like a stage.',
      ru: 'Салатные короны на пьедесталах, хрустящая лапша на палочках — кухня подаёт как на сцене.',
    },
    tiles: [
      { kind: 'still', id: 'food/salad-crown', portrait: true, big: true },
      { kind: 'still', id: 'food/noodle-tower' },
      { kind: 'still', id: 'food/noodle-plate', portrait: true },
    ],
    cta: 'call',
  },
  {
    id: 'appetizers',
    label: { en: 'Appetizers', ru: 'Закуски' },
    line: {
      en: 'Trays of golden pastry with two red sauces; the cold platter laid on white cloth.',
      ru: 'Подносы золотистой выпечки с двумя красными соусами; мясная нарезка на белой скатерти.',
    },
    tiles: [
      { kind: 'still', id: 'food/samsa-trays-new', portrait: true, big: true },
      { kind: 'still', id: 'food/cold-platter-new' },
    ],
    cta: 'menu',
  },
  {
    id: 'desserts',
    label: { en: 'The sweet table', ru: 'Десерты' },
    line: {
      en: 'Gold-wrapped chocolates in glasses, fruit plates down the length of the table.',
      ru: 'Конфеты в золоте в бокалах, фруктовые тарелки вдоль всего стола.',
    },
    tiles: [
      { kind: 'loop', id: 'motion/dessert-glasses', portrait: true, big: true },
      { kind: 'loop', id: 'motion/furshet', portrait: true },
    ],
    cta: 'call',
  },
  {
    id: 'banquets',
    label: { en: 'Banquets', ru: 'Банкеты' },
    line: {
      en: 'The grand table end to end — fruit towers, flowers, the gold sign over the hall. Call to plan your evening.',
      ru: 'Гранд-стол целиком — фруктовые башни, цветы, золотая вывеска над залом. Позвоните — обсудим ваш вечер.',
    },
    tiles: [
      { kind: 'loop', id: 'motion/banquet-grand', portrait: true, big: true },
      { kind: 'loop', id: 'motion/hall-sign', portrait: true },
      { kind: 'loop', id: 'motion/table-cards', portrait: true },
    ],
    cta: 'call',
    note: {
      en: 'Banquet formats and terms are being confirmed with the restaurant.',
      ru: 'Форматы и условия банкетов уточняются у ресторана.',
    },
  },
  {
    id: 'room',
    label: { en: 'The room', ru: 'Зал и терраса' },
    line: {
      en: 'Off Avenue U, under the sign, into the room — and out to the flower terrace.',
      ru: 'С Avenue U, под вывеской, в зал — и на цветочную террасу.',
    },
    tiles: [
      { kind: 'loop', id: 'motion/storefront-walk', portrait: true, big: true },
      { kind: 'loop', id: 'motion/terrace', portrait: true },
    ],
  },
];

export function Chapters({ lang, callLabel }: { lang: Lang; callLabel: string }) {
  const [active, setActive] = useState('meat');

  // /#chapters-banquets (etc.) deep-links straight to a chapter
  useEffect(() => {
    const pick = () => {
      const m = window.location.hash.match(/^#chapters-(\w+)/);
      if (m && CHAPTERS.some((c) => c.id === m[1])) setActive(m[1]);
    };
    pick();
    window.addEventListener('hashchange', pick);
    return () => window.removeEventListener('hashchange', pick);
  }, []);

  const chapter = CHAPTERS.find((c) => c.id === active) ?? CHAPTERS[0];

  return (
    <section id="chapters" className="section section--ivory chapters">
      <div className="rail">
        <header className="chapters__head reveal">
          <p className="eyebrow">{lang === 'ru' ? 'Кухня по главам' : 'Chapter by chapter'}</p>
          <h2>{lang === 'ru' ? 'Что здесь готовят.' : 'What the kitchen makes.'}</h2>
        </header>

        <div
          className="chapters__tabs"
          role="tablist"
          aria-label={lang === 'ru' ? 'Главы кухни' : 'Kitchen chapters'}
          onKeyDown={(e) => {
            // roving tabs: arrows move selection, Home/End jump — standard tablist keys
            const idx = CHAPTERS.findIndex((c) => c.id === active);
            let next = -1;
            if (e.key === 'ArrowRight') next = (idx + 1) % CHAPTERS.length;
            if (e.key === 'ArrowLeft') next = (idx - 1 + CHAPTERS.length) % CHAPTERS.length;
            if (e.key === 'Home') next = 0;
            if (e.key === 'End') next = CHAPTERS.length - 1;
            if (next === -1) return;
            e.preventDefault();
            setActive(CHAPTERS[next].id);
            document.getElementById(`chapters-tab-${CHAPTERS[next].id}`)?.focus();
          }}
        >
          {CHAPTERS.map((c) => (
            <button
              key={c.id}
              id={`chapters-tab-${c.id}`}
              type="button"
              role="tab"
              aria-selected={active === c.id}
              aria-controls="chapters-panel"
              tabIndex={active === c.id ? 0 : -1}
              className="chapters__tab"
              onClick={() => setActive(c.id)}
            >
              {c.label[lang]}
            </button>
          ))}
        </div>

        {/* key remount replays the tile entrances on every chapter switch */}
        <div
          id="chapters-panel"
          role="tabpanel"
          aria-labelledby={`chapters-tab-${chapter.id}`}
          className="chapters__panel"
          key={chapter.id}
        >
          <p className="lead chapters__line">{chapter.line[lang]}</p>
          <div className="chapters__grid">
            {chapter.tiles.map((tile, i) => (
              <div
                key={tile.id}
                className={`chapters__tile ${tile.big ? 'chapters__tile--big' : ''} ${tile.portrait ? 'chapters__tile--portrait' : ''}`}
                style={{ animationDelay: `${i * 110}ms` }}
                data-drift={i % 2 ? '0.045' : '0.03'}
              >
                {tile.kind === 'loop' ? (
                  <Loop
                    asset={media(tile.id)}
                    alt=""
                    orientation={tile.portrait ? 'portrait' : 'landscape'}
                    lang={lang}
                  />
                ) : (
                  <Still asset={media(tile.id)} alt="" sizes="(min-width: 900px) 30vw, 90vw" lang={lang} />
                )}
              </div>
            ))}
          </div>
          <div className="chapters__foot">
            {chapter.cta === 'call' && (
              <a className="btn btn--gold" href={`tel:${VERIFIED.phoneE164}`}>
                {callLabel}
              </a>
            )}
            {chapter.cta === 'menu' && (
              <Link className="btn btn--gold" href="/menu/">
                {lang === 'ru' ? 'Открыть меню' : 'Open the menu'}
              </Link>
            )}
            {chapter.note && <p className="micro chapters__note">{chapter.note[lang]}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
