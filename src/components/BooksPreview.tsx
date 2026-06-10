'use client'

import { useEffect, useState } from 'react'

interface Book {
  id: string
  title: string
  author: string
  amazon_url: string
  description: string
  sort_order: number
  cover_image_url: string | null
}

export default function BooksPreview({ primaryColor }: { primaryColor?: string }) {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/books')
      .then(res => res.json())
      .then(payload => {
        // Unwrap the { data } envelope; fall back to the raw array in
        // case the deployment is still serving the pre-envelope shape.
        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data) ? payload.data : []
        setBooks(list)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return null
  if (books.length === 0) return null

  return (
    <section id="books" className="py-24 bg-[#F9F9F9]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Author Badge */}
        <div className="inline-block text-white text-xs font-bold px-4 py-2 mb-6" style={{ backgroundColor: primaryColor || '#A61C30' }}>
          I Create Owners
        </div>

        <h2 className="text-4xl font-bold text-black mb-4">Master Real Estate Investing & Wealth Building</h2>
        <p className="text-gray-600 mb-12 max-w-2xl">
          Take your knowledge to the next level with our comprehensive guides on property ownership, real estate investing, and building generational wealth — available on Amazon.
        </p>

        {/* Book List */}
        <div className="space-y-6">
          {books.map((book) => (
            <a
              key={book.id}
              href={book.amazon_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-6 p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="w-16 h-16 rounded flex items-center justify-center flex-shrink-0 overflow-hidden bg-pink-200">
                {book.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={book.cover_image_url}
                    alt={`${book.title} cover`}
                    data-testid="book-cover"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className="font-bold text-black text-lg">{book.title}</p>
                <p className="text-gray-500 text-sm">by {book.author}</p>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-red-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          ))}
        </div>

        {/* Other Resources */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Homeownership Resources</p>
          <div className="space-y-3">
            <a href="/resources" className="flex items-center gap-2 text-black font-medium hover:text-red-700 transition-colors">
              Financial Literacy Resources
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            <a href="/resources" className="flex items-center gap-2 text-black font-medium hover:text-red-700 transition-colors">
              Investment Property Guides
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
