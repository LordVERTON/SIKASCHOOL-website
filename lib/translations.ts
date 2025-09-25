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

  // Contact
  contact: {
    formTitle: string;
    fullNamePlaceholder: string;
    emailPlaceholder: string;
    subjectPlaceholder: string;
    phonePlaceholder: string;
    messagePlaceholder: string;
    consentText: string;
    sendButton: string;
    sidebarTitle: string;
    locationTitle: string;
    emailTitle: string;
    phoneTitle: string;
  };

  // Auth
  auth: {
    signin: {
      title: string;
      withGoogle: string;
      withGithub: string;
      orEmail: string;
      emailPlaceholder: string;
      passwordPlaceholder: string;
      keepSignedIn: string;
      forgotPassword: string;
      submit: string;
      noAccount: string;
      signUpLink: string;
    };
    signup?: {
      title: string;
      withGoogle: string;
      orEmail: string;
      firstNamePlaceholder: string;
      lastNamePlaceholder: string;
      emailPlaceholder: string;
      passwordPlaceholder: string;
      keepSignedIn: string;
      submit: string;
      haveAccount: string;
      signInLink: string;
    };
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
      title: 'Atteignez vos objectifs académiques',
      subtitle: 'Séance d’essai gratuite',
      description: 'Professeurs certifiés et étudiants des meilleures écoles. Programmez votre première séance GRATUITE avec un tuteur pédagogique.',
      emailPlaceholder: 'Votre e-mail',
      reserveButton: 'Commencer',
      freeTrial: 'Programmez votre première séance GRATUITE avec un tuteur pédagogique',
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
    contact: {
      formTitle: 'Envoyer un message',
      fullNamePlaceholder: 'Nom complet',
      emailPlaceholder: 'Adresse e-mail',
      subjectPlaceholder: 'Objet',
      phonePlaceholder: 'Numéro de téléphone',
      messagePlaceholder: 'Message',
      consentText: 'En cliquant, vous acceptez nos conditions d’utilisation du formulaire et l’utilisation des cookies dans votre navigateur.',
      sendButton: 'Envoyer',
      sidebarTitle: 'Nous trouver',
      locationTitle: 'Notre adresse',
      emailTitle: 'Adresse e-mail',
      phoneTitle: 'Numéro de téléphone',
    },
    auth: {
      signin: {
        title: 'Connexion à votre compte',
        withGoogle: 'Se connecter avec Google',
        withGithub: 'Se connecter avec GitHub',
        orEmail: 'Ou, connectez-vous avec votre e-mail',
        emailPlaceholder: 'Adresse e-mail',
        passwordPlaceholder: 'Mot de passe',
        keepSignedIn: 'Rester connecté',
        forgotPassword: 'Mot de passe oublié ?',
        submit: 'Se connecter',
        noAccount: "Vous n'avez pas de compte ?",
        signUpLink: "S'inscrire",
      },
      signup: {
        title: 'Créer un compte',
        withGoogle: 'S’inscrire avec Google',
        orEmail: 'Ou, inscrivez-vous avec votre e-mail',
        firstNamePlaceholder: 'Prénom',
        lastNamePlaceholder: 'Nom',
        emailPlaceholder: 'Adresse e-mail',
        passwordPlaceholder: 'Mot de passe',
        keepSignedIn: 'Rester connecté',
        submit: 'Créer le compte',
        haveAccount: 'Vous avez déjà un compte ?',
        signInLink: 'Se connecter',
      },
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
    contact: {
      formTitle: 'Send a message',
      fullNamePlaceholder: 'Full name',
      emailPlaceholder: 'Email address',
      subjectPlaceholder: 'Subject',
      phonePlaceholder: 'Phone number',
      messagePlaceholder: 'Message',
      consentText: 'By clicking, you agree to our form terms and consent to cookie usage in your browser.',
      sendButton: 'Send Message',
      sidebarTitle: 'Find us',
      locationTitle: 'Our Location',
      emailTitle: 'Email Address',
      phoneTitle: 'Phone Number',
    },
    auth: {
      signin: {
        title: 'Login to Your Account',
        withGoogle: 'Sign in with Google',
        withGithub: 'Sign in with GitHub',
        orEmail: 'Or, login with your email',
        emailPlaceholder: 'Email',
        passwordPlaceholder: 'Password',
        keepSignedIn: 'Keep me signed in',
        forgotPassword: 'Forgot Password?',
        submit: 'Log in',
        noAccount: "Don't have an account?",
        signUpLink: 'Sign Up',
      },
      signup: {
        title: 'Create an Account',
        withGoogle: 'Sign up with Google',
        orEmail: 'Or, register with your email',
        firstNamePlaceholder: 'First name',
        lastNamePlaceholder: 'Last name',
        emailPlaceholder: 'Email address',
        passwordPlaceholder: 'Password',
        keepSignedIn: 'Keep me signed in',
        submit: 'Create Account',
        haveAccount: 'Already have an account?',
        signInLink: 'Sign In',
      },
    },
  },
};
