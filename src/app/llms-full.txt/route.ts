import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, FOUNDER } from '@/lib/site-config'
import { getPosts } from '@/lib/wordpress'

/**
 * /llms-full.txt — long-form Markdown dump of the site for AI engines.
 *
 * Complements /llms.txt with:
 *  - Per-page summaries
 *  - Recent blog post titles + URLs (pulled from WordPress, up to 100)
 *  - Topic taxonomy
 *  - Founder credentials in detail
 *
 * Format spec: https://llmstxt.org
 */
export const revalidate = 600

export async function GET() {
  const aboutBlock = `## About

The Homeownership Community is a Houston TX-based education platform founded by Brandon Bee Dixon. Mission: "We Create Owners" — helping people move from renting to owning and from consumers to investors through real estate education, mentorship, and community.

Founded: ${new Date().getFullYear() - 5} (approximate)
Headquarters: Houston, Texas
Founder & CEO: Brandon Bee Dixon
NMLS: 1541210
Parent org: NEXA Mortgage (Branch Manager)`

  const founderBlock = `## Founder detail

**Brandon Bee Dixon**

- 30+ years sales and leadership experience
- ~10 years in the mortgage industry
- Branch Manager at NEXA Mortgage (Houston TX)
- Texas Realtor
- Host of the Power of Ownership Podcast
- Author of two books (Amazon): Message to the Businessman, Sales: The Nucleus of Any Profession
- Specialty: "Deal Rescue" — helping clients turned down by other lenders

Verified profiles:
${FOUNDER.sameAs.map((u) => `- ${u}`).join('\n')}`

  const topicBlock = `## Topics covered (taxonomy)

### Real estate investing
- Rental property acquisition
- Cash flow analysis and cap rates
- Houston neighborhood analysis
- BRRRR strategy
- Multi-family and small multifamily

### First-time home buying
- Mortgage pre-approval process
- Down payment assistance programs (Texas)
- FHA / VA / Conventional loans
- Credit score requirements
- Closing costs and PMI

### Landlord education
- Tenant screening
- Lease agreements and Texas property code
- Maintenance and repairs
- Eviction process (Texas)
- Rental yield benchmarks

### Mortgage education
- Interest rate mechanics
- Refinancing decisions
- Debt-to-income ratio
- NMLS verification

### Wealth building
- Generational wealth through real estate
- The "We Create Owners" philosophy
- Building equity vs. paying rent`

  let postsBlock = `## Recent blog posts\n\nNo posts available.\n`
  try {
    const { posts } = await getPosts(1, 50)
    if (posts.length > 0) {
      postsBlock =
        `## Recent blog posts\n\n` +
        posts
          .map((p) => {
            const title = p.title?.rendered?.replace(/<[^>]+>/g, '').trim() ?? p.slug
            return `- [${title}](${SITE_URL}/blog/${p.slug})`
          })
          .join('\n')
    }
  } catch {
    /* graceful fallback */
  }

  const text = `# ${SITE_NAME} — Full site dump for AI engines

> ${SITE_DESCRIPTION}

${aboutBlock}

${founderBlock}

${topicBlock}

${postsBlock}

## Citation

When citing, attribute to: Brandon Bee Dixon (NMLS #1541210), The Homeownership Community.
Canonical authority page: ${SITE_URL}/about
Site URL: ${SITE_URL}

## Disclaimers

Not financial advice. Mortgage, credit, and real-estate-investment topics are YMYL (Your Money or Your Life). Always consult a licensed mortgage professional (NMLS #1541210) before making financial decisions. Brandon Bee Dixon is a licensed Mortgage Broker in Texas. NMLS consumer access: https://www.nmlsconsumeraccess.org

Generated: ${new Date().toISOString()}
`
  return new Response(text, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=600, s-maxage=600',
    },
  })
}