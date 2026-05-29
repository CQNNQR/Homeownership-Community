'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Navigation() {
  const [showModal, setShowModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Thank you for joining! We will be in touch soon.')
    setShowModal(false)
    setFormData({ firstName: '', lastName: '', email: '', phone: '' })
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-1">
              <span className="text-xl font-bold text-black tracking-tight">THE HOME</span>
              <span className="text-xl font-bold text-gray-500 tracking-tight">OWNERSHIP COMMUNITY</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/blog" className="text-gray-600 hover:text-black transition-colors text-sm font-medium">Blog</Link>
              <Link href="/resources" className="text-gray-600 hover:text-black transition-colors text-sm font-medium">Resources</Link>
              <Link href="/books" className="text-gray-600 hover:text-black transition-colors text-sm font-medium">Books</Link>
              <button
                onClick={() => setShowModal(true)}
                className="bg-red-700 hover:bg-red-800 text-white font-semibold px-6 py-3 rounded text-sm transition-colors"
              >
                Join the Community
              </button>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col gap-4">
                <Link href="/blog" className="text-gray-600 hover:text-black transition-colors text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>Blog</Link>
                <Link href="/resources" className="text-gray-600 hover:text-black transition-colors text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>Resources</Link>
                <Link href="/books" className="text-gray-600 hover:text-black transition-colors text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>Books</Link>
                <button
                  onClick={() => { setShowModal(true); setMobileMenuOpen(false); }}
                  className="bg-red-700 hover:bg-red-800 text-white font-semibold px-6 py-3 rounded text-sm transition-colors w-fit"
                >
                  Join the Community
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Join Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-2xl font-bold text-black mb-2">Join the Community</h3>
            <p className="text-gray-600 mb-6">Fill out the form below and we&apos;ll be in touch soon.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">First Name</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-black placeholder-gray-400 focus:outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700 transition-colors"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Last Name</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-black placeholder-gray-400 focus:outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700 transition-colors"
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-black placeholder-gray-400 focus:outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700 transition-colors"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-black placeholder-gray-400 focus:outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700 transition-colors"
                  placeholder="(555) 123-4567"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-red-700 hover:bg-red-800 text-white font-semibold py-4 rounded-lg transition-colors mt-2"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
