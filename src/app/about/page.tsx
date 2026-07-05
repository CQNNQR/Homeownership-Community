import type { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { getSettings } from '@/lib/settings'
import { sanitizeHtml } from '@/lib/sanitize'
import { SITE_URL } from '@/lib/site-config'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings()
  const description =
    settings.meta_description ||
    'Meet Brandon Bee Dixon — Houston mortgage broker (NMLS #1541210), Texas Realtor, author, and host of the Power of Ownership Podcast.'
  return {
    title: settings.meta_title || 'About Brandon Bee Dixon',
    description: description.slice(0, 160),
    alternates: {
      canonical: `${SITE_URL}/about`,
    },
    openGraph: {
      title: settings.meta_title || 'About Brandon Bee Dixon | The Homeownership Community',
      description: description.slice(0, 160),
      url: `${SITE_URL}/about`,
      type: 'profile',
    },
  }
}

export default async function AboutPage() {
  const settings = await getSettings()

  const socialLinks = {
    facebook: settings.facebook_url || 'https://www.facebook.com/share/1DySwCFJKY/?mibextid=wwXIfr',
    instagram: settings.instagram_url || 'https://www.instagram.com/billionaireloanofficer?utm_source=qr',
    linkedin: settings.linkedin_url || 'https://www.linkedin.com/in/brandonbeedixon?utm_source=share_via&utm_content=profile&utm_medium=member_ios',
    twitter: settings.twitter_url || 'https://x.com/billionaire_lo?s=11&t=b8_2VZHBBDvMHx_DZ4ZwPA',
    youtube: settings.youtube_url || 'https://youtube.com/@billionaireloanofficer?si=x_1rO-5t4U3rdgbf',
    amazon1: 'https://a.co/d/09f8MkL3',
    amazon2: 'https://a.co/d/0bXRCoq6',
  }

  const aboutTitle = settings.about_title || 'About Brandon Bee Dixon'
  const aboutContent = settings.about_content || ''
  const primaryColor = settings.theme_primary_color || '#A61C30'

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block text-white text-xs font-bold px-4 py-2 mb-6" style={{ backgroundColor: primaryColor }}>
              I Create Owners
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
              {aboutTitle}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Mortgage Broker | Texas Realtor | Entrepreneur | Author | Podcast Host
            </p>
          </div>

          {/* Profile Flyer */}
          <div className="max-w-2xl mx-auto mb-16">
            <img
              src="/brandon-flyer.webp"
              alt="Brandon Bee Dixon - Profile"
              className="w-full rounded-xl shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Bio Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            {aboutContent ? (
              <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(aboutContent) }} />
            ) : (
              <>
                <h2 className="text-3xl font-bold text-black mb-6">The Man Behind the Mission</h2>

                <p className="text-gray-600 mb-6 leading-relaxed">
                  Brandon Bee Dixon is a Mortgage Broker, Texas Realtor, entrepreneur, author, and host of the Power of Ownership Podcast.
                </p>

                <p className="text-gray-600 mb-6 leading-relaxed">
                  With over 30 years of sales and leadership experience and nearly a decade in the mortgage industry, Brandon has helped countless families achieve homeownership and real estate investment goals.
                </p>

                <h3 className="text-2xl font-bold text-black mt-10 mb-4">Professional Background</h3>

                <p className="text-gray-600 mb-6 leading-relaxed">
                  As Branch Manager with <strong>NEXA Mortgage</strong>, Brandon provides access to over 300 lending institutions, helping clients find financing solutions for first homes, investment properties, land purchases, and complex mortgage scenarios.
                </p>

                <div className="border-l-4 p-6 my-8" style={{ borderColor: primaryColor, backgroundColor: `${primaryColor}10` }}>
                  <h4 className="font-bold text-black mb-2">The "Deal Rescue" Approach</h4>
                  <p className="text-gray-600 mb-0">
                    Brandon specializes in helping clients navigate challenging situations when other lenders have said no. If you've been turned down elsewhere, Brandon and his team can help find a solution.
                  </p>
                </div>

                <h3 className="text-2xl font-bold text-black mt-10 mb-4">Author & Educator</h3>

                <p className="text-gray-600 mb-6 leading-relaxed">
                  Brandon is the author of <em>Message to the Businessman</em> and <em>Sales: The Nucleus of Any Profession</em>. As the founder of The Homeownership Community, he created a platform dedicated to educating future homeowners, landlords, and real estate investors.
                </p>

                <h3 className="text-2xl font-bold text-black mt-10 mb-4">The Mission</h3>

                <div className="bg-black text-white p-8 text-center my-8">
                  <p className="text-2xl font-bold">"I Create Owners."</p>
                </div>

                <p className="text-gray-600 mb-6 leading-relaxed">
                  Through education, mentorship, and practical real estate strategies, Brandon helps people move from renting to owning and from consumers to investors.
                </p>

                <h3 className="text-2xl font-bold text-black mt-10 mb-4">Connect With Brandon</h3>

                <div className="flex flex-wrap gap-4 mt-6">
                  <a
                    href={socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-5 py-3 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </a>
                  <a
                    href={socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-5 py-3 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                    </svg>
                    Instagram
                  </a>
                  <a
                    href={socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-5 py-3 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    LinkedIn
                  </a>
                  <a
                    href={socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-5 py-3 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    X (Twitter)
                  </a>
                </div>

                <div className="mt-10 pt-8 border-t border-gray-200">
                  <h3 className="text-2xl font-bold text-black mb-4">Contact Brandon</h3>
                  <p className="text-gray-600 mb-4">
                    For mortgage inquiries, investment property financing, or to join the Homeownership Community:
                  </p>
                  <a
                    href={`mailto:${settings.contact_email || 'brandon@hocmortgage.com'}`}
                    className="inline-flex items-center gap-2 font-semibold text-lg transition-colors"
                    style={{ color: primaryColor }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {settings.contact_email || 'brandon@hocmortgage.com'}
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Podcast Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block text-white text-xs font-bold px-4 py-2 mb-6" style={{ backgroundColor: primaryColor }}>
            Podcast
          </span>
          <h2 className="text-3xl font-bold text-black mb-4">Power of Ownership Podcast</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Tune in to learn about real estate investing, homeownership strategies, and wealth building through property ownership.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href={socialLinks.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-white font-semibold px-6 py-3 rounded transition-colors"
              style={{ backgroundColor: primaryColor }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              Listen Now
            </a>
          </div>
        </div>
      </section>

      {/* Books Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-black mb-8 text-center">Brandon's Books</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <a
              href={socialLinks.amazon1}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-50 hover:bg-gray-100 p-6 rounded-xl transition-colors block"
            >
              <div className="flex items-start gap-4">
                <img
                  src="/book-message-to-the-businessman.jpg"
                  alt="Message to the Businessman"
                  className="w-20 h-28 rounded shadow-md object-cover flex-shrink-0"
                />
                <div>
                  <h3 className="font-bold text-black mb-1">Message to the Businessman</h3>
                  <p className="text-gray-500 text-sm mb-2">by Brandon Bee Dixon</p>
                  <span className="text-sm font-medium inline-flex items-center gap-1" style={{ color: primaryColor }}>
                    View on Amazon
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </span>
                </div>
              </div>
            </a>
            <a
              href={socialLinks.amazon2}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-50 hover:bg-gray-100 p-6 rounded-xl transition-colors block"
            >
              <div className="flex items-start gap-4">
                <img
                  src="/book-sales-nucleus.jpg"
                  alt="Sales: The Nucleus of Any Profession"
                  className="w-20 h-28 rounded shadow-md object-cover flex-shrink-0"
                />
                <div>
                  <h3 className="font-bold text-black mb-1">Sales: The Nucleus of Any Profession</h3>
                  <p className="text-gray-500 text-sm mb-2">by Brandon Bee Dixon</p>
                  <span className="text-sm font-medium inline-flex items-center gap-1" style={{ color: primaryColor }}>
                    View on Amazon
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </span>
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
