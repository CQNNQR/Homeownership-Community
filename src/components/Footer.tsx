import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="py-16 bg-[#F9F9F9] border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-1 mb-8">
          <span className="text-xl font-bold text-black tracking-tight">THE HOME</span>
          <span className="text-xl font-bold text-gray-400 tracking-tight">OWNERSHIP COMMUNITY</span>
        </Link>

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
  )
}
