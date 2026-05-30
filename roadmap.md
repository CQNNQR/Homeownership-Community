# Homeownership Community - Project Roadmap

## Project Overview
- **GitHub Repository**: https://github.com/CQNNQR/Homeownership-Community
- **Vercel Deployment**: https://homeownership-community.vercel.app
- **Status**: Initialized and linked

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
- [x] Implement blog/updates section with 6 full articles
- [x] Create Resources page with tools and guides
- [x] Create Books page with book listings
- [x] Create Contact page with form
- [x] Add logo placeholder for posts without featured images
- [x] SEO optimization (integrated SEO keywords throughout site)
- [ ] Add user authentication (if needed)
- [ ] Integrate with third-party services

### Phase 4: Launch
- [ ] Final testing across devices
- [ ] Set up custom domain (optional)
- [ ] Launch and monitor

---

## WordPress Integration - ATTEMPTS & ISSUES

### Issue Summary
- WordPress.com staging site (`bdixon7955e29543-dcwxs.wpcomstaging.com`) blocks browser requests via Cloudflare
- Error: `net::ERR_INSUFFICIENT_RESOURCES` - browser cannot establish TCP connection to WordPress
- Server-side (curl) can reach WordPress fine - only browser is blocked

### Attempt 1: WPGraphQL Plugin
- [x] Installed WPGraphQL plugin on WordPress.com staging
- [x] Created GraphQL client and queries
- **Result**: Failed - same `ERR_INSUFFICIENT_RESOURCES` error

### Attempt 2: WordPress REST API (Direct)
- [x] Switched from GraphQL to native WordPress REST API
- [x] Created REST API fetch functions with timeout
- **Result**: Failed - same `ERR_INSUFFICIENT_RESOURCES` error

### Attempt 3: React Infinite Loop Fix
- [x] Fixed React infinite loop in useEffect (added useCallback, proper dependency array)
- [x] Added hasInitialized flag to prevent double-fetching
- **Result**: Failed - error persists, not a React code issue

### Attempt 4: WordPress RSS-to-JSON
- [x] Installed `rss-parser` npm package
- [x] Created RSS parsing functions
- [x] Updated all blog components for RSS format
- **Result**: Failed - WordPress.com staging blocks RSS feed too via Cloudflare

### Attempt 5: API Route Proxy
- [x] Created Next.js API routes (`/api/posts`, `/api/post/[slug]`)
- [x] Client components fetch from our API route instead of WordPress directly
- [x] Vercel server fetches from WordPress (server-to-server, no browser blocking)
- **Result**: Still investigating - Vercel server should be able to reach WordPress

### WordPress.com Support Conclusion
- WordPress agent confirmed `.wpcomstaging.com` URLs should support REST API
- Agent suggested issue was React infinite loop (we fixed this)
- Issue persists despite fixes - likely Cloudflare configuration on staging

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

#### Database Schema (Planned)
```
users (Supabase Auth)
├── profiles (user details, avatar)
├── posts (title, slug, content, status, author)
├── categories (name, slug)
├── post_categories (junction table)
└── site_settings (key-value config)
```

#### Phase Breakdown
1. **Phase 1**: Supabase setup, authentication, admin login
2. **Phase 2**: Blog post management (CRUD operations)
3. **Phase 3**: Rich text editor + media library
4. **Phase 4**: Site customization panel
5. **Phase 5**: Polish, security, performance

### Option B: Self-Hosted WordPress
- Move to self-hosted WordPress on hosting (Bluehost, SiteGround, etc.)
- Full control over REST API, no Cloudflare blocking
- Brandon can use familiar WordPress admin interface

### Option C: Production WordPress.com Site
- Create a production WordPress.com site (not staging)
- Production sites typically don't have Cloudflare blocking
- Use that URL for REST API access

---

## Notes

- Vercel is configured to auto-deploy on every push to the `master` branch
- WordPress.com staging Cloudflare blocking remains unresolved
- API route proxy approach is the latest attempt - may need further debugging
- Custom CMS via Supabase is recommended long-term solution
- Alternative: Use self-hosted WordPress or production WordPress.com site
