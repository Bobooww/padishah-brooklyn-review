#!/usr/bin/env node
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  assertNoInstagramCdn,
  assertPrivateDataExcluded,
  assertProductionApprovals,
  assertProductionMediaApproved,
  loadJson,
  reviewModeFromEnv,
} from './site-guards.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const SITE = resolve(HERE, '..');
const RESEARCH = resolve(SITE, '../website-research');
const includeOutput = process.argv.includes('--output');
const reviewMode = reviewModeFromEnv();

assertPrivateDataExcluded(SITE, { includeOutput });
assertNoInstagramCdn(SITE, { includeOutput });

if (!reviewMode) {
  const manifest = loadJson(resolve(RESEARCH, 'media-library/manifest.json'));
  const derivatives = loadJson(resolve(SITE, 'public/media/derivatives.json'));
  const approvals = loadJson(resolve(RESEARCH, 'data/production-approvals.json'));
  const used = assertProductionMediaApproved(SITE, manifest, derivatives);
  assertProductionApprovals(SITE, approvals);
  console.log(`production gate: ${used.length} referenced media assets cleared; explicit approvals present`);
} else {
  console.log(`review gate: private data and Instagram CDN checks passed${includeOutput ? ' for exported output' : ''}`);
}
