import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import {
  assertNoInstagramCdn,
  assertPrivateDataExcluded,
  assertProductionApprovals,
  assertProductionMediaApproved,
  collectUsedMedia,
  loadJson,
  reviewModeFromEnv,
} from '../scripts/site-guards.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const SITE = resolve(HERE, '..');
const RESEARCH = resolve(SITE, '../website-research');

function fixture() {
  const root = mkdtempSync(resolve(tmpdir(), 'padishah-guard-'));
  mkdirSync(resolve(root, 'src'), { recursive: true });
  mkdirSync(resolve(root, 'public/media'), { recursive: true });
  return root;
}

test('review mode defaults true and production requires an explicit false', () => {
  assert.equal(reviewModeFromEnv({}), true);
  assert.equal(reviewModeFromEnv({ SITE_REVIEW_MODE: 'true' }), true);
  assert.equal(reviewModeFromEnv({ SITE_REVIEW_MODE: 'false' }), false);
  assert.throws(() => reviewModeFromEnv({ SITE_REVIEW_MODE: '0' }), /must be exactly/);
});

test('private NYC health research cannot be referenced from src or public', () => {
  assert.doesNotThrow(() => assertPrivateDataExcluded(SITE));
  const root = fixture();
  writeFileSync(resolve(root, 'src/leak.ts'), "import privateData from '../../data/nyc-health-snapshot.json';\n");
  assert.throws(() => assertPrivateDataExcluded(root), /Private NYC health research/);
});

test('Instagram CDN URLs are rejected while stable Instagram page URLs are allowed', () => {
  assert.doesNotThrow(() => assertNoInstagramCdn(SITE));
  const root = fixture();
  writeFileSync(resolve(root, 'src/stable.ts'), "export const page = 'https://www.instagram.com/example/';\n");
  assert.doesNotThrow(() => assertNoInstagramCdn(root));
  writeFileSync(resolve(root, 'public/leak.json'), '{"src":"https://scontent.cdninstagram.com/photo.jpg"}\n');
  assert.throws(() => assertNoInstagramCdn(root), /Instagram CDN URLs are forbidden/);
});

test('production rejects every referenced media entry that is not explicitly cleared', () => {
  const manifest = loadJson(resolve(RESEARCH, 'media-library/manifest.json'));
  const derivatives = loadJson(resolve(SITE, 'public/media/derivatives.json'));
  const used = collectUsedMedia(SITE, manifest, derivatives);
  assert.ok(used.length >= 8, 'expected the guard to discover homepage and shell media references');
  assert.throws(
    () => assertProductionMediaApproved(SITE, manifest, derivatives),
    /Production build blocked by media without written clearance/,
  );
});

test('production media gate accepts only a referenced cleared asset with approved alt text', () => {
  const root = fixture();
  writeFileSync(resolve(root, 'src/page.tsx'), "const image = media('food/photo');\n");
  const manifest = {
    site_alt_text: { 'food/photo': { en: 'Food', ru: 'Еда', status: 'owner_confirmed' } },
    files: [
      {
        path: 'selected/food/photo.jpg',
        rights_status: 'client_supplied_cleared',
        production_approved: true,
      },
    ],
  };
  const derivatives = { assets: { 'food/photo': { derivedFrom: 'selected/food/photo.jpg', sources: [] } } };
  assert.deepEqual(assertProductionMediaApproved(root, manifest, derivatives), ['food/photo']);
});

test('production approvals fail closed while owner fields are blank', () => {
  const approvals = loadJson(resolve(RESEARCH, 'data/production-approvals.json'));
  assert.throws(() => assertProductionApprovals(SITE, approvals), /current_hours\.days/);
  assert.throws(() => assertProductionApprovals(SITE, approvals), /menu\.approved_at/);
  assert.throws(() => assertProductionApprovals(SITE, approvals), /logo_master\.public_path/);
  assert.throws(() => assertProductionApprovals(SITE, approvals), /canonical_order_url\.value/);
  assert.throws(() => assertProductionApprovals(SITE, approvals), /canonical_reservation_url\.value/);
});

test('production approvals accept complete explicit owner values', () => {
  const root = fixture();
  mkdirSync(resolve(root, 'public/brand'), { recursive: true });
  writeFileSync(resolve(root, 'public/brand/logo.svg'), '<svg xmlns="http://www.w3.org/2000/svg"/>\n');
  const days = Object.fromEntries(
    ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => [
      day,
      '10:00 AM–10:00 PM',
    ]),
  );
  const approved = {
    current_hours: { days, summary: 'Daily 10:00 AM–10:00 PM', approved_at: '2026-08-01' },
    menu: { approved_at: '2026-08-01' },
    logo_master: { public_path: '/brand/logo.svg', approved_at: '2026-08-01' },
    canonical_order_url: { value: 'https://orders.example.test/', approved_at: '2026-08-01' },
    canonical_reservation_url: { value: 'tel:+17187439656', approved_at: '2026-08-01' },
    content_copy: { approved_at: '2026-08-01' },
  };
  assert.doesNotThrow(() => assertProductionApprovals(root, approved));
});
