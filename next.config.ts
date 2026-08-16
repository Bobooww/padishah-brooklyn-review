import type { NextConfig } from 'next';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Run guards from Next itself as well as npm pre/post hooks. This prevents a
// direct `next build` invocation from bypassing production approvals.
execFileSync(process.execPath, [fileURLToPath(new URL('./scripts/check-production-gate.mjs', import.meta.url))], {
  stdio: 'inherit',
  env: process.env,
});

/**
 * Static export. This build is a private review prototype for Padishah Restaurant.
 * It is deliberately noindex until the owner approves facts, menu and media.
 */
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  env: {
    // Flipping this to 'false' arms the production gate in scripts/check-production-gate.mjs.
    NEXT_PUBLIC_SITE_REVIEW_MODE: process.env.SITE_REVIEW_MODE ?? 'true',
  },
};

export default nextConfig;
