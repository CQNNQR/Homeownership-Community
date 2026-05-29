import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'The Homeownership Community',
  description: 'Join The Homeownership Community. Become a real estate investor and future landlord. Stay informed with our latest blogs and resources.',
  openGraph: {
    title: 'The Homeownership Community',
    description: 'Join The Homeownership Community. Become a real estate investor and future landlord.',
    type: 'website',
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
      </body>
    </html>
  )
}
