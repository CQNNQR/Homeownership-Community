/**
 * Single source of truth for site-wide constants.
 *
 * Used by:
 *  - src/app/layout.tsx (root metadata, canonical default, OG image)
 *  - src/app/robots.ts, src/app/sitemap.ts (sitemap/robots URLs)
 *  - src/app/blog/[slug]/page.tsx (JSON-LD schema URLs)
 *  - src/app/about/page.tsx, podcast/page.tsx, etc. (canonical + OG)
 *  - All future Tier 2 schema expansion (Organization, LocalBusiness JSON-LD)
 *
 * Keep this file lean. Anything that needs to vary by environment (per-stage
 * Vercel preview vs. production) should come from an env var; anything brand-
 * stable should be a hard-coded constant here.
 */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.thehomeownershipcommunity.com'

export const SITE_NAME = 'The Homeownership Community'

export const SITE_TAGLINE = 'We Create Owners'

export const SITE_DESCRIPTION =
  'Real estate investing, first-time home buying, and landlord education from Houston mortgage broker Brandon Bee Dixon (NMLS #1541210).'

export const SITE_KEYWORDS = [
  'Homeownership Community',
  'Homeownership Education',
  'First Time Home Buyer',
  'Real Estate Investing',
  'Future Landlord',
  'Building Generational Wealth',
  'Financial Literacy',
  'Wealth Through Real Estate',
  'Home Buying Tips',
  'Property Ownership',
  'Real Estate Wealth Building',
  'Investment Properties',
  'Rental Property Investing',
  'Passive Income Real Estate',
  'Homeownership Resources',
  'Real Estate Community',
  'Ownership Mindset',
  'Brandon Bee Dixon',
  'I Create Owners',
  'The Power of Ownership',
]

export const FOUNDER = {
  name: 'Brandon Bee Dixon',
  nmls: '1541210',
  email: 'brandon@hocmortgage.com',
  jobTitle: 'Founder, NEXA Mortgage Branch Manager',
  // Canonical social profile URLs. Update here when onboarding a new channel.
  sameAs: [
    'https://facebook.com/BrandonBeeDixon13',
    'https://instagram.com/billionaireloanofficer',
    'https://linkedin.com/in/brandonbeedixon',
    'https://linkedin.com/company/thehomeownershipcompany',
    'https://x.com/billionaire_lo',
    'https://youtube.com/@billionaireloanofficer',
    'https://podcasts.apple.com/us/podcast/the-power-of-ownership/id1367210212',
    'https://a.co/d/09f8MkL3',
    'https://a.co/d/0bXRCoq6',
    'https://calendly.com/brandon-669',
  ],
} as const

/** Default Open Graph image used when a page doesn't override it. */
export const OG_IMAGE_DEFAULT = `${SITE_URL}/opengraph-image`

/**
 * WordPress staging image host. We rewrite image URLs from this host to a
 * same-origin /wp-image/... path so that:
 *   (a) JSON-LD og:image references the production domain (Knowledge Graph
 *       attribution stays clean)
 *   (b) the Vercel edge can proxy the WP-hosted image (so social previews
 *       can fetch it without mixed-content warnings)
 *
 * See next.config.js `rewrites()` for the proxy rule.
 */
export const WP_STAGING_HOST = 'bdixon7955e29543-dcwxs.wpcomstaging.com'

/** Rewrite a WP staging image URL to our production proxy path.
 *
 *  Example:
 *    in:  https://bdixon7955e29543-dcwxs.wpcomstaging.com/wp-content/uploads/2026/07/x.png
 *    out: https://www.thehomeownershipcommunity.com/wp-image/uploads/2026/07/x.png
 *
 *  The `/wp-content` prefix is dropped from the proxy path because the
 *  next.config.js rewrites() rule re-prepends it. Net effect: schema +
 *  og:image URLs all resolve to the production domain, and the actual
 *  bytes still come from the WP staging bucket via the Vercel edge.
 */
export function proxyWpImage(wpUrl: string | null | undefined): string | null {
  if (!wpUrl) return null
  try {
    const u = new URL(wpUrl)
    if (u.hostname === WP_STAGING_HOST) {
      const stripped = u.pathname.replace(/^\/wp-content/, '')
      return `${SITE_URL}/wp-image${stripped}`
    }
    return wpUrl
  } catch {
    return wpUrl
  }
}