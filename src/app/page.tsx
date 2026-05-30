import Link from 'next/link'
import BlogPreview from '@/components/BlogPreview'
import JoinCommunityButton from '@/components/JoinCommunityButton'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-1">
              <span className="text-xl font-bold text-black tracking-tight">THE HOME</span>
              <span className="text-xl font-bold text-gray-500 tracking-tight">OWNERSHIP COMMUNITY</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/blog" className="text-gray-600 hover:text-black transition-colors text-sm font-medium">Blog</Link>
              <Link href="/about" className="text-gray-600 hover:text-black transition-colors text-sm font-medium">About</Link>
              <Link href="/resources" className="text-gray-600 hover:text-black transition-colors text-sm font-medium">Resources</Link>
              <Link href="/books" className="text-gray-600 hover:text-black transition-colors text-sm font-medium">Books</Link>
              <JoinCommunityButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen pt-20">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/75 to-black/90" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto py-24">
          {/* Welcome Pill */}
          <div className="inline-block bg-white/10 backdrop-blur-sm rounded-full px-5 py-2 mb-8">
            <p className="text-white/90 text-sm font-medium tracking-wide">Welcome to the Ownership Movement</p>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
            Build <span className="text-red-500">Generational Wealth</span> Through <span className="text-red-500">Real Estate Ownership</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-white/80 mb-6 max-w-2xl mx-auto leading-relaxed">
            Join The Home Ownership Community — a growing network dedicated to helping future homeowners, real estate investors, and aspiring landlords achieve <strong className="text-white">financial freedom through ownership</strong>.
          </p>
          <p className="text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed">
            We Create Owners.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/blog"
              className="bg-red-700 hover:bg-red-800 text-white font-semibold px-8 py-4 rounded text-base transition-colors inline-flex items-center justify-center gap-2"
            >
              Start Your Journey
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <a
              href="/books"
              className="bg-black/80 hover:bg-black text-white font-semibold px-8 py-4 rounded text-base transition-colors border border-white/30 inline-flex items-center justify-center gap-2"
            >
              Get My Book
            </a>
          </div>
        </div>
      </section>

      {/* Latest from the Blog Section - WordPress Powered */}
      <BlogPreview />

      {/* Books Section */}
      <section id="books" className="py-24 bg-[#F9F9F9]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Author Badge */}
          <div className="inline-block bg-red-700 text-white text-xs font-bold px-4 py-2 mb-6">
            I Create Owners
          </div>

          <h2 className="text-4xl font-bold text-black mb-4">Master Real Estate Investing & Wealth Building</h2>
          <p className="text-gray-600 mb-12 max-w-2xl">
            Take your knowledge to the next level with our comprehensive guides on property ownership, real estate investing, and building generational wealth — available on Amazon.
          </p>

          {/* Book List */}
          <div className="space-y-6">
            {/* Book 1 */}
            <a href="https://a.co/d/09f8MkL3" target="_blank" rel="noopener noreferrer" className="flex items-center gap-6 p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow group">
              <div className="bg-pink-200 w-16 h-16 rounded flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-bold text-black text-lg">Message to the Businessman</p>
                <p className="text-gray-500 text-sm">by Brandon Bee Dixon</p>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-red-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>

            {/* Book 2 */}
            <a href="https://a.co/d/0bXRCoq6" target="_blank" rel="noopener noreferrer" className="flex items-center gap-6 p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow group">
              <div className="bg-pink-200 w-16 h-16 rounded flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-bold text-black text-lg">Sales: The Nucleus of Any Profession</p>
                <p className="text-gray-500 text-sm">by Brandon Bee Dixon</p>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-red-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>

          {/* Other Resources */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Homeownership Resources</p>
            <div className="space-y-3">
              <Link href="/resources" className="flex items-center gap-2 text-black font-medium hover:text-red-700 transition-colors">
                Financial Literacy Resources
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </Link>
              <Link href="/resources" className="flex items-center gap-2 text-black font-medium hover:text-red-700 transition-colors">
                Investment Property Guides
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Community Ad Banner */}
      <section className="py-16 bg-gradient-to-b from-pink-50 to-gray-100">
        <div className="max-w-4xl mx-auto px-4">
          <img
            src="/assets/join the community.png"
            alt="Join The Home Ownership Community - We Create Owners"
            className="w-full rounded-xl shadow-2xl"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-[#F9F9F9] border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center justify-center gap-1 mb-8">
            <span className="text-xl font-bold text-black tracking-tight">THE HOME</span>
            <span className="text-xl font-bold text-gray-400 tracking-tight">OWNERSHIP COMMUNITY</span>
          </Link>

          {/* Mission Statement */}
          <p className="text-center text-gray-500 mb-8 max-w-md mx-auto">
            Empowering future homeowners, real estate investors, and aspiring landlords to build generational wealth through ownership.
          </p>

          {/* Tagline */}
          <p className="text-center text-red-700 font-semibold mb-8">
            We Create Owners.
          </p>

          {/* Social Links */}
          <div className="flex items-center justify-center gap-8 mb-8">
            <a href="https://www.facebook.com/share/1DySwCFJKY/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-black transition-colors text-sm font-medium">Facebook</a>
            <a href="https://www.instagram.com/billionaireloanofficer?utm_source=qr" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-black transition-colors text-sm font-medium">Instagram</a>
            <a href="https://www.linkedin.com/in/brandonbeedixon?utm_source=share_via&utm_content=profile&utm_medium=member_ios" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-black transition-colors text-sm font-medium">LinkedIn</a>
            <a href="https://x.com/billionaire_lo?s=11&t=b8_2VZHBBDvMHx_DZ4ZwPA" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-black transition-colors text-sm font-medium">X (Twitter)</a>
          </div>

          {/* Contact */}
          <div className="text-center mb-8">
            <a href="mailto:brandon@hocmortgage.com" className="text-gray-500 hover:text-red-700 transition-colors text-sm font-medium">
              brandon@hocmortgage.com
            </a>
          </div>

          {/* Copyright */}
          <p className="text-center text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} The Homeownership Community. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
