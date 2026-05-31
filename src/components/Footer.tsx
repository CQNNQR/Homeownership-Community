'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Footer() {
  const [settings, setSettings] = useState({
    facebook_url: '',
    instagram_url: '',
    linkedin_url: '',
    twitter_url: '',
    contact_email: 'brandon@hocmortgage.com',
    site_tagline: 'We Create Owners.',
    theme_footer_bg: '#F9F9F9',
    theme_footer_text: '#333333',
    theme_primary_color: '#A61C30',
    footer_mission: '',
  })

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setSettings({
            facebook_url: data.facebook_url || '',
            instagram_url: data.instagram_url || '',
            linkedin_url: data.linkedin_url || '',
            twitter_url: data.twitter_url || '',
            contact_email: data.contact_email || 'brandon@hocmortgage.com',
            site_tagline: data.site_tagline || 'We Create Owners.',
            theme_footer_bg: data.theme_footer_bg || '#F9F9F9',
            theme_footer_text: data.theme_footer_text || '#333333',
            theme_primary_color: data.theme_primary_color || '#A61C30',
            footer_mission: data.footer_mission || '',
          })
        }
      })
      .catch(() => {})
  }, [])

  const socialLinks = {
    facebook: settings.facebook_url || 'https://www.facebook.com/share/1DySwCFJKY/?mibextid=wwXIfr',
    instagram: settings.instagram_url || 'https://www.instagram.com/billionaireloanofficer?utm_source=qr',
    linkedin: settings.linkedin_url || 'https://www.linkedin.com/in/brandonbeedixon?utm_source=share_via&utm_content=profile&utm_medium=member_ios',
    twitter: settings.twitter_url || 'https://x.com/billionaire_lo?s=11&t=b8_2VZHBBDvMHx_DZ4ZwPA',
  }

  const footerStyle = {
    backgroundColor: settings.theme_footer_bg,
    color: settings.theme_footer_text,
  }

  const primaryColor = settings.theme_primary_color

  return (
    <footer style={footerStyle} className="py-16 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-1 mb-8">
          <span className="text-xl font-bold tracking-tight" style={{ color: footerStyle.color }}>THE HOME</span>
          <span className="text-xl font-bold tracking-tight opacity-60">OWNERSHIP COMMUNITY</span>
        </Link>

        {/* Mission Statement */}
        <p className="text-center mb-8 max-w-md mx-auto opacity-70">
          {settings.footer_mission || 'Empowering future homeowners, real estate investors, and aspiring landlords to build generational wealth through ownership.'}
        </p>

        {/* Tagline */}
        <p className="text-center font-semibold mb-8" style={{ color: primaryColor }}>
          {settings.site_tagline}
        </p>

        {/* Social Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mb-8">
          <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="opacity-60 hover:opacity-100 transition-colors text-sm font-medium">Facebook</a>
          <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="opacity-60 hover:opacity-100 transition-colors text-sm font-medium">Instagram</a>
          <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="opacity-60 hover:opacity-100 transition-colors text-sm font-medium">LinkedIn</a>
          <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="opacity-60 hover:opacity-100 transition-colors text-sm font-medium">X (Twitter)</a>
          <Link href="/admin/login" style={{ color: primaryColor }} className="hover:opacity-80 transition-colors text-sm font-medium border px-3 py-1 rounded">Login</Link>
        </div>

        {/* Contact */}
        <div className="text-center mb-8">
          <a href={`mailto:${settings.contact_email}`} className="opacity-60 hover:opacity-100 transition-colors text-sm font-medium" style={{ color: footerStyle.color }}>
            {settings.contact_email}
          </a>
        </div>

        {/* Copyright */}
        <p className="text-center opacity-40 text-sm">
          &copy; {new Date().getFullYear()} The Homeownership Community. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
