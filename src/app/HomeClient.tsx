'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { CATEGORIES, ITEMS, MENU_APPROVED_AT, MENU_OBSERVED_AT } from '@/content/generated/menu';
import { HOURS, PROVISIONAL, VERIFIED, OBSERVED_AT } from '@/content/generated/facts';
import type { MenuItem } from '@/content/types';
import { media } from '@/lib/review-mode';
import { observeReveals, stagger } from '@/lib/reveal';
import { observeDrift } from '@/lib/drift';
import { Loop, Still } from '@/components/Media';
import { Cartouche } from '@/components/Cartouche';
import { Ornament } from '@/components/Ornament';
import { CarpetBorder } from '@/components/CarpetBorder';
import { Seal } from '@/components/Seal';
import { IG_HANDLE, ReviewBar, SiteHeader, SiteFooter, StickyActions } from '@/components/Shell';
import { useLang } from '@/components/LangProvider';
import Stage from '@/components/motion/Stage';
import { fill } from '@/content/copy';

/** Six dishes pulled straight from the public listing — described only as it describes them. */
const DISH_IDS = [
  'shish-kebab--lamb-ribs-kebab',
  'shish-kebab--lulya-kebab',
  'shish-kebab--veal-liver-kebab',
  'cold-appetizers--samsa-1-piece',
  'main-course--manti',
  'salads--achichuk-salad',
];

/**
 * Photographs are NOT matched to dish names. The library is phone footage from the
 * restaurant's own posts; nobody has confirmed which dish is in which frame, and
 * captioning a photo with a dish name would be a claim we cannot support.
 * They live in their own strip below, described only by what is visibly in them.
 */
const KITCHEN_STRIP = [
  'food/platter-overhead',
  'food/grill-skewers-closeup',
  'food/skewer-ranks',
  'food/salmon-grill',
];

/**
 * The provisional cuisine wording is research data and arrives in English. On the
 * Russian page the same claim is rendered in Russian — the translation maps ONLY
 * the exact known research string, so a corrected fact can never be silently
 * re-translated; anything else falls back to the raw research value.
 */
const CUISINE_RU: Record<string, string> = {
  'Uzbek and Central Asian cuisine': 'Узбекская и среднеазиатская кухня',
};

export default function HomeClient() {
  const { t, lang } = useLang();

  useEffect(() => {
    document.querySelectorAll<HTMLElement>('[data-stagger]').forEach((el) => stagger(el));
    const teardownReveals = observeReveals(document);
    const teardownDrift = observeDrift(document);
    return () => {
      teardownReveals();
      teardownDrift();
    };
  }, []);

  const dishes = DISH_IDS.map((id) => ITEMS.find((i) => i.id === id)).filter(
    (d): d is MenuItem => d !== undefined,
  );

  return (
    <>
      <Stage />
      <ReviewBar />
      <SiteHeader tone="ivory" />

      <main>
        {/* ---------------------------------------------------------- hero */}
        {/*
         * Editorial split, not a stretched backdrop: the reels are 9:16 phone
         * footage, and cropping them to a full-bleed 16:9 wall threw away two
         * thirds of the pixels and upscaled the rest. Framed portrait in an
         * arch, the same footage ships at native sharpness — and the fire
         * reads as the object of the page instead of wallpaper.
         */}
        <section id="hero" className="hero">
          <div className="hero__glow" aria-hidden="true" />
          <div className="hero__texture" aria-hidden="true" />
          {/* the carpet trim down the page edge — the textile layer of the collage */}
          <CarpetBorder className="hero__carpet" />
          <div className="rail hero__grid">
            <div className="hero__body">
              {/* the ink seal: verified facts only, turning like an admired stamp */}
              <Seal className="hero__seal" text="PADISHAH · 1920 AVENUE U · BROOKLYN · NY ·" />
              <p className="eyebrow hero__eyebrow">{t.hero.eyebrow}</p>
              <h1 className="hero__title">
                {t.hero.title.split('\n').map((line, i) => (
                  <span key={line} className="hero__line" style={{ animationDelay: `${120 + i * 130}ms` }}>
                    <span>
                      {/* the word the sign is about, in the sign's own red script voice */}
                      {line.split(/(fire|огня)/).map((part, j) =>
                        /^(fire|огня)$/.test(part) ? (
                          <em key={j} className="hero__flame">
                            {part}
                          </em>
                        ) : (
                          part
                        ),
                      )}
                    </span>
                  </span>
                ))}
              </h1>
              <p className="hero__sub">
                <span
                  className="provisional"
                  title={
                    lang === 'ru'
                      ? 'Формулировку кухни ещё подтверждает ресторан'
                      : 'Cuisine wording is still being confirmed by the restaurant'
                  }
                >
                  {lang === 'ru' ? (CUISINE_RU[PROVISIONAL.cuisine.value] ?? PROVISIONAL.cuisine.value) : PROVISIONAL.cuisine.value}
                  {/* the dotted marker and title are invisible to readers and touch: say it */}
                  <span className="u-sr">
                    {lang === 'ru' ? ' (формулировка уточняется у ресторана)' : ' (wording pending the restaurant’s confirmation)'}
                  </span>
                </span>{' '}
                {lang === 'ru' ? '— 1920 Avenue U, Бруклин.' : 'at 1920 Avenue U in Brooklyn.'}
              </p>
              <div className="hero__cta">
                <Link className="btn btn--gold btn--lg" href="/menu/">
                  {t.hero.ctaMenu}
                  <span className="btn__arr" aria-hidden="true">
                    →
                  </span>
                </Link>
                <a className="btn btn--ghost btn--lg" href={`tel:${VERIFIED.phoneE164}`}>
                  {t.hero.ctaCall}
                </a>
              </div>
              <p className="hero__hours">
                <span className="hero__hours-dot" aria-hidden="true" />
                {PROVISIONAL.hoursSummary.value}
                {PROVISIONAL.hoursSummary.status !== 'owner_confirmed' && <> · {t.visit.hoursNote}</>}
              </p>
            </div>

            {/*
             * The collage: paper-scrap layers around the arch, each at its own
             * drift depth, settling into place once on load. Cut-out grammar
             * from the reference board; every photographic piece is still the
             * restaurant's own footage with its badge on.
             */}
            <div className="hero__collage">
              {/* the sun disc with a crescent bite — pure paper, no claim */}
              <span className="hero__disc" aria-hidden="true" data-drift="0.09">
                <span className="hero__disc-settle" />
              </span>

              {/* torn red paper behind the arch */}
              <span className="hero__shard" aria-hidden="true" data-drift="0.03">
                <span className="hero__shard-settle" />
              </span>

              {/* ink scrollwork, drawn in once */}
              <div className="hero__ornament-slot" data-drift="0.06">
                <Ornament draw className="hero__ornament" />
              </div>

              {/* the big sepia figure of the collage: the cook, torn straight
                  out of an old print — release-required badge and all */}
              <div className="hero__print" data-drift="0.045" data-drift-rotate="-0.8">
                <div className="hero__print-settle">
                  <Still
                    asset={media('people/chef-fruit-platter')}
                    alt=""
                    sizes="(min-width: 900px) 300px, 44vw"
                    lang={lang}
                  />
                  <Ornament draw className="hero__ornament hero__ornament--echo" />
                </div>
              </div>

              <div className="hero__arch" data-drift="0.05">
                {/* the crowned frame from the restaurant's own mark, drawn in once —
                    it names the window: this is Padishah's arch, not decoration */}
                <Cartouche draw className="hero__crest" />
                <span className="hero__arch-echo" aria-hidden="true" />
                <Loop
                  asset={media('motion/fire')}
                  alt={t.hero.title.replace('\n', ' ')}
                  priority
                  orientation="portrait"
                  lang={lang}
                />
                <p className="hero__caption micro">
                  {lang === 'ru' ? 'Мангал — из съёмки самого ресторана.' : "The grill — the restaurant's own footage."}
                </p>
              </div>

              {/* a small snapshot tucked behind the arch, like a photo pinned to the board */}
              <div className="hero__snap" data-drift="0.08" data-drift-rotate="1.6">
                <div className="hero__snap-settle">
                  <Still
                    asset={media('food/skewer-ranks')}
                    alt=""
                    sizes="(min-width: 900px) 190px, 34vw"
                    lang={lang}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------- fire */}
        <section id="fire" className="section section--ink fire">
          <div className="rail fire__inner">
            <div className="fire__copy reveal">
              <p className="eyebrow">{t.fire.eyebrow}</p>
              <h2>{t.fire.title}</h2>
              <p className="lead">{t.fire.body}</p>
              <ul className="fire__facts" data-stagger>
                <li className="reveal">{lang === 'ru' ? 'Один мангал.' : 'One trough.'}</li>
                <li className="reveal">{lang === 'ru' ? 'Шампуры рядами.' : 'Skewers in ranks.'}</li>
                <li className="reveal">{lang === 'ru' ? 'Дым идёт вверх.' : 'The smoke goes up.'}</li>
              </ul>
            </div>
            <div className="fire__media reveal">
              <Still
                asset={media('food/kebab-smoke')}
                alt={
                  lang === 'ru'
                    ? 'Шампуры с мясом над углями в стальном мангале'
                    : 'Skewers of meat over coals in a steel trough'
                }
                sizes="(min-width: 900px) 40vw, 90vw"
                lang={lang}
              />
              <p className="micro">
                {lang === 'ru'
                  ? 'Кадр из съёмки самого ресторана. Только для согласования.'
                  : "From the restaurant's own footage. Review use only."}
              </p>
            </div>
          </div>
        </section>

        {/* --------------------------------------------------------- board */}
        <section id="board" className="section section--ivory board">
          <div className="rail board__inner">
            <div className="board__media reveal">
              <Loop
                asset={media('motion/serving')}
                alt={
                  lang === 'ru'
                    ? 'Шашлык выкладывают на деревянную доску с красным луком и лимоном'
                    : 'Kebabs laid onto a wooden board with red onion and lemon'
                }
                orientation="portrait"
                lang={lang}
              />
            </div>
            <div className="board__copy reveal">
              <p className="eyebrow">{lang === 'ru' ? 'И на стол' : 'To the table'}</p>
              <h2>{lang === 'ru' ? 'Потом всё выносят на доске.' : 'Then it comes out on the board.'}</h2>
              <p className="lead">
                {lang === 'ru'
                  ? 'С шампуров — на дерево, с лимоном, зеленью и горкой красного лука. Так это уходит из кухни и так пересекает зал.'
                  : 'Off the skewers, onto wood, with lemon, herbs and a heap of red onion. That is how it leaves the kitchen and how it crosses the room.'}
              </p>

            </div>
          </div>
        </section>

        {/* -------------------------------------------------------- dishes */}
        <section id="dishes" className="section section--ivory dishes">
          <div className="rail">
            <header className="dishes__head reveal">
              <div className="dishes__intro">
                <p className="eyebrow">{t.dishes.eyebrow}</p>
                <h2>{t.dishes.title}</h2>
                <p className="lead">{t.dishes.body}</p>
              </div>
              {/* the sharing board as a plate: a circle that turns a few degrees
                  against the scroll — food doing the moving, nothing else */}
              <div className="plate" data-drift="0.06" data-drift-rotate="7">
                <Still
                  asset={media('food/platter-overhead')}
                  alt=""
                  sizes="(min-width: 900px) 380px, 70vw"
                  lang={lang}
                />
              </div>
            </header>

            {/* A printed card, not six empty photo frames: the names are the content. */}
            <ul className="dishlist" data-stagger>
              {dishes.map((dish) => (
                <li key={dish!.id} className="dishlist__item reveal">
                  <h3 className="dishlist__name">{dish!.displayName}</h3>
                  {dish!.description && <p className="dishlist__desc">{dish!.description}</p>}
                </li>
              ))}
            </ul>

            <div className="kitchenstrip reveal">
              <p className="eyebrow kitchenstrip__label">
                {lang === 'ru' ? 'Снято на кухне' : 'Shot in the kitchen'}
              </p>
              <ul className="kitchenstrip__grid" data-stagger>
                {KITCHEN_STRIP.map((id) => (
                  <li key={id} className="reveal">
                    <Still asset={media(id)} sizes="(min-width: 900px) 22vw, 45vw" alt="" lang={lang} />
                  </li>
                ))}
              </ul>
              <p className="micro">
                {lang === 'ru'
                  ? 'Фотографии из публикаций самого ресторана. Мы не подписываем их названиями блюд: какое блюдо в кадре — подтвердит только ресторан.'
                  : "Photographs from the restaurant's own posts. We do not caption them with dish names — only the restaurant can confirm what is in the frame."}
              </p>
            </div>

            {MENU_APPROVED_AT === null && (
              <p className="micro dishes__foot reveal">
                {fill(
                  lang === 'ru'
                    ? 'Названия блюд взяты из открытого справочника от {date}. Ресторан их пока не подтвердил.'
                    : "Dish names come from a public listing dated {date}. The restaurant hasn't approved them yet.",
                  { date: MENU_OBSERVED_AT },
                )}
              </p>
            )}
          </div>
        </section>

        {/* ------------------------------------------------------- passage */}
        <section id="passage" className="passage">
          <div className="rail passage__inner">
            {/* The gate, not the inventory: the menu preview right below carries the
                "The menu / nine sections" head, so the plate must not repeat it. */}
            <Cartouche className="passage__plate" draw>
              <h2 className="passage__title">
                {lang === 'ru' ? 'От салатов до шашлыка.' : 'From salads to skewers.'}
              </h2>
              <Link className="btn btn--gold" href="/menu/">
                {lang === 'ru' ? 'Открыть всё меню' : 'Open the full menu'}
              </Link>
            </Cartouche>
          </div>
        </section>

        {/* -------------------------------------------------- menu preview */}
        <section id="menu-preview" className="section section--cream menupreview">
          <div className="rail">
            <header className="menupreview__head reveal">
              <p className="eyebrow">{t.menuPreview.eyebrow}</p>
              <h2>{t.menuPreview.title}</h2>
              <p className="lead">{t.menuPreview.body}</p>
            </header>
            <ul className="menupreview__grid" data-stagger>
              {CATEGORIES.map((c) => (
                <li key={c.id} className="catcard reveal">
                  <Link href="/menu/">
                    <span className="catcard__name">{c.name}</span>
                    <span className="catcard__count">{ITEMS.filter((i) => i.categoryId === c.id).length}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------------------------------------------------------- room */}
        <section id="room" className="section section--ivory room">
          <div className="rail room__inner">
            <div className="room__copy reveal">
              <p className="eyebrow">{t.room.eyebrow}</p>
              <h2>{lang === 'ru' ? 'Зал для долгих ужинов.' : 'A room made for long dinners.'}</h2>
              <p className="lead">{t.room.body}</p>
              <p className="notice">
                {lang === 'ru'
                  ? 'Зал обновили в июне 2026-го. Всё, что у нас есть, — публичные кадры ресторана; текущие фотографии предоставит сам ресторан.'
                  : 'The room was renewed in June 2026. Everything we have is the restaurant’s own public footage — current photography will come from the restaurant.'}
              </p>
            </div>
            <div className="room__media reveal">
              <Loop
                asset={media('motion/room-table')}
                alt={
                  lang === 'ru'
                    ? 'Длинный накрытый стол с приборами и цветами, без гостей'
                    : 'A long table laid with settings and flowers, no guests'
                }
                lang={lang}
              />
            </div>
          </div>
        </section>

        {/* --------------------------------------------------------- visit */}
        <section id="visit" className="section section--cream visit">
          <div className="rail visit__inner">
            <div className="visit__copy reveal">
              <p className="eyebrow">{t.visit.eyebrow}</p>
              <h2 className="visit__addr">{lang === 'ru' ? '1920 Avenue U, Бруклин.' : '1920 Avenue U, Brooklyn.'}</h2>
              <p className="lead">
                {lang === 'ru'
                  ? 'Позвоните в ресторан — про меню и про всё, на что сайт пока не отвечает.'
                  : "Call the restaurant for the menu or anything the site can't answer yet."}
              </p>
              <div className="visit__cta">
                <a className="btn btn--gold btn--lg" href={`tel:${VERIFIED.phoneE164}`}>
                  {t.hero.ctaCall}
                </a>
                <a
                  className="btn btn--ghost btn--lg"
                  href={VERIFIED.directions}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {t.visit.directions}
                </a>
              </div>

              {/* The sign you are actually looking for on Avenue U. */}
              <div className="visit__store reveal" data-drift="0.03">
                <Loop asset={media('motion/storefront')} alt="" lang={lang} />
              </div>
            </div>

            <div className="visit__facts reveal">
              <div className="visit__block">
                <h3>{t.visit.hoursLabel}</h3>
                <ul className="hours">
                  {HOURS.days.map((d) => (
                    <li key={d.day}>
                      <span className="hours__day">
                        {t.visit.days[d.day as keyof typeof t.visit.days] ?? d.day}
                      </span>
                      <span className="hours__val">{d.value}</span>
                    </li>
                  ))}
                </ul>
                {HOURS.status !== 'owner_confirmed' && (
                  <p className="micro">
                    {fill(
                      lang === 'ru'
                        ? 'Из открытого справочника, проверено {date}. Ресторан пока не подтвердил — перед визитом позвоните.'
                        : "From a public listing, checked {date}. The restaurant hasn't confirmed these yet — please call before you come.",
                      { date: OBSERVED_AT },
                    )}
                  </p>
                )}
              </div>

              <div className="visit__block">
                <h3>{t.visit.phoneLabel}</h3>
                <p className="visit__phone">
                  <a href={`tel:${VERIFIED.phoneE164}`}>{VERIFIED.phoneDisplay}</a>
                </p>
                <h3>{t.visit.instagram}</h3>
                <p>
                  <a href={VERIFIED.instagram} target="_blank" rel="noreferrer noopener">
                    {IG_HANDLE}
                  </a>
                </p>
                <h3>{t.visit.order}</h3>
                <p>
                  <a href={PROVISIONAL.orderLink.value} target="_blank" rel="noreferrer noopener">
                    Grubhub
                  </a>
                </p>
                <p className="micro">{t.visit.orderNote}</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
      <StickyActions />
    </>
  );
}
