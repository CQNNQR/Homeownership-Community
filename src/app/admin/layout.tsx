import type { Metadata } from 'next'

/**
 * Admin segment layout — applies noindex,nofollow to every admin route
 * (both /admin and /admin/login).
 *
 * Why: the audit found /admin/login was a publicly crawlable page returning
 * HTTP 200 with a Supabase login form — a SERP-hygiene and brand-trust
 * liability. This layout fixes it at the segment level so every future
 * /admin/* route inherits noindex automatically.
 *
 * Audit reference: docs/seo-audit-2026-07-05/01-technical-seo.md §Top 5 #5
 *                  docs/seo-audit-2026-07-05/00-summary-report.md §Tier 1 #7
 */
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  title: 'Admin',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Plain pass-through — admin pages already have their own auth guards.
  return <>{children}</>
}