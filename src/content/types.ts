/**
 * Approval state travels with every business value on this site.
 * Nothing renders as a plain fact unless its status says it may.
 */
export type Approval = 'verified' | 'owner_confirmed' | 'research_only' | 'blocked';

export type Fact = {
  value: string;
  status: Approval;
  source: string;
  verifiedAt: string;
};

export type Hours = {
  status: string;
  verifiedAt: string;
  days: { day: string; value: string }[];
};

export type MenuCategory = {
  id: string;
  name: string;
  sort: number;
  approval: Approval;
  ownerConfirmationRequired: boolean;
};

/** Human-facing consequence of a research flag. */
export type MenuNote =
  | 'price_unavailable'
  | 'pending_owner'
  | 'name_suggested'
  | 'description_pending'
  | 'possible_duplicate';

export type MenuItem = {
  id: string;
  categoryId: string;
  /** Exactly as published on the source platform. Kept for audit, never shown as final. */
  rawName: string;
  displayName: string;
  approval: Approval;
  ownerConfirmationRequired: boolean;
  /**
   * Research snapshot, never a public price. Review mode may reveal it behind an
   * explicit control on /menu, always labelled as research; production never renders it.
   */
  researchPriceCents: number | null;
  /** null means "no owner-approved public price" — never render 0. */
  priceCents: number | null;
  priceStatus: Approval;
  description: string | null;
  featured: boolean;
  flags: string[];
  notes: MenuNote[];
};

export type RatingSnapshot = {
  platform: string;
  rating: number;
  reviewCount: number;
  url: string;
  observedAt: string;
};

export type MediaDerivative = {
  /** Public path, e.g. /media/food/kebab-smoke.avif */
  src: string;
  width: number;
  height: number;
  bytes: number;
};

export type MediaWeb = {
  poster?: MediaDerivative;
  /** Tiny inline blur-up placeholder, base64 data URI. */
  lqip?: string;
  sources: MediaDerivative[];
  durationSeconds?: number;
  /** What the cut shows, in plain words — used for alt text review. */
  note?: string;
  /** Provenance: the exact library file the derivative came from. */
  derivedFrom?: string;
  /** [start, length] pairs, in seconds, taken from the source reel. */
  segments?: [number, number][];
  /** For a still lifted from a reel: the exact frame timestamp, in seconds. */
  frameAtSeconds?: number;
};

export type MediaAsset = {
  id: string;
  kind: 'image' | 'video';
  sourcePath: string;
  width: number;
  height: number;
  durationSeconds: number | null;
  rightsStatus: string;
  /** False for every asset in this build. The production gate reads this. */
  productionApproved: boolean;
  curationLabel: string;
  sourceUrl: string;
  qualityFlags: string[];
  alt: {
    en: string;
    ru: string;
    status: 'draft_owner_approval_required' | 'owner_confirmed';
  } | null;
  web: MediaWeb | null;
};
