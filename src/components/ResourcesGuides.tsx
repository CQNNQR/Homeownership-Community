'use client'

import { useEffect, useState } from 'react'
import SubscribeModal from './SubscribeModal'

const freeGuides = [
  {
    title: 'HOC Real Estate Investment FAQ',
    description:
      'The Homeownership Community guide to real estate investment frequently asked questions.',
    category: 'Free with Subscription',
    file: '/guides/hoc-rei-faq.pdf',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    title: 'Real Estate Investment FAQ',
    description:
      'Frequently asked questions about real estate investing, property ownership, and building wealth through real estate.',
    category: 'Free with Subscription',
    file: '/guides/REI FAQ BrandonBeeDixon.pdf',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Reverse Mortgage Guide',
    description:
      'Comprehensive guide to reverse mortgages — how they work, the pros and cons, and whether they might be right for you. Get the complete breakdown from a mortgage expert.',
    category: 'Free with Subscription',
    file: '/guides/Reverse Mortgage Guide BrandonBeeDixon.pdf',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
]

/**
 * Client-only guides grid + subscribe modal gate.
 *
 * Extracted from src/app/resources/page.tsx so the page can be a Server
 * Component (with generateMetadata export).
 */
export default function ResourcesGuides() {
  const [showSubscribeModal, setShowSubscribeModal] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  useEffect(() => {
    const subscribed = localStorage.getItem('hoc_subscribed')
    if (subscribed) setIsSubscribed(true)
  }, [])

  return (
    <>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {freeGuides.map((guide, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow"
          >
            <div className="p-6">
              <div className="bg-red-700/10 w-16 h-16 rounded-xl flex items-center justify-center mb-4">
                <div className="text-red-700">{guide.icon}</div>
              </div>
              <span className="bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full">
                {guide.category}
              </span>
              <h3 className="text-xl font-bold text-black mt-4 mb-2">{guide.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{guide.description}</p>
            </div>
            <div className="px-6 pb-6">
              {isSubscribed ? (
                <a
                  href={guide.file}
                  download
                  className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 rounded transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Free Guide
                </a>
              ) : (
                <button
                  onClick={() => setShowSubscribeModal(true)}
                  className="w-full bg-red-700 hover:bg-red-800 text-white font-semibold py-3 rounded transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Subscribe for Free Access
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <SubscribeModal
        open={showSubscribeModal}
        onClose={() => setShowSubscribeModal(false)}
      />
    </>
  )
}