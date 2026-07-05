import BlogPreview from '@/components/BlogPreview'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import EventsPreview from '@/components/EventsPreview'
import TestimonialsPreview from '@/components/TestimonialsPreview'
import BooksPreview from '@/components/BooksPreview'
import { getSettings } from '@/lib/settings'
import { sanitizeHtml } from '@/lib/sanitize'

// Revalidate every 10 seconds to keep blog fresh
export const revalidate = 10

export async function generateMetadata() {
  const settings = await getSettings()
  return {
    title: settings.meta_title || 'The Homeownership Community | Building Generational Wealth',
    description: settings.meta_description || 'Empowering future homeowners, real estate investors, and aspiring landlords to build generational wealth through ownership.',
  }
}

export default async function Home() {
  const settings = await getSettings()

  const heroTitle = settings.hero_title || 'Build <span className="text-red-500">Generational Wealth</span> Through <span className="text-red-500">Real Estate Ownership</span>'
  const heroSubtitle = settings.hero_subtitle || "Join The Home Ownership Community — a growing network dedicated to helping future homeowners, real estate investors, and aspiring landlords achieve financial freedom through ownership."
  const siteTagline = settings.site_tagline || 'We Create Owners.'
  const primaryColor = settings.theme_primary_color || '#A61C30'
  const heroImageUrl = settings.hero_image_url || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop'
  const ctaButtonText = settings.cta_button_text || 'Start Your Journey'
  const ctaSecondaryText = settings.cta_secondary_text || 'Get My Book'
  const blogTitle = settings.blog_title || 'Latest from the Blog'
  const showBooks = settings.show_books_section !== 'false'
  const showCommunityAd = settings.show_community_ad !== 'false'
  const showEvents = settings.show_events_section !== 'false'
  const showTestimonials = settings.show_testimonials_section !== 'false'

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="relative min-h-screen pt-20">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('${heroImageUrl}')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/75 to-black/90" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto py-24">
          {/* Welcome Pill */}
          <div className="inline-block bg-white/10 backdrop-blur-sm rounded-full px-5 py-2 mb-8">
            <p className="text-white/90 text-sm font-medium tracking-wide">Welcome to the Ownership Movement</p>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
            {settings.hero_title ? (
              <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(settings.hero_title) }} />
            ) : (
              <>
                Build <span className="text-red-500">Generational Wealth</span> Through <span className="text-red-500">Real Estate Ownership</span>
              </>
            )}
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-white/80 mb-6 max-w-2xl mx-auto leading-relaxed">
            {heroSubtitle}
          </p>
          <p className="text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed">
            {siteTagline}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/blog"
              style={{ backgroundColor: primaryColor }}
              className="hover:opacity-90 text-white font-semibold px-8 py-4 rounded text-base transition-opacity inline-flex items-center justify-center gap-2"
            >
              {ctaButtonText}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <a
              href="/books"
              className="bg-black/80 hover:bg-black text-white font-semibold px-8 py-4 rounded text-base transition-colors border border-white/30 inline-flex items-center justify-center gap-2"
            >
              {ctaSecondaryText}
            </a>
          </div>
        </div>
      </section>

      {/* Latest from the Blog Section - WordPress Powered */}
      <BlogPreview title={blogTitle} />

      {/* Upcoming Events Section */}
      {showEvents && <EventsPreview />}

      {/* Books Section */}
      {showBooks && <BooksPreview primaryColor={primaryColor} />}

      {/* Community Ad Banner */}
      {showCommunityAd && (
        <section className="py-16 bg-gradient-to-b from-pink-50 to-gray-100">
          <div className="max-w-4xl mx-auto px-4">
            <img
              src="/assets/join the community.webp"
              alt="Join The Home Ownership Community - We Create Owners"
              className="w-full rounded-xl shadow-2xl"
            />
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      {showTestimonials && <TestimonialsPreview />}

      {/* Footer */}
      <Footer />
    </div>
  )
}
