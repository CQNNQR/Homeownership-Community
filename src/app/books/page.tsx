import type { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import BooksList from '@/components/BooksList'
import { SITE_URL, FOUNDER } from '@/lib/site-config'

export const metadata: Metadata = {
  title: 'Books by Brandon Bee Dixon',
  description:
    'Books by Brandon Bee Dixon on sales and business leadership — Message to the Businessman and Sales: The Nucleus of Any Profession.',
  alternates: {
    canonical: `${SITE_URL}/books`,
  },
  openGraph: {
    title: 'Books by Brandon Bee Dixon | The Homeownership Community',
    description:
      'Books by Brandon Bee Dixon on sales, business leadership, and personal development. Available on Amazon.',
    url: `${SITE_URL}/books`,
    type: 'website',
  },
}

/**
 * Book schema for both of Brandon's published works (audit Tier 1 #6).
 * Each Book becomes a citable entity for AI engines and surfaces
 * product rich results in Google. ISBN fields are intentionally omitted
 * here — fill in from the Amazon product pages when known.
 */
const bookSchema = [
  {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: 'Message to the Businessman',
    author: {
      '@type': 'Person',
      name: FOUNDER.name,
      url: `${SITE_URL}/about`,
    },
    image: `${SITE_URL}/book-message-to-the-businessman.jpg`,
    bookFormat: 'https://schema.org/Paperback',
    inLanguage: 'en',
    publisher: {
      '@type': 'Organization',
      name: 'Brandon Bee Dixon',
    },
    about: 'Sales, business leadership, and personal development for entrepreneurs.',
    offers: {
      '@type': 'Offer',
      url: 'https://a.co/d/09f8MkL3',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: 'Sales: The Nucleus of Any Profession',
    author: {
      '@type': 'Person',
      name: FOUNDER.name,
      url: `${SITE_URL}/about`,
    },
    image: `${SITE_URL}/book-sales-nucleus.jpg`,
    bookFormat: 'https://schema.org/Paperback',
    inLanguage: 'en',
    publisher: {
      '@type': 'Organization',
      name: 'Brandon Bee Dixon',
    },
    about: 'Sales fundamentals and the role of selling across every profession.',
    offers: {
      '@type': 'Offer',
      url: 'https://a.co/d/0bXRCoq6',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
  },
]

const recommendedReading = [
  {
    title: 'Rich Dad Poor Dad',
    author: 'Robert Kiyosaki',
    description: 'What the rich teach their kids about money that the poor and middle class do not.',
  },
  {
    title: 'The Millionaire Real Estate Investor',
    author: 'Gary Keller',
    description: 'Anyone can become a millionaire by investing in real estate.',
  },
  {
    title: 'Think and Grow Rich',
    author: 'Napoleon Hill',
    description: 'The timeless classic on success and wealth building principles.',
  },
  {
    title: 'The Book on Rental Property Investing',
    author: 'Brandon Turner',
    description: 'How to create wealth and passive income through rental properties.',
  },
]

export default function BooksPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Book JSON-LD (audit Tier 1 #6) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bookSchema) }}
      />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-[#F9F9F9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-block bg-red-700 text-white text-xs font-bold px-4 py-2 mb-6">
            I Create Owners
          </div>
          <h1 className="text-4xl font-bold text-black mb-4">Books by Brandon Bee Dixon</h1>
          <p className="text-gray-600 max-w-2xl">
            Learn from Brandon&apos;s expertise through his published works. These books cover essential topics in sales, business leadership, and personal development to help you achieve success.
          </p>
        </div>
      </section>

      {/* Our Books (client island) */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <BooksList />
        </div>
      </section>

      {/* Recommended Reading */}
      <section className="py-16 bg-[#F9F9F9]">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-black mb-8">Recommended Reading</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {recommendedReading.map((book, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-sm flex gap-4"
              >
                <div className="bg-pink-200 w-16 h-20 rounded flex-shrink-0 flex items-center justify-center">
                  <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-black mb-1">{book.title}</h3>
                  <p className="text-gray-500 text-sm mb-2">{book.author}</p>
                  <p className="text-gray-600 text-sm">{book.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-black">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Join the Ownership Movement</h2>
          <p className="text-white/70 mb-8">
            Be the first to know about new books, real estate investing insights, and exclusive content. Join a community dedicated to building wealth through property ownership.
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