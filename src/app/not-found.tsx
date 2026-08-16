'use client';

import Link from 'next/link';
import { VERIFIED } from '@/content/generated/facts';
import { ReviewBar, SiteHeader, SiteFooter } from '@/components/Shell';
import { useLang } from '@/components/LangProvider';

export default function NotFound() {
  const { t, lang } = useLang();
  return (
    <>
      <ReviewBar />
      <SiteHeader tone="ivory" />
      {/* id="hero": the layout's skip link targets #hero on every non-menu route */}
      <main id="hero" tabIndex={-1} className="section section--ivory">
        <div className="rail">
          <p className="eyebrow">404</p>
          <h1 style={{ marginTop: '0.8rem' }}>
            {lang === 'ru' ? 'Такой страницы нет.' : 'That page is not here.'}
          </h1>
          <p className="lead">
            {lang === 'ru'
              ? 'Меню, часы и маршрут — на главной. Или позвоните нам.'
              : 'The menu, the hours and the directions are on the home page. Or call us.'}
          </p>
          <div className="hero__cta">
            <Link className="btn btn--gold btn--lg" href="/">
              {lang === 'ru' ? 'На главную' : 'Home'}
            </Link>
            <a className="btn btn--ghost btn--lg" href={`tel:${VERIFIED.phoneE164}`}>
              {t.nav.call}
            </a>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
