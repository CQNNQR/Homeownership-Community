'use client'

import { useState } from 'react'

export default function Home() {
  const [showModal, setShowModal] = useState(false)
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
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-1">
              <span className="text-xl font-bold text-black tracking-tight">THE HOME</span>
              <span className="text-xl font-bold text-gray-500 tracking-tight">OWNERSHIP COMMUNITY</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#blog" className="text-gray-600 hover:text-black transition-colors text-sm font-medium">Blog</a>
              <a href="#resources" className="text-gray-600 hover:text-black transition-colors text-sm font-medium">Resources</a>
              <a href="#books" className="text-gray-600 hover:text-black transition-colors text-sm font-medium">Books</a>
              <button
                onClick={() => setShowModal(true)}
                className="bg-red-700 hover:bg-red-800 text-white font-semibold px-6 py-3 rounded text-sm transition-colors"
              >
                Join the Community
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#1E2A1E]/90 via-[#121A12]/85 to-[#121A12]/95" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto py-24">
          {/* Welcome Pill */}
          <div className="inline-block bg-white/10 backdrop-blur-sm rounded-full px-5 py-2 mb-8">
            <p className="text-white/90 text-sm font-medium tracking-wide">Welcome to Your Future</p>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
            Become a <span className="text-red-500">Real Estate Investor</span> & Future Landlord
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join The Homeownership Community. Stay informed with our latest insights, resources, and guides to build your real estate portfolio.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#blog"
              className="bg-red-700 hover:bg-red-800 text-white font-semibold px-8 py-4 rounded text-base transition-colors inline-flex items-center justify-center gap-2"
            >
              Read Our Blog
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <a
              href="#books"
              className="bg-[#1E2A1E]/80 hover:bg-[#1E2A1E] text-white font-semibold px-8 py-4 rounded text-base transition-colors border border-white/30 inline-flex items-center justify-center gap-2"
            >
              Get My Book
            </a>
          </div>
        </div>
      </section>

      {/* Latest from the Blog Section */}
      <section id="blog" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-black mb-4">Latest from the Blog</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Insights, tips, and strategies for navigating the high-end real estate market and building generational wealth.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-56 bg-gray-200 relative">
                <img
                  src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&auto=format&fit=crop"
                  alt="Luxury living room"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">Investing</span>
                  <span className="text-gray-400 text-sm">October 12, 2024</span>
                </div>
                <h3 className="text-xl font-bold text-black mb-3">How to Spot Value in High-End Real Estate</h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  Learn the key indicators that separate great investments from overpriced properties in luxury markets.
                </p>
                <a href="#" className="text-red-700 font-semibold text-sm inline-flex items-center gap-1 hover:gap-2 transition-all">
                  Read Article
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-56 bg-gray-100 flex items-center justify-center">
                <div className="bg-gray-200 border-2 border-dashed border-gray-300 w-full h-full flex items-center justify-center">
                  <span className="text-gray-400 text-sm font-medium">Community Logo</span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">Community</span>
                  <span className="text-gray-400 text-sm">Company News</span>
                </div>
                <h3 className="text-xl font-bold text-black mb-3">Why Joining a Real Estate Community Accelerates Your Success</h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  Discover how networking with fellow investors can unlock opportunities you won&apos;t find alone.
                </p>
                <a href="#" className="text-red-700 font-semibold text-sm inline-flex items-center gap-1 hover:gap-2 transition-all">
                  Read Article
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-56 bg-gray-200 relative">
                <img
                  src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop"
                  alt="Luxury house at sunset"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">Landlord Tips</span>
                  <span className="text-gray-400 text-sm">October 14, 2024</span>
                </div>
                <h3 className="text-xl font-bold text-black mb-3">Managing High-End Properties: A Landlord&apos;s Guide</h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  Essential strategies for maintaining luxury rentals and keeping tenants satisfied long-term.
                </p>
                <a href="#" className="text-red-700 font-semibold text-sm inline-flex items-center gap-1 hover:gap-2 transition-all">
                  Read Article
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* View All Posts Button */}
          <div className="text-center mt-12">
            <a
              href="#"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-black text-black font-semibold rounded hover:bg-black hover:text-white transition-colors"
            >
              View All Posts
            </a>
          </div>
        </div>
      </section>

      {/* Books Section */}
      <section id="books" className="py-24 bg-[#F9F9F9]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Author Badge */}
          <div className="inline-block bg-red-700 text-white text-xs font-bold px-4 py-2 mb-6">
            Author & Expert
          </div>

          <h2 className="text-4xl font-bold text-black mb-4">Master Real Estate with Our Exclusive Books</h2>
          <p className="text-gray-600 mb-12 max-w-2xl">
            Take your knowledge to the next level. Our comprehensive guides are available on Amazon and cover everything from your first purchase to managing a multi-million dollar portfolio.
          </p>

          {/* Book List */}
          <div className="space-y-6">
            {/* Book 1 */}
            <a href="#" className="flex items-center gap-6 p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow group">
              <div className="bg-pink-200 w-16 h-16 rounded flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-bold text-black text-lg">The Future Landlord Playbook</p>
                <p className="text-gray-500 text-sm">Available on Amazon</p>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-red-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>

            {/* Book 2 */}
            <a href="#" className="flex items-center gap-6 p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow group">
              <div className="bg-pink-200 w-16 h-16 rounded flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-bold text-black text-lg">Investing in High-End Real Estate</p>
                <p className="text-gray-500 text-sm">Available on Amazon</p>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-red-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>

          {/* Other Resources */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Other Resources & Sites</p>
            <div className="space-y-3">
              <a href="#" className="flex items-center gap-2 text-black font-medium hover:text-red-700 transition-colors">
                Real Estate Investor Portal
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              <a href="#" className="flex items-center gap-2 text-black font-medium hover:text-red-700 transition-colors">
                Property Management Tools
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Community Ad Banner */}
      <section className="py-16 bg-gradient-to-b from-pink-50 to-gray-100">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-black rounded-xl overflow-hidden shadow-2xl">
            <div className="p-12 md:p-16 text-center">
              {/* House Illustration */}
              <div className="mb-8">
                <svg className="w-24 h-24 mx-auto" viewBox="0 0 100 100" fill="none">
                  <path d="M50 10L10 40V90H40V60H60V90H90V40L50 10Z" fill="#D4AF37" />
                  <rect x="45" y="65" width="10" height="25" fill="#1E2A1E" />
                  <rect x="25" y="50" width="15" height="15" fill="#87CEEB" opacity="0.5" />
                  <rect x="60" y="50" width="15" height="15" fill="#87CEEB" opacity="0.5" />
                </svg>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                JOIN THE COMMUNITY!
              </h3>
              <p className="text-xl md:text-2xl text-yellow-400 font-semibold mb-6">
                DO YOU WANT TO BECOME A REAL ESTATE INVESTOR / FUTURE LANDLORD?
              </p>
              <p className="text-white/80 text-lg mb-6">STAY INFORMED.</p>
              <p className="text-white font-medium">WWW.THEHOMEOWNERSHIPCOMMUNITY.COM</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-[#F9F9F9] border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-1 mb-8">
            <span className="text-xl font-bold text-black tracking-tight">THE HOME</span>
            <span className="text-xl font-bold text-gray-400 tracking-tight">OWNERSHIP COMMUNITY</span>
          </div>

          {/* Mission Statement */}
          <p className="text-center text-gray-500 mb-8 max-w-md mx-auto">
            Empowering the next generation of real estate investors and landlords.
          </p>

          {/* Social Links */}
          <div className="flex items-center justify-center gap-8 mb-8">
            <a href="#" className="text-gray-500 hover:text-black transition-colors text-sm font-medium">Twitter</a>
            <a href="#" className="text-gray-500 hover:text-black transition-colors text-sm font-medium">LinkedIn</a>
            <a href="#" className="text-gray-500 hover:text-black transition-colors text-sm font-medium">Instagram</a>
          </div>

          {/* Copyright */}
          <p className="text-center text-gray-400 text-sm">
            &copy; 2026 The Homeownership Community. All rights reserved.
          </p>
        </div>
      </footer>

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
    </div>
  )
}
