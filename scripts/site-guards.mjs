import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';

const TEXT_EXTENSIONS = new Set(['.css', '.html', '.js', '.json', '.jsx', '.map', '.mjs', '.ts', '.tsx', '.txt']);
const APPROVED_MEDIA_RIGHTS = new Set(['client_supplied_cleared', 'approved_for_production']);
const PRIVATE_DATA_MARKER = 'nyc-health-snapshot';
const INSTAGRAM_CDN = /(?:cdninstagram\.com|fbcdn\.net|scontent[^\s"']*instagram)/i;

function filesUnder(root) {
  if (!existsSync(root)) return [];
  const found = [];
  const visit = (path) => {
    const stat = statSync(path);
    if (stat.isDirectory()) {
      for (const name of readdirSync(path)) visit(join(path, name));
      return;
    }
    found.push(path);
  };
  visit(root);
  return found;
}

function textFilesUnder(root) {
  return filesUnder(root).filter((file) => TEXT_EXTENSIONS.has(extname(file).toLowerCase()));
}

function sourceText(siteRoot) {
  return textFilesUnder(resolve(siteRoot, 'src'))
    .filter((file) => !file.endsWith('/src/content/generated/media.ts'))
    .map((file) => readFileSync(file, 'utf8'))
    .join('\n');
}

function idOf(path) {
  const name = path
    .split('/')
    .pop()
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/-(review-only|release-required)$/, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .toLowerCase();
  return `${path.split('/')[1]}/${name}`;
}

function isIsoDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

function isUrl(value, protocols) {
  if (typeof value !== 'string' || value.length === 0) return false;
  try {
    return protocols.includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

export function reviewModeFromEnv(env = process.env) {
  const raw = env.SITE_REVIEW_MODE;
  if (raw === undefined || raw === '') return true;
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  throw new Error(`SITE_REVIEW_MODE must be exactly "true" or "false"; received ${JSON.stringify(raw)}.`);
}

export function assertPrivateDataExcluded(siteRoot, { includeOutput = false } = {}) {
  const roots = [resolve(siteRoot, 'src'), resolve(siteRoot, 'public')];
  if (includeOutput) roots.push(resolve(siteRoot, 'out'));
  const violations = [];
  for (const root of roots) {
    for (const file of filesUnder(root)) {
      const rel = relative(siteRoot, file);
      if (rel.toLowerCase().includes(PRIVATE_DATA_MARKER)) {
        violations.push(`${rel} (forbidden filename)`);
        continue;
      }
      if (TEXT_EXTENSIONS.has(extname(file).toLowerCase()) && readFileSync(file, 'utf8').toLowerCase().includes(PRIVATE_DATA_MARKER)) {
        violations.push(`${rel} (forbidden import/reference)`);
      }
    }
  }
  if (violations.length) {
    throw new Error(`Private NYC health research must never enter website source or public output:\n- ${violations.join('\n- ')}`);
  }
}

export function assertNoInstagramCdn(siteRoot, { includeOutput = false } = {}) {
  const roots = [resolve(siteRoot, 'src'), resolve(siteRoot, 'public')];
  if (includeOutput) roots.push(resolve(siteRoot, 'out'));
  const violations = [];
  for (const root of roots) {
    for (const file of textFilesUnder(root)) {
      if (INSTAGRAM_CDN.test(readFileSync(file, 'utf8'))) violations.push(relative(siteRoot, file));
    }
  }
  if (violations.length) {
    throw new Error(`Instagram CDN URLs are forbidden in source and public output:\n- ${violations.join('\n- ')}`);
  }
}

export function collectUsedMedia(siteRoot, manifest, derivatives) {
  const text = sourceText(siteRoot);
  const byId = new Map();

  for (const file of manifest.files.filter((entry) => entry.path.startsWith('selected/'))) {
    byId.set(idOf(file.path), file);
  }
  const byPath = new Map(manifest.files.map((entry) => [entry.path, entry]));
  for (const [id, derivative] of Object.entries(derivatives.assets ?? {})) {
    const parent = byPath.get(derivative.derivedFrom);
    if (!parent) throw new Error(`Derivative ${id} points to unknown manifest source ${derivative.derivedFrom}.`);
    byId.set(id, parent);
  }

  return [...byId.entries()]
    .filter(([id]) => {
      const web = derivatives.assets?.[id];
      const paths = [web?.poster?.src, ...(web?.sources ?? []).map((source) => source.src)].filter(Boolean);
      const quotedId = new RegExp(`['\"]${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['\"]`).test(text);
      return quotedId || paths.some((path) => text.includes(path));
    })
    .map(([id, entry]) => ({ id, entry }));
}

export function assertProductionMediaApproved(siteRoot, manifest, derivatives) {
  const used = collectUsedMedia(siteRoot, manifest, derivatives);
  if (used.length === 0) throw new Error('Production media gate found no referenced manifest assets; usage detection failed closed.');
  const blocked = used.filter(({ id, entry }) => {
    const alt = manifest.site_alt_text?.[id];
    return (
      entry.production_approved !== true ||
      !APPROVED_MEDIA_RIGHTS.has(entry.rights_status) ||
      alt?.status !== 'owner_confirmed'
    );
  });
  if (blocked.length) {
    throw new Error(
      `Production build blocked by media without written clearance:\n- ${blocked
        .map(({ id, entry }) =>
          `${id}: production_approved=${entry.production_approved}, rights_status=${entry.rights_status}, ` +
          `alt_status=${manifest.site_alt_text?.[id]?.status ?? 'missing'}`,
        )
        .join('\n- ')}`,
    );
  }
  return used.map(({ id }) => id);
}

export function assertProductionApprovals(siteRoot, approvals) {
  const missing = [];
  const days = approvals.current_hours?.days;
  if (!days || typeof days !== 'object' || Array.isArray(days) || Object.keys(days).length !== 7) {
    missing.push('current_hours.days (all seven days)');
  }
  if (typeof approvals.current_hours?.summary !== 'string' || approvals.current_hours.summary.trim().length === 0) {
    missing.push('current_hours.summary');
  }
  if (!isIsoDate(approvals.current_hours?.approved_at)) missing.push('current_hours.approved_at');
  if (!isIsoDate(approvals.menu?.approved_at)) missing.push('menu.approved_at');
  if (!isIsoDate(approvals.logo_master?.approved_at)) missing.push('logo_master.approved_at');
  if (typeof approvals.logo_master?.public_path !== 'string' || !approvals.logo_master.public_path.startsWith('/')) {
    missing.push('logo_master.public_path');
  } else if (!existsSync(resolve(siteRoot, 'public', approvals.logo_master.public_path.slice(1)))) {
    missing.push('logo_master.public_path (file not found under public/)');
  }
  if (!isUrl(approvals.canonical_order_url?.value, ['http:', 'https:'])) missing.push('canonical_order_url.value');
  if (!isIsoDate(approvals.canonical_order_url?.approved_at)) missing.push('canonical_order_url.approved_at');
  if (!isUrl(approvals.canonical_reservation_url?.value, ['http:', 'https:', 'tel:'])) {
    missing.push('canonical_reservation_url.value');
  }
  if (!isIsoDate(approvals.canonical_reservation_url?.approved_at)) missing.push('canonical_reservation_url.approved_at');
  if (!isIsoDate(approvals.content_copy?.approved_at)) missing.push('content_copy.approved_at');

  if (missing.length) {
    throw new Error(`Production approval values are missing or invalid:\n- ${missing.join('\n- ')}`);
  }
}

export function loadJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}
