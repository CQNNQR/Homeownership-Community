'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

interface Book {
  id: string
  title: string
  author: string | null
  amazon_url: string
  description: string | null
  sort_order: number | null
  is_active: boolean
  created_at: string
}

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
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch('/api/books')
        if (!response.ok) throw new Error('Failed to fetch books')
        const data = await response.json()
        setBooks(data || [])
      } catch (err) {
        setBooks([])
      } finally {
        setLoading(false)
      }
    }
    fetchBooks()
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-[#F9F9F9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-block bg-red-700 text-white text-xs font-bold px-4 py-2 mb-6">
            I Create Owners
          </div>
          <h1 className="text-4xl font-bold text-black mb-4">Books by Brandon Bee Dixon</h1>
          <p className="text-gray-600 max-w-2xl">
            Learn from Brandon's expertise through his published works. These books cover essential topics in sales, business leadership, and personal development to help you achieve success.
          </p>
        </div>
      </section>

      {/* Our Books */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="space-y-8">
            {loading ? (
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
            ) : books.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-600 text-lg">No books yet — add some in the admin!</p>
              </div>
            ) : (
              books.map((book) => (
                <div
                  key={book.id}
                  className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
                >
                  <div className="p-8">
                    <div className="flex flex-col md:flex-row gap-8">
                      {/* Book Cover */}
                      <div className="flex-shrink-0">
                        <div className="w-48 h-72 rounded-lg shadow-lg bg-gradient-to-br from-red-700 to-red-900 flex items-center justify-center">
                          <svg className="w-20 h-20 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                      </div>
                      {/* Book Details */}
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-black mb-2">{book.title}</h2>
                        {book.author && (
                          <p className="text-gray-500 mb-4">by {book.author}</p>
                        )}
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
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                          <span className="text-gray-500 font-medium">Available on Amazon</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
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
