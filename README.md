# SikaSchool - Next.js Website (based on Solid template)

This project is a customized Next.js 13+ (App Router) website aligned with the SikaSchool structure and content while preserving the original Solid template design system (Tailwind CSS, dark mode, animations).

- **Stack**: Next.js 13/14/15 (App Router), React 18/19, TypeScript, Tailwind CSS, Framer Motion, Swiper
- **Design system**: Original Solid template styles retained; content updated to match SikaSchool
- **Live content modeled from**: `https://www.sikaschool.com/`

## What's included
- **Homepage sections**: Hero, About (Nos méthodes), Fun Facts (Quelques Chiffres), Témoignages, Pricing (Packs de séances), Contact
- **Header navigation**: `Accueil`, `Comment ça marche`, `Qui sommes nous ?`, `Packs de séances`, `A la séance`, `Se connecter`
- **CTAs**: `Se connecter` and `Réserver` in the header
- **Theming**: Light/Dark mode toggle preserved

Removed (from the original template): Blog pages/components and Docs page.

## Project structure (key files)
- `app/(site)/page.tsx`: Homepage composition with anchors `#about`, `#how-it-works`, `#pricing`, `#contact`
- `components/Header/menuData.tsx`: Navigation items aligned to SikaSchool
- `components/Header/index.tsx`: Header with CTAs `Se connecter` and `Réserver`
- `components/Hero/index.tsx`: Updated hero copy (“Comprendre, Progresser, Réussir” + email capture UI)
- `components/About/index.tsx`: “Nos méthodes”: Comprendre, Progresser, Réussir
- `components/FunFact/index.tsx`: “Quelques Chiffres”: 5+, 200+, 95%
- `components/Pricing/index.tsx`: Three packs — Collège (18 €/cours), Lycée (22 €/cours), Supérieur (28 €/cours)
- `components/Testimonial/index.tsx` and `components/Testimonial/testimonialData.ts`: Testimonials content

## Getting started
Install dependencies:
```bash
    npm install --legacy-peer-deps
```
Run the dev server:
```bash
    npm run dev
 ```
The app will be available at `http://localhost:3000`.

Build:
```bash
npm run build && npm run start
```

## Code Quality & Security
This project follows security best practices and includes comprehensive quality checks:

### Available Scripts
- `npm run lint` - Run ESLint with security rules
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run type-check` - Run TypeScript type checking
- `npm run security:audit` - Run npm security audit
- `npm run security:check` - Run comprehensive security checks
- `npm run format` - Format code with Prettier

### Security Features
- ✅ Input validation and sanitization
- ✅ Security headers (CSP, XSS protection, etc.)
- ✅ Error boundaries and secure logging
- ✅ TypeScript strict mode
- ✅ ESLint security rules
- ✅ Regular security audits
- ✅ Accessibility features (WCAG compliant)

## Customization
- Update navigation items in `components/Header/menuData.tsx`.
- Edit homepage sections in `app/(site)/page.tsx` and the respective components under `components/`.
- Images live in `public/images/**`. Replace with your own assets as needed.
- Colors/spacing/typography are Tailwind-based; tweak via classes in components or Tailwind config.

## Deployment
- Recommended platforms: `Vercel` or `Netlify` for Next.js.
- Ensure environment variables (if added later for auth/payments) are configured in the hosting provider.

## Roadmap: Online course platform
Planned features to extend this marketing site into a full platform:
- Authentication and profiles
  - Email/password and social login; `students` and `tutors` roles; onboarding flows.
- Scheduling and booking
  - Tutor availability calendar; student booking; reschedule/cancel; reminders; time zones.
- Payments and plans
  - Stripe packs (8 cours/mois) and à la séance; invoices; refunds; wallet of sessions.
- Live classroom & content
  - Video calls (Zoom/Twilio), whiteboard, chat, file sharing, homework/notes, optional recordings.
- Search & matching
  - Subject/level filters, ratings, recommendations, admin manual matching.
- Admin back office
  - Manage users/tutors/sessions, disputes, payouts, homepage CMS.
- Analytics & quality
  - NPS/testimonials, conversion/retention dashboards, learning outcomes tracking.
- Compliance & operations
  - GDPR consent and data retention, policies, tutor contracts, payouts (Stripe Connect).

## To-Do List - Site Improvements

### 🚀 **Priority 1 - Critical Issues**
- [ ] **Fix missing images** - Add placeholder images for `/images/how-to/step1.jpg`, `step2.jpg`, `step3.jpg` (currently causing 404 errors)
- [ ] **Complete favicon setup** - Ensure all favicon formats are properly configured and displaying correctly
- [ ] **Test mobile responsiveness** - Verify all components work perfectly on mobile devices
- [ ] **Fix any broken links** - Audit all internal and external links for 404 errors

### 🎨 **Priority 2 - UI/UX Enhancements**
- [ ] **Add loading states** - Implement skeleton loaders for better perceived performance
- [ ] **Improve animations** - Add more smooth transitions and micro-interactions
- [ ] **Enhance mobile menu** - Add slide-in animation for better mobile experience
- [ ] **Add breadcrumbs** - Implement breadcrumb navigation for better user orientation
- [ ] **Improve form validation** - Add real-time validation feedback for contact forms
- [ ] **Add success/error messages** - Implement toast notifications for user actions

### 📱 **Priority 3 - Content & Features**
- [ ] **Add more testimonials** - Expand testimonial carousel with more customer reviews
- [ ] **Create FAQ section** - Add frequently asked questions to reduce support inquiries
- [ ] **Add blog/news section** - Implement content management for educational articles
- [ ] **Add tutor profiles** - Create detailed tutor profile pages with photos and specialties
- [ ] **Implement search functionality** - Add search bar for finding specific content
- [ ] **Add newsletter signup** - Implement email subscription for marketing campaigns

### 🔧 **Priority 4 - Technical Improvements**
- [ ] **Implement PWA features** - Add service worker for offline functionality
- [ ] **Add analytics tracking** - Implement Google Analytics or similar for user behavior insights
- [ ] **Optimize images** - Convert images to WebP format and implement lazy loading
- [ ] **Add sitemap.xml** - Generate sitemap for better SEO
- [ ] **Implement meta tags** - Add dynamic meta tags for social media sharing
- [ ] **Add error pages** - Create custom 404 and 500 error pages
- [ ] **Implement caching** - Add proper caching headers for better performance

### 🌐 **Priority 5 - SEO & Performance**
- [ ] **Optimize Core Web Vitals** - Improve LCP, FID, and CLS scores
- [ ] **Add structured data** - Implement JSON-LD schema markup for better search results
- [ ] **Implement lazy loading** - Add intersection observer for images and components
- [ ] **Add preloading** - Implement resource hints for critical assets
- [ ] **Optimize bundle size** - Analyze and reduce JavaScript bundle size
- [ ] **Add compression** - Implement gzip/brotli compression for assets

### 🔒 **Priority 6 - Security & Compliance**
- [ ] **Implement CSP headers** - Add Content Security Policy for enhanced security
- [ ] **Add rate limiting** - Implement rate limiting for API endpoints
- [ ] **Add CSRF protection** - Implement CSRF tokens for form submissions
- [ ] **Add input sanitization** - Enhance input validation and sanitization
- [ ] **Implement GDPR compliance** - Add cookie consent and privacy policy
- [ ] **Add security headers** - Implement additional security headers (HSTS, etc.)

### 📊 **Priority 7 - Analytics & Monitoring**
- [ ] **Add error tracking** - Implement Sentry or similar for error monitoring
- [ ] **Add performance monitoring** - Implement performance tracking and alerts
- [ ] **Add user analytics** - Track user behavior and conversion funnels
- [ ] **Add A/B testing** - Implement A/B testing framework for optimization
- [ ] **Add heatmap tracking** - Implement user interaction heatmaps
- [ ] **Add conversion tracking** - Track goal completions and user journeys

### 🎯 **Priority 8 - Business Features**
- [ ] **Implement booking system** - Complete the tutor selection and calendar booking flow
- [ ] **Add payment integration** - Implement Stripe for session payments
- [ ] **Add user authentication** - Implement login/signup system
- [ ] **Add user dashboard** - Create user profile and session management
- [ ] **Add admin panel** - Create admin interface for managing tutors and sessions
- [ ] **Add email notifications** - Implement email reminders and confirmations

### 🧪 **Priority 9 - Testing & Quality**
- [ ] **Add unit tests** - Implement Jest tests for components and utilities
- [ ] **Add integration tests** - Test user flows and API integrations
- [ ] **Add E2E tests** - Implement Playwright or Cypress for end-to-end testing
- [ ] **Add accessibility tests** - Ensure WCAG compliance with automated testing
- [ ] **Add performance tests** - Implement Lighthouse CI for performance monitoring
- [ ] **Add visual regression tests** - Implement screenshot testing for UI consistency

### 📚 **Priority 10 - Documentation & Maintenance**
- [ ] **Update component documentation** - Add JSDoc comments to all components
- [ ] **Create user guides** - Add help documentation for users
- [ ] **Add API documentation** - Document all API endpoints and data structures
- [ ] **Create deployment guide** - Document deployment process and environment setup
- [ ] **Add maintenance procedures** - Document regular maintenance tasks
- [ ] **Create backup procedures** - Implement automated backup and recovery processes

---

**Note**: This to-do list is prioritized by impact and urgency. Focus on Priority 1 items first, then work through the list systematically. Each completed item should be tested thoroughly before moving to the next priority level.

## Documentation
- [Development Guide](DEVELOPMENT.md) - Comprehensive development guidelines
- [Security Policy](SECURITY.md) - Security measures and best practices
- [Component Documentation](components/) - Individual component documentation

## Scripts
- `dev`: start development server
- `build`: build production bundle
- `start`: start production server
- `lint`: run ESLint with security rules
- `lint:fix`: fix ESLint issues automatically
- `type-check`: run TypeScript type checking
- `security:audit`: run npm security audit
- `security:check`: run comprehensive security checks
- `format`: format code with Prettier

## License
This repository began from the Solid Next.js template. The customizations for SikaSchool are open for personal or commercial use in the context of this project. Please review the original Solid template license in `LICENSE`.

## Acknowledgements
- Base template: Solid by Next.js Templates
- Content inspiration: SikaSchool (`https://www.sikaschool.com/`)
