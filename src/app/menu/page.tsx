import type { Metadata } from 'next';
import { COPY } from '@/content/copy';
import { VERIFIED } from '@/content/generated/facts';
import MenuClient from './MenuClient';

export const metadata: Metadata = {
  title: `${COPY.en.menuPage.title} — ${VERIFIED.name}`,
  description: COPY.en.menuPage.lead,
};

export default function MenuPage() {
  return <MenuClient />;
}
