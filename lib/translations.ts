/**
 * Translation system for SikaSchool
 */

export type Language = 'fr' | 'en';

export interface Translations {
  // Navigation
  nav: {
    home: string;
    howItWorks: string;
    aboutUs: string;
    sessionPacks: string;
    perSession: string;
    signIn: string;
  };
  
  // Hero Section
  hero: {
    title: string;
    subtitle: string;
    description: string;
    emailPlaceholder: string;
    reserveButton: string;
    freeTrial: string;
  };
  
  // About Section
  about: {
    title: string;
    subtitle: string;
    methods: {
      understand: {
        title: string;
        description: string;
      };
      progress: {
        title: string;
        description: string;
      };
      succeed: {
        title: string;
        description: string;
      };
    };
    qualifications: string;
  };
  
  // Fun Facts
  funFacts: {
    title: string;
    years: string;
    families: string;
    success: string;
  };
  
  // Pricing
  pricing: {
    title: string;
    subtitle: string;
    description: string;
    college: string;
    highSchool: string;
    university: string;
    perCourse: string;
    discoverPack: string;
    legalNotice: string;
  };
  
  // Testimonials
  testimonials: {
    title: string;
    subtitle: string;
    quote: string;
    author: string;
    location: string;
  };
  
  // Footer
  footer: {
    description: string;
    contact: string;
    quickLinks: string;
    support: string;
    newsletter: string;
    newsletterDescription: string;
    newsletterPlaceholder: string;
    privacyPolicy: string;
    supportLink: string;
    copyright: string;
    language: string;
  };
  
  // Common
  common: {
    loading: string;
    error: string;
    success: string;
    cancel: string;
    confirm: string;
    save: string;
    back: string;
    next: string;
    close: string;
  };
}

export const translations: Record<Language, Translations> = {
  fr: {
    nav: {
      home: 'Accueil',
      howItWorks: 'Comment ça marche',
      aboutUs: 'Qui sommes nous ?',
      sessionPacks: 'Packs de séances',
      perSession: 'A la séance',
      signIn: 'Se connecter',
    },
    hero: {
      title: 'Comprendre, Progresser, Réussir',
      subtitle: 'Séance d\'essai gratuite',
      description: 'Professeurs certifiés et étudiants des meilleures universités. Programmez votre première séance GRATUITE avec un tuteur pédagogique.',
      emailPlaceholder: 'Votre e-mail',
      reserveButton: 'Réserver',
      freeTrial: 'Essayez gratuitement, sans carte bancaire.',
    },
    about: {
      title: 'Nos Méthodes',
      subtitle: 'Une approche pédagogique éprouvée',
      methods: {
        understand: {
          title: 'Comprendre',
          description: 'Identifier les difficultés et les besoins spécifiques de chaque élève.',
        },
        progress: {
          title: 'Progresser',
          description: 'Mettre en place des stratégies d\'apprentissage personnalisées.',
        },
        succeed: {
          title: 'Réussir',
          description: 'Atteindre les objectifs académiques avec confiance et sérénité.',
        },
      },
      qualifications: 'Nos tuteurs sont certifiés et sélectionnés pour leur expertise pédagogique.',
    },
    funFacts: {
      title: 'Quelques Chiffres...',
      years: '5+ ans d\'expérience',
      families: '200+ familles accompagnées',
      success: '95% de mention obtenues au bac',
    },
    pricing: {
      title: 'Packs de séances',
      subtitle: 'Promo de rentrée*',
      description: 'Choisissez le pack adapté : Collège, Lycée, ou Supérieur.',
      college: 'Collège',
      highSchool: 'Lycée',
      university: 'Supérieur',
      perCourse: '€/cours',
      discoverPack: 'Découvrir le pack',
      legalNotice: '*offre réservée à l\'achat de deux cours par semaine.',
    },
    testimonials: {
      title: 'Témoignages',
      subtitle: 'Ce que disent nos familles',
      quote: 'SikaSchool a transformé l\'approche de mon fils face aux mathématiques. Les résultats sont visibles dès les premières séances.',
      author: 'Hélène',
      location: 'Paris',
    },
    footer: {
      description: 'SikaSchool accompagne les élèves dans leur réussite scolaire avec des tuteurs qualifiés et une approche pédagogique personnalisée.',
      contact: 'Contact',
      quickLinks: 'Liens rapides',
      support: 'Support',
      newsletter: 'Newsletter',
      newsletterDescription: 'Abonnez-vous pour recevoir nos dernières actualités',
      newsletterPlaceholder: 'Adresse e-mail',
      privacyPolicy: 'Politique de confidentialité',
      supportLink: 'Support',
      copyright: 'SikaSchool. Tous droits réservés',
      language: 'Langue',
    },
    common: {
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
      cancel: 'Annuler',
      confirm: 'Confirmer',
      save: 'Enregistrer',
      back: 'Retour',
      next: 'Suivant',
      close: 'Fermer',
    },
  },
  en: {
    nav: {
      home: 'Home',
      howItWorks: 'How it works',
      aboutUs: 'About us',
      sessionPacks: 'Session packs',
      perSession: 'Per session',
      signIn: 'Sign in',
    },
    hero: {
      title: 'Understand, Progress, Succeed',
      subtitle: 'Free trial session',
      description: 'Certified teachers and students from the best universities. Schedule your first FREE session with an educational tutor.',
      emailPlaceholder: 'Your email',
      reserveButton: 'Reserve',
      freeTrial: 'Try for free, no credit card required.',
    },
    about: {
      title: 'Our Methods',
      subtitle: 'A proven pedagogical approach',
      methods: {
        understand: {
          title: 'Understand',
          description: 'Identify the difficulties and specific needs of each student.',
        },
        progress: {
          title: 'Progress',
          description: 'Implement personalized learning strategies.',
        },
        succeed: {
          title: 'Succeed',
          description: 'Achieve academic goals with confidence and serenity.',
        },
      },
      qualifications: 'Our tutors are certified and selected for their pedagogical expertise.',
    },
    funFacts: {
      title: 'Some Numbers...',
      years: '5+ years of experience',
      families: '200+ families supported',
      success: '95% of honors obtained at baccalaureate',
    },
    pricing: {
      title: 'Session packs',
      subtitle: 'Back to school promo*',
      description: 'Choose the pack that suits you: Middle School, High School, or University.',
      college: 'Middle School',
      highSchool: 'High School',
      university: 'University',
      perCourse: '€/course',
      discoverPack: 'Discover the pack',
      legalNotice: '*offer reserved for the purchase of two courses per week.',
    },
    testimonials: {
      title: 'Testimonials',
      subtitle: 'What our families say',
      quote: 'SikaSchool transformed my son\'s approach to mathematics. The results are visible from the first sessions.',
      author: 'Helen',
      location: 'Paris',
    },
    footer: {
      description: 'SikaSchool supports students in their academic success with qualified tutors and a personalized pedagogical approach.',
      contact: 'Contact',
      quickLinks: 'Quick Links',
      support: 'Support',
      newsletter: 'Newsletter',
      newsletterDescription: 'Subscribe to receive our latest news',
      newsletterPlaceholder: 'Email address',
      privacyPolicy: 'Privacy Policy',
      supportLink: 'Support',
      copyright: 'SikaSchool. All rights reserved',
      language: 'Language',
    },
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      back: 'Back',
      next: 'Next',
      close: 'Close',
    },
  },
};
