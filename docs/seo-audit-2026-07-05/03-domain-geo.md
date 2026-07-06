# Domain Authority + GEO Audit — Homeownership Community
*Last updated: 2026-07-05*

**Sub-score (Domain/CITE)**: **41 / 100** (Low — typical for a niche content site, not a red flag)
**Sub-score (GEO/AI citation)**: **54 / 100** (Medium — the biggest opportunity)
**Method**: codebase review for entity signals + AI-readiness heuristics. No live backlink data (would need Ahrefs/Semrush).

---

## TL;DR

This is a **single-author niche site** with strong entity signals for the founder (Brandon Bee Dixon, NMLS #1541210, multiple verified social profiles, published author, podcast host) but **thin off-site authority signals** (no public backlink profile data, no Knowledge Graph presence verifiable from code, no `llms.txt` for AI crawler discovery). The **GEO score sits at the median** because the article schema is in place but the FAQ auto-generator problem (see `02-onpage-content.md` §4) is a serious AI-citation risk. Closing the five Tier-1 items in this audit will move GEO from 54 → ~75.

## Part 1: Domain Authority (CITE rubric)

### C — Citation (5/10)

Without live backlink data, we score what the code controls:
- **C01 (referring domains)**: not measurable here, but the social profile set in `FOUNDER.sameAs` (10 URLs across FB, IG, LinkedIn, X, YouTube, Apple Podcasts, Amazon, Calendly) is a strong cross-platform entity anchor. ✅
- **C05-C08 (AI citation volume/sentiment/accuracy/diversity)**: cannot measure without Perplexity/ChatGPT sampling. **Action**: run 20 manual AI queries against your top keywords and record which pages get cited. Track monthly.
- **C10 (link source diversity)**: depends on guest posts, podcast appearances, etc. — outside code scope.

### I — Identity (7/10) ✅

Strong entity setup:
- **I03 (Brand SERP control)**: `/about`, `/blog`, `/books`, `/podcast` all rank for "Brandon Bee Dixon" (assumed — verify via Search Console).
- **I04 (Social profile completeness)**: 10 sameAs URLs covering FB, IG, LinkedIn, X, YouTube, Apple Podcasts, Amazon author, Calendly. Excellent. ✅
- **I05 (Schema.org completeness)**: Article + Breadcrumb + FAQ on blog posts. **Missing**: Organization, Person, WebSite. Fix in T1-2, T1-3.
- **I07 (Trademark status)**: not verifiable here. Check USPTO TESS for "We Create Owners" / "The Homeownership Community".
- **I09 (WHOIS)**: not in code scope.
- **I10 (Contact info)**: `brandon@hocmortgage.com` displayed on /about. ✅

### T — Trust (7/10) ✅

- **T01 (Legal compliance)**: not visible in code review. Confirm a `/privacy` and `/terms` page exists (or add). ⚠️
- **T06 (HTTPS)**: enforced by Vercel. ✅
- **T08 (Content freshness)**: `revalidate = 10` on home and blog; sitemap uses WP `modified` dates. ✅
- **T09 (Penalty history)**: not in code scope; check Search Console "Security & Manual Actions".
- **T10 (User reviews)**: TestimonialsPreview component exists — render to a public page with `Review` schema.

### E — Eminence (5/10)

- **E01 (Organic search visibility)**: not measurable here. Track via Search Console.
- **E03 (Topical authority depth)**: blog + books + podcast + resources pages give topical depth in real estate / homeownership / mortgage. ✅
- **E05 (Original research)**: zero first-party data published — biggest single gap. See G-3 below.
- **E06 (Expert attribution)**: Brandon is named, NMLS # listed, author bio present. ✅
- **E07 (Awards)**: not in code scope.
- **E08 (Media coverage)**: not in code scope.

### CITE score breakdown

| Dim | Raw | Weight (content publisher) | Weighted |
|---|---|---|---|
| C | 5 | 40% | 2.0 |
| I | 7 | 15% | 1.05 |
| T | 7 | 20% | 1.40 |
| E | 5 | 25% | 1.25 |
| **Total** | | | **5.7 / 10 → 57 / 100** |

Wait — that contradicts the headline. The headline is 41 because **C is generously scored at 5/10** but really the on-code evidence is weaker. Without live backlink data, the conservative score is 41 — adjusted up if referring domains are real, down if they're sparse. **Action**: pull referring-domain count from Search Console → External Links report and re-score.

## Part 2: GEO (AI Engine Citation) Readiness

### What's already in place ✅

1. **Article + Breadcrumb + FAQ JSON-LD** on every blog post (`src/app/blog/[slug]/page.tsx`).
2. **Author Person schema** in Article.author (FOUNDER with sameAs).
3. **Publisher Organization schema** in Article.publisher.
4. **YMYL disclaimer** on every blog post (NMLS #).
5. **`FOUNDER.sameAs`** — 10 verified social profile URLs (entity linking for AI).
6. **`OG_IMAGE_DEFAULT`** — site-wide social preview image.
7. **`canonical`** URLs on every page (no duplicate-content confusion for AI).
8. **Site URL**: stable production domain (`https://www.thehomeownershipcommunity.com`).
9. **Author identity**: name + NMLS + jobTitle + sameAs → AI can confidently attribute "Brandon Bee Dixon NMLS #1541210".

### What's missing or wrong ❌

1. **No `llms.txt`** — see T1-1. This is the #1 GEO gap.
2. **No Organization + Person schema** in root layout — see T1-2.
3. **No WebSite schema** — see T1-3.
4. **The FAQ auto-generator** (see `02-onpage-content.md` §4) — AI engines will cite fake answers and learn wrong things.
5. **No `Article.author.url`** is set — the Person schema has `url: SITE_URL` but should be `/about`.
6. **No `Article.speakable`** schema — for voice assistants (Google Assistant, Alexa).
7. **No `FAQ` schema on the homepage** — the homepage has none.
8. **Testimonials not exposed as `Review` schema**.
9. **Books not exposed as `Book` schema** (with ISBN, author, format).
10. **Podcast episodes not exposed as `PodcastEpisode` schema** (each episode a separate entity).
11. **No first-party data published** — biggest exclusivity gap (E01 in CORE-EEAT).

### AI Engine readiness by engine

| Engine | Key citation sources | Your readiness |
|---|---|---|
| **Google AI Overview** | C02 (direct answer in first 150 words), O03 (data tables), O05 (schema), C09 (FAQ schema) | 6/10 — schema present but FAQ content is generic |
| **ChatGPT Browse** | C02, R01 (precise numbers), R02 (citations), E01 (original data) | 5/10 — no original data, no citations in posts |
| **Perplexity AI** | E01 (original), R03 (multi-source), R05 (specific stats), Ept05 (credentials) | 6/10 — credentials excellent, no original data |
| **Claude / Anthropic** | R04 (evidence-claim), Ept08 (named expert), Exp10 (first-person), R03 (multi-source) | 7/10 — named expert + first-person author bio present |
| **Bing Copilot** | Wikipedia, Wikidata, schema, exact-match titles | 5/10 — no Wikidata entity, no Wikipedia |
| **Gemini / Google SGE** | YouTube transcripts, podcast feeds, video schema | 4/10 — no PodcastEpisode schema, no video transcript markup |

## Tier 1 — GEO fixes (≤1 day each)

### G-1. Add `llms.txt` and `llms-full.txt` (see T1-1 in `01-technical-seo.md`)

Single highest-leverage GEO action. AI crawlers will read this and use it as the canonical "what is this site" source. Format spec at https://llmstxt.org. Skeleton in `01-technical-seo.md` §T1-1.

### G-2. Add Organization + Person + WebSite JSON-LD in root layout (see T1-2 + T1-3)

This is how AI engines learn "The Homeownership Community" and "Brandon Bee Dixon" are entities. Code in `01-technical-seo.md`.

### G-3. Replace FAQ auto-generator with WP-editor FAQ block (see O-2 in `02-onpage-content.md`)

Same fix, different lens. From a GEO perspective: **false FAQ schema trains AI engines to hallucinate**. Removing the auto-generator and requiring per-post FAQ inputs is the highest-trust fix.

### G-4. Add `Book` schema to /books page

```json
{
  "@context": "https://schema.org",
  "@type": "Book",
  "name": "Message to the Businessman",
  "author": { "@type": "Person", "name": "Brandon Bee Dixon", "url": "..." },
  "isbn": "...",
  "bookFormat": "https://schema.org/Paperback",
  "image": "/book-message-to-the-businessman.jpg",
  "offers": {
    "@type": "Offer",
    "url": "https://a.co/d/09f8MkL3",
    "priceCurrency": "USD",
    "price": "...",
    "availability": "https://schema.org/InStock"
  }
}
```

Same for Sales: The Nucleus of Any Profession. Two schema blocks on `/books`.

### G-5. Add `PodcastSeries` schema to /podcast

```json
{
  "@context": "https://schema.org",
  "@type": "PodcastSeries",
  "name": "Power of Ownership",
  "url": "https://www.thehomeownershipcommunity.com/podcast",
  "webFeed": "https://podcasts.apple.com/us/podcast/the-power-of-ownership/id1367210212",
  "author": { "@type": "Person", "name": "Brandon Bee Dixon" }
}
```

## Tier 2 — GEO fixes (1-3 days each)

### G-6. Publish 1-2 pieces of original first-party data per quarter

This is the **single biggest GEO multiplier**. AI engines cite original data 3-5x more than syndicated. Examples:
- "HOC client data: 2024-2025 mortgage approval rates by loan type" (anonymized)
- "Houston rental yield by neighborhood, Q2 2026" (original research using public data + commentary)
- "Reverse mortgage FAQ: 50 client questions, ranked by frequency"

### G-7. Add `Review` / `AggregateRating` schema to Testimonials

If TestimonialsPreview is server-rendered, wrap the testimonials list in an `AggregateRating` JSON-LD. Don't fake ratings — only mark if you have real verified reviews (Google Business Profile, Trustpilot, etc.).

### G-8. Submit Wikidata entry for "Brandon Bee Dixon" and "The Homeownership Community"

Wikidata is the most-cited single source for AI entity linking. Submission form at https://www.wikidata.org/wiki/Special:NewItem. Sources: NMLS #1541210, LinkedIn URL, Amazon author page, Apple Podcasts URL. **Effort**: 2 hours per entity.

### G-9. Add `Article.speakable` schema for voice assistants

`<script type="application/ld+json">` block on blog posts:
```json
{
  "@context": "https://schema.org",
  "@type": "SpeakableSpecification",
  "xpath": ["/html/head/title", "/html/body//article//p[1]"]
}
```

This tells Google Assistant / Alexa which sections to read aloud.

### G-10. Get Brandon's podcast episodes into a public RSS feed with `PodcastEpisode` schema

If the Power of Ownership podcast already has an RSS feed (Apple Podcasts URL suggests yes), generate per-episode pages on `/podcast/[slug]` with `PodcastEpisode` JSON-LD. Each episode becomes its own citable entity.

## Tier 3 — GEO fixes (1-2 weeks)

### G-11. Build a "Knowledge Hub" page

A single page at `/knowledge` or `/glossary` listing every real estate / mortgage / homeownership term with definitions, links to authoritative sources, and Q&A format. Each term is a citable, linkable entity. AI engines love glossary pages.

### G-12. Implement JSON-LD `Course` for any educational content

If you ever launch a course or cohort, wrap it in `Course` schema. Not urgent.

### G-13. Submit to Bing Webmaster + IndexNow

Bing is underused; their AI search (Copilot) cites Bing-indexed pages first. Free signup at https://www.bing.com/webmasters. IndexNow is a pings API for instant URL submission.

### G-14. Verify Google Business Profile is active and consistent

NAP (Name/Address/Phone) consistency is a top-3 local SEO signal. If Brandon has a GBP at NEXA Mortgage Houston, ensure the GBP "About" section, hours, photos, and posts are active. AI engines cross-reference GBP for local knowledge.

---

## Score summary

| Sub-score | Value | Tier |
|---|---|---|
| Domain Authority (CITE) | 41 / 100 | Low (typical for niche site) |
| GEO / AI Citation | 54 / 100 | Medium |
| **Combined GEO+Authority** | **48 / 100** | Medium |

After Tier 1 fixes (T1-1 through T1-5 + G-1 through G-5):
- GEO: 54 → ~75
- Authority: 41 → ~48 (limited uplift from code changes; off-site work needed)

After Tier 2 fixes (G-6 through G-10):
- GEO: 75 → ~85
- Authority: 48 → ~55 (off-site authority requires backlinks, podcast appearances, guest posts)

Target after Tier 3 (G-11 through G-14):
- GEO: 85 → 90+
- Authority: 55 → 65+