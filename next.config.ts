import type { NextConfig } from 'next';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Run guards from Next itself as well as npm pre/post hooks.
execFileSync(process.execPath, [fileURLToPath(new URL('./scripts/check-production-gate.mjs', import.meta.url))], {
  stdio: 'inherit',
  env: process.env,
});

/**
 * Static export for Padishah Restaurant.
 */
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  env: {
    // The content gate reads this environment value during build.
    NEXT_PUBLIC_SITE_REVIEW_MODE: process.env.SITE_REVIEW_MODE ?? 'true',
  },
};

export default nextConfig;
