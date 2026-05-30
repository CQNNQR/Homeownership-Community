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
- [x] Create all site pages (Blog, Resources, Books, Contact, About)
- [x] Set up testing framework (Playwright)

### Phase 3: Content & Features
- [x] Create Resources page with tools and guides
- [x] Create Books page with book listings
- [x] Create Contact page with form
- [x] SEO optimization (integrated SEO keywords throughout site)
- [x] Add About page with Brandon Bee Dixon bio
- [x] Add downloadable PDF guides
- [x] Add user authentication for gated content (Resend)
- [ ] Integrate with third-party services

### Phase 4: Admin CMS & Customization (In Progress)
- [ ] Admin authentication (login/logout)
- [ ] Admin dashboard overview
- [ ] Blog post management (CRUD)
- [ ] Rich text editor with TipTap
- [ ] Media library for images/PDFs
- [ ] Homepage hero editor
- [ ] Site settings panel (social links, contact email, podcast URL)
- [ ] Email subscriber list view
- [ ] Podcast episode manager
- [ ] Testimonials section manager
- [ ] Event/webinar announcements

### Phase 5: Launch
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

## Brand Information (Completed)

### Brandon Bee Dixon Bio
- Mortgage Broker & Texas Realtor at NEXA Mortgage
- 30+ years sales and leadership experience
- Nearly a decade in mortgage industry
- Branch Manager with access to 300+ lending institutions
- "Deal Rescue" specialist - helps clients others have turned down
- Author of "Message to the Businessman" and "Sales: The Nucleus of Any Profession"
- Host of Power of Ownership Podcast
- Mission: "I Create Owners"

### Social Media Links (Updated)
- Facebook: https://www.facebook.com/share/1DySwCFJKY/?mibextid=wwXIfr
- Instagram: https://www.instagram.com/billionaireloanofficer?utm_source=qr
- LinkedIn: https://www.linkedin.com/in/brandonbeedixon?utm_source=share_via&utm_content=profile&utm_medium=member_ios
- Twitter/X: https://x.com/billionaire_lo?s=11&t=b8_2VZHBBDvMHx_DZ4ZwPA

### Contact
- Email: brandon@hocmortgage.com

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

## SEO & UX Improvements (Completed)

### Recent UX Fixes (May 29, 2026)
- [x] Fix "Join the Community" modal clipping/truncation on open
- [x] Render modal with React portal (`createPortal`) to `document.body`
- [x] Apply fix to both Navigation and JoinCommunityButton modals
- [x] Increase modal overlay stacking context and mobile-safe top spacing
- [x] Add About page with Brandon Bee Dixon bio
- [x] Update social links with actual URLs
- [x] Update contact email to brandon@hocmortgage.com
- [x] Add PDF guides to Resources page
- [x] Add Podcast link to About page

### Quick Wins Completed
- [x] Add schema markup (Article, Person, FAQ, BreadcrumbList)
- [x] Add FAQ section template to blog posts
- [x] Add About page with Brandon's full bio
- [x] Update social links with real URLs
- [x] Add downloadable PDF guides to Resources
- [x] Update contact email

### Pending: Requires Info From Brandon

#### Still Needed
- [ ] Power of Ownership Podcast URL
- [ ] Amazon links for books:
  - "The Future Landlord Playbook"
  - "Investing in High-End Real Estate"
  - "Message to the Businessman"
  - "Sales: The Nucleus of Any Profession"
- [ ] New blog posts (current: 6 posts from Oct-Nov 2024)

---

## Playwright Testing (Completed)

- [x] 50 passing tests covering all pages and interactions
- [x] Modal functionality tests
- [x] Navigation tests
- [x] Form submission tests
- [x] Blog post flow tests

---

## WordPress Integration - Attempted Solutions

### Issue Summary
- WordPress.com staging site blocked browser requests via Cloudflare
- Error: `net::ERR_INSUFFICIENT_RESOURCES`
- Server-side (curl) could reach WordPress fine

### Attempted Solutions

| Attempt | Approach | Result |
|---------|----------|--------|
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
2. **Phase 2**: Admin dashboard with site analytics
3. **Phase 3**: Blog post management (CRUD)
4. **Phase 4**: Rich text editor + media library
5. **Phase 5**: Site customization panel
6. **Phase 6**: Email subscribers, podcast episodes, testimonials
7. **Phase 7**: Polish, security, performance

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
- Join Community modal now mounts via portal to `document.body` to prevent clipping
- Brandon Bee Dixon profile flyer available at `/bio/profile picture flyer .PNG`
