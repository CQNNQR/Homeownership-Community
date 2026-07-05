'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'

const POSTS_PER_PAGE = 6

/**
 * Client-only blog index list with "Show More" pagination.
 *
 * Extracted from src/app/blog/page.tsx so the page itself can be a Server
 * Component (with generateMetadata export).
 *
 * Tier 2 #14 will move the initial-page fetch into SSR via getPosts() and
 * keep only the "Show More" button as a client island — that's the bigger
 * SEO win. For Tier 1 we just need metadata to be reachable.
 */
export default function BlogList() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  const fetchPosts = useCallback(async (page: number) => {
    try {
      const response = await fetch(`/api/posts?page=${page}&perPage=${POSTS_PER_PAGE}`)

      if (!response.ok) {
        throw new Error('Failed to fetch')
      }

      const data = await response.json()

      if (page > 1) {
        setPosts((prev) => [...prev, ...data.posts])
      } else {
        setPosts(data.posts)
      }
      setHasMore(data.pageInfo.totalPages > page)
      setCurrentPage(page)
      setError(null)
    } catch {
      setError('Unable to load blog posts. Please try again later.')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts(1)
  }, [fetchPosts])

  function loadMore() {
    if (hasMore && !loadingMore && !error) {
      setLoadingMore(true)
      fetchPosts(currentPage + 1)
    }
  }

  function retry() {
    setLoading(true)
    setError(null)
    fetchPosts(1)
  }

  if (loading) {
    return (
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
    )
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600 mb-4">{error}</p>
        <button onClick={retry} className="text-red-700 hover:text-red-800 font-semibold">
          Try Again
        </button>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600">No blog posts found.</p>
      </div>
    )
  }

  return (
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
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.image}
                  alt={post.imageAlt || post.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src="/LOGO/15002.png"
                  alt="Home Ownership Community"
                  className="w-full h-full object-contain bg-gray-50"
                />
              )}
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
                  {post.category}
                </span>
                <span className="text-gray-400 text-sm">{post.date}</span>
              </div>
              <h3 className="text-xl font-bold text-black mb-3">{post.title}</h3>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">{post.excerpt}</p>
              <span className="text-red-700 font-semibold text-sm inline-flex items-center gap-1">
                Read Article
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </span>
            </div>
          </Link>
        ))}
      </div>

      {hasMore && (
        <div className="text-center mt-12">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="inline-flex items-center justify-center px-8 py-4 border-2 border-black text-black font-semibold rounded hover:bg-black hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingMore ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
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
  )
}