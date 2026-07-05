'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export default function Navigation() {
  const [showModal, setShowModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showPodcast, setShowPodcast] = useState(false)
  const [theme, setTheme] = useState({
    primary_color: '#A61C30',
    header_bg: '#FFFFFF',
    header_text: '#000000',
  })
  const [embedLoaded, setEmbedLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/settings', { cache: 'no-store' })
      .then(res => res.json())
      .then(payload => {
        // Unwrap the { data } envelope; fall back to the raw object in
        // case the deployment is still serving the pre-envelope shape.
        const settings = payload?.data && typeof payload.data === 'object'
          ? payload.data
          : (payload && typeof payload === 'object' ? payload : null)
        if (settings) {
          setTheme({
            primary_color: settings.theme_primary_color || '#A61C30',
            header_bg: settings.theme_header_bg || '#FFFFFF',
            header_text: settings.theme_header_text || '#000000',
          })
        }
      })
      .catch(() => {})

    // Check if there are visible podcasts
    fetch('/api/podcast', { cache: 'no-store' })
      .then(res => res.json())
      .then(payload => {
        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data) ? payload.data : []
        if (list.length > 0) {
          setShowPodcast(true)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!showModal || embedLoaded) return

    if (document.getElementById('goatgenie-form-embed-script')) {
      setEmbedLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://links.goatgenie.com/js/form_embed.js'
    script.async = true
    script.defer = true
    script.id = 'goatgenie-form-embed-script'
    script.onload = () => setEmbedLoaded(true)
    document.body.appendChild(script)
  }, [showModal, embedLoaded])

  const modal = showModal ? (
    <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-8 sm:pt-[10vh] overflow-y-auto">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
      <div className="relative bg-white rounded-2xl p-4 sm:p-6 max-w-3xl w-full shadow-2xl my-auto">
        <button
          onClick={() => setShowModal(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close join form"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="pt-8">
          <div className="mb-5">
            <h3 className="text-2xl font-bold text-black mb-2">Join the Community</h3>
            <p className="text-gray-600">
              Fill out the GoatGenie form below and Brandon&apos;s team will receive your info directly.
            </p>
          </div>

          <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 min-h-[560px]">
            <iframe
              src="https://links.goatgenie.com/widget/form/sXfFG5m4S6zWGQAqLMrx"
              style={{ width: '100%', height: '100%', border: 'none', borderRadius: '8px', minHeight: '560px' }}
              id="inline-sXfFG5m4S6zWGQAqLMrx"
              data-layout="{'id':'INLINE'}"
              data-trigger-type="alwaysShow"
              data-trigger-value=""
              data-activation-type="alwaysActivated"
              data-activation-value=""
              data-deactivation-type="neverDeactivate"
              data-deactivation-value=""
              data-form-name="Join the Community"
              data-height="523"
              data-layout-iframe-id="inline-sXfFG5m4S6zWGQAqLMrx"
              data-form-id="sXfFG5m4S6zWGQAqLMrx"
              title="Join the Community"
              className="w-full"
            />
          </div>

          {!embedLoaded && (
            <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
              Loading the GoatGenie form...
            </div>
          )}
        </div>
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
