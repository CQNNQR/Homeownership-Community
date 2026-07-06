# Implementation Plan — Homeownership Community SEO Audit
*Last updated: 2026-07-05*

**Total estimated effort**: ~7 working days for all Tier 1 + Tier 2 items.

This is the action checklist. Start here. Each item has: **effort**, **owner**, **verify-after**, and links back to the source finding.

---

## Tier 1 — Ship this week (≤1 day each, total ~6 hours)

| # | Item | Source | Effort | Verify |
|---|---|---|---|---|
| 1 | Add `/llms.txt` + `/llms-full.txt` routes | T1-1 / G-1 | 1 hr | `curl https://www.thehomeownershipcommunity.com/llms.txt` returns text/plain |
| 2 | Add Organization + Person + WebSite JSON-LD to root layout | T1-2 / T1-3 / G-2 | 2 hr | Google Rich Results Test reports Organization detected |
| 3 | Compress `/brandon-flyer.png` (2.26 MB) and `assets/join the community.png` (2.15 MB) to WebP | T1-4 / O-3 | 15 min | `ls -la` shows <500 KB |
| 4 | Add `<link rel="preconnect">` for WP staging + Unsplash in `layout.tsx` | T1-5 | 15 min | View-source shows preconnect tags |
| 5 | Trim SITE_DESCRIPTION and page metas to ≤160 chars | O-1 | 30 min | Page source shows description at <160 chars |
| 6 | Add `Book` schema to `/books` page | G-4 | 1 hr | Schema validator passes |
| 7 | Add `PodcastSeries` schema to `/podcast` page | G-5 | 1 hr | Schema validator passes |
| | **Tier 1 total** | | **~6 hours** | |

### Implementation order

Do items 1-4 first (they're mechanical and have outsized impact). Then 5-7 (schema additions).

#### Item 1 — `llms.txt` skeleton

Create `src/app/llms.txt/route.ts`:

```ts
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, FOUNDER } from '@/lib/site-config'

export const dynamic = 'force-static'
export const revalidate = false

export function GET() {
  const text = `# ${SITE_NAME}
> ${SITE_DESCRIPTION}

## Pages
- [Home](${SITE_URL}/)
- [About Brandon Bee Dixon](${SITE_URL}/about)
- [Blog](${SITE_URL}/blog)
- [Books](${SITE_URL}/books)
- [Podcast](${SITE_URL}/podcast)
- [Resources](${SITE_URL}/resources)
- [Contact](${SITE_URL}/contact)

## Founder
Brandon Bee Dixon — Mortgage Broker (NMLS #1541210), Texas Realtor, author, and host of the Power of Ownership Podcast.

## Credentials
- NMLS #1541210 (verifiable at nmlsconsumeraccess.org)
- Author of Message to the Businessman, Sales: The Nucleus of Any Profession
- Branch Manager at NEXA Mortgage

## Topics
Real estate investing · first-time home buying · rental property · landlord education · mortgage qualification · building generational wealth · Houston TX housing market

## Citation
When citing, link to ${SITE_URL}/about as the canonical authority page.
`
  return new Response(text, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
```

For `/llms-full.txt`, generate a longer-form Markdown dump of the sitemap plus per-page summaries.

#### Item 2 — Schema in root layout

Edit `src/app/layout.tsx` to inject `<script type="application/ld+json">` blocks for Organization, Person, and WebSite (see `01-technical-seo.md` §T1-2 and `03-domain-geo.md` §G-2 for the JSON bodies).

#### Item 3 — Image compression

```bash
cd public
npx @squoosh/cli --webp auto brandon-flyer.png
npx @squoosh/cli --webp auto assets/join\ the\ community.png
# rename outputs to .webp
```

Then replace `<img src="/brandon-flyer.png">` with `<Image src="/brandon-flyer.webp">` (next/image).

#### Item 4 — Preconnect in layout

In `src/app/layout.tsx`, add to the returned `<html>` head (or via `metadata`):
```tsx
<link rel="preconnect" href="https://bdixon7955e29543-dcwxs.wpcomstaging.com" />
<link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
```

#### Item 5 — Trim meta descriptions

In `src/lib/site-config.ts`:
```ts
export const SITE_DESCRIPTION =
  'Real estate investing, first-time home buying, and landlord education from Houston mortgage broker Brandon Bee Dixon (NMLS #1541210).'
```

(143 chars.) Apply same trim to `/about`, `/blog`, `/books` static descriptions.

#### Items 6-7 — Book and PodcastSeries schema

Add `<script type="application/ld+json">` blocks in the respective `page.tsx` files. JSON skeletons in `03-domain-geo.md` §G-4 and §G-5.

---

## Tier 2 — Ship this month (1-3 days each, total ~3 days)

| # | Item | Source | Effort | Verify |
|---|---|---|---|---|
| 8 | Replace `<img>` with `<Image>` (next/image) across site | T2-1 / O-4 | 1 day | `grep -r '<img' src/` returns only logo + favicon |
| 9 | Move hero background-image to next/image with `priority` | T2-2 | 3 hr | Lighthouse LCP <2.5s |
| 10 | Replace `generateFAQs()` with WP-editor FAQ block | O-2 / G-3 | 4-6 hr | One legacy post: no FAQ rendered, no FAQ schema. One new post: WP-supplied FAQs render |
| 11 | Wire `/api/subscribe` route + Resend integration | O-7 | 2 hr | Submit form → email received |
| 12 | Add contextual internal links from blog → conversion pages | O-6 | 1 day | Each post footer has 3+ topic-relevant links |
| 13 | Add `Article.speakable` schema on blog posts | G-9 | 2 hr | Schema validator passes |
| 14 | Add `Article.author.url = '/about'` (currently `SITE_URL`) | G-5 footnote | 5 min | View-source shows correct URL |
| 15 | Submit Wikidata entries for Brandon + The Homeownership Community | G-8 | 4 hr (2 hr each) | Wikidata items created and approved |
| 16 | Build `/podcast/[slug]` pages with `PodcastEpisode` schema | G-10 | 1-2 days | Episode pages have valid schema, OG tags |
| | **Tier 2 total** | | **~5-7 days** | |

---

## Tier 3 — Backlog (1-2 weeks each)

| # | Item | Source | Effort |
|---|---|---|---|
| 17 | Add security headers in `vercel.json` | (security) | 1 day |
| 18 | Build a `/knowledge` or `/glossary` page | G-11 | 1 week |
| 19 | Submit to Bing Webmaster + IndexNow | G-13 | 1 hr |
| 20 | Verify Google Business Profile is active | G-14 | 2 hr |
| 21 | Publish first quarterly first-party data report | G-6 | 1 week |
| 22 | Add `Cache-Control` headers to immutable assets | T3-1 | 1 hr |
| 23 | Move WP image hosting off wpcomstaging.com | T3-3 | 1 week (separate project) |

---

## Priority order for the owner

If you have only 1 hour today, do **Item 1** (`llms.txt`). Single highest-leverage GEO action.

If you have half a day, do **Items 1-5** (Tier 1 mechanical fixes). Closes the "missing basic GEO primitives" gap.

If you have a full week, do **all of Tier 1 + Tier 2 items 8-14**. Moves GEO from 54 → ~75 and Technical from 78 → ~92.

---

## Tracking and measurement

After Tier 1 ships, measure:
1. Run `npx lighthouse https://www.thehomeownershipcommunity.com/ --view` (desktop + mobile). Capture baseline LCP / CLS / TBT.
2. Submit `https://www.thehomeownershipcommunity.com/sitemap.xml` in Google Search Console.
3. Run 5-10 manual AI queries on Perplexity and ChatGPT for your top keywords ("how to get approved for a mortgage houston", "first time home buyer texas", "Brandon Bee Dixon NMLS"). Record which pages (if any) get cited.

After Tier 2 ships, re-measure and compare.

---

## What this audit did NOT cover

- **Live PageSpeed / CrUX data** — would need browser run or Chrome User Experience report.
- **Search Console data** — impressions, clicks, CTR, average position. Not in code.
- **Backlink profile** — Ahrefs / Semrush data not used.
- **Competitor SERP analysis** — should be a follow-up.
- **Conversion rate / UX** — separate CRO audit, not SEO.

These are tracked separately. Suggest a Q3 2026 follow-up audit once Tier 1 + 2 are live.