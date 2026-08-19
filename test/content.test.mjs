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

  assert.equal(categories.length, 8);
  assert.equal(items.length, 143);
  // Owner-approved menu (Clover export, 2026-08-17): every category and item is
  // owner_confirmed and every visible dish carries a real published price.
  assert.ok(categories.every((category) => category.approval === 'owner_confirmed'));
  assert.ok(items.every((item) => item.approval === 'owner_confirmed'));
  assert.ok(items.every((item) => item.priceCents === null || item.priceCents > 0));
  assert.ok(items.filter((item) => item.priceCents > 0).length >= 140, 'published prices went missing');

  // Owner-supplied Clover export, 2026-08-17: no zero-priced dish ships, and a
  // couple of spot prices pin the conversion (Achichuk $14.95, Manti… varies).
  assert.ok(!/"priceCents": 0[,}]/.test(source), 'a zero price leaked into the menu');
  const achichuk = source.match(/"rawName": "ACHICHUK"[\s\S]{0,400}?"priceCents": (\d+)/);
  assert.ok(achichuk, 'ACHICHUK missing from the generated menu');
  assert.equal(Number(achichuk[1]), 1495);
  assert.ok(source.includes('"MENU_APPROVED_AT": null') === false, 'menu approval date missing');
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

