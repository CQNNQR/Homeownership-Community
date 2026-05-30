'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { getPosts } from '@/lib/wordpress'
import { normalizePost } from '@/lib/utils'

interface Post {
  id: string
  slug: string
  title: string
  excerpt: string
  date: string
  image: string | null
  imageAlt: string
  category: string
  readingTime: string
}

const POSTS_PER_PAGE = 6

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [hasInitialized, setHasInitialized] = useState(false)

  const fetchPosts = useCallback(async (page: number) => {
    try {
      const result = await getPosts(page, POSTS_PER_PAGE)
      const normalizedPosts = result.posts.map(normalizePost)

      if (page > 1) {
        setPosts(prev => [...prev, ...normalizedPosts])
      } else {
        setPosts(normalizedPosts)
      }
      setHasMore(result.pageInfo.totalPages > page)
      setCurrentPage(page)
      setError(null)
    } catch (err) {
      setError('Unable to load blog posts. Please try again later.')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    if (!hasInitialized) {
      setHasInitialized(true)
      fetchPosts(1)
    }
  }, [hasInitialized, fetchPosts])

  function loadMore() {
    if (hasMore && !loadingMore) {
      setLoadingMore(true)
      fetchPosts(currentPage + 1)
    }
  }

  function retry() {
    setLoading(true)
    setError(null)
    fetchPosts(1)
  }

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

      {/* Blog Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                  <div className="h-56 bg-gray-200" />
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
                    <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={retry}
                className="text-red-700 hover:text-red-800 font-semibold"
              >
                Try Again
              </button>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-600">No blog posts found.</p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
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

              {/* Load More Button */}
              {hasMore && (
                <div className="text-center mt-12">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="inline-flex items-center justify-center px-8 py-4 border-2 border-black text-black font-semibold rounded hover:bg-black hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingMore ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Loading...
                      </>
                    ) : (
                      'Show More'
                    )}
                  </button>
                </div>
              )}
            </>
          )}
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
