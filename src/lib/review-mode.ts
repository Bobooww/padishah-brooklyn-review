import { MEDIA } from '@/content/generated/media';
import type { MediaAsset } from '@/content/types';

/**
 * Review mode is ON unless the build is explicitly told otherwise.
 * Flipping it off arms scripts/check-production-gate.mjs, which refuses to ship
 * a build that renders any asset the restaurant has not cleared.
 */
export const REVIEW_MODE = process.env.NEXT_PUBLIC_SITE_REVIEW_MODE !== 'false';

export type RightsState = 'review_only' | 'release_required' | 'cleared';

export function rightsState(asset: MediaAsset): RightsState {
  if (asset.productionApproved) return 'cleared';
  if (asset.rightsStatus === 'people_release_required') return 'release_required';
  return 'review_only';
}

/** Look up a generated asset; throws at build time if a page references a ghost. */
export function media(id: string): MediaAsset {
  const asset = MEDIA[id];
  if (!asset) {
    throw new Error(
      `Unknown media asset "${id}". Every asset must exist in website-research/media-library/manifest.json ` +
        `and be produced by scripts/build-media.mjs.`,
    );
  }
  if (!REVIEW_MODE && !asset.productionApproved) {
    throw new Error(
      `Asset "${id}" is not production-approved (${asset.rightsStatus}). ` +
        `Obtain written clearance and update the manifest before building with SITE_REVIEW_MODE=false.`,
    );
  }
  if (!asset.alt?.en || !asset.alt?.ru) {
    throw new Error(
      `Asset "${id}" has no bilingual alt text in media-library/manifest.json. ` +
        `Add site_alt_text before using it on the site.`,
    );
  }
  return asset;
}

/** Public paths of the derivatives an asset actually ships. */
export function assetSources(asset: MediaAsset) {
  const web = asset.web;
  if (!web) {
    throw new Error(`Asset "${asset.id}" has no web derivatives. Run: npm run media`);
  }
  return web;
}

export function pickSource(asset: MediaAsset, match: (src: string) => boolean): string {
  const found = assetSources(asset).sources.find((s) => match(s.src));
  if (!found) throw new Error(`No derivative matching filter for "${asset.id}"`);
  return found.src;
}
