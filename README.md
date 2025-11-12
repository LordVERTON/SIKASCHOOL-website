# SikaSchool - Next.js Platform (based on Solid template)

This project is a comprehensive Next.js 15+ (App Router) educational platform aligned with the SikaSchool structure and content while preserving the original Solid template design system (Tailwind CSS, dark mode, animations).

- **Stack**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Framer Motion, Swiper, LiveKit, Supabase
- **Design system**: Original Solid template styles retained; content updated to match SikaSchool
- **Live content modeled from**: `https://www.sikaschool.com/`
- **Platform URL**: `https://sikaschool.app` - The platform is accessible at this address

## What's included
- **Homepage sections**: Hero, About (Nos méthodes), Fun Facts (Quelques Chiffres), Témoignages, Pricing (Packs de séances), Contact
- **Header navigation**: `Accueil`, `Comment ça marche`, `Qui sommes nous ?`, `Packs de séances`, `A la séance`, `Se connecter`
- **CTAs**: `Se connecter` and `Réserver` in the header
- **Theming**: Light/Dark mode toggle preserved
- **Authentication**: Complete login/signup system with role-based access
- **Lead Capture**: Automatic student account creation from registration form
- **Student Portal**: Full dashboard with booking, history, tutor selection, notifications, and messaging
- **Tutor Portal**: Complete tutor management interface with admin capabilities
- **Admin Panel**: Comprehensive administration system for user, session, and assignment management
- **Database**: Full Supabase integration with real-time data synchronization
- **Live Sessions**: LiveKit integration for real-time video tutoring sessions
- **Real-time Notifications**: Instant notifications for students, tutors, and admins

Removed (from the original template): Blog pages/components and Docs page.

## 🏗️ Technical Architecture

### **Frontend Stack**
- **Next.js 15** - App Router with TypeScript
- **React 19** - Latest React features and hooks
- **Tailwind CSS 4** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Swiper** - Touch slider for testimonials and carousels
- **React Hot Toast** - Toast notifications
- **LiveKit Components** - Real-time video and audio components

### **Backend & Database**
- **Supabase** - PostgreSQL database with real-time features
  - Real-time subscriptions for notifications
  - Row-level security policies
  - Database functions and triggers
- **Custom Authentication** - Secure session management with bcryptjs
- **API Routes** - RESTful endpoints for all operations
- **TypeScript** - End-to-end type safety
- **LiveKit** - Real-time video/audio infrastructure for live tutoring sessions

### **Key Features**
- **Role-Based Access Control** - Students, Tutors, and Admins with granular permissions
- **Real-time Data Sync** - Live updates across all interfaces using Supabase Realtime
- **Responsive Design** - Mobile-first approach with optimized layouts
- **Dark/Light Theme** - User preference support with system detection
- **Internationalization** - French/English support ready
- **Security** - Input validation, password hashing, secure sessions, CSRF protection
- **Real-time Notifications** - Instant notifications with unread badges
- **Live Video Sessions** - LiveKit integration for interactive tutoring

## Project structure (key files)
- `app/(site)/page.tsx`: Homepage composition with anchors `#about`, `#how-it-works`, `#pricing`, `#contact`
- `app/(site)/donnees-personnelles/page.tsx`: Privacy policy page
- `components/Header/menuData.tsx`: Navigation items aligned to SikaSchool
- `components/Header/index.tsx`: Header with CTAs `Se connecter` and `Réserver`
- `components/Hero/index.tsx`: Updated hero copy with lead capture modal
- `components/Booking/LeadCaptureModal.tsx`: Registration form with automatic account creation
- `components/Auth/SimpleSignin.tsx`: Sign-in form with password visibility toggle
- `components/Auth/ForgotPasswordModal.tsx`: Password reset functionality
- `app/student/`: Complete student portal (dashboard, calendar, history, messages, notifications, profile, tutors)
- `app/tutor/`: Complete tutor portal (dashboard, calendar, students, messages, notifications, administration)
- `app/api/`: Comprehensive API routes for all operations
- `hooks/useUnreadNotifications.ts`: Real-time notification count hook for students
- `hooks/useUnreadAdminNotifications.ts`: Real-time notification count hook for admins/tutors

## Getting started

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Supabase account and project
- LiveKit account (for video sessions)

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

4. Configure environment variables in `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# LiveKit
LIVEKIT_URL=your_livekit_url
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

5. Configure Supabase:
   - Create a new Supabase project
   - Run the database schema from `supabase/` directory
   - Set up Row Level Security policies
   - Configure real-time subscriptions

6. Configure LiveKit:
   - Create a LiveKit account
   - Set up your LiveKit server
   - Add credentials to `.env.local`
   - See `docs/LIVEKIT_SETUP.md` for detailed setup

7. Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

**Production URL**: The platform is live and accessible at [https://sikaschool.app](https://sikaschool.app)

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
- `POST /api/auth/signup` - User registration
- `POST /api/auth/forgot-password` - Password reset request

### **Lead Capture**
- `POST /api/leads` - Create lead and student account automatically
  - Generates initial password: `<firstname>.<lastname>12345`
  - Creates user and student profile
  - Stores intake information
  - Sends notifications to admins

### **Student APIs**
- `GET /api/student/dashboard` - Student dashboard data
- `GET /api/student/profile` - Get/update student profile
- `GET /api/student/tutors` - Available tutors list
- `GET /api/student/assigned-tutors` - Assigned tutors
- `GET /api/student/notifications` - Student notifications (real-time)
- `PATCH /api/student/notifications` - Mark notifications as read
- `GET /api/student/calendar` - Calendar events
- `GET /api/student/messages` - Message threads
- `POST /api/student/messages/[threadId]` - Send message
- `GET /api/student/sessions` - Student sessions

### **Tutor APIs**
- `GET /api/tutor/dashboard` - Tutor dashboard data
- `GET /api/tutor/students` - Assigned students with intake details
- `GET /api/tutor/notifications` - Tutor/admin notifications (real-time)
- `PATCH /api/tutor/notifications` - Mark notifications as read
- `GET /api/tutor/messages` - Message threads
- `POST /api/tutor/messages/[threadId]` - Send message
- `GET /api/tutor/sessions` - Tutor sessions
- `GET /api/tutor/payments/*` - Payment tracking

### **Admin APIs**
- `GET /api/admin/users` - Manage all users
- `POST /api/admin/users` - Create new user
- `PUT /api/admin/users/[userId]` - Update user
- `DELETE /api/admin/users/[userId]` - Delete user
- `POST /api/admin/users/[userId]/reset-password` - Reset user password
- `POST /api/admin/users/[userId]/toggle-status` - Toggle user active status
- `GET /api/admin/sessions` - Manage all sessions
- `POST /api/admin/sessions` - Create session
- `PUT /api/admin/sessions/[sessionId]` - Update session
- `DELETE /api/admin/sessions/[sessionId]` - Delete session
- `GET /api/admin/assignments` - View all assignments
- `POST /api/admin/assignments/assign` - Assign tutor to student
- `DELETE /api/admin/assignments/unassign` - Unassign tutor from student
- `POST /api/admin/sync-profiles` - Sync user profiles

### **LiveKit APIs**
- `POST /api/livekit/token` - Generate LiveKit access token for sessions

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
- ✅ Password hashing with bcryptjs
- ✅ Secure session management

## Customization
- Update navigation items in `components/Header/menuData.tsx`.
- Edit homepage sections in `app/(site)/page.tsx` and the respective components under `components/`.
- Images live in `public/images/**`. Replace with your own assets as needed.
- Colors/spacing/typography are Tailwind-based; tweak via classes in components or Tailwind config.

## Deployment
- **Production URL**: The platform is live at [https://sikaschool.app](https://sikaschool.app)
- Recommended platforms: `Vercel` or `Netlify` for Next.js.
- Ensure environment variables are configured in the hosting provider.
- Set up Supabase and LiveKit production instances.
- Configure domain and SSL certificates.

## 🚀 Current Status - Platform Features Implemented

### ✅ **Completed Features**

#### **Authentication & User Management**
- **Custom Authentication System** - Secure auth with Supabase backend
  - Email/password login for students and tutors
  - Role-based access control (STUDENT, TUTOR, ADMIN)
  - Session management with secure cookies
  - Password hashing with bcryptjs
  - Password visibility toggle in forms
  - Forgot password functionality with automatic password reset
  - Initial password generation: `<firstname>.<lastname>12345`

#### **Lead Capture & Registration**
- **Automatic Account Creation** - From registration form
  - Lead capture modal on homepage
  - Automatic student account creation
  - Password generation and display
  - Email pre-filling for sign-in
  - Privacy policy link integration
  - Intake information storage (civility, guardian info, goals, etc.)
  - Admin notifications for new registrations

#### **Student Portal**
- **Complete Student Dashboard**
  - Personalized dashboard with statistics
  - Course management and progress tracking
  - Tutor selection and booking system
  - Session history and ratings
  - Calendar integration
  - Profile management with intake details display
  - Assigned tutors view

- **Real-time Notifications**
  - Profile creation notifications
  - Tutor assignment notifications
  - Session confirmations, cancellations, and modifications
  - Password reset history
  - Unread badge in sidebar
  - Real-time updates via Supabase Realtime

- **Messaging System**
  - Thread-based messaging with tutors
  - Real-time message notifications
  - Message history and search

#### **Tutor Portal**
- **Complete Tutor Dashboard**
  - Tutor profile management
  - Student management with detailed intake information
  - Session tracking and management
  - Availability management
  - Payment tracking and commission calculations
  - Calendar view

- **Administration Panel** (for admin tutors)
  - User management (create, update, delete, reset passwords, toggle status)
  - Session management (view, create, update, delete)
  - Assignment management (assign/unassign tutors to students)
  - Payment tracking and management
  - Profile synchronization between users and tutors/students
  - Direct navigation from notifications to assignments

- **Real-time Notifications**
  - New student registration alerts
  - Assignment requests
  - Session updates
  - Message notifications
  - Unread badge in sidebar

#### **Database Integration**
- **Full Supabase Backend**
  - User management (students, tutors, admins)
  - Session tracking and booking system
  - Payment management with commission calculations
  - Real-time data synchronization
  - Comprehensive API endpoints
  - Notification system with real-time subscriptions
  - Message threads and conversations
  - Assignment tracking (tutor-student relationships)

#### **Live Video Sessions**
- **LiveKit Integration**
  - Real-time video/audio infrastructure
  - Access token generation
  - Session room management
  - Live class pages with video components

#### **Privacy & Compliance**
- **Data Protection**
  - Privacy policy page (`/donnees-personnelles`)
  - GDPR-compliant data handling
  - Secure data storage
  - User consent management

### 🔄 **In Progress Features**
- **Live Video Sessions** - LiveKit integration in place, UI enhancements ongoing
- **Payment Integration** - Payment tracking system in place, Stripe integration pending
- **Email Notifications** - System ready, email service integration pending

### 📋 **Remaining Features to Implement**

#### 🎯 **Priority 1 - Core Platform Features**
- [ ] **Stripe Payment Integration**
  - Integrate Stripe for actual payment processing
  - Implement subscription management (monthly packs)
  - Add invoice generation and management
  - Implement refund and cancellation policies
  - Add wallet system for session credits

- [ ] **Enhanced Booking System**
  - Add timezone support for international tutors
  - Implement recurring session scheduling
  - Add automatic reminder notifications (email/SMS)
  - Implement waitlist functionality
  - Add session rescheduling with conflict detection

- [ ] **LiveKit UI Enhancements**
  - Complete video session UI
  - Add whiteboard functionality
  - Implement screen sharing capabilities
  - Add session recording features
  - Chat during live sessions

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

- [ ] **Communication Enhancements**
  - Add real-time chat during sessions
  - Implement file sharing capabilities
  - Add voice message support
  - Create notification preferences (email, SMS, push)

#### 🔧 **Priority 3 - Technical Improvements**
- [ ] **Performance Optimization**
  - Implement caching strategies
  - Add CDN for static assets
  - Optimize database queries
  - Add lazy loading for components
  - Implement image optimization

- [ ] **Security Enhancements**
  - Implement rate limiting
  - Add CSRF protection
  - Enhance input validation
  - Add audit logging
  - Implement 2FA (optional)

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
  - Complete GDPR compliance features
  - Add terms of service page
  - Create tutor contracts and agreements
  - Add data retention policies
  - Implement data export functionality

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
  - Authentication and basic profile information
  - Role-based access control
  - Active/inactive status management

- **students** - Student profiles and academic information
  - Grade level, academic goals
  - Learning style and intake details (JSON)
  - Contact information and preferences

- **tutors** - Tutor profiles and specializations
  - Bio, experience, subjects
  - Availability and rates
  - Commission settings

- **sessions** - Tutoring sessions and bookings
  - Session details (subject, level, type, duration)
  - Status tracking (SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED)
  - Ratings and feedback

- **assignments** - Tutor-student relationships
  - Assignment tracking
  - Active/inactive status
  - Assignment history

- **notifications** - User notifications and alerts
  - Real-time notification system
  - Multiple notification types (PROFILE, PASSWORD, SESSION_UPDATE, TUTOR_ASSIGNMENT, SYSTEM, MESSAGE, BOOKING)
  - Read/unread status
  - JSON data payload for context

- **message_threads** - Conversation threads
  - Thread metadata
  - Participant management

- **messages** - Communication between users
  - Message content and metadata
  - Thread associations

- **session_payments** - Payment tracking
  - Payment amounts and status
  - Commission calculations
  - Payment history

### **Key Relationships**
- Users → Tutors/Students (one-to-one)
- Sessions → Users (many-to-one for student and tutor)
- Assignments → Users (many-to-many for tutors and students)
- Notifications → Users (many-to-one)
- Messages → Message Threads (many-to-one)
- Payments → Sessions (one-to-one)

## 🎯 Next Steps & Development Roadmap

### **Immediate Priorities (Next 2-4 weeks)**
1. **Stripe Payment Integration** - Implement real payment processing
2. **Email Notifications** - Add email service for reminders and confirmations
3. **LiveKit UI Completion** - Finish video session interface
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

## 📚 Documentation
- [Development Guide](DEVELOPMENT.md) - Comprehensive development guidelines
- [Security Policy](SECURITY.md) - Security measures and best practices
- [Supabase Setup](docs/SUPABASE_SETUP.md) - Database setup and configuration
- [LiveKit Setup](docs/LIVEKIT_SETUP.md) - Video session setup guide
- [Student Section Guide](README_student_section.md) - Student portal documentation

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
- `db:types`: generate TypeScript types from Supabase schema

## License
This repository began from the Solid Next.js template. The customizations for SikaSchool are open for personal or commercial use in the context of this project. Please review the original Solid template license in `LICENSE`.

## Acknowledgements
- Base template: Solid by Next.js Templates
- Content inspiration: SikaSchool (`https://www.sikaschool.com/`)
- Video infrastructure: LiveKit
- Database & Backend: Supabase
