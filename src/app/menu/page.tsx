import type { Metadata } from 'next';
import { COPY } from '@/content/copy';
import { VERIFIED } from '@/content/generated/facts';
import { REVIEW_MODE } from '@/lib/review-mode';
import MenuClient from './MenuClient';

export const metadata: Metadata = {
  title: `${COPY.en.menuPage.title} — ${VERIFIED.name}`,
  description: COPY.en.menuPage.lead,
  robots: REVIEW_MODE ? { index: false, follow: false, nocache: true } : undefined,
};

export default function MenuPage() {
  return <MenuClient />;
}
