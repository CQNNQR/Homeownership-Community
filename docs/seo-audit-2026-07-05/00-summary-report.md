# Executive Summary — Homeownership Community SEO Audit
*Last updated: 2026-07-05*

**Domain**: https://www.thehomeownershipcommunity.com
**Overall score**: **62 / 100** (Medium)

---

## One-paragraph verdict

The Homeownership Community is a **technically sound, content-focused, single-author niche site** with a clear topical focus (real estate investing + homeownership education), strong founder entity (Brandon Bee Dixon, NMLS #1541210), and well-built infrastructure (Next.js 16 App Router, proper sitemap/robots, JSON-LD on blog posts, YMYL-compliant disclaimers, image proxy for cross-origin media). The single biggest gap is **GEO readiness for AI engines** — the site has no `llms.txt`, no global Organization/Person schema, and a FAQ auto-generator that produces generic answers not derived from post content (a hallucination risk). Closing the seven Tier-1 items in `04-implementation-plan.md` (~6 hours of work) moves the overall score from 62 to ~78 and the GEO sub-score from 54 to ~75.

---

## Score breakdown

| Dimension | Score | Rating | Trend after Tier 1 |
|---|---|---|---|
| **Technical SEO** | 78 / 100 | Good | → 92 |
| **On-page content** | 72 / 100 | Good | → 82 |
| **GEO / AI citation** | 54 / 100 | Medium | → 75 |
| **Domain authority (CITE)** | 41 / 100 | Low | → 48 (off-site work needed beyond code) |
| **Overall** | **62 / 100** | **Medium** | **→ 78** |

## Top 10 priorities (sorted by impact/effort ratio)

| # | Action | Impact | Effort | ROI |
|---|---|---|---|---|
| 1 | Add `/llms.txt` + `/llms-full.txt` | High (every AI engine) | 1 hr | ★★★★★ |
| 2 | Add Organization + Person + WebSite JSON-LD to root layout | High (entity recognition) | 2 hr | ★★★★★ |
| 3 | Replace `generateFAQs()` with WP-editor FAQ block | High (AI trust + YMYL) | 4-6 hr | ★★★★ |
| 4 | Compress 2.2 MB + 2.15 MB PNGs to WebP | High (LCP) | 15 min | ★★★★★ |
| 5 | Add `<link rel="preconnect">` for WP + Unsplash | Medium (LCP + TTFB) | 15 min | ★★★★ |
| 6 | Trim SITE_DESCRIPTION and page metas to ≤160 chars | Medium (SERP CTR) | 30 min | ★★★★ |
| 7 | Add `Book` + `PodcastSeries` schema | Medium (entity diversity) | 2 hr | ★★★ |
| 8 | Replace `<img>` with `<Image>` (next/image) sitewide | High (LCP + format) | 1 day | ★★★★ |
| 9 | Wire `/api/subscribe` route + Resend | Medium (conversion) | 2 hr | ★★★ |
| 10 | Add contextual internal links from blog → conversion pages | Medium (topical authority) | 1 day | ★★★ |

---

## What the site does well (preserve)

✅ Clean App Router architecture — every page is server-rendered with a single H1.
✅ WordPress as a CMS — easy for non-developer to author content.
✅ YMYL compliance — explicit "Not financial advice" + NMLS # disclosure on every blog post.
✅ Per-page canonical URLs — no duplicate-content issues.
✅ Stable production domain — `https://www.thehomeownershipcommunity.com` (not a Vercel preview URL).
✅ Image proxy for cross-origin content — JSON-LD references the production domain even when images live on WP staging.
✅ Soft-404 fix — blog post 404s return proper HTTP 404 (post-fix).
✅ Strong founder entity — NMLS #, multiple verified social profiles, published author, podcast host.
✅ Vercel hosting — fast edge, automatic HTTPS, deploy hooks for WP.
✅ Supabase backend — used appropriately for forms + auth, not over-applied.

## What the site needs (Tier 1 + Tier 2)

❌ `llms.txt` — most-asked-for file by AI crawlers, missing entirely.
❌ Organization / Person / WebSite schema in root layout — only Article schema on blog posts.
❌ Real FAQ content — current FAQ auto-generator produces generic Q&A not based on post content.
❌ Image optimization — two 2+ MB PNGs, raw `<img>` tags instead of next/image.
❌ Email subscribe forms — visible `<form>` elements but no `action` or Resend integration.
❌ Wikidata entries for Brandon + The Homeownership Community — easiest off-site AI citation gain.
❌ Internal linking strategy — blog posts don't link to conversion pages with keyword-rich anchors.
❌ First-party data publication — biggest exclusivity gap for GEO.

---

## Audit deliverable structure

This audit ships in `docs/seo-audit-2026-07-05/`:

```
docs/seo-audit-2026-07-05/
├── README.md                 ← start here (1-page overview)
├── 00-summary-report.md      ← this file (executive summary)
├── 01-technical-seo.md       ← crawlability, indexing, schema, security
├── 02-onpage-content.md      ← titles, metas, content, internal links
├── 03-domain-geo.md          ← domain authority + AI citation readiness
└── 04-implementation-plan.md ← Tier 1/2/3 fix list (start here for action)
```

---

## Suggested cadence

- **This week**: ship Tier 1 (7 items, ~6 hours). Re-measure Lighthouse + AI query tests.
- **This month**: ship Tier 2 (8 items, ~5-7 days). Capture before/after GEO scores.
- **Q3 2026**: full re-audit. Add live PageSpeed + Search Console data + backlink profile. Aim for 80+ overall score.
- **Q4 2026**: target Top-3 SERP ranking for "first-time home buyer houston" + "real estate investing podcast".

---

## Open questions for the owner

1. **Brand decision**: do you want "The Homeownership Community" or "Brandon Bee Dixon" to be the canonical entity for AI citation? Currently both are referenced; for a single-author site, leading with the person usually wins.
2. **Content strategy**: are you publishing first-party data (e.g., Houston housing market analysis, NEXA Mortgage approval rates by loan type)? If yes, we should highlight it. If no, that's the biggest single content investment for 2026.
3. **Conversion path**: where do you want organic traffic to land — `/blog`, `/about`, `/contact`, `/books`? Currently primary CTA on `/` is `Start Your Journey` → `/blog`. `/blog` doesn't convert; consider `Talk to Brandon` → `/contact` or `Calendly embed`.
4. **Brand identity consistency**: FOUNDER.sameAs includes Calendly, Apple Podcasts, and Amazon. Calendly is a scheduling tool, not a social profile. Consider removing it from sameAs and using it in a `ContactPoint` schema instead.

---

## Methodology notes

- **All scoring is from a single-day codebase review** (2026-07-05).
- **No live PageSpeed data, Search Console data, backlink profile, or AI engine query results** were used. Live measurement is recommended after Tier 1 ships.
- **Scoring weights are from the CORE-EEAT (content) and CITE (domain) rubrics** in the seo-geo-optimization-expert skill, calibrated for a content-publisher domain type.
- **All recommendations are code-actionable** — every Tier 1/2 item has a specific file path, code snippet, or `npx` command.
- **Off-site recommendations (Tier 3+) require separate work** — backlinks, podcast guest appearances, Wikipedia/Wikidata submissions, Google Business Profile maintenance.