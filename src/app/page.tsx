'use client'

import { useState } from 'react'

export default function Home() {
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'contact' | 'resources'>('contact')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  })

  const openContactModal = () => {
    setModalType('contact')
    setShowModal(true)
  }

  const openResourcesModal = () => {
    setModalType('resources')
    setShowModal(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Thank you for your submission! We will be in touch soon.')
    setShowModal(false)
    setFormData({ firstName: '', lastName: '', email: '', phone: '' })
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="text-white font-serif text-xl tracking-wide">THE HOME</span>
              <span className="text-yellow-600 text-lg">OWNERSHIP COMMUNITY</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#about" className="text-white/80 hover:text-white transition-colors text-sm">About</a>
              <a href="#resources" className="text-white/80 hover:text-white transition-colors text-sm">Resources</a>
              <a href="#books" className="text-white/80 hover:text-white transition-colors text-sm">Books</a>
              <a href="#blog" className="text-white/80 hover:text-white transition-colors text-sm">Blog</a>
              <button
                onClick={openContactModal}
                className="bg-yellow-600 hover:bg-yellow-700 text-black font-semibold px-4 py-2 rounded transition-colors text-sm"
              >
                Contact
              </button>
            </div>
            <button
              onClick={openContactModal}
              className="md:hidden bg-yellow-600 hover:bg-yellow-700 text-black font-semibold px-4 py-2 rounded transition-colors text-sm"
            >
              Contact
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-serif font-bold text-white tracking-tight mb-2">
            THE HOME
          </h1>
          <p className="text-xl md:text-2xl text-yellow-500 tracking-widest mb-8">
            OWNERSHIP COMMUNITY
          </p>
          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
            Join The Homeownership Community. Become a real estate investor and future landlord.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={openContactModal}
              className="bg-yellow-600 hover:bg-yellow-700 text-black font-semibold px-8 py-4 rounded-lg transition-all hover:scale-105 text-lg"
            >
              Get Started
            </button>
            <button
              onClick={openResourcesModal}
              className="border-2 border-white/30 hover:border-white/60 text-white font-semibold px-8 py-4 rounded-lg transition-all hover:bg-white/10 text-lg"
            >
              Browse Resources
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-serif font-bold text-white mb-6">About Our Community</h2>
              <p className="text-white/70 text-lg leading-relaxed mb-6">
                The Homeownership Community is a collective of aspiring and experienced real estate investors dedicated to helping each other succeed in building wealth through property ownership.
              </p>
              <p className="text-white/70 text-lg leading-relaxed">
                Whether you&apos;re just starting your journey as a future landlord or looking to expand your portfolio, our community provides the resources, education, and support you need.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/50 p-6 rounded-xl border border-white/10">
                <p className="text-4xl font-bold text-yellow-500 mb-2">500+</p>
                <p className="text-white/70">Active Members</p>
              </div>
              <div className="bg-black/50 p-6 rounded-xl border border-white/10">
                <p className="text-4xl font-bold text-yellow-500 mb-2">$50M+</p>
                <p className="text-white/70">Properties Managed</p>
              </div>
              <div className="bg-black/50 p-6 rounded-xl border border-white/10">
                <p className="text-4xl font-bold text-yellow-500 mb-2">100+</p>
                <p className="text-white/70">Properties Sold</p>
              </div>
              <div className="bg-black/50 p-6 rounded-xl border border-white/10">
                <p className="text-4xl font-bold text-yellow-500 mb-2">24/7</p>
                <p className="text-white/70">Community Support</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section id="resources" className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-serif font-bold text-white mb-4 text-center">Resources</h2>
          <p className="text-white/60 text-center mb-12 max-w-2xl mx-auto">
            Explore our curated collection of guides, templates, and tools to help you on your real estate journey.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Investment Calculator', desc: 'Calculate potential returns on your investment properties' },
              { title: 'Property Analysis Template', desc: 'Excel spreadsheet for analyzing potential deals' },
              { title: 'Landlord Checklist', desc: 'Essential steps for first-time landlords' },
              { title: 'Market Research Guide', desc: 'How to analyze local real estate markets' },
              { title: 'Financing Options', desc: 'Overview of loan types and financing strategies' },
              { title: 'Property Management', desc: 'Best practices for managing rental properties' },
            ].map((resource, i) => (
              <div
                key={i}
                className="bg-zinc-900 p-6 rounded-xl border border-white/10 hover:border-yellow-600/50 transition-all hover:-translate-y-1 cursor-pointer group"
              >
                <div className="bg-yellow-600/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-yellow-500 transition-colors">{resource.title}</h3>
                <p className="text-white/60">{resource.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Books Section */}
      <section id="books" className="py-24 bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-serif font-bold text-white mb-4 text-center">Recommended Reading</h2>
          <p className="text-white/60 text-center mb-12 max-w-2xl mx-auto">
            Essential books for every aspiring real estate investor.
          </p>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              'The Book on Rental Property Investing',
              'Rich Dad Poor Dad',
              'The Millionaire Real Estate Investor',
              'Think and Grow Rich',
            ].map((book, i) => (
              <div key={i} className="bg-black p-4 rounded-xl border border-white/10 hover:border-yellow-600/50 transition-all">
                <div className="bg-zinc-800 h-48 rounded-lg mb-4 flex items-center justify-center">
                  <svg className="w-16 h-16 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <p className="text-white font-medium text-center">{book}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section id="blog" className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-serif font-bold text-white mb-4 text-center">Latest Updates</h2>
          <p className="text-white/60 text-center mb-12 max-w-2xl mx-auto">
            Stay informed with insights and tips from our community.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: '5 Things to Know Before Buying Your First Investment Property', date: 'May 15, 2026' },
              { title: 'How to Analyze a Deal: A Step-by-Step Guide', date: 'May 10, 2026' },
              { title: 'Building Your Real Estate Network: Tips for Beginners', date: 'May 5, 2026' },
            ].map((post, i) => (
              <div key={i} className="bg-zinc-900 rounded-xl border border-white/10 overflow-hidden hover:border-yellow-600/50 transition-all cursor-pointer group">
                <div className="bg-zinc-800 h-40 flex items-center justify-center">
                  <svg className="w-12 h-12 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <div className="p-6">
                  <p className="text-yellow-600 text-sm mb-2">{post.date}</p>
                  <h3 className="text-lg font-semibold text-white group-hover:text-yellow-500 transition-colors">{post.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-950 py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="text-white font-serif text-xl tracking-wide">THE HOME</span>
              <span className="text-yellow-600 text-lg">OWNERSHIP COMMUNITY</span>
            </div>
            <p className="text-white/40 text-sm">
              &copy; 2026 The Homeownership Community. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-zinc-900 rounded-2xl p-8 max-w-md w-full border border-white/10 shadow-2xl">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-2xl font-serif font-bold text-white mb-2">
              {modalType === 'contact' ? 'Get In Touch' : 'Browse Resources'}
            </h3>
            <p className="text-white/60 mb-6">
              {modalType === 'contact'
                ? 'Fill out the form below and we\'ll be in touch soon.'
                : 'Enter your details to access our free resources.'}
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 text-sm mb-2">First Name</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-yellow-600 transition-colors"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm mb-2">Last Name</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-yellow-600 transition-colors"
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div>
                <label className="block text-white/80 text-sm mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-yellow-600 transition-colors"
                  placeholder="john@example.com"
                />
              </div>
              {modalType === 'contact' && (
                <div>
                  <label className="block text-white/80 text-sm mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-yellow-600 transition-colors"
                    placeholder="(555) 123-4567"
                  />
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-semibold py-4 rounded-lg transition-all hover:scale-105"
              >
                {modalType === 'contact' ? 'Submit' : 'Get Resources'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
