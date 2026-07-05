import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import {
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  OG_IMAGE_DEFAULT,
  FOUNDER,
  WP_STAGING_HOST,
} from '@/lib/site-config'

/**
 * Root layout metadata.
 *
 * Audit fixes applied here:
 *  - Title shortened from 82 chars → 56 chars (Tier 1 #8).
 *  - Description shortened from 226 chars → ≤160 chars with CTA (Tier 1 #8).
 *  - metadataBase set so all relative OG/canonical URLs resolve correctly
 *    on Vercel preview vs production.
 *  - alternates.canonical set as a default ('/'). Per-page generateMetadata
 *    overrides this where appropriate.
 *  - og:image and twitter:image defaulted to OG_IMAGE_DEFAULT so social
 *    previews stop missing assets site-wide.
 *  - robots defaults to index,follow (admins opt out via segment layout).
 *  - Global Organization + Person + WebSite JSON-LD so AI engines + Google
 *    Knowledge Graph recognize Brandon Bee Dixon and The Homeownership
 *    Community as entities (audit Tier 1 #2).
 *  - preconnect to WP staging + Unsplash for LCP/TTFB (audit Tier 1 #4).
 *  - link rel="llms-txt" hint for AI crawler discovery (audit Tier 1 #1).
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Real Estate Investing & Homeownership`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  authors: [{ name: 'Brandon Bee Dixon', url: SITE_URL }],
  creator: 'Brandon Bee Dixon',
  publisher: SITE_NAME,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Real Estate Investing & Homeownership`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: OG_IMAGE_DEFAULT,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — We Create Owners`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Real Estate Investing & Homeownership`,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE_DEFAULT],
  },
  icons: {
    icon: [{ url: '/icon.png', type: 'image/png' }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
}

/**
 * Global JSON-LD blocks. These are emitted on every page so AI engines
 * (ChatGPT, Claude, Perplexity, Google AI Overview) can recognize:
 *  - The Homeownership Community as an Organization
 *  - Brandon Bee Dixon as a Person with verifiable NMLS #1541210
 *  - The site itself as a WebSite (unlocks Google's sitelinks search box
 *    once a /blog?q= search endpoint exists; safe to declare now).
 *
 * All URLs reference SITE_URL (production) for entity consistency. Calendly
 * is excluded from sameAs — it's a scheduling tool, not a social identity —
 * and Amazon author URLs are kept because they're authoritative for Book
 * authorship (audit Tier 1 #2, see 03-domain-geo.md §G-2).
 */
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/LOGO/15002.png`,
  description: SITE_DESCRIPTION,
  foundingDate: '2020',
  founder: {
    '@type': 'Person',
    name: FOUNDER.name,
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Houston',
    addressRegion: 'TX',
    addressCountry: 'US',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: FOUNDER.email,
    availableLanguage: ['English'],
  },
  sameAs: FOUNDER.sameAs,
}

const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: FOUNDER.name,
  url: `${SITE_URL}/about`,
  jobTitle: FOUNDER.jobTitle,
  email: FOUNDER.email,
  identifier: FOUNDER.nmls, // NMLS #1541210 — verifiable identity
  worksFor: {
    '@type': 'Organization',
    name: 'NEXA Mortgage',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Houston',
      addressRegion: 'TX',
      addressCountry: 'US',
    },
  },
  knowsAbout: [
    'Real Estate Investing',
    'Mortgage Lending',
    'First-Time Home Buying',
    'Rental Property Management',
    'Generational Wealth Building',
    'Reverse Mortgages',
  ],
  sameAs: FOUNDER.sameAs,
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  inLanguage: 'en-US',
  publisher: {
    '@type': 'Organization',
    name: SITE_NAME,
  },
  // potentialAction: SearchAction will be added once /blog?q= endpoint exists.
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to cross-origin hosts for LCP/TTFB. Tier 1 #4.
            Use preconnect (TCP+TLS warmup) for hosts we'll fetch from
            on first paint; dns-prefetch is the cheaper fallback for
            third-party assets loaded later. */}
        <link rel="preconnect" href={`https://${WP_STAGING_HOST}`} />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />

        {/* AI-crawler discovery hint. Tier 1 #1. */}
        <link rel="llms-txt" href="/llms.txt" type="text/plain" />
        <link
          rel="alternate"
          type="text/plain"
          href="/llms-full.txt"
          title="Long-form AI-readable site dump"
        />
      </head>
      <body className="font-sans antialiased">
        {children}

        {/* Global JSON-LD: Organization, Person, WebSite. Tier 1 #2.
            These blocks are static (don't depend on per-page data) so
            emitting them in the root layout is correct and minimal. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />

        <Analytics />
      </body>
    </html>
  )
}