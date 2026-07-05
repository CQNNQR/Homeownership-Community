import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

/**
 * Root 404 page — replaces Next.js default. Renders for any unmatched path.
 *
 * Notes:
 *  - This page returns HTTP 404 by virtue of being not-found.tsx in the
 *    app router. search engines will treat it as a hard 404.
 *  - Soft-404 on /blog/[slug] was the bigger audit finding; that's fixed in
 *    src/app/blog/[slug]/page.tsx (calls notFound() when post is null).
 *
 * Audit reference: docs/seo-audit-2026-07-05/01-technical-seo.md §ME-1
 *                  docs/seo-audit-2026-07-05/00-summary-report.md §Tier 1 #6
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <section className="pt-32 pb-16 bg-[#F9F9F9]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-sm font-bold tracking-widest text-red-700 uppercase mb-4">
            404 — Page Not Found
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-6">
            We couldn&apos;t find that page.
          </h1>
          <p className="text-lg text-gray-600 mb-10 max-w-xl mx-auto">
            The page may have moved, or the link you followed may be out of date. Try one of these instead:
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/blog"
              className="inline-flex items-center justify-center gap-2 bg-red-700 hover:bg-red-800 text-white font-semibold px-6 py-3 rounded transition-colors"
            >
              Browse the Blog
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-6 py-3 rounded transition-colors"
            >
              Back to Home
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-6 py-3 rounded transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}