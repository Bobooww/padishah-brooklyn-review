import type { Metadata, Viewport } from 'next';
import { COPY } from '@/content/copy';
import { VERIFIED } from '@/content/generated/facts';
import { REVIEW_MODE } from '@/lib/review-mode';
import { LangProvider } from '@/components/LangProvider';
import { SkipLink } from '@/components/Shell';
import './fonts.css';
import './globals.css';
import './app.css';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  'https://padishah-brooklyn-review.shamsworkcabin.chatgpt.site';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: COPY.en.meta.title,
  description: COPY.en.meta.description,
  // Private review build. It must never be indexed before the restaurant approves it.
  robots: REVIEW_MODE ? { index: false, follow: false, nocache: true } : undefined,
  openGraph: {
    title: COPY.en.meta.title,
    description: COPY.en.meta.description,
    type: 'website',
    locale: 'en_US',
    images: REVIEW_MODE
      ? [
          {
            url: '/og-review-only.jpg',
            width: 1200,
            height: 627,
            alt: 'Padishah Restaurant — off the fire, onto the table',
          },
        ]
      : undefined,
  },
  twitter: REVIEW_MODE
    ? {
        card: 'summary_large_image',
        title: COPY.en.meta.title,
        description: COPY.en.meta.description,
        images: ['/og-review-only.jpg'],
      }
    : undefined,
};

export const viewport: Viewport = {
  themeColor: '#060505',
  colorScheme: 'light',
};

/**
 * Structured data carries ONLY facts that are both verified and visible on the page.
 * Hours, cuisine, price range, reservations and ratings are deliberately absent:
 * they are still pending the restaurant's confirmation.
 */
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Restaurant',
  name: VERIFIED.name,
  telephone: VERIFIED.phoneE164,
  address: {
    '@type': 'PostalAddress',
    streetAddress: VERIFIED.street,
    addressLocality: VERIFIED.city,
    addressRegion: VERIFIED.state,
    postalCode: VERIFIED.postalCode,
    addressCountry: VERIFIED.country,
  },
  sameAs: [VERIFIED.instagram],
  hasMap: VERIFIED.directions,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: the inline script below strips .no-js before React hydrates
    <html
      lang="en"
      className="no-js"
      data-review={REVIEW_MODE ? 'true' : 'false'}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        {!REVIEW_MODE && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        )}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.remove('no-js');`,
          }}
        />
      </head>
      <body>
        <LangProvider>
          <SkipLink />
          {children}
        </LangProvider>
      </body>
    </html>
  );
}
