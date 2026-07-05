import type { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import BlogList from '@/components/BlogList'
import { SITE_URL } from '@/lib/site-config'

export const revalidate = 10

export const metadata: Metadata = {
  title: 'Real Estate Investing & Homeownership Blog',
  description:
    'Expert insights on real estate investing, first-time home buying, rental property, and building generational wealth.',
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
  openGraph: {
    title: 'Real Estate Investing & Homeownership Blog | HOC',
    description:
      'Expert insights on real estate investing, first-time home buying, rental property, and building generational wealth.',
    url: `${SITE_URL}/blog`,
    type: 'website',
  },
}

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-[#F9F9F9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-black mb-4">Real Estate Investing & Homeownership Education</h1>
          <p className="text-gray-600 max-w-2xl">
            Expert insights on real estate investing, property ownership, building generational wealth, and developing your ownership mindset. Join our real estate community and start your journey toward financial freedom.
          </p>
        </div>
      </section>

      {/* Blog Grid (client island for pagination + load-more) */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BlogList />
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-black">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Join the Homeownership Movement</h2>
          <p className="text-white/70 mb-8">
            Get expert insights on real estate investing, mortgage education, and wealth building delivered straight to your inbox. Join a community built on one principle: We Create Owners.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-700"
            />
            <button
              type="submit"
              className="bg-red-700 hover:bg-red-800 text-white font-semibold px-6 py-3 rounded transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  )
}