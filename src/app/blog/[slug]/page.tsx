import { Metadata } from 'next'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { getPostBySlug as getPostFromWordPress, getPosts as getPostsFromWordPress } from '@/lib/wordpress'
import { normalizePost } from '@/lib/utils'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    // Use direct WordPress fetch for server component (no browser blocking)
    const post = await getPostFromWordPress(slug)

    if (!post) {
      return { title: 'Post Not Found' }
    }

    const normalizedPost = normalizePost(post)

    return {
      title: `${normalizedPost.title} | The Home Ownership Community`,
      description: normalizedPost.excerpt,
      openGraph: {
        title: normalizedPost.title,
        description: normalizedPost.excerpt,
        images: normalizedPost.image ? [{ url: normalizedPost.image }] : [],
      },
    }
  } catch {
    return { title: 'Blog Post' }
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params

  let post = null
  let relatedPosts: any[] = []

  try {
    // Use direct WordPress fetch for server component
    post = await getPostFromWordPress(slug)

    if (post) {
      const { posts: allPosts } = await getPostsFromWordPress(1, 4)
      relatedPosts = allPosts
        .filter((p) => p.slug !== slug)
        .slice(0, 3)
        .map(normalizePost)
    }
  } catch (err) {
    console.error('Error fetching post:', err)
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <section className="pt-32 pb-16">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold text-black mb-4">Article Not Found</h1>
            <Link href="/blog" className="text-red-700 hover:text-red-800">
              ← Back to Blog
            </Link>
          </div>
        </section>
        <Footer />
      </div>
    )
  }

  const normalizedPost = normalizePost(post)

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Article Hero */}
      <section className="pt-32 pb-12 bg-[#F9F9F9]">
        <div className="max-w-3xl mx-auto px-4">
          <Link href="/blog" className="inline-flex items-center gap-2 text-gray-500 hover:text-black mb-8 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Blog
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-red-700 text-white text-xs font-bold px-3 py-1 rounded">{normalizedPost.category}</span>
            <span className="text-gray-400 text-sm">{normalizedPost.date}</span>
            <span className="text-gray-400 text-sm">• {normalizedPost.readingTime}</span>
          </div>
          <h1 className="text-4xl font-bold text-black mb-6">{normalizedPost.title}</h1>
        </div>
      </section>

      {/* Featured Image */}
      {normalizedPost.image && (
        <div className="max-w-4xl mx-auto px-4 -mt-4">
          <img
            src={normalizedPost.image}
            alt={normalizedPost.imageAlt || 'Home Ownership Community'}
            className="w-full h-96 object-cover rounded-xl shadow-lg"
          />
        </div>
      )}

      {/* Article Content */}
      <section className="py-16 bg-white">
        <article
          className="max-w-3xl mx-auto px-4 prose prose-lg max-w-none text-center"
          dangerouslySetInnerHTML={{ __html: post.content?.rendered || '' }}
        />
      </section>

      {/* Author Box */}
      <section className="py-12 bg-[#F9F9F9]">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center gap-6 p-6 bg-white rounded-xl shadow-sm">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-500 font-bold text-xl">
                {normalizedPost.author.charAt(0)}
              </span>
            </div>
            <div>
              <p className="font-bold text-black">{normalizedPost.author}</p>
              <p className="text-gray-600 text-sm">The Home Ownership Community</p>
            </div>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      {relatedPosts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-black mb-8">More Articles</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  href={`/blog/${relatedPost.slug}`}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow block border border-gray-100"
                >
                  <div className="h-40 bg-gray-200 relative">
                    {relatedPost.image && (
                      <img
                        src={relatedPost.image}
                        alt={relatedPost.imageAlt}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">{relatedPost.category}</span>
                      <span className="text-gray-400 text-sm">{relatedPost.date}</span>
                    </div>
                    <h3 className="text-lg font-bold text-black">{relatedPost.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  )
}
