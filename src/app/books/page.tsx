import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

const books = [
  {
    title: 'The Future Landlord Playbook',
    author: 'The Homeownership Community',
    description: 'Your comprehensive guide to becoming a successful landlord. From finding your first property to managing tenants and scaling your portfolio, this book covers everything you need to know.',
    topics: ['Landlord basics', 'Tenant management', 'Financial planning', 'Legal compliance', 'Scaling your portfolio'],
    price: 'Available on Amazon',
    amazonUrl: '#',
  },
  {
    title: 'Investing in High-End Real Estate',
    author: 'The Homeownership Community',
    description: 'Master the luxury real estate market with this in-depth guide. Learn how to identify premium properties, understand high-net-worth tenants, and maximize returns in the exclusive property segment.',
    topics: ['Market analysis', 'Luxury property evaluation', 'Premium tenant screening', 'High-end property management', 'Investment strategies'],
    price: 'Available on Amazon',
    amazonUrl: '#',
  },
]

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
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-[#F9F9F9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-block bg-red-700 text-white text-xs font-bold px-4 py-2 mb-6">
            I Create Owners
          </div>
          <h1 className="text-4xl font-bold text-black mb-4">Master Real Estate Investing & Wealth Building</h1>
          <p className="text-gray-600 max-w-2xl">
            Take your knowledge to the next level with our comprehensive guides on property ownership, real estate investing strategies, and building generational wealth. Learn from expert insights designed to help you achieve financial freedom through ownership.
          </p>
        </div>
      </section>

      {/* Our Books */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="space-y-8">
            {books.map((book, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
              >
                <div className="p-8">
                  <div className="flex flex-col md:flex-row gap-8">
                    {/* Book Cover Placeholder */}
                    <div className="flex-shrink-0">
                      <div className="bg-gradient-to-br from-gray-800 to-black w-48 h-72 rounded-lg shadow-lg flex items-center justify-center">
                        <div className="text-center p-4">
                          <p className="text-white font-bold text-sm">{book.title}</p>
                        </div>
                      </div>
                    </div>
                    {/* Book Details */}
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-black mb-2">{book.title}</h2>
                      <p className="text-gray-500 mb-4">by {book.author}</p>
                      <p className="text-gray-600 mb-6 leading-relaxed">{book.description}</p>
                      <div className="mb-6">
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">What You&apos;ll Learn</p>
                        <div className="flex flex-wrap gap-2">
                          {book.topics.map((topic, tIndex) => (
                            <span
                              key={tIndex}
                              className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <a
                          href={book.amazonUrl}
                          className="bg-red-700 hover:bg-red-800 text-white font-semibold px-6 py-3 rounded transition-colors inline-flex items-center gap-2"
                        >
                          Get on Amazon
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                        <span className="text-gray-500 font-medium">{book.price}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
