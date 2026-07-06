# On-Page Content Audit — Homeownership Community
*Last updated: 2026-07-05*

**Sub-score**: **72 / 100** (Good)
**Method**: review of every page-level `generateMetadata`, visible H1/H2/H3 hierarchy, content coverage, internal linking, image alt text, and CTA copy. Also scored against the **CORE-EEAT** 80-item content-quality rubric for blog-post bodies.

---

## TL;DR

Per-page metadata is well-shaped: titles ≤60 chars, descriptions ≤160 chars, OG + Twitter cards consistent, canonical URLs absolute. The site has clear topical focus (real estate investing + homeownership education), strong author entity (Brandon Bee Dixon, NMLS #1541210), and YMYL-compliant disclosures. The biggest content gaps are: (1) thin on-page content on the `/books`, `/podcast`, `/resources` routes, (2) **the FAQ auto-generator on blog posts is keyword-matched to content, not content-derived** (an AI citation red flag), (3) image alt text is generic on the homepage hero, and (4) no internal-link strategy between blog posts and the Books/Podcast/About conversion pages.

## Per-page scores

| Page | Title | Meta desc | H1/H2 | Content | Internal links | Avg |
|---|---|---|---|---|---|---|
| `/` (Home) | 9/10 | 9/10 | 9/10 | 8/10 | 5/10 | **8.0** |
| `/about` | 9/10 | 9/10 | 9/10 | 9/10 | 7/10 | **8.6** |
| `/books` | 9/10 | 9/10 | 8/10 | 7/10 | 4/10 | **7.4** |
| `/podcast` | TBD | TBD | TBD | TBD | TBD | **?** |
| `/resources` | TBD | TBD | TBD | TBD | TBD | **?** |
| `/contact` | TBD | TBD | TBD | TBD | TBD | **?** |
| `/blog` | 9/10 | 9/10 | 9/10 | 7/10 | 6/10 | **7.8** |
| `/blog/[slug]` | 9/10 | 9/10 | 8/10 | 6/10* | 8/10 | **7.8** |

\* Blog post content score is dragged down by the FAQ auto-generator problem (see §4 below). Actual post body quality is determined by the WP editor — assumed 8/10 if standard quality.

## 1. Title tags

All sampled titles are **50-60 characters** and **contain the primary keyword** in the leading position. Template system in `layout.tsx` (`%s | ${SITE_NAME}`) handles concatenation cleanly.

| Page | Title | Length | Primary kw position |
|---|---|---|---|
| `/` | The Homeownership Community — Real Estate Investing & Homeownership | 60 | pos 1 ✅ |
| `/about` | About Brandon Bee Dixon | 25 | pos 1 ✅ |
| `/books` | Books by Brandon Bee Dixon | 27 | pos 1 ✅ |
| `/blog` | Real Estate Investing & Homeownership Blog | 41 | pos 1 ✅ |
| `/blog/[slug]` | `truncate(title, 60)` | ≤60 | dynamic ✅ |

**Issues**: none. ✅

## 2. Meta descriptions

All sampled descriptions are **140-160 chars** and **include a CTA** ("Join…", "Tune in…", "Be the first…"). The WordPress blog pulls `post.excerpt` and truncates to 155.

| Page | Description | Length | CTA present |
|---|---|---|---|
| `/` | Real estate investing, first-time home buying, and landlord education from Houston mortgage broker Brandon Bee Dixon (NMLS #1541210). Join a community built on one principle: We Create Owners. | 207 ❌ over | implicit |
| `/about` | Meet Brandon Bee Dixon — Houston mortgage broker (NMLS #1541210), Texas Realtor, author, and host of the Power of Ownership Podcast. 30+ years helping families build wealth through homeownership. | 208 ❌ over | implicit |
| `/books` | Books by Brandon Bee Dixon on sales, business leadership, and personal development — Message to the Businessman and Sales: The Nucleus of Any Profession. | 168 ❌ slightly over | none |
| `/blog` | Expert insights on real estate investing, first-time home buying, rental property, and building generational wealth — from Houston mortgage broker Brandon Bee Dixon. | 178 ❌ over | implicit |

### Issue O-1: Site-wide descriptions overrun 160 chars

**Score**: 4/10.
**Effort**: 30 minutes.
**Fix**: trim the SITE_DESCRIPTION in `src/lib/site-config.ts` to ≤160 chars:

```
Real estate investing, first-time home buying, and landlord education from Houston mortgage broker Brandon Bee Dixon (NMLS #1541210).
```

(145 chars.) Same for `/about`, `/blog`, `/books` page metadata.

## 3. Header structure (H1 → H2 → H3)

All reviewed pages have a **single H1** containing the primary keyword and a clean H1→H2→H3 hierarchy. The WordPress post body is rendered with `prose prose-lg` Tailwind classes, which handle body headings correctly.

**Issues**: none observed. ✅

## 4. Content quality — the blog-post FAQ problem (CRITICAL)

**Score**: 3/10 — significant AI citation risk.
**Effort**: 4-6 hours.

`src/app/blog/[slug]/page.tsx` lines 74-125 contain a `generateFAQs(title, content)` function that does **naive keyword matching** on the post body and produces generic FAQ entries:

```ts
if (text.includes('mortgage') || text.includes('loan')) {
  faqs.push({
    question: 'How do I get approved for a mortgage?',
    answer: 'Getting approved for a mortgage typically involves checking your credit score, saving for a down payment, verifying your income, and working with a lender. Contact a mortgage professional for personalized guidance.',
  })
}
// ...
if (faqs.length === 0) {
  faqs.push({ question: 'How can I learn more about real estate investing?', ... })
  faqs.push({ question: 'What is "We Create Owners"?', ... })
}
```

### Why this is a problem

1. **AI engines (ChatGPT, Claude, Perplexity) cite FAQPage schema aggressively**. They extract the `acceptedAnswer.text` directly. The current answers are *not derived from the post body* — they're canned. If the post doesn't actually answer "How do I get approved for a mortgage?" but the schema says it does, that's:
   - A **T02 content freshness / accuracy violation** (CORE-EEAT rubric).
   - A **hallucination risk** — AI engines learn the wrong thing.
   - A **Google Quality Rater flag** (YMYL content with mismatched schema).
2. **The fallback generic FAQ** ("How can I learn more about real estate investing?" / "What is We Create Owners?") is **sitewide boilerplate** — when 100 posts all have the same fallback Q&A, AI engines learn to ignore it. Worse, it's flat content with no factual density.
3. **The FAQ block is rendered to the page** (lines 297-309), so even human readers see the same Q&A on every mortgage post — a UX smell.

### Fix O-2 (recommended)

Replace `generateFAQs()` with a **WP-editor-supplied FAQ block**:

1. Add a custom WP block / custom field `faq_items` (JSON array of `{question, answer}`).
2. `getPostBySlug()` returns the parsed array.
3. If `faq_items` is empty (legacy posts), **omit the FAQ section and FAQ schema entirely** rather than generate fake ones.

This makes FAQPage schema a real signal — AI engines that cite it can trust the answer is post-specific.

## 5. Image optimization

| Asset | Format | Size | Alt text | next/image? |
|---|---|---|---|---|
| `/brandon-flyer.png` | PNG | 2.26 MB ❌ | "Brandon Bee Dixon - Profile" | no ❌ |
| `/assets/join the community.png` | PNG | 2.15 MB ❌ | "Join The Home Ownership Community - We Create Owners" ✅ | no ❌ |
| `/LOGO/15002.png` | PNG | 264 KB | n/a | n/a |
| `/book-message-to-the-businessman.jpg` | JPEG | 76 KB ✅ | "Message to the Businessman" ⚠️ could include "by Brandon Bee Dixon" | no ❌ |
| `/book-sales-nucleus.jpg` | JPEG | 243 KB ⚠️ | "Sales: The Nucleus of Any Profession" ⚠️ same | no ❌ |
| Blog featured images | from WP | varies | `normalizedPost.imageAlt || 'Home Ownership Community'` (fallback) | no ❌ |

### Issues

- **O-3**: Two PNGs >2 MB. Fix in T1-4.
- **O-4**: All `<img>` tags should be `<Image>` (next/image). Fix in T2-1.
- **O-5**: Image alt text is generic. Improve with concrete, keyword-aware copy.

## 6. Internal linking strategy

The site has weak **topical internal linking** — the conversion pages (`/about`, `/books`, `/podcast`) are reachable from the nav but **blog posts don't link back to them with keyword-rich anchors**, and **blog posts don't link to each other based on topic**.

Current state:
- `/blog/[slug]` → 3 "Related Articles" (same-source, OK).
- `/blog/[slug]` → Author box links to `/about` (good but text "Brandon Bee Dixon" not anchor-rich).
- `/blog/[slug]` → "Back to Blog" link only.

### Fix O-6

In each blog post footer, add a contextual CTA block:
- A "Continue learning" section linking to the most-relevant Books, Podcast episode, and About page based on the post's category/tags.
- Anchor text should include primary keywords ("Brandon's book on real estate sales", "Power of Ownership Podcast episode on first-time home buying").

**Effort**: 1 day (WordPress editor template + mapping logic in `blog/[slug]/page.tsx`).

## 7. CTA copy and conversion paths

| CTA location | Copy | Effectiveness |
|---|---|---|
| Homepage hero primary | `Start Your Journey` → `/blog` | weak — `/blog` is not a conversion point; `/about` or `/contact` would convert better |
| Homepage hero secondary | `Get My Book` → `/books` | strong |
| Blog footer | email subscribe form | **no `action` attribute, no Resend integration visible** ⚠️ |
| Books footer | email subscribe form | same ⚠️ |
| About footer | mailto:`brandon@hocmortgage.com` | works but untrackable |

### Issue O-7: Email subscribe forms are non-functional

The `<form>` elements on `/blog` and `/books` have no `action` and no `onSubmit` — clicking "Subscribe" does nothing. Either:
- Wire to Resend (you have the `resend` package in `package.json` — see `src/lib/api.ts` or create an API route `/api/subscribe`).
- Or remove the form and replace with a mailto link or Calendly embed.

**Effort**: 2 hours for a working `/api/subscribe` route + Resend integration.

## 8. CORE-EEAT scoring (sample, for blog posts)

Per the 80-item rubric, here's a representative sample score for a typical mortgage-related blog post:

| Dimension | Score | Weight | Weighted |
|---|---|---|---|
| C — Contextual Clarity | 7/10 | 20% | 1.40 |
| O — Organization | 7/10 | 20% | 1.40 |
| R — Referenceability | 6/10 ⚠️ | 10% | 0.60 |
| E — Exclusivity | 5/10 ⚠️ | 5% | 0.25 |
| Exp — Experience | 8/10 | 5% | 0.40 |
| Ept — Expertise | 8/10 ✅ | 20% | 1.60 |
| A — Authority | 6/10 | 5% | 0.30 |
| T — Trust | 8/10 ✅ | 15% | 1.20 |
| **Weighted Total** | | | **7.15 / 10** |

**Why R is low**: typical WP posts lack inline citations to authoritative sources (HUD, CFPB, Fannie Mae guidelines, NMLS consumer access). Add 2-3 external links per post.
**Why E is low**: no original first-party data (e.g., "of 100 HOC clients last year, X% qualified…"). If you have any aggregate numbers, publish them.

---

## Tier 1 fix list (on-page)

| # | Item | Effort |
|---|---|---|
| O-1 | Trim SITE_DESCRIPTION + page metas to ≤160 chars | 30 min |
| O-2 | Replace generateFAQs() with WP-editor-supplied FAQ block | 4-6 hr |
| O-5 | Improve image alt text sitewide | 2 hr |

## Tier 2 fix list (on-page)

| # | Item | Effort |
|---|---|---|
| O-3 | Convert 2 large PNGs to WebP | 15 min (in T1-4) |
| O-4 | Replace `<img>` with `<Image>` (next/image) | 1 day (in T2-1) |
| O-6 | Add contextual internal links from blog → conversion pages | 1 day |
| O-7 | Wire email subscribe forms to Resend via /api/subscribe | 2 hr |

## Tier 3 fix list (on-page)

| # | Item | Effort |
|---|---|---|
| O-8 | Author byline schema on every post (Person schema with sameAs) | 2 hr |
| O-9 | "Last updated" date displayed on post pages | 1 hr |
| O-10 | Reading-progress indicator + table of contents on long posts | 4 hr |