import Link from 'next/link'

const socialLinks = {
  facebook: 'https://www.facebook.com/share/1DySwCFJKY/?mibextid=wwXIfr',
  instagram: 'https://www.instagram.com/billionaireloanofficer?utm_source=qr',
  linkedin: 'https://www.linkedin.com/in/brandonbeedixon?utm_source=share_via&utm_content=profile&utm_medium=member_ios',
  twitter: 'https://x.com/billionaire_lo?s=11&t=b8_2VZHBBDvMHx_DZ4ZwPA',
}

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
          Empowering future homeowners, real estate investors, and aspiring landlords to build generational wealth through ownership.
        </p>

        {/* Tagline */}
        <p className="text-center text-red-700 font-semibold mb-8">
          We Create Owners.
        </p>

        {/* Social Links */}
        <div className="flex items-center justify-center gap-8 mb-8">
          <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-black transition-colors text-sm font-medium">Facebook</a>
          <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-black transition-colors text-sm font-medium">Instagram</a>
          <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-black transition-colors text-sm font-medium">LinkedIn</a>
          <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-black transition-colors text-sm font-medium">X (Twitter)</a>
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
  )
}
