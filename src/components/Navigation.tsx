'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export default function Navigation() {
  const [showModal, setShowModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showPodcast, setShowPodcast] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  })
  const [theme, setTheme] = useState({
    primary_color: '#A61C30',
    header_bg: '#FFFFFF',
    header_text: '#000000',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setTheme({
            primary_color: data.theme_primary_color || '#A61C30',
            header_bg: data.theme_header_bg || '#FFFFFF',
            header_text: data.theme_header_text || '#000000',
          })
        }
      })
      .catch(() => {})

    // Check if there are visible podcasts
    fetch('/api/podcast')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setShowPodcast(true)
        }
      })
      .catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError('')
    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Something went wrong')
      }
      setShowModal(false)
      setFormData({ firstName: '', lastName: '', email: '', phone: '' })
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  const modal = showModal ? (
    <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-8 sm:pt-[10vh] overflow-y-auto">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
      <div className="relative bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl my-auto">
        <button
          onClick={() => setShowModal(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close join form"
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
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {submitError}
            </div>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full text-white font-semibold py-4 rounded-lg transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: theme.primary_color }}
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  ) : null

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-gray-200/50" style={{ backgroundColor: `${theme.header_bg}E6` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-1">
              <span className="text-xl font-bold tracking-tight" style={{ color: theme.header_text }}>THE HOME</span>
              <span className="text-xl font-bold tracking-tight" style={{ color: `${theme.header_text}99` }}>OWNERSHIP COMMUNITY</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/blog" className="hover:opacity-80 transition-colors text-sm font-medium" style={{ color: theme.header_text }}>Blog</Link>
              {showPodcast && <Link href="/podcast" className="hover:opacity-80 transition-colors text-sm font-medium" style={{ color: theme.header_text }}>Podcast</Link>}
              <Link href="/about" className="hover:opacity-80 transition-colors text-sm font-medium" style={{ color: theme.header_text }}>About</Link>
              <Link href="/resources" className="hover:opacity-80 transition-colors text-sm font-medium" style={{ color: theme.header_text }}>Resources</Link>
              <Link href="/books" className="hover:opacity-80 transition-colors text-sm font-medium" style={{ color: theme.header_text }}>Books</Link>
              <button
                onClick={() => setShowModal(true)}
                className="font-semibold px-6 py-3 rounded text-sm transition-colors"
                style={{ backgroundColor: theme.primary_color, color: '#FFFFFF' }}
              >
                Join the Community
              </button>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2"
              style={{ color: theme.header_text }}
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
                <Link href="/blog" className="hover:opacity-80 transition-colors text-sm font-medium" style={{ color: theme.header_text }} onClick={() => setMobileMenuOpen(false)}>Blog</Link>
                {showPodcast && <Link href="/podcast" className="hover:opacity-80 transition-colors text-sm font-medium" style={{ color: theme.header_text }} onClick={() => setMobileMenuOpen(false)}>Podcast</Link>}
                <Link href="/about" className="hover:opacity-80 transition-colors text-sm font-medium" style={{ color: theme.header_text }} onClick={() => setMobileMenuOpen(false)}>About</Link>
                <Link href="/resources" className="hover:opacity-80 transition-colors text-sm font-medium" style={{ color: theme.header_text }} onClick={() => setMobileMenuOpen(false)}>Resources</Link>
                <Link href="/books" className="hover:opacity-80 transition-colors text-sm font-medium" style={{ color: theme.header_text }} onClick={() => setMobileMenuOpen(false)}>Books</Link>
                <button
                  onClick={() => { setShowModal(true); setMobileMenuOpen(false); }}
                  className="font-semibold px-6 py-3 rounded text-sm transition-colors w-fit"
                  style={{ backgroundColor: theme.primary_color, color: '#FFFFFF' }}
                >
                  Join the Community
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Join Modal */}
      {mounted && createPortal(modal, document.body)}
    </>
  )
}
