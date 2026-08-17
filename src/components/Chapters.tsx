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
      en: 'Eight shish kebab entries on the public menu. From the coals to the board, from the board to the middle of the table.',
      ru: 'Восемь позиций шашлыка в публичном меню. С углей — на доску, с доски — в середину стола.',
    },
    tiles: [
      { kind: 'loop', id: 'motion/mangal', portrait: true, big: true },
      { kind: 'loop', id: 'motion/fire', portrait: true },
      { kind: 'still', id: 'food/board-overhead', portrait: true },
    ],
    cta: 'menu',
  },
  {
    id: 'kazan',
    label: { en: 'The kazan', ru: 'Казан' },
    line: {
      en: 'Zirvak at a rolling boil, a long skimmer, meat by the bowlful — the kazan works the real way.',
      ru: 'Кипящий зирвак, длинная шумовка, мясо целыми мисками — казан работает по-настоящему.',
    },
    tiles: [
      { kind: 'loop', id: 'motion/kazan', portrait: true, big: true },
      { kind: 'still', id: 'food/kazan-skim', portrait: true },
    ],
    cta: 'call',
    note: {
      en: "Plov isn't in the July public menu snapshot — ask about today's plov by phone.",
      ru: 'Плова нет в июльском срезе меню — спросите про сегодняшний плов по телефону.',
    },
  },
  {
    id: 'appetizers',
    label: { en: 'Appetizers', ru: 'Закуски' },
    line: {
      en: 'Cold and hot appetizers the way the kitchen actually plates them — trays, sauces, gold handles.',
      ru: 'Холодные и горячие закуски так, как их реально собирает кухня — подносы, соусы, золотые ручки.',
    },
    tiles: [
      { kind: 'still', id: 'food/samsa-plate', portrait: true, big: true },
      { kind: 'still', id: 'food/cold-platter', portrait: true },
      { kind: 'still', id: 'food/cheese-plates' },
    ],
    cta: 'menu',
  },
  {
    id: 'desserts',
    label: { en: 'The sweet table', ru: 'Десерты' },
    line: {
      en: 'Fruit towers and the sweet setting the room puts out for big evenings.',
      ru: 'Фруктовые башни и сладкий стол, который зал собирает для больших вечеров.',
    },
    tiles: [
      { kind: 'still', id: 'food/banquet-dessert', portrait: true, big: true },
      { kind: 'still', id: 'food/fruit-tower', portrait: true },
    ],
    cta: 'call',
  },
  {
    id: 'banquets',
    label: { en: 'Banquets', ru: 'Банкеты' },
    line: {
      en: 'Long tables under the chandeliers — this is how the restaurant films its own banquets. Call to plan your table.',
      ru: 'Длинные столы под люстрами — так ресторан снимает собственные банкеты. Позвоните, чтобы обсудить ваш стол.',
    },
    tiles: [
      { kind: 'loop', id: 'motion/banquet-room', big: true },
      { kind: 'still', id: 'food/banquet-frame', portrait: true },
    ],
    cta: 'call',
    note: {
      en: 'Guests appear in frame — releases required; shown for review only. Banquet terms are being confirmed.',
      ru: 'В кадре гости — нужны согласия; показано для согласования. Условия банкетов уточняются.',
    },
  },
  {
    id: 'room',
    label: { en: 'The room', ru: 'Зал' },
    line: {
      en: 'The renovated room: chandeliers, painted arches, the gold sign behind drifting smoke.',
      ru: 'Обновлённый зал: люстры, расписные арки и золотая вывеска за дымкой.',
    },
    tiles: [
      { kind: 'loop', id: 'motion/room-table', big: true },
      { kind: 'loop', id: 'motion/sign-smoke', portrait: true },
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

        <div className="chapters__tabs" role="tablist" aria-label={lang === 'ru' ? 'Главы кухни' : 'Kitchen chapters'}>
          {CHAPTERS.map((c) => (
            <button
              key={c.id}
              id={`chapters-tab-${c.id}`}
              type="button"
              role="tab"
              aria-selected={active === c.id}
              aria-controls="chapters-panel"
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
