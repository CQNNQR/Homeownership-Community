import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { getPostBySlug as getPostFromWordPress, getPosts as getPostsFromWordPress } from '@/lib/wordpress'
import { normalizePost, stripHtml } from '@/lib/utils'
import { SITE_URL, OG_IMAGE_DEFAULT, proxyWpImage, FOUNDER } from '@/lib/site-config'

// Revalidate every 10 seconds to keep blog fresh
export const revalidate = 10

interface Props {
  params: Promise<{ slug: string }>
}

/**
 * Cap a string at `max` chars without splitting mid-word.
 * Used to keep blog-post titles + meta descriptions inside SERP pixel budgets.
 */
function truncate(text: string, max: number): string {
  if (!text) return text
  if (text.length <= max) return text
  const sliced = text.slice(0, max).trimEnd()
  const lastSpace = sliced.lastIndexOf(' ')
  return (lastSpace > max * 0.6 ? sliced.slice(0, lastSpace) : sliced) + '…'
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const post = await getPostFromWordPress(slug)

    if (!post) {
      return { title: 'Post Not Found' }
    }

    const normalizedPost = normalizePost(post)
    const title = truncate(normalizedPost.title, 60)
    const description = truncate(normalizedPost.excerpt || '', 155)
    const postImage = proxyWpImage(normalizedPost.image) || OG_IMAGE_DEFAULT
    const postUrl = `${SITE_URL}/blog/${post.slug}`

    return {
      title,
      description,
      alternates: {
        canonical: postUrl,
      },
      openGraph: {
        title,
        description,
        url: postUrl,
        siteName: 'The Homeownership Community',
        images: [{ url: postImage, alt: normalizedPost.imageAlt || title }],
        type: 'article',
        publishedTime: post.date,
        modifiedTime: post.modified || post.date,
        authors: [FOUNDER.name],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [postImage],
      },
    }
  } catch {
    return { title: 'Blog Post' }
  }
}

// Generate FAQ schema based on post content
function generateFAQs(title: string, content: string) {
  const text = stripHtml(content).toLowerCase()

  const faqs: { question: string; answer: string }[] = []

  if (text.includes('mortgage') || text.includes('loan')) {
    faqs.push({
      question: 'How do I get approved for a mortgage?',
      answer:
        'Getting approved for a mortgage typically involves checking your credit score, saving for a down payment, verifying your income, and working with a lender. Contact a mortgage professional for personalized guidance.',
    })
  }

  if (text.includes('investing') || text.includes('rental')) {
    faqs.push({
      question: 'Is real estate a good investment?',
      answer:
        'Real estate can be an excellent investment for building wealth through rental income, property appreciation, and tax benefits. Research local markets and work with experienced professionals.',
    })
  }

  if (text.includes('landlord') || text.includes('tenant')) {
    faqs.push({
      question: 'What are the responsibilities of a landlord?',
      answer:
        'Landlord responsibilities include maintaining the property, handling repairs, screening tenants, collecting rent, and complying with local landlord-tenant laws.',
    })
  }

  if (text.includes('buy') || text.includes('purchase')) {
    faqs.push({
      question: 'What should I know before buying my first property?',
      answer:
        'Before buying, understand your budget, get pre-approved for financing, research neighborhoods, factor in hidden costs (taxes, insurance, maintenance), and work with a real estate professional.',
    })
  }

  if (faqs.length === 0) {
    faqs.push({
      question: 'How can I learn more about real estate investing?',
      answer:
        'Join The Home Ownership Community for expert insights on real estate investing, property ownership, and building generational wealth.',
    })
    faqs.push({
      question: 'What is "We Create Owners"?',
      answer:
        '"We Create Owners" is the mission of The Home Ownership Community — empowering individuals to become homeowners and real estate investors.',
    })
  }

  return faqs
}

/**
 * Article JSON-LD for a single blog post.
 *
 * Audit fix: this used to hardcode `homeownership-community.vercel.app`
 * (the previous Vercel preview deploy). Now it uses SITE_URL (production)
 * for every URL field, plus proxyWpImage() to point featured images at
 * the same-origin /wp-image proxy path so social previews can fetch them
 * without mixed-content warnings.
 */
function generateArticleSchema(post: any, normalizedPost: any) {
  const articleUrl = `${SITE_URL}/blog/${post.slug}`
  const imageUrl = proxyWpImage(normalizedPost.image) || `${SITE_URL}/LOGO/15002.png`

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: normalizedPost.title,
    description: normalizedPost.excerpt,
    image: imageUrl,
    datePublished: post.date,
    dateModified: post.modified || post.date,
    author: {
      '@type': 'Person',
      name: FOUNDER.name,
      description: FOUNDER.jobTitle,
      url: SITE_URL,
      sameAs: FOUNDER.sameAs.slice(0, 4),
    },
    publisher: {
      '@type': 'Organization',
      name: 'The Homeownership Community',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/LOGO/15002.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    keywords: normalizedPost.category,
    wordCount: stripHtml(post.content?.rendered || '').split(/\s+/).length,
  }
}

function generateBreadcrumbSchema(post: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title?.rendered ? stripHtml(post.title.rendered) : 'Post',
        item: `${SITE_URL}/blog/${post.slug}`,
      },
    ],
  }
}

function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params

  let post = null
  let relatedPosts: any[] = []

  try {
    post = await getPostFromWordPress(slug)

    if (post) {
      const { posts: allPosts } = await getPostsFromWordPress(1, 4)
      relatedPosts = allPosts
        .filter((p) => p.slug !== slug)
        .slice(0, 3)
        .map(normalizePost)
    }
  } catch (err) {
    console.error('Error fetching post:', err)
  }

  // Audit fix: this used to return a JSX "Article Not Found" page with HTTP
  // 200 (soft-404), letting Google index random slugs. Now we trigger a
  // proper 404 via Next's notFound(), which renders src/app/not-found.tsx.
  if (!post) {
    notFound()
  }

  const normalizedPost = normalizePost(post)
  const faqs = generateFAQs(normalizedPost.title, post.content?.rendered || '')
  const heroImage = proxyWpImage(normalizedPost.image)

  const articleSchema = generateArticleSchema(post, normalizedPost)
  const breadcrumbSchema = generateBreadcrumbSchema(post)
  const faqSchema = generateFAQSchema(faqs)

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([articleSchema, breadcrumbSchema, faqSchema]),
        }}
      />

      {/* Article Hero */}
      <section className="pt-32 pb-12 bg-[#F9F9F9]">
        <div className="max-w-3xl mx-auto px-4">
          <Link href="/blog" className="inline-flex items-center gap-2 text-gray-500 hover:text-black mb-8 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Blog
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-red-700 text-white text-xs font-bold px-3 py-1 rounded">{normalizedPost.category}</span>
            <span className="text-gray-400 text-sm">{normalizedPost.date}</span>
            <span className="text-gray-400 text-sm">• {normalizedPost.readingTime}</span>
          </div>
          <h1 className="text-4xl font-bold text-black mb-6">{normalizedPost.title}</h1>
          {/* YMYL disclaimer — Tier 1 #10. Mortgage/credit content is
              designated "Your Money or Your Life" by Google quality raters
              and requires an explicit non-advice disclaimer. */}
          <p className="text-xs text-gray-500">
            *Not financial advice. NMLS #{FOUNDER.nmls}. Always consult a licensed mortgage professional before making financial decisions.
          </p>
        </div>
      </section>

      {/* Featured Image */}
      {heroImage && (
        <div className="max-w-4xl mx-auto px-4 -mt-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImage}
            alt={normalizedPost.imageAlt || 'Home Ownership Community'}
            className="w-full h-96 object-cover rounded-xl shadow-lg"
          />
        </div>
      )}

      {/* Article Content */}
      <section className="py-16 bg-white">
        <article
          className="max-w-3xl mx-auto px-4 prose prose-lg max-w-none text-center"
          dangerouslySetInnerHTML={{ __html: post.content?.rendered || '' }}
        />
      </section>

      {/* FAQ Section */}
      <section className="py-12 bg-[#F9F9F9]">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-black mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-black mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Author Box */}
      <section className="py-12 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center gap-6 p-6 bg-[#F9F9F9] rounded-xl shadow-sm">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-500 font-bold text-xl">B</span>
            </div>
            <div>
              <p className="font-bold text-black">Brandon Bee Dixon</p>
              <p className="text-gray-600 text-sm">Founder of The Homeownership Community • NMLS #{FOUNDER.nmls}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      {relatedPosts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-black mb-8">More Articles</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  href={`/blog/${relatedPost.slug}`}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow block border border-gray-100"
                >
                  <div className="h-40 bg-gray-200 relative">
                    {relatedPost.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={relatedPost.image}
                        alt={relatedPost.imageAlt}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src="/LOGO/15002.png"
                        alt="Home Ownership Community"
                        className="w-full h-full object-contain bg-gray-50"
                      />
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">{relatedPost.category}</span>
                      <span className="text-gray-400 text-sm">{relatedPost.date}</span>
                    </div>
                    <h3 className="text-lg font-bold text-black">{relatedPost.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  )
}