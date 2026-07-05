'use client'

import { useEffect, useState } from 'react'

interface Book {
  id: string
  title: string
  author: string | null
  amazon_url: string
  description: string | null
  sort_order: number | null
  is_active: boolean
  created_at: string
  cover_image_url: string | null
}

/**
 * Client-only books list. Fetches from /api/books and renders the cards.
 *
 * Extracted from src/app/books/page.tsx so the page can be a Server
 * Component (with generateMetadata export). Tier 2 #14 will move this to
 * SSR — for Tier 1 we just need the metadata to be reachable.
 */
export default function BooksList() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch('/api/books')
        if (!response.ok) throw new Error('Failed to fetch books')
        const payload = await response.json()
        // Unwrap the { data } envelope; fall back to the raw array in
        // case the deployment is still serving the pre-envelope shape.
        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : []
        setBooks(list)
      } catch {
        setBooks([])
      } finally {
        setLoading(false)
      }
    }
    fetchBooks()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-pulse">
        <div className="p-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-shrink-0">
              <div className="w-48 h-72 bg-gray-200 rounded-lg" />
            </div>
            <div className="flex-1">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-6" />
              <div className="h-4 bg-gray-200 rounded w-full mb-2" />
              <div className="h-4 bg-gray-200 rounded w-full mb-2" />
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-6" />
              <div className="h-12 bg-gray-200 rounded w-40" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (books.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600 text-lg">No books yet — add some in the admin!</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {books.map((book) => (
        <div
          key={book.id}
          className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
        >
          <div className="p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Book Cover */}
              <div className="flex-shrink-0">
                {book.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={book.cover_image_url}
                    alt={`${book.title} cover`}
                    data-testid="book-cover"
                    className="w-48 h-72 rounded-lg shadow-lg object-cover"
                  />
                ) : (
                  <div className="w-48 h-72 rounded-lg shadow-lg bg-gradient-to-br from-red-700 to-red-900 flex items-center justify-center">
                    <svg
                      className="w-20 h-20 text-white/70"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                )}
              </div>
              {/* Book Details */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-black mb-2">{book.title}</h2>
                {book.author && <p className="text-gray-500 mb-4">by {book.author}</p>}
                {book.description && (
                  <p className="text-gray-600 mb-6 leading-relaxed">{book.description}</p>
                )}
                <div className="flex items-center gap-4">
                  <a
                    href={book.amazon_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-red-700 hover:bg-red-800 text-white font-semibold px-6 py-3 rounded transition-colors inline-flex items-center gap-2"
                  >
                    Get on Amazon
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                  <span className="text-gray-500 font-medium">Available on Amazon</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}