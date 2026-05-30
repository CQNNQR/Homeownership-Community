# Homeownership Community - Project Roadmap

## Project Overview
- **GitHub Repository**: https://github.com/CQNNQR/Homeownership-Community
- **Vercel Deployment**: https://homeownership-community.vercel.app
- **Status**: Live with WordPress Blog Integration

---

## Setup Phase (Completed)

- [x] Create GitHub repository "Homeownership-Community"
- [x] Initialize local git repository
- [x] Create Vercel project "homeownership-community"
- [x] Link Vercel project to GitHub repository
- [x] Configure GitHub → Vercel deployment pipeline

---

## Development Phase

### Phase 1: Foundation
- [x] Set up project structure (Next.js with Tailwind CSS)
- [x] Configure environment variables
- [x] Set up CI/CD pipeline
- [x] Deploy initial placeholder page

### Phase 2: Core Features
- [x] Design and implement homepage (hero, about, resources, books, blog sections)
- [x] Implement navigation structure
- [x] Add responsive design
- [x] Create all site pages (Blog, Resources, Books, Contact)
- [ ] Set up testing framework

### Phase 3: Content & Features
- [x] Create Resources page with tools and guides
- [x] Create Books page with book listings
- [x] Create Contact page with form
- [x] SEO optimization (integrated SEO keywords throughout site)
- [ ] Add user authentication (if needed)
- [ ] Integrate with third-party services

### Phase 4: Launch
- [ ] Final testing across devices
- [ ] Set up custom domain (optional)
- [ ] Launch and monitor

---

## WordPress Integration (COMPLETED)

### Solution: Server Component Architecture

The final working solution combined multiple approaches:

1. **API Route Proxy** - Vercel server fetches from WordPress
2. **Server Components** - BlogPreview runs server-side where WordPress is reachable
3. **Client Components** - Only interactive elements (Join Community modal)

### Architecture Details
- `page.tsx` is a **Server Component** (no 'use client')
- `JoinCommunityButton.tsx` is a separate **Client Component**
- `BlogPreview.tsx` runs server-side and fetches WordPress data directly
- `/api/posts` route provides fallback for client-side fetches

### Environment Variable
```
NEXT_PUBLIC_WORDPRESS_URL=https://bdixon7955e29543-dcwxs.wpcomstaging.com
```

---

## Blog Features (Completed)

### Core Blog Functionality
- [x] Blog listing page with "Show More" pagination
- [x] Individual blog post pages with full content
- [x] Related posts section at bottom of each blog
- [x] Featured image support from WordPress
- [x] Reading time calculation
- [x] HTML entity decoding for proper text display
- [x] 10-second cache revalidation for fresh content

### Blog Styling
- [x] Tailwind Typography plugin for proper content formatting
- [x] Custom prose styling with site colors (Crimson Red #A61C30)
- [x] Centered blog post text
- [x] Responsive image sizing

### Logo Placeholder
- [x] Logo appears for posts without featured images
- [x] Applied to: Blog preview cards, related posts, individual posts

### Auto-Categorization
- [x] Keyword-based automatic category assignment
- [x] Categories: Mortgage, Investing, Real Estate, Landlord, Taxes, Insurance, Maintenance
- [x] Falls back to WordPress category if available
- [x] Default to "General" if no match

---

## SEO & UX Improvements (In Progress)

### Quick Wins Completed
- [x] Add schema markup (Article, Person, FAQ, BreadcrumbList)
- [x] Add FAQ section template to blog posts
- [ ] Unique meta descriptions per page
- [ ] Fix broken social links (need actual URLs from Brandon)
- [ ] Add downloadable resources (need actual files from Brandon)

### Pending: Requires Info From Brandon

#### Personal Brand
- [ ] Brandon Bee Dixon bio (photo, credentials, story)
- [ ] Author photo upload
- [ ] Personal brand trust signals for E-E-A-T

#### Social Links
- [ ] Twitter/X profile URL
- [ ] LinkedIn profile URL
- [ ] Instagram profile URL

#### Community & Resources
- [ ] Community platform link (Discord, Facebook group, etc.)
- [ ] Actual downloadable resource files (PDFs, spreadsheets, etc.)
- [ ] Lead magnet / email incentive
- [ ] Email subscribe confirmation flow

#### Content
- [ ] 2-3 long-form pillar articles (2,000+ words)
- [ ] FAQ sections for each blog post (template ready)
- [ ] New blog posts (current: 6 posts from Oct-Nov 2024)

#### SEO
- [ ] Unique meta descriptions per page
- [ ] Article schema per blog post (template ready)
- [ ] Person schema for Brandon Bee Dixon
- [ ] BreadcrumbList schema
- [ ] robots.txt configuration
- [ ] sitemap.xml generation

---

## WordPress Integration - Attempted Solutions

### Issue Summary
- WordPress.com staging site blocked browser requests via Cloudflare
- Error: `net::ERR_INSUFFICIENT_RESOURCES`
- Server-side (curl) could reach WordPress fine

### Attempted Solutions

| Attempt | Approach | Result |
|--------|----------|--------|
| 1 | WPGraphQL Plugin | Failed - Cloudflare blocked |
| 2 | WordPress REST API (Direct) | Failed - Cloudflare blocked |
| 3 | React Infinite Loop Fix | Partial - not root cause |
| 4 | RSS-to-JSON | Failed - Cloudflare blocked |
| 5 | API Route Proxy | Partial - bypassed for homepage |
| **6** | **Server Components** | **SUCCESS** |

### Root Cause (Discovered)
- `BlogPreview` was being pulled into client bundle because `page.tsx` had `'use client'`
- Browser tried to fetch from WordPress directly - Cloudflare blocked
- **Fix**: Remove `'use client'` from `page.tsx`, extract modal to separate client component

---

## Future Enhancements

### Option A: Custom CMS & Admin Dashboard (Recommended)

Build a fully custom CMS where Brandon can manage all site content without WordPress.

#### Technology Stack
- **Database**: Supabase (PostgreSQL) for data storage
- **Authentication**: Supabase Auth (built-in)
- **Rich Text Editor**: TipTap (headless, customizable)
- **Image Storage**: Supabase Storage or Cloudinary
- **Frontend**: Next.js (current stack)

#### Features
- [ ] Admin login / authentication
- [ ] Dashboard with site analytics
- [ ] Blog post CRUD (create, read, update, delete)
- [ ] Rich text editor with image uploads
- [ ] Media library for images/assets
- [ ] Category and tag management
- [ ] Site customization panel
  - Theme color picker
  - Logo upload
  - Site name/description
  - Social media links
- [ ] SEO settings per post
- [ ] Draft/publish workflow
- [ ] User role management (if multiple admins)

#### Phase Breakdown
1. **Phase 1**: Supabase setup, authentication, admin login
2. **Phase 2**: Blog post management (CRUD operations)
3. **Phase 3**: Rich text editor + media library
4. **Phase 4**: Site customization panel
5. **Phase 5**: Polish, security, performance

### Option B: Auto-Generated Images for Blogs
- [ ] Integrate AI image generation (DALL-E, Midjourney API)
- [ ] Generate contextually relevant images for each blog post
- [ ] Create variety based on category/topic
- [ ] Flyer-style promotional images

### Option C: Self-Hosted WordPress
- Move to self-hosted WordPress on hosting (Bluehost, SiteGround, etc.)
- Full control over REST API, no Cloudflare blocking
- Brandon can use familiar WordPress admin interface

---

## Notes

- Vercel auto-deploys on every push to the `master` branch
- Current solution uses Server Component architecture to bypass Cloudflare
- Logo placeholder (`/LOGO/15002.png`) used for posts without featured images
- Blog auto-categorization works based on content keyword analysis
- Typography plugin configured with site brand colors
- Schema markup added for SEO (Article, Person, FAQ, BreadcrumbList)

---

## Info Needed From Brandon (Action Items)

To complete the SEO & UX improvements, Brandon needs to provide:

### High Priority
1. **Social URLs** - Twitter/X, LinkedIn, Instagram links
2. **Community Link** - Discord/Facebook group/membership portal URL
3. **Author Bio** - Photo, credentials, story for "About" page
4. **Downloadable Resources** - Any PDFs, spreadsheets, guides to link

### Medium Priority
5. **Lead Magnet** - What incentive for email signup?
6. **FAQ Content** - Common questions about real estate investing

### Lower Priority (Long-term)
7. **New Blog Posts** - Consistent publishing schedule
8. **Pillar Content** - Long-form guides (2,000+ words each)
