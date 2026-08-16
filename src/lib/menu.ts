import { CATEGORIES, ITEMS } from '@/content/generated/menu';
import type { MenuItem } from '@/content/types';

export const categoryName = (id: string) => CATEGORIES.find((c) => c.id === id)?.name ?? id;

export const itemsIn = (categoryId: string) => ITEMS.filter((i) => i.categoryId === categoryId);

/** A published price, or null. Zero never reaches this function — build-content strips it. */
export function formatPrice(cents: number | null, fallback: string): string {
  if (cents === null || cents <= 0) return fallback;
  return cents % 100 === 0 ? `$${cents / 100}` : `$${(cents / 100).toFixed(2)}`;
}

/* ------------------------------------------------------------------ search */

const normalise = (s: string) =>
  s
    .toLowerCase()
    .replace(/[ё]/g, 'е')
    .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Russian and colloquial words mapped onto words that actually occur in the
 * English menu data. This is a vocabulary bridge, not knowledge: every target
 * word below appears verbatim in the public listing.
 */
const SYNONYMS: Record<string, string[]> = {
  шашлык: ['kebab'],
  шашлыки: ['kebab'],
  кебаб: ['kebab'],
  люля: ['lulya'],
  баранина: ['lamb'],
  ягненок: ['lamb'],
  ребрышки: ['ribs'],
  ребра: ['ribs'],
  говядина: ['beef'],
  телятина: ['veal'],
  печень: ['liver'],
  курица: ['chicken'],
  куриные: ['chicken'],
  крылья: ['wings'],
  рыба: ['salmon', 'tilapia', 'bass', 'fish'],
  лосось: ['salmon'],
  семга: ['salmon'],
  салат: ['salad'],
  суп: ['soup', 'shurpa', 'mastava'],
  шурпа: ['shurpa'],
  мастава: ['mastava'],
  самса: ['samsa'],
  манты: ['manti'],
  ачичук: ['achichuk'],
  картошка: ['potato', 'potatoes', 'fries'],
  картофель: ['potato', 'potatoes'],
  фри: ['fries'],
  рис: ['rice'],
  плов: ['rice'],
  овощи: ['vegetables'],
  помидор: ['tomato', 'tomatoes'],
  язык: ['tongue'],
  закуска: ['appetizer', 'appetizers'],
  напиток: ['cola', 'beverages'],
  вода: ['beverages'],
  гриль: ['grilled', 'kebab'],
  grill: ['grilled', 'kebab'],
  skewer: ['kebab'],
  skewers: ['kebab'],
  bbq: ['kebab', 'grilled'],
  dumpling: ['manti'],
  dumplings: ['manti'],
  pastry: ['samsa'],
  starter: ['appetizer'],
  starters: ['appetizers'],
  drink: ['cola', 'beverages'],
  drinks: ['cola', 'beverages'],
};

/** Questions this data cannot answer. The restaurant answers them, not the site. */
const REFUSE = [
  'halal',
  'халяль',
  'халял',
  'allerg',
  'аллерг',
  'gluten',
  'глютен',
  'vegan',
  'веган',
  'vegetarian',
  'вегетариан',
  'spicy',
  'остр',
  'nut',
  'орех',
  'dairy',
  'лактоз',
  'молочн',
  'pork',
  'свинин',
  'kosher',
  'кошер',
  'calorie',
  'калор',
  'diet',
  'диет',
  'certif',
  'сертиф',
  'fresh',
  'organic',
];

export type ConciergeResult =
  | { kind: 'refusal' }
  | { kind: 'empty' }
  | { kind: 'matches'; items: { item: MenuItem; matched: string[] }[] };

export function askMenu(query: string): ConciergeResult {
  const q = normalise(query);
  if (!q) return { kind: 'empty' };
  if (REFUSE.some((word) => q.includes(word))) return { kind: 'refusal' };

  const tokens = q.split(' ').filter((t) => t.length > 2);
  const expanded = new Set<string>();
  for (const t of tokens) {
    expanded.add(t);
    for (const s of SYNONYMS[t] ?? []) expanded.add(s);
    // crude Russian stem: drop a trailing inflection so "шашлыком" reaches "шашлык"
    if (t.length > 5) {
      const stem = t.slice(0, -1);
      for (const s of SYNONYMS[stem] ?? []) expanded.add(s);
    }
  }
  if (expanded.size === 0) return { kind: 'empty' };

  const scored = ITEMS.map((item) => {
    const haystack = normalise(
      `${item.displayName} ${item.rawName} ${item.description ?? ''} ${categoryName(item.categoryId)}`,
    );
    const matched: string[] = [];
    let score = 0;
    for (const token of expanded) {
      if (!haystack.includes(token)) continue;
      matched.push(token);
      // a hit in the dish name counts double: it is what the guest will read
      score += normalise(item.displayName).includes(token) ? 2 : 1;
    }
    if (item.featured) score += 0.5;
    return { item, matched, score };
  })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.item.displayName.localeCompare(b.item.displayName))
    .slice(0, 6);

  if (scored.length === 0) return { kind: 'empty' };
  return { kind: 'matches', items: scored.map(({ item, matched }) => ({ item, matched })) };
}

/* -------------------------------------------------------------- text search */

export function searchItems(query: string): MenuItem[] {
  const q = normalise(query);
  if (!q) return ITEMS;
  const tokens = new Set<string>();
  for (const t of q.split(' ')) {
    if (!t) continue;
    tokens.add(t);
    for (const s of SYNONYMS[t] ?? []) tokens.add(s);
  }
  return ITEMS.filter((item) => {
    const haystack = normalise(
      `${item.displayName} ${item.rawName} ${item.description ?? ''} ${categoryName(item.categoryId)}`,
    );
    return [...tokens].some((t) => haystack.includes(t));
  });
}
