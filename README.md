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

## Scripts
- `dev`: start development server
- `build`: build production bundle
- `start`: start production server
- `lint`: run lints (if configured)

## License
This repository began from the Solid Next.js template. The customizations for SikaSchool are open for personal or commercial use in the context of this project. Please review the original Solid template license in `LICENSE`.

## Acknowledgements
- Base template: Solid by Next.js Templates
- Content inspiration: SikaSchool (`https://www.sikaschool.com/`)
