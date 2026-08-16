'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { VERIFIED, OBSERVED_AT, PROVISIONAL } from '@/content/generated/facts';
import { fill } from '@/content/copy';
import { media, pickSource, REVIEW_MODE } from '@/lib/review-mode';
import { useLang, LangToggle } from '@/components/LangProvider';

const LOGO_ASSET = media('hero/current-padishah-logo-poster-crop');
const LOGO = pickSource(LOGO_ASSET, (src) => src.endsWith('.webp'));

/** The displayed handle is derived from the verified profile URL, never hand-copied. */
export const IG_HANDLE = `@${new URL(VERIFIED.instagram).pathname.split('/').filter(Boolean)[0]}`;

export function SkipLink() {
  const pathname = usePathname();
  const { t } = useLang();
  const target = pathname.startsWith('/menu') ? 'menu-main' : 'hero';
  return (
    <a
      className="u-skip"
      href={`#${target}`}
      onClick={(event) => {
        const destination = document.getElementById(target);
        if (!destination) return;
        event.preventDefault();
        if (!destination.hasAttribute('tabindex')) destination.setAttribute('tabindex', '-1');
        destination.focus();
        window.history.replaceState(null, '', `#${target}`);
      }}
    >
      {t.nav.skip}
    </a>
  );
}

/* --------------------------------------------------------------- review bar */

/**
 * The persistent review disclosure, restaged as a quiet floating pill instead of
 * a bar across the top: the disclaimer never leaves the screen, but it stops
 * shouting over the hero. The full banner text and the verified-facts list live
 * in the panel the pill opens.
 */
export function ReviewBar() {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  if (!REVIEW_MODE) return null;

  const verified = [
    [t.review.verifiedLabels.name, VERIFIED.name],
    [t.review.verifiedLabels.address, VERIFIED.addressLine],
    [t.review.verifiedLabels.phone, VERIFIED.phoneDisplay],
    [t.review.verifiedLabels.instagram, IG_HANDLE],
    [t.review.verifiedLabels.directions, t.review.directionsValue],
  ];

  return (
    <div className="reviewbar" data-open={open ? 'true' : 'false'}>
      <div className="reviewbar__panel" id="reviewbar-panel" hidden={!open}>
        <p className="reviewbar__text">{t.review.banner}</p>
        <dl>
          {verified.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <p className="reviewbar__meta">{fill(t.review.checked, { date: OBSERVED_AT })}</p>
      </div>
      <button
        type="button"
        className="reviewbar__toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="reviewbar-panel"
      >
        <span className="reviewbar__dot" aria-hidden="true" />
        {t.review.bannerShort}
        <span className="reviewbar__sep" aria-hidden="true">
          ·
        </span>
        {t.review.verifiedToggle}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------- header */

export function SiteHeader({ tone = 'ink' }: { tone?: 'ink' | 'ivory' }) {
  const { t, lang } = useLang();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="hdr" data-tone={tone} data-scrolled={scrolled ? 'true' : 'false'}>
      <div className="rail hdr__inner">
        <Link href="/" className="hdr__brand" aria-label={VERIFIED.name}>
          <img src={LOGO} alt={LOGO_ASSET.alt?.[lang] ?? VERIFIED.name} width={124} height={45} />
          <span className="hdr__where">{VERIFIED.street} · {VERIFIED.city}</span>
        </Link>

        <nav className="hdr__nav" aria-label={t.nav.mainLabel}>
          <Link href="/menu/">{t.nav.menu}</Link>
          <a href="/#fire">{t.nav.fire}</a>
          <a href="/#visit">{t.nav.visit}</a>
        </nav>

        <div className="hdr__actions">
          <LangToggle />
          <a className="btn btn--ghost" href={VERIFIED.directions} target="_blank" rel="noreferrer noopener">
            {t.nav.directions}
          </a>
          <a className="btn btn--gold" href={`tel:${VERIFIED.phoneE164}`}>
            {t.nav.call}
          </a>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------ sticky mobile */

export function StickyActions() {
  const { t } = useLang();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.7);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="sticky-actions" data-show={show ? 'true' : 'false'}>
      <a href={`tel:${VERIFIED.phoneE164}`} className="sticky-actions__btn sticky-actions__btn--gold">
        {t.nav.call}
      </a>
      <a href={VERIFIED.directions} target="_blank" rel="noreferrer noopener" className="sticky-actions__btn">
        {t.nav.directions}
      </a>
      <Link href="/menu/" className="sticky-actions__btn">
        {t.nav.menu}
      </Link>
    </div>
  );
}

/* ------------------------------------------------------------------- footer */

export function SiteFooter() {
  const { t, lang } = useLang();
  return (
    <footer className="ftr">
      <div className="rail ftr__inner">
        <div className="ftr__brand">
          <img src={LOGO} alt={LOGO_ASSET.alt?.[lang] ?? VERIFIED.name} width={124} height={45} />
          <p className="ftr__addr">
            {VERIFIED.addressLine}
            <br />
            <a href={`tel:${VERIFIED.phoneE164}`}>{VERIFIED.phoneDisplay}</a>
          </p>
        </div>

        <nav className="ftr__links" aria-label={t.nav.footerLabel}>
          <Link href="/menu/">{t.nav.menu}</Link>
          <a href={VERIFIED.instagram} target="_blank" rel="noreferrer noopener">
            {t.visit.instagram}
          </a>
          <a href={VERIFIED.directions} target="_blank" rel="noreferrer noopener">
            {t.visit.directions}
          </a>
          <a href={PROVISIONAL.orderLink.value} target="_blank" rel="noreferrer noopener">
            {t.visit.order}
            <span className="ftr__prov" aria-hidden="true">
              ?
            </span>
            <span className="u-sr">— {t.visit.orderNote}</span>
          </a>
        </nav>

        {REVIEW_MODE && (
          <details className="ftr__pending">
            <summary>{t.footer.pendingTitle}</summary>
            <ul>
              {t.footer.pendingItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </details>
        )}

        <p className="ftr__note">
          {t.footer.rights} {fill(t.footer.factsChecked, { date: OBSERVED_AT })}
        </p>
      </div>
    </footer>
  );
}
