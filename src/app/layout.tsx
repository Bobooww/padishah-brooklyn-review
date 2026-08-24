import type { Metadata, Viewport } from 'next';
import { COPY } from '@/content/copy';
import { VERIFIED } from '@/content/generated/facts';
import { LangProvider } from '@/components/LangProvider';
import { SkipLink } from '@/components/Shell';
import './fonts.css';
import './globals.css';
import './app.css';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  'https://eatpadishah.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: COPY.en.meta.title,
  description: COPY.en.meta.description,
  openGraph: {
    title: COPY.en.meta.title,
    description: COPY.en.meta.description,
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-padishah-logo.jpg',
        width: 1200,
        height: 630,
        alt: 'Padishah Restaurant — the crowned mark',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: COPY.en.meta.title,
    description: COPY.en.meta.description,
    images: ['/og-padishah-logo.jpg'],
  },
};

export const viewport: Viewport = {
  themeColor: '#060505',
  colorScheme: 'light',
};

/**
 * Structured data carries ONLY facts that are both verified and visible on the page.
 * Hours, cuisine, price range, reservations and ratings are deliberately absent.
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
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        {/* the browser chrome matches the paper the page opens on */}
        <meta name="theme-color" content="#f7f3ea" />
        {/* the two faces that draw the first screen — swap is already set in fonts.css */}
        <link
          rel="preload"
          href="/fonts/cormorant-normal-500-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/manrope-normal-400-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
