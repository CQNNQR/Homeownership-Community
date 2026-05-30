import Link from 'next/link'
import { getPostsFromRSS } from '@/lib/wordpress'
import { normalizePost } from '@/lib/utils'

async function getLatestPosts() {
  try {
    const { posts } = await getPostsFromRSS(1, 3)
    return posts.map(normalizePost)
  } catch (err) {
    return []
  }
}

export default async function BlogPreview() {
  const posts = await getLatestPosts()

  if (posts.length === 0) {
    return null
  }

  return (
    <section id="blog" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-black mb-4">Real Estate Investing & Homeownership Education</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Insights, tips, and strategies for navigating the real estate market, building generational wealth, and developing your ownership mindset.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post: any) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow block"
            >
              <div className="h-56 bg-gray-200 relative">
                {post.image ? (
                  <img
                    src={post.image}
                    alt={post.imageAlt}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src="/LOGO/15002.png"
                    alt="Home Ownership Community"
                    className="w-full h-full object-contain bg-gray-50"
                  />
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

        <div className="text-center mt-12">
          <Link
            href="/blog"
            className="inline-flex items-center justify-center px-8 py-4 border-2 border-black text-black font-semibold rounded hover:bg-black hover:text-white transition-colors"
          >
            Explore All Resources
          </Link>
        </div>
      </div>
    </section>
  )
}
