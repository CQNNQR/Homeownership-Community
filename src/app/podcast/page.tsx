import type { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { getSettings } from '@/lib/settings'
import { getPodcastEpisodes } from '@/lib/settings'
import { SITE_URL, FOUNDER } from '@/lib/site-config'

export const revalidate = 10

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings()
  const description =
    settings.podcast_meta_description ||
    'The Power of Ownership Podcast with Brandon Bee Dixon — real estate investing, homeownership strategies, and wealth-building conversations.'
  return {
    title: settings.podcast_meta_title || 'Power of Ownership Podcast',
    description: description.slice(0, 160),
    alternates: {
      canonical: `${SITE_URL}/podcast`,
    },
    openGraph: {
      title: 'Power of Ownership Podcast | Houston Real Estate | HOC',
      description: description.slice(0, 160),
      url: `${SITE_URL}/podcast`,
      type: 'website',
    },
  }
}

/**
 * PodcastSeries JSON-LD so AI engines + podcast directories recognize
 * the show as an entity (audit Tier 1 #7). Apple Podcasts is the
 * canonical webFeed per Apple Podcast Connect. youtube.com is the
 * video surface. future: when /podcast/[slug] pages exist, each
 * episode will get its own PodcastEpisode schema.
 */
const podcastSeriesSchema = {
  '@context': 'https://schema.org',
  '@type': 'PodcastSeries',
  name: 'Power of Ownership',
  url: `${SITE_URL}/podcast`,
  description:
    'Real estate investing, homeownership strategies, and wealth-building conversations with Brandon Bee Dixon.',
  inLanguage: 'en',
  webFeed: 'https://podcasts.apple.com/us/podcast/the-power-of-ownership/id1367210212',
  author: {
    '@type': 'Person',
    name: FOUNDER.name,
    url: `${SITE_URL}/about`,
  },
  publisher: {
    '@type': 'Organization',
    name: 'The Homeownership Community',
    url: SITE_URL,
  },
  // image will be added once a podcast cover art asset exists at
  // /podcast/cover.jpg (recommended 1400x1400 to 3000x3000).
}

export default async function PodcastPage() {
  const settings = await getSettings()
  const episodes = await getPodcastEpisodes()
  const primaryColor = settings.theme_primary_color || '#A61C30'
  const podcastUrl = settings.podcast_url || 'https://youtube.com/@billionaireloanofficer'

  const socialLinks = {
    youtube: podcastUrl,
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* PodcastSeries JSON-LD (audit Tier 1 #7) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(podcastSeriesSchema) }}
      />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span
            className="inline-block text-white text-xs font-bold px-4 py-2 mb-6"
            style={{ backgroundColor: primaryColor }}
          >
            Podcast
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
            Power of Ownership Podcast
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tune in to learn about real estate investing, homeownership strategies, and wealth building through property ownership.
          </p>

          {/* Subscribe Links */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
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
              Listen on YouTube
            </a>
          </div>
        </div>
      </section>

      {/* Episodes */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-black mb-8 text-center">All Episodes</h2>

          {episodes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No podcast episodes available yet.</p>
              <p className="text-gray-400 text-sm">Check back soon for new episodes!</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {episodes.map((episode: any) => (
                <div
                  key={episode.id}
                  className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Episode Number Badge */}
                    <div className="flex-shrink-0">
                      <div
                        className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-xl"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {episode.episode_number || '?'}
                      </div>
                    </div>

                    {/* Episode Content */}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-black mb-2">
                        {episode.title}
                      </h3>
                      {episode.description && (
                        <p className="text-gray-600 mb-4">{episode.description}</p>
                      )}
                      <a
                        href={episode.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium hover:opacity-80 transition-opacity"
                        style={{ color: primaryColor }}
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                        Watch on YouTube
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-black mb-4">Want to Learn More?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join the Homeownership Community to get access to exclusive content, resources, and community events.
          </p>
          <a
            href="/about"
            className="inline-flex items-center gap-2 text-white font-semibold px-6 py-3 rounded transition-colors"
            style={{ backgroundColor: primaryColor }}
          >
            Learn About Brandon
          </a>
        </div>
      </section>

      <Footer />
    </div>
  )
}
