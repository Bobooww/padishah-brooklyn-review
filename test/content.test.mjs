import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const HERE = dirname(fileURLToPath(import.meta.url));
const SITE = resolve(HERE, '..');

function generatedArray(source, exportName, typeSuffix) {
  const start = source.indexOf(`export const ${exportName}${typeSuffix} = `);
  assert.notEqual(start, -1, `missing generated export ${exportName}`);
  const jsonStart = start + `export const ${exportName}${typeSuffix} = `.length;
  const end = source.indexOf('\n];', jsonStart);
  assert.notEqual(end, -1, `unterminated generated export ${exportName}`);
  return JSON.parse(source.slice(jsonStart, end + 2));
}

test('menu generation preserves all structured items but withholds unapproved prices', () => {
  execFileSync(process.execPath, ['scripts/build-content.mjs'], { cwd: SITE, stdio: 'pipe' });
  const source = readFileSync(resolve(SITE, 'src/content/generated/menu.ts'), 'utf8');
  const categories = generatedArray(source, 'CATEGORIES', ': MenuCategory[]');
  const items = generatedArray(source, 'ITEMS', ': MenuItem[]');

  assert.equal(categories.length, 9);
  assert.equal(items.length, 42);
  assert.ok(categories.every((category) => category.approval === 'research_only'));
  assert.ok(categories.every((category) => category.ownerConfirmationRequired === true));
  assert.ok(items.every((item) => item.approval === 'research_only'));
  assert.ok(items.every((item) => item.ownerConfirmationRequired === true));
  assert.ok(items.every((item) => item.priceCents === null), 'research prices must not be presented as public prices');
  assert.ok(items.some((item) => item.researchPriceCents > 0), 'research price audit values should be retained');
  assert.ok(items.every((item) => item.researchPriceCents !== 0));

  const beefSoup = items.find((item) => item.rawName === 'Beef soup');
  assert.equal(beefSoup.researchPriceCents, null);
  assert.equal(beefSoup.priceStatus, 'blocked');
  assert.ok(beefSoup.flags.includes('owner_confirmation_required'));
});

test('generated media carries bilingual manifest alt text for every referenced asset', () => {
  const source = readFileSync(resolve(SITE, 'src/content/generated/media.ts'), 'utf8');
  // The roster changed 2026-08-16: every photographic asset now derives from
  // the owner-supplied 4K batch; pre-renovation assets were retired outright.
  for (const id of [
    'food/board-overhead',
    'food/lulya-smoke',
    'food/storefront-print',
    'food/samsa-trays-new',
    'food/cold-platter-new',
    'food/noodle-tower',
    'food/salad-crown',
    'food/noodle-plate',
    'hero/current-padishah-logo-poster-crop',
    'motion/fire',
    'motion/mangal',
    'motion/raw-rank',
    'motion/ribs-fries',
    'motion/meat-board',
    'motion/banquet-grand',
    'motion/storefront-walk',
    'motion/terrace',
    'motion/plated-spin',
    'motion/dessert-glasses',
    'motion/furshet',
    'motion/meat-platter',
    'motion/table-cards',
    'motion/hall-sign',
  ]) {
    const offset = source.indexOf(`"${id}":`);
    assert.notEqual(offset, -1, `missing media asset ${id}`);
    const block = source.slice(offset, offset + 2500);
    assert.match(block, /"alt": \{/);
    assert.match(block, /"en": /);
    assert.match(block, /"ru": /);
  }
});

