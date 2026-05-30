import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

const guides = [
  {
    title: 'Real Estate Investment FAQ',
    description: 'Frequently asked questions about real estate investing, property ownership, and building wealth through real estate.',
    category: 'Guides',
    file: '/guides/REI FAQ BrandonBeeDixon.pdf',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Reverse Mortgage Guide',
    description: 'Comprehensive guide to reverse mortgages, how they work, pros and cons, and whether they might be right for you.',
    category: 'Guides',
    file: '/guides/Reverse Mortgage Guide BrandonBeeDixon.pdf',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    title: 'HOC Real Estate Investment FAQ',
    description: 'The Homeownership Community guide to real estate investment frequently asked questions.',
    category: 'Guides',
    file: '/guides/hoc-rei-faq.pdf',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
]

export default function ResourcesPage() {
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

      {/* Guides Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {guides.map((guide, index) => (
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
                  <span className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
                    {guide.category}
                  </span>
                  <h3 className="text-xl font-bold text-black mt-4 mb-2">{guide.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{guide.description}</p>
                </div>
                <div className="px-6 pb-6">
                  <a
                    href={guide.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-red-700 hover:bg-red-800 text-white font-semibold py-3 rounded transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download PDF
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
