import type { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import ResourcesGuides from '@/components/ResourcesGuides'
import { SITE_URL } from '@/lib/site-config'

export const metadata: Metadata = {
  title: 'Free Real Estate Investment Guides & Resources',
  description:
    'Free downloadable guides on real estate investing, reverse mortgages, and homeownership from Houston mortgage broker Brandon Bee Dixon (NMLS #1541210).',
  alternates: {
    canonical: `${SITE_URL}/resources`,
  },
  openGraph: {
    title: 'Free Real Estate Investment Guides | The Homeownership Community',
    description:
      'Free downloadable guides on real estate investing, reverse mortgages, and homeownership from Houston mortgage broker Brandon Bee Dixon.',
    url: `${SITE_URL}/resources`,
    type: 'website',
  },
}

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-[#F9F9F9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-black mb-4">Homeownership Resources & Financial Literacy</h1>
          <p className="text-gray-600 max-w-2xl">
            Explore our collection of guides and resources to help you succeed in real estate investing, property ownership, and building generational wealth through ownership.
          </p>
        </div>
      </section>

      {/* Free Guides Section - Requires Subscription (client island) */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-black mb-2">Free Guides</h2>
          <p className="text-gray-600 mb-8">Subscribe to get instant access to these free guides.</p>
          <ResourcesGuides />
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-[#F9F9F9]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-black mb-4">Looking for Something Specific?</h2>
          <p className="text-gray-600 mb-6">
            Contact Brandon directly for personalized guidance on real estate investing, mortgage options, or property management questions.
          </p>
          <a
            href="mailto:brandon@hocmortgage.com"
            className="inline-flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white font-semibold px-6 py-3 rounded transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Contact Brandon
          </a>
        </div>
      </section>

      <Footer />
    </div>
  )
}