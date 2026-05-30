'use client'

import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { useState } from 'react'

const freeGuides = [
  {
    title: 'HOC Real Estate Investment FAQ',
    description: 'The Homeownership Community guide to real estate investment frequently asked questions.',
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
    description: 'Frequently asked questions about real estate investing, property ownership, and building wealth through real estate.',
    category: 'Free with Subscription',
    file: '/guides/REI FAQ BrandonBeeDixon.pdf',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
]

const premiumGuide = {
  title: 'Reverse Mortgage Guide',
  description: 'Comprehensive guide to reverse mortgages, how they work, pros and cons, and whether they might be right for you. Get the complete breakdown from a mortgage expert.',
  category: 'Premium Guide',
  price: '$99',
  icon: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}

export default function ResourcesPage() {
  const [showSubscribeModal, setShowSubscribeModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [subscribeEmail, setSubscribeEmail] = useState('')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  })

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Thank you for subscribing! Check your email for the free guides.')
    setShowSubscribeModal(false)
    setSubscribeEmail('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Thank you for your purchase! The Reverse Mortgage Guide will be sent to your email.')
    setShowJoinModal(false)
    setFormData({ firstName: '', lastName: '', email: '', phone: '' })
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* hero */}
      <section className="pt-32 pb-16 bg-[#F9F9F9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-black mb-4">Homeownership Resources & Financial Literacy</h1>
          <p className="text-gray-600 max-w-2xl">
            Explore our collection of guides and resources to help you succeed in real estate investing, property ownership, and building generational wealth through ownership.
          </p>
        </div>
      </section>

      {/* Free Guides Section - Requires Subscription */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-black mb-2">Free Guides</h2>
          <p className="text-gray-600 mb-8">Subscribe to get instant access to these free guides.</p>

          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {freeGuides.map((guide, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="p-6">
                  <div className="bg-red-700/10 w-16 h-16 rounded-xl flex items-center justify-center mb-4">
                    <div className="text-red-700">
                      {guide.icon}
                    </div>
                  </div>
                  <span className="bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full">
                    {guide.category}
                  </span>
                  <h3 className="text-xl font-bold text-black mt-4 mb-2">{guide.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{guide.description}</p>
                </div>
                <div className="px-6 pb-6">
                  <button
                    onClick={() => setShowSubscribeModal(true)}
                    className="w-full bg-red-700 hover:bg-red-800 text-white font-semibold py-3 rounded transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Subscribe for Free Access
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Guide Section - $99 */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-black mb-2">Premium Guide</h2>
          <p className="text-gray-600 mb-8">Get exclusive access to in-depth analysis and expert insights.</p>

          <div className="max-w-md">
            <div className="bg-white rounded-xl shadow-lg border-2 border-red-700 overflow-hidden">
              <div className="bg-red-700 text-white text-center py-2">
                <span className="font-bold">Premium Content</span>
              </div>
              <div className="p-6">
                <div className="bg-gray-100 w-16 h-16 rounded-xl flex items-center justify-center mb-4">
                  <div className="text-gray-600">
                    {premiumGuide.icon}
                  </div>
                </div>
                <span className="bg-red-100 text-red-700 text-xs font-medium px-3 py-1 rounded-full">
                  {premiumGuide.category}
                </span>
                <h3 className="text-xl font-bold text-black mt-4 mb-2">{premiumGuide.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{premiumGuide.description}</p>
                <div className="text-center mb-6">
                  <span className="text-4xl font-bold text-black">{premiumGuide.price}</span>
                </div>
              </div>
              <div className="px-6 pb-6">
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-3 rounded transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Purchase Now - $99
                </button>
                <p className="text-gray-400 text-xs text-center mt-3">
                  Instant digital delivery
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subscribe Modal */}
      {showSubscribeModal && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-8 sm:pt-[10vh] overflow-y-auto">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowSubscribeModal(false)}
          />
          <div className="relative bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl my-auto">
            <button
              onClick={() => setShowSubscribeModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-2xl font-bold text-black mb-2">Get Free Guides</h3>
            <p className="text-gray-600 mb-4">Subscribe to get instant access to our free investment guides.</p>
            <form onSubmit={handleSubscribe} className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={subscribeEmail}
                  onChange={(e) => setSubscribeEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-black placeholder-gray-400 focus:outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700 transition-colors"
                  placeholder="john@example.com"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-red-700 hover:bg-red-800 text-white font-semibold py-4 rounded-lg transition-colors mt-2"
              >
                Get Free Access
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Purchase Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-8 sm:pt-[10vh] overflow-y-auto">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowJoinModal(false)}
          />
          <div className="relative bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl my-auto">
            <button
              onClick={() => setShowJoinModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-2xl font-bold text-black mb-2">Purchase Reverse Mortgage Guide</h3>
            <p className="text-gray-600 mb-2">Get instant access to the complete guide for $99.</p>
            <p className="text-red-700 font-bold text-lg mb-6">Total: $99</p>
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
                className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-4 rounded-lg transition-colors mt-2"
              >
                Complete Purchase - $99
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Contact Section */}
      <section className="py-16 bg-[#F9F9F9]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-black mb-4">Looking for Something Specific?</h2>
          <p className="text-gray-600 mb-6">
            Contact Brandon directly for personalized guidance on real estate investing, mortgage options, or property management questions.
          </p>
          <a
            href="mailto:brandon@hocmortgage.com"
            className="inline-flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white font-semibold px-6 py-3 rounded transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Contact Brandon
          </a>
        </div>
      </section>

      <Footer />
    </div>
  )
}
