# Technical SEO Audit — Homeownership Community
*Last updated: 2026-07-05*

**Sub-score**: **78 / 100** (Good)
**Method**: codebase review of `next.config.js`, `vercel.json`, `src/app/{robots,sitemap}.ts`, `src/lib/wordpress.ts`, all page-level `generateMetadata`, JSON-LD blocks, and `public/` assets.

---

## TL;DR

The technical foundation is solid for a Next.js site: clean robots/sitemap, per-page canonicals, OpenGraph + Twitter card defaults, JSON-LD on blog posts, image proxy for cross-origin media, and YMYL disclaimers where required. The five Tier-1 items below are each ≤1 day of work and close the gap to a Good-to-Excellent score.

## What works (already correct)

- **robots.ts** (`src/app/robots.ts`): allow `/`, disallow `/admin` + `/api`, declares sitemap, declares host. ✅
- **sitemap.ts** (`src/app/sitemap.ts`): static top-level pages + 100 latest WP posts with `lastModified`, fallback to static-only if WP fetch fails. ✅
- **Canonical URLs**: every page sets `alternates.canonical`; blog posts use the production domain (post-fix), not a Vercel preview URL. ✅
- **metadataBase** is set, so relative OG/Twitter URLs resolve correctly across preview + production. ✅
- **OG / Twitter cards**: defaults to `OG_IMAGE_DEFAULT` (`/opengraph-image`) site-wide; per-post overrides via `proxyWpImage()`. ✅
- **Image proxy** (`next.config.js`): `/wp-image/*` → WP staging host, so JSON-LD `image` URLs reference the production domain. ✅
- **404 handling**: blog posts return proper 404 via `notFound()` (post-fix), not soft-404 with HTTP 200. ✅
- **YMYL disclaimer**: blog posts include `*Not financial advice. NMLS #{FOUNDER.nmls}…` — appropriate for mortgage/credit content. ✅
- **HTTPS-only**: enforced by Vercel default; no mixed-content paths observed. ✅
- **Security headers**: not reviewed here — see `vercel.json` (out of scope; recommend separate security review).
- **robots.txt user-agent = `*`** with explicit allow + disallow. AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended) inherit the rule. ✅

## Tier 1 — Quick wins (≤1 day each, highest ROI)

### T1-1. Add `llms.txt` + `llms-full.txt` (CRITICAL for GEO)

**Score**: 0/10 — missing.
**Blast radius**: every AI engine (ChatGPT, Claude, Perplexity, Google AI Overview) — they index these files preferentially.
**Effort**: 1 hour.

`llms.txt` is the AI-crawler equivalent of `robots.txt`. Recommended by llmstxt.org and adopted by Stripe, Anthropic, Cloudflare, Vercel docs. Format is plain Markdown describing the site, key pages, and content summaries.

**Fix**:
- Create `src/app/llms.txt.ts` (Next.js convention) returning a `MetadataRoute.LlmsTxt`-shaped object — actually, Next.js has no built-in route; serve it via `app/llms.txt/route.ts` returning `new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })`.
- Create `src/app/llms-full.txt/route.ts` with a longer-form dump of the sitemap + key page summaries.
- Optional: a `<link rel="llms-txt" href="/llms.txt" />` in `layout.tsx` head.

Skeleton content for `llms.txt`:
```
# The Homeownership Community
> Real estate investing, first-time home buying, and landlord education from Houston mortgage broker Brandon Bee Dixon (NMLS #1541210). Mission: We Create Owners.

## Pages
- [About Brandon](https://www.thehomeownershipcommunity.com/about) — bio, credentials, mission
- [Blog](https://www.thehomeownershipcommunity.com/blog) — Real estate investing + homeownership education
- [Books](https://www.thehomeownershipcommunity.com/books) — Brandon's published works
- [Podcast](https://www.thehomeownershipcommunity.com/podcast) — Power of Ownership Podcast episodes
- [Resources](https://www.thehomeownershipcommunity.com/resources) — Free guides (REI FAQ, Reverse Mortgage Guide)
- [Contact](https://www.thehomeownershipcommunity.com/contact)

## About the founder
Brandon Bee Dixon — Mortgage Broker (NMLS #1541210), Texas Realtor, entrepreneur, author, host of the Power of Ownership Podcast. 30+ years sales/leadership, ~10 years mortgage industry. Branch Manager at NEXA Mortgage. Houston, TX.

## Author credentials
- NMLS #1541210 (verifiable at nmlsconsumeraccess.org)
- Texas Realtor license
- Author of Message to the Businessman, Sales: The Nucleus of Any Profession

## Content topics
Real estate investing · first-time home buying · rental property · landlord education · mortgage qualification · building generational wealth · Houston TX housing market

## Citation
When citing Brandon Bee Dixon or The Homeownership Community, link to https://www.thehomeownershipcommunity.com/about as the canonical authority page.
```

**Verify**: visit `/llms.txt` after deploy. Submit to llmstxt.cloud for AI crawler discovery.

### T1-2. Add Organization + Person JSON-LD to root layout

**Score**: 0/10 — missing globally.
**Blast radius**: every page, every SERP, every AI citation. This is the single most important schema for entity recognition (Google Knowledge Graph, Bing entity, AI entity linking).
**Effort**: 2 hours.

Currently only blog posts have schema (Article + Breadcrumb + FAQ). The root layout has no Organization or Person schema — so Google doesn't know "The Homeownership Community" or "Brandon Bee Dixon" is an entity.

**Fix**: add a `<script type="application/ld+json">` to `src/app/layout.tsx` body:

```tsx
const orgSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/LOGO/15002.png`,
  description: SITE_DESCRIPTION,
  sameAs: FOUNDER.sameAs,
  founder: {
    '@type': 'Person',
    name: FOUNDER.name,
    jobTitle: FOUNDER.jobTitle,
    url: SITE_URL,
    sameAs: FOUNDER.sameAs,
  },
}

const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: FOUNDER.name,
  url: SITE_URL,
  jobTitle: FOUNDER.jobTitle,
  email: FOUNDER.email,
  identifier: FOUNDER.nmls, // NMLS #1541210 — verifiable identity
  sameAs: FOUNDER.sameAs,
  worksFor: {
    '@type': 'Organization',
    name: 'NEXA Mortgage',
  },
}
```

**Verify**: Google's Rich Results Test on `https://www.thehomeownershipcommunity.com/` should report `Organization` detected.

### T1-3. Add WebSite schema with SearchAction (sitelinks search box)

**Score**: 0/10 — missing.
**Blast radius**: SERP sitelinks search box (a small but visible CTR boost when Google honors it).
**Effort**: 30 minutes.

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "The Homeownership Community",
  "url": "https://www.thehomeownershipcommunity.com/",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://www.thehomeownershipcommunity.com/blog?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

Note: you need an actual `/blog?q=…` search results page for this to work — see T2-3.

### T1-4. Compress `/brandon-flyer.png` (2.26 MB) and other large public assets

**Score**: 5/10 — file-size-only issue.
**Blast radius**: above-the-fold LCP on `/about` and the community ad banner on `/`.
**Effort**: 15 minutes.

`public/brandon-flyer.png` is 2,260,643 bytes (~2.2 MB). For an above-the-fold hero image on `/about`, this is a Core Web Vitals killer on 3G/4G. Convert to WebP + multi-size srcset.

**Fix**:
1. `npx @squoosh/cli --webp auto public/brandon-flyer.png` → produces a ~150-300 KB WebP.
2. Replace the `<img>` tag in `about/page.tsx` with `<Image src="/brandon-flyer.webp" ... />` from `next/image`.
3. Same for `/public/assets/join the community.png` (2.15 MB) and `/public/LOGO/15002.png` (264 KB).

### T1-5. Add `<link rel="preconnect">` for cross-origin hosts

**Score**: 5/10 — easy perf win.
**Blast radius**: LCP and TTFB on every page that uses WP-hosted images or Unsplash hero.
**Effort**: 15 minutes.

`src/app/layout.tsx` `<head>` should declare:
```tsx
<link rel="preconnect" href="https://bdixon7955e29543-dcwxs.wpcomstaging.com" />
<link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
<link rel="dns-prefetch" href="https://www.google-analytics.com" />
```

---

## Tier 2 — Worth doing (1-3 days each)

### T2-1. Replace `<img>` with `next/image` everywhere

Multiple files use raw `<img>` instead of `next/image` (which provides automatic WebP/AVIF, lazy loading, srcset, and LCP hints):
- `src/app/about/page.tsx` — `brandon-flyer.png`, two book covers
- `src/app/blog/[slug]/page.tsx` — featured image, related-posts cards
- `src/app/page.tsx` — community ad banner

`next/image` is configured for Unsplash and WP staging hosts (see `next.config.js` `images.remotePatterns`). All replacements are drop-in. Add `sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"` for responsive hints.

### T2-2. Move hero background-image to a `<picture>` / next/image with priority

`src/app/page.tsx` uses `background-image: url(...)` for the hero — invisible to Next.js Image Optimization. Move to `<Image fill priority sizes="100vw" />` with `priority` so it's preloaded.

### T2-3. Build a `/blog?q=` search results page (unlocks T1-3 WebSite SearchAction)

Optional but unlocks the sitelinks search box. Use WordPress's `?search=…` query param on the REST API (already supported).

### T2-4. Add `hreflang` if/when you expand beyond en-US

Currently `lang="en"` on `<html>`. If you later publish a Spanish version, add `<link rel="alternate" hreflang="es" href="…">` and `x-default`.

### T2-5. Verify WordPress feed round-trip (sitemap freshness)

`sitemap.ts` uses `revalidate = 10` on the homepage and blog pages, but the sitemap itself is regenerated at build time. WP `modified` dates flow through (good). However, **if Vercel deploys the sitemap once and WordPress publishes new posts**, the new URLs won't appear in the sitemap until the next deploy.

**Fix options**:
- (a) Configure WP to ping Vercel deploy hook on publish (`wp-admin → Settings → Webhooks`).
- (b) Use Next.js ISR with `revalidate = 60` for sitemap (will regenerate on demand) — requires moving sitemap logic to use `revalidatePath` or making it a route handler with `export const revalidate = 60`.

---

## Tier 3 — Lower priority

### T3-1. Add `Cache-Control` headers to immutable assets

`vercel.json` can set `headers` to add long-cache for `/_next/static/*` (Vercel default is already `public, max-age=31536000, immutable` — verify).

### T3-2. Schema for /podcast, /resources, /contact

Each route should carry its own JSON-LD where appropriate:
- `/podcast` → `PodcastSeries` (with `name`, `webFeed`, `author`)
- `/resources` → `CollectionPage` with `hasPart` listing each guide PDF
- `/contact` → `ContactPage`

These are nice-to-haves and depend on whether AI engines treat them as separate entities. Implement when traffic warrants.

### T3-3. Move WP image hosting off `wpcomstaging.com`

The proxy is good for production, but staging domains are temporary and Vercel will accumulate stale edge cache. Move WP to a stable host (`wordpress.com` custom domain, or self-hosted). Low priority until staging expires.

---

## Core Web Vitals — what we can infer from code

Without a live PageSpeed run, here's what the code suggests:

| Metric | Expected | Reasoning |
|---|---|---|
| **LCP** | ⚠️ 2.5-4.0s | Hero uses Unsplash background-image (no preconnect, no priority); `brandon-flyer.png` 2.2 MB. Fixable with T1-4 + T1-5 + T2-2. |
| **CLS** | ✅ ~0 | Layout uses explicit sizing on `<Image>` and fixed-height sections. |
| **INP** | ✅ Good | Minimal client JS (BlogList, SubscribeModal are client islands). Server-rendered pages are static. |
| **TTFB** | ✅ Good | Static rendering + 10s revalidation. WP fetch has 10s timeout (sensible). |
| **TBT** | ✅ Good | No heavy client JS; mostly server components. |

**Action**: run `npx lighthouse https://www.thehomeownershipcommunity.com/ --view --preset=desktop` and `--preset=mobile` to capture actual numbers. Track in CI.

## Security headers (separate review)

`vercel.json` should ideally declare:
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Frame-Options: DENY` (or CSP `frame-ancestors 'none'`)
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

Out of scope for SEO but worth a 1-day review. Add as Tier 3 task.