'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { CATEGORIES, ITEMS, MENU_APPROVED_AT, MENU_OBSERVED_AT, MENU_SOURCE } from '@/content/generated/menu';
import type { MenuItem, MenuNote } from '@/content/types';
import { askMenu, categoryName, formatPrice, searchItems } from '@/lib/menu';
import { REVIEW_MODE } from '@/lib/review-mode';
import { fill } from '@/content/copy';
import { useLang } from '@/components/LangProvider';
import { ReviewBar, SiteHeader, SiteFooter, StickyActions } from '@/components/Shell';
import { observeReveals } from '@/lib/reveal';

const NOTE_KEY: Record<MenuNote, keyof ReturnType<typeof useLang>['t']['menuPage']> = {
  name_suggested: 'noteNameSuggested',
  description_pending: 'noteDescriptionPending',
  possible_duplicate: 'notePossibleDuplicate',
  price_unavailable: 'notePriceUnavailable',
  pending_owner: 'notePendingOwner',
};

function Row({ item, showResearch }: { item: MenuItem; showResearch: boolean }) {
  const { t } = useLang();
  // An owner-approved price wins. Otherwise, in review mode only, the dated research
  // price can be revealed on request — always labelled as research, never as the menu.
  const research = showResearch && item.priceCents === null ? item.researchPriceCents : null;
  const shown = item.priceCents ?? research;
  return (
    <li className="dish">
      <div className="dish__head">
        <h3 className="dish__name">{item.displayName}</h3>
        <span className="dish__leader" aria-hidden="true" />
        <span
          className="dish__price"
          data-unpriced={shown === null ? 'true' : 'false'}
          data-research={research !== null ? 'true' : 'false'}
          title={research !== null ? t.menuPage.researchPriceTag : undefined}
        >
          {formatPrice(shown, t.menuPage.priceUnavailable)}
        </span>
      </div>
      {item.description && <p className="dish__desc">{item.description}</p>}
      {item.ownerConfirmationRequired && <span className="u-sr">{t.menuPage.itemApproval}</span>}
      {item.notes.length > 0 && (
        <ul className="dish__notes">
          {item.notes.map((n) => (
            <li key={n} className="dish__note">
              {t.menuPage[NOTE_KEY[n]]}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function Concierge() {
  const { t } = useLang();
  const [q, setQ] = useState('');
  const [asked, setAsked] = useState<string | null>(null);
  const result = useMemo(() => (asked === null ? null : askMenu(asked)), [asked]);

  return (
    <section className="concierge" aria-labelledby="concierge-title">
      <h2 id="concierge-title" className="concierge__title">
        {t.concierge.title}
      </h2>
      <p className="concierge__lead">{t.concierge.lead}</p>
      <form
        className="concierge__form"
        onSubmit={(e) => {
          e.preventDefault();
          // An empty ask is not a question; answering it with "no matches" would be wrong.
          if (q.trim()) setAsked(q);
        }}
      >
        <label className="u-sr" htmlFor="concierge-q">
          {t.concierge.title}
        </label>
        <input
          id="concierge-q"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t.concierge.placeholder}
          autoComplete="off"
        />
        <button type="submit" className="btn btn--gold">
          {t.concierge.submit}
        </button>
      </form>

      <div className="concierge__out" aria-live="polite">
        {result?.kind === 'refusal' && <p className="concierge__refusal">{t.concierge.refusal}</p>}
        {result?.kind === 'empty' && <p className="concierge__refusal">{t.concierge.empty}</p>}
        {result?.kind === 'matches' && (
          <>
            <p className="concierge__label">{t.concierge.resultsLabel}</p>
            <ul className="concierge__list">
              {result.items.map(({ item }) => (
                <li key={item.id}>
                  <span className="concierge__dish">{item.displayName}</span>
                  <span className="concierge__cat">
                    {t.menuCategories[item.categoryId as keyof typeof t.menuCategories] ?? categoryName(item.categoryId)}
                  </span>
                  <span className="concierge__price">
                    {formatPrice(item.priceCents, t.menuPage.priceUnavailable)}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}

export default function MenuClient() {
  const { t } = useLang();
  const [active, setActive] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [showResearch, setShowResearch] = useState(false);
  const main = useRef<HTMLElement>(null);

  useEffect(() => observeReveals(document), []);

  const filtered = useMemo(() => {
    const base = query.trim() ? searchItems(query) : ITEMS;
    return active === 'all' ? base : base.filter((i) => i.categoryId === active);
  }, [active, query]);

  const groups = CATEGORIES.map((c) => ({ category: c, items: filtered.filter((i) => i.categoryId === c.id) })).filter(
    (g) => g.items.length > 0,
  );

  return (
    <>
      <ReviewBar />
      <SiteHeader tone="ivory" />
      <main id="menu-main" ref={main} className="menupage" tabIndex={-1}>
        <div className="rail menupage__head">
          <p className="eyebrow">{t.menuPage.title}</p>
          <h1 className="menupage__title">{t.menuPreview.title}</h1>
          <p className="menupage__lead">{t.menuPage.lead}</p>
          {/* The "being confirmed" notice must disappear the day the owner approves the menu. */}
          {MENU_APPROVED_AT === null && <p className="menupage__notice">{t.menuPage.notice}</p>}
          <p className="menupage__observed">
            {fill(t.menuPage.observed, { date: MENU_OBSERVED_AT, source: MENU_SOURCE.platform })}
          </p>
          {REVIEW_MODE && (
            <div className="pricereveal">
              <button
                type="button"
                className="pricereveal__btn"
                onClick={() => setShowResearch((v) => !v)}
                aria-expanded={showResearch}
              >
                {showResearch
                  ? t.menuPage.hideResearchPrices
                  : fill(t.menuPage.showResearchPrices, { date: MENU_OBSERVED_AT })}
              </button>
              {showResearch && (
                <p className="pricereveal__note">{fill(t.menuPage.researchPriceNote, { date: MENU_OBSERVED_AT })}</p>
              )}
            </div>
          )}
        </div>

        <div className="menunav">
          <div className="rail menunav__inner">
            <div className="menunav__tabs" role="group" aria-label={t.menuPage.title}>
              <button
                type="button"
                aria-pressed={active === 'all'}
                className="menunav__tab"
                onClick={() => setActive('all')}
              >
                {t.menuPage.all}
              </button>
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={active === c.id}
                  className="menunav__tab"
                  onClick={() => setActive(c.id)}
                >
                  {t.menuCategories[c.id as keyof typeof t.menuCategories] ?? c.name}
                </button>
              ))}
            </div>
            <div className="menunav__search">
              <label className="u-sr" htmlFor="menu-search">
                {t.menuPage.search}
              </label>
              <input
                id="menu-search"
                type="search"
                value={query}
                onChange={(e) => {
                  const next = e.target.value;
                  // A fresh search looks across the whole menu — a leftover category
                  // tab must not silently hide matches. Tabs can narrow it again.
                  if (next.trim() && !query.trim()) setActive('all');
                  setQuery(next);
                }}
                placeholder={t.menuPage.searchPlaceholder}
                autoComplete="off"
              />
            </div>
          </div>
        </div>

        <div className="rail menupage__body">
          <p className="menupage__count" aria-live="polite">
            {fill(t.menuPage.countLabel, { n: filtered.length })}
          </p>

          {groups.length === 0 && <p className="menupage__empty">{t.menuPage.empty}</p>}

          {groups.map(({ category, items }) => (
            <section
              key={category.id}
              className="course reveal"
              aria-labelledby={`c-${category.id}`}
              data-approval={category.approval}
            >
              <h2 id={`c-${category.id}`} className="course__title">
                {t.menuCategories[category.id as keyof typeof t.menuCategories] ?? category.name}
                <span className="course__count">{items.length}</span>
                {category.ownerConfirmationRequired && <span className="u-sr"> — {t.menuPage.categoryApproval}</span>}
              </h2>
              <ul className="course__list">
                {items.map((item) => (
                  <Row key={item.id} item={item} showResearch={showResearch} />
                ))}
              </ul>
            </section>
          ))}

          <Concierge />
        </div>
      </main>

      <SiteFooter />
      <StickyActions />
    </>
  );
}
