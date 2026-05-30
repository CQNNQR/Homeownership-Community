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
- [x] WordPress REST API integration (live blog from WordPress)
- [x] Add logo placeholder for posts without featured images
- [ ] Add user authentication (if needed)
- [ ] Integrate with third-party services

### Phase 4: Launch
- [x] SEO optimization (integrated SEO keywords throughout site)
- [ ] Final testing across devices
- [ ] Set up custom domain (optional)
- [ ] Launch and monitor

---

## WordPress Integration - RSS Solution (Near-Term)

### Why We Need This
- WordPress.com Personal plan blocks REST API access from browsers
- WordPress.com staging sites block external requests via Cloudflare
- Need a workaround to fetch blog posts without server-side API calls

### RSS-to-JSON Approach
- [x] Install `rss-parser` npm package
- [x] Create API route to fetch and parse WordPress RSS feed
- [x] Map RSS feed data to blog post components
- [x] Add error handling and fallback content
- [ ] Test with WordPress.com free subdomain

**RSS Feed URL Pattern**: `https://yoursite.wordpress.com/feed/`

---

## Future Enhancements (Down the Road)

### Custom CMS & Admin Dashboard

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

---

## Notes

- Vercel is configured to auto-deploy on every push to the `master` branch
- WordPress.com blocks REST API on Personal plan - using RSS fallback
- Future phases will move to custom Supabase-powered CMS
