# Homeownership Community — SEO Audit
*Codebase review + technical, on-page, and GEO scoring.*

**Domain**: https://www.thehomeownershipcommunity.com
**Repo**: https://github.com/CQNNQR/Homeownership-Community
**Stack**: Next.js 16.2.6 App Router · React 19.2.6 · Supabase · WordPress (REST API) · Vercel · Tailwind 3.4
**Audit date**: 2026-07-05

## Files in this audit

1. `00-summary-report.md` — Executive summary, overall scores, top 10 priorities (this file).
2. `01-technical-seo.md` — Crawlability, indexing, Core Web Vitals, sitemap, robots, schema, security.
3. `02-onpage-content.md` — Titles, metas, headers, keywords, content quality, internal links, image optimization.
4. `03-domain-geo.md` — Domain authority signals + GEO/AI citation potential (CORE-EEAT + CITE).
5. `04-implementation-plan.md` — Prioritized fix list: Tier 1 (≤1 day), Tier 2 (1-3 days), Tier 3 (1-2 weeks).

## How to read this audit

Every issue carries: **score (0-10)**, **blast radius**, **effort**, **owner**, and a concrete fix recipe. The summary report aggregates everything to a single 0-100 score per dimension. Implementation-plan.md is the action checklist — start there.

## Headline numbers (preview)

| Dimension | Score | Tier |
|---|---|---|
| Technical SEO | **78 / 100** (Good) | Tier 1 only — 5 quick wins |
| On-page content | **72 / 100** (Good) | Tier 1 + Tier 2 — 8 items |
| GEO / AI citation | **54 / 100** (Medium) | Tier 2 — biggest gap, biggest opportunity |
| Domain authority (CITE) | **41 / 100** (Low) | Tier 3 — long-term entity play |
| **Overall** | **62 / 100** (Medium) | — |

See `00-summary-report.md` for the full breakdown.

## Audit method

- **Code review**: every `*.tsx`, `*.ts`, `*.js`, `public/` asset, `package.json`, `next.config.js`, `vercel.json`, and config files in `src/app/`, `src/components/`, `src/lib/`.
- **Schema validation**: spot-checked Article / Breadcrumb / FAQ / Organization JSON-LD for validity and coverage.
- **No live PageSpeed / Search Console data** in this audit (no API access). Where numbers would help, the implementation plan lists the test commands to run yourself.
- **No third-party backlink data** — recommendations are based on what the codebase can do today, not on referring-domain counts.