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
- **Authentication**: Complete login/signup system with role-based access
- **Student Portal**: Full dashboard with booking, history, and tutor selection
- **Tutor Portal**: Complete tutor management interface with admin capabilities
- **Database**: Full Supabase integration with real-time data synchronization

Removed (from the original template): Blog pages/components and Docs page.

## 🏗️ Technical Architecture

### **Frontend Stack**
- **Next.js 15** - App Router with TypeScript
- **React 19** - Latest React features and hooks
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Swiper** - Touch slider for testimonials and carousels
- **Radix UI** - Accessible component primitives
- **shadcn/ui** - Modern component library

### **Backend & Database**
- **Supabase** - PostgreSQL database with real-time features
- **Custom Authentication** - Secure session management
- **API Routes** - RESTful endpoints for all operations
- **TypeScript** - End-to-end type safety

### **Key Features**
- **Role-Based Access Control** - Students, Tutors, and Admins
- **Real-time Data Sync** - Live updates across all interfaces
- **Responsive Design** - Mobile-first approach
- **Dark/Light Theme** - User preference support
- **Internationalization** - French/English support ready
- **Security** - Input validation, CSRF protection, secure sessions

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

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Supabase account and project

### **Installation**
1. Clone the repository:
```bash
git clone <repository-url>
cd SIKASCHOOL-website
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure Supabase:
   - Create a new Supabase project
   - Add your Supabase URL and keys to `.env.local`
   - Run the database schema from `supabase/schema.sql`

5. Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### **Test Credentials**
The application includes test accounts for development:

**Students:**
- Email: `student@sikaschool.com` | Password: `Steve`
- Email: `liele.ghoma@sikaschool.com` | Password: `Liele123`
- Email: `milly.koula@sikaschool.com` | Password: `Milly123`

**Tutors:**
- Email: `daniel.verton@sikaschool.com` | Password: `Daniel123` (Admin)
- Email: `ruudy.mbouza-bayonne@sikaschool.com` | Password: `Ruudy123` (Admin)
- Email: `alix.tarrade@sikaschool.com` | Password: `Alix123`
- Email: `nolwen.verton@sikaschool.com` | Password: `Nolwen123`
- Email: `walid.lakas@sikaschool.com` | Password: `Walid123`

### **Build & Deployment**
```bash
# Build for production
npm run build

# Start production server
npm run start

# Deploy to Vercel
vercel --prod
```

## 🔌 API Endpoints

### **Authentication**
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout  
- `GET /api/auth/me` - Get current user info

### **Student APIs**
- `GET /api/student/dashboard` - Student dashboard data
- `GET /api/student/tutors` - Available tutors list
- `GET /api/student/notifications` - Student notifications
- `GET /api/student/calendar` - Calendar events
- `GET /api/student/messages` - Message threads

### **Admin APIs**
- `GET /api/admin/users` - Manage all users
- `POST /api/admin/users` - Create new user
- `PUT /api/admin/users/[userId]` - Update user
- `DELETE /api/admin/users/[userId]` - Delete user
- `GET /api/admin/sessions` - Manage all sessions
- `GET /api/admin/payments` - Payment management
- `POST /api/admin/sync-profiles` - Sync user profiles

### **Public APIs**
- `GET /api/faqs` - FAQ data
- `GET /api/testimonials` - Testimonials data
- `GET /api/subjects` - Available subjects

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

## 🚀 Current Status - Platform Features Implemented

### ✅ **Completed Features**
- **Authentication System** - Custom auth with Supabase backend
  - Email/password login for students and tutors
  - Role-based access control (STUDENT, TUTOR, ADMIN)
  - Session management with secure cookies
  - Password hashing with bcryptjs

- **Student Dashboard** - Complete student interface
  - Personalized dashboard with statistics
  - Course management and progress tracking
  - Tutor selection and booking system
  - Session history and ratings
  - Messages and notifications
  - Calendar integration

- **Tutor Dashboard** - Complete tutor interface
  - Tutor profile management
  - Student management and session tracking
  - Availability management
  - Payment tracking and commission calculations
  - Administration panel (for admin tutors)

- **Database Integration** - Full Supabase backend
  - User management (students, tutors, admins)
  - Session tracking and booking system
  - Payment management with commission calculations
  - Real-time data synchronization
  - Comprehensive API endpoints

- **Admin Panel** - Complete administration system
  - User management (create, update, delete, reset passwords)
  - Session management (view, create, update, delete)
  - Payment tracking and management
  - Profile synchronization between users and tutors/students

### 🔄 **In Progress Features**
- **Real-time Communication** - Basic messaging system implemented
- **Payment Integration** - Payment tracking system in place
- **Session Management** - Core booking and session tracking complete

### 📋 **Remaining Features to Implement**

#### 🎯 **Priority 1 - Core Platform Features**
- [ ] **Live Video Integration**
  - Integrate Zoom/Google Meet API for live sessions
  - Add whiteboard functionality
  - Implement screen sharing capabilities
  - Add session recording features

- [ ] **Advanced Payment System**
  - Integrate Stripe for actual payment processing
  - Implement subscription management (monthly packs)
  - Add invoice generation and management
  - Implement refund and cancellation policies
  - Add wallet system for session credits

- [ ] **Enhanced Booking System**
  - Add timezone support for international tutors
  - Implement recurring session scheduling
  - Add automatic reminder notifications
  - Implement waitlist functionality
  - Add session rescheduling with conflict detection

#### 🎨 **Priority 2 - User Experience Enhancements**
- [ ] **Advanced Search & Filtering**
  - Implement tutor search by subject, level, availability
  - Add rating and review system
  - Implement recommendation engine
  - Add advanced filtering options

- [ ] **Content Management**
  - Add file sharing system for homework and materials
  - Implement assignment submission and grading
  - Add progress tracking and analytics
  - Create learning path recommendations

- [ ] **Communication Features**
  - Add real-time chat during sessions
  - Implement video call integration
  - Add file sharing capabilities
  - Create notification system (email, SMS, push)

#### 🔧 **Priority 3 - Technical Improvements**
- [ ] **Performance Optimization**
  - Implement caching strategies
  - Add CDN for static assets
  - Optimize database queries
  - Add lazy loading for components

- [ ] **Security Enhancements**
  - Implement rate limiting
  - Add CSRF protection
  - Enhance input validation
  - Add audit logging

- [ ] **Monitoring & Analytics**
  - Add error tracking (Sentry)
  - Implement performance monitoring
  - Add user analytics and dashboards
  - Create admin reporting tools

#### 🌐 **Priority 4 - Business Features**
- [ ] **Marketing & Growth**
  - Add referral system
  - Implement loyalty programs
  - Create promotional campaigns
  - Add social media integration

- [ ] **Compliance & Legal**
  - Implement GDPR compliance
  - Add terms of service and privacy policy
  - Create tutor contracts and agreements
  - Add data retention policies

- [ ] **Multi-language Support**
  - Implement i18n for French/English
  - Add language selection
  - Translate all user interfaces
  - Add RTL support if needed

#### 📱 **Priority 5 - Mobile & Accessibility**
- [ ] **Mobile App Development**
  - Create React Native mobile app
  - Implement push notifications
  - Add offline functionality
  - Create mobile-specific features

- [ ] **Accessibility Improvements**
  - Enhance screen reader support
  - Add keyboard navigation
  - Implement high contrast mode
  - Add voice commands

#### 🧪 **Priority 6 - Testing & Quality**
- [ ] **Comprehensive Testing**
  - Add unit tests for all components
  - Implement integration tests
  - Add end-to-end testing
  - Create performance tests

- [ ] **Quality Assurance**
  - Implement automated testing pipeline
  - Add code coverage reporting
  - Create user acceptance testing
  - Add security testing

#### 📊 **Priority 7 - Analytics & Reporting**
- [ ] **Business Intelligence**
  - Add revenue tracking and reporting
  - Implement user behavior analytics
  - Create tutor performance metrics
  - Add predictive analytics

- [ ] **Admin Dashboard Enhancements**
  - Add real-time monitoring
  - Implement automated alerts
  - Create custom reporting tools
  - Add data export capabilities

## 🗄️ Database Schema

### **Core Tables**
- **users** - User accounts (students, tutors, admins)
- **user_credentials** - Secure password storage
- **tutors** - Tutor profiles and specializations
- **students** - Student profiles and academic goals
- **sessions** - Tutoring sessions and bookings
- **bookings** - Session reservations and scheduling
- **payments** - Payment tracking and commissions
- **notifications** - User notifications and alerts
- **messages** - Communication between users
- **message_threads** - Conversation threads

### **Key Relationships**
- Users → Tutors/Students (one-to-one)
- Sessions → Users (many-to-one for student and tutor)
- Payments → Sessions (one-to-one)
- Messages → Message Threads (many-to-one)

## 🎯 Next Steps & Development Roadmap

### **Immediate Priorities (Next 2-4 weeks)**
1. **Video Integration** - Implement Zoom/Google Meet for live sessions
2. **Payment Processing** - Integrate Stripe for real payments
3. **Email Notifications** - Add email reminders and confirmations
4. **Mobile Optimization** - Ensure perfect mobile experience

### **Short-term Goals (1-3 months)**
1. **Advanced Booking** - Recurring sessions, timezone support
2. **Content Management** - File sharing, assignments, progress tracking
3. **Rating System** - Tutor reviews and feedback
4. **Search & Filtering** - Advanced tutor discovery

### **Long-term Vision (3-6 months)**
1. **Mobile App** - React Native application
2. **AI Features** - Smart matching, progress recommendations
3. **Analytics Dashboard** - Business intelligence and reporting
4. **Multi-language** - Full internationalization

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
