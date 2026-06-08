import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'The Home Ownership Community | Real Estate Investing & Homeownership Education',
  description: 'The Home Ownership Community is a growing network dedicated to helping future homeowners, real estate investors, and aspiring landlords build wealth through ownership. Join a community built on one principle: We Create Owners.',
  icons: {
    icon: [{ url: '/icon.png', type: 'image/png' }],
  },
  keywords: [
    'Home Ownership Community',
    'Homeownership Education',
    'First Time Home Buyer',
    'Real Estate Investing',
    'Future Landlord',
    'Building Generational Wealth',
    'Financial Literacy',
    'Wealth Through Real Estate',
    'Home Buying Tips',
    'Property Ownership',
    'Real Estate Wealth Building',
    'Investment Properties',
    'Rental Property Investing',
    'Passive Income Real Estate',
    'Homeownership Resources',
    'Real Estate Community',
    'Ownership Mindset',
    'Brandon Bee Dixon',
    'I Create Owners',
    'The Power of Ownership',
  ],
  openGraph: {
    title: 'The Home Ownership Community | Real Estate Investing & Homeownership Education',
    description: 'Join The Home Ownership Community. A growing network dedicated to helping future homeowners, real estate investors, and aspiring landlords build wealth through ownership.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Home Ownership Community',
    description: 'Join a community built on one principle: We Create Owners.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
