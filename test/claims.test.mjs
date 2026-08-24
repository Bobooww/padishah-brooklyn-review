/**
 * The site is allowed to be beautiful. It is not allowed to claim things the
 * restaurant has not confirmed. These tests read the exported HTML and fail the
 * build if a forbidden claim, a private file or an unpublishable price appears.
 *
 * Run: npm run build && npm test
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const APP = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(APP, 'out');
const SRC = join(APP, 'src');

function walk(dir, filter) {
  if (!existsSync(dir)) return [];
  const found = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) found.push(...walk(full, filter));
    else if (filter(full)) found.push(full);
  }
  return found;
}

const htmlFiles = () => walk(OUT, (f) => f.endsWith('.html'));
const html = () => htmlFiles().map((f) => ({ file: f, body: readFileSync(f, 'utf8') }));
const sourceFiles = () => walk(SRC, (f) => /\.(ts|tsx|css)$/.test(f));

test('an export exists to test', () => {
  assert.ok(htmlFiles().length >= 2, 'run `npm run build` first — no exported HTML found');
});

test('the private NYC health snapshot never enters the app', () => {
  for (const file of sourceFiles()) {
    const body = readFileSync(file, 'utf8');
    assert.ok(!body.includes('nyc-health-snapshot'), `${file} references the private health snapshot`);
  }
  for (const { file, body } of html()) {
    for (const needle of ['nyc-health', 'DOHMH', 'health grade', 'inspection']) {
      assert.ok(!body.toLowerCase().includes(needle.toLowerCase()), `${file} leaks private launch data: ${needle}`);
    }
  }
});

test('no claim the restaurant has not approved', () => {
  // Every phrase here is banned by CONTENT-COPY-DECK.md or FACTS-SOURCE-OF-TRUTH.md.
  const banned = [
    'authentic',
    'best in brooklyn',
    'award-winning',
    'family-owned',
    'since 19',
    'since 20',
    '100% halal',
    'certified halal',
    'signature dish',
    'gluten-free',
    'vegetarian-friendly',
    'аутентичн',
    'лучший в бруклине',
    'семейный ресторан с',
    '100% халяль',
    'фирменное блюдо',
  ];
  for (const { file, body } of html()) {
    const text = body.toLowerCase();
    for (const phrase of banned) {
      assert.ok(!text.includes(phrase), `${file} contains a banned claim: "${phrase}"`);
    }
  }
});

test('no price is ever rendered as $0.00', () => {
  for (const { file, body } of html()) {
    // strip the RSC flight payload: "$0:f:…" is a React reference, not a price
    const visible = body.replace(/<script[\s\S]*?<\/script>/g, '');
    assert.ok(!/\$0\.00/.test(visible), `${file} renders a $0.00 price`);
    assert.ok(!/>\s*\$0\s*</.test(visible), `${file} renders a bare $0`);
  }
  const menu = readFileSync(join(APP, 'src/content/generated/menu.ts'), 'utf8');
  assert.ok(!/"priceCents": 0[,}]/.test(menu), 'a zero price leaked into the generated menu');
});

test('no Instagram CDN URL is embedded — those expire and are not a licence', () => {
  for (const { file, body } of html()) {
    assert.ok(!/cdninstagram|fbcdn\.net|scontent/.test(body), `${file} hotlinks an Instagram CDN asset`);
  }
});

test('every media file the pages reference actually shipped', () => {
  for (const { file, body } of html()) {
    for (const match of body.matchAll(/\/media\/[A-Za-z0-9._/-]+/g)) {
      const path = join(OUT, match[0]);
      assert.ok(existsSync(path), `${file} references a missing asset: ${match[0]}`);
    }
  }
});

test('every shipped media asset carries its rights status, and none claims approval', () => {
  const media = JSON.parse(
    readFileSync(join(APP, 'src/content/generated/media.ts'), 'utf8')
      .replace(/^[\s\S]*?export const MEDIA: Record<string, MediaAsset> = /, '')
      .replace(/;\s*export const PRODUCTION_CLEARED_COUNT[\s\S]*$/, ''),
  );
  const assets = Object.values(media);
  assert.ok(assets.length > 0);
  for (const asset of assets) {
    assert.ok(asset.rightsStatus, `${asset.id} has no rights status`);
    assert.equal(
      asset.productionApproved,
      false,
      `${asset.id} claims production approval — nothing in this library is cleared yet`,
    );
    if (asset.web) {
      assert.ok(asset.alt?.en && asset.alt?.ru, `${asset.id} is rendered without bilingual alt text`);
    }
  }
});

test('public pages omit review markers and include structured data', () => {
  for (const { file, body } of html()) {
    assert.ok(!body.includes('reviewbar'), `${file} contains a review marker`);
    assert.ok(!body.includes('data-review'), `${file} contains a review data attribute`);
    assert.ok(body.includes('application/ld+json'), `${file} is missing structured data`);
  }
});

test('public hours retain a call-ahead note', () => {
  const home = html().find(({ file }) => file.endsWith(join('out', 'index.html')));
  assert.ok(home, 'home page missing');
  assert.ok(
    home.body.includes('10:00 AM') === home.body.includes('Please call before you come.'),
    'opening hours are shown without a call-ahead note',
  );
});
