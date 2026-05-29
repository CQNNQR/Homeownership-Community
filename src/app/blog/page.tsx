import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Link from 'next/link'

const blogPosts = [
  {
    slug: 'how-to-spot-value-in-high-end-real-estate',
    title: 'How to Spot Value in High-End Real Estate',
    excerpt: 'Learn the key indicators that separate great investments from overpriced properties in luxury markets.',
    category: 'Investing',
    date: 'October 12, 2024',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&auto=format&fit=crop',
    readTime: '8 min read',
  },
  {
    slug: 'why-joining-real-estate-community-accelerates-success',
    title: 'Why Joining a Real Estate Community Accelerates Your Success',
    excerpt: 'Discover how networking with fellow investors can unlock opportunities you won\'t find alone.',
    category: 'Community',
    date: 'October 8, 2024',
    image: null,
    readTime: '6 min read',
  },
  {
    slug: 'managing-high-end-properties-landlords-guide',
    title: 'Managing High-End Properties: A Landlord\'s Guide',
    excerpt: 'Essential strategies for maintaining luxury rentals and keeping tenants satisfied long-term.',
    category: 'Landlord Tips',
    date: 'October 14, 2024',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop',
    readTime: '10 min read',
  },
  {
    slug: 'financing-your-first-investment-property',
    title: 'Financing Your First Investment Property',
    excerpt: 'Understanding loan options, down payments, and financing strategies for new investors.',
    category: 'Investing',
    date: 'October 20, 2024',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop',
    readTime: '12 min read',
  },
  {
    slug: 'building-generational-wealth-through-real-estate',
    title: 'Building Generational Wealth Through Real Estate',
    excerpt: 'How strategic property investments can create lasting wealth for your family.',
    category: 'Investing',
    date: 'October 25, 2024',
    image: 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=800&auto=format&fit=crop',
    readTime: '15 min read',
  },
  {
    slug: 'market-analysis-for-real-estate-investors',
    title: 'Market Analysis for Real Estate Investors',
    excerpt: 'How to evaluate local markets, trends, and opportunities before making investment decisions.',
    category: 'Investing',
    date: 'November 1, 2024',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop',
    readTime: '11 min read',
  },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-[#F9F9F9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-black mb-4">Latest from the Blog</h1>
          <p className="text-gray-600 max-w-2xl">
            Insights, tips, and strategies for navigating the high-end real estate market and building generational wealth.
          </p>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow block"
              >
                <div className="h-56 bg-gray-200 relative">
                  {post.image ? (
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <span className="text-gray-400 text-sm font-medium">Community Logo</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">{post.category}</span>
                    <span className="text-gray-400 text-sm">{post.date}</span>
                  </div>
                  <h3 className="text-xl font-bold text-black mb-3">{post.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">{post.excerpt}</p>
                  <span className="text-red-700 font-semibold text-sm inline-flex items-center gap-1">
                    Read Article
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-black">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Stay Informed</h2>
          <p className="text-white/70 mb-8">
            Get the latest insights, tips, and strategies delivered straight to your inbox.
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
