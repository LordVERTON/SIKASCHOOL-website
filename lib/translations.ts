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
    secondaryButton: string;
    freeTrial: string;
    steps: {
      needs: string;
      schedule: string;
      learn: string;
    };
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

  stagePromo: {
    title: string;
    subtitle: string;
    description: string;
    benefitReview: string;
    benefitConsolidate: string;
    benefitConfidence: string;
    cta: string;
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
      withGithub: string;
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
      signIn: 'Mon espace',
    },
    hero: {
      title: 'Cours particuliers en ligne du collège au supérieur',
      subtitle: 'Un accompagnement adapté à chaque objectif',
      description: 'Trouvez un tuteur adapté au niveau, à la matière et aux objectifs de votre enfant ou de votre parcours.',
      emailPlaceholder: 'Votre e-mail',
      reserveButton: 'Réserver ma séance d’essai gratuite',
      secondaryButton: 'Voir les tarifs',
      freeTrial: 'Première séance gratuite · Sans engagement · Réservation en quelques étapes',
      steps: {
        needs: 'Partagez vos besoins',
        schedule: 'Choisissez un créneau',
        learn: 'Commencez à progresser',
      },
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
      title: 'Pourquoi choisir SIKASCHOOL',
      years: '5+ ans d\'expérience',
      families: '200+ familles accompagnées',
      success: '95% de mention obtenues au bac',
    },
    pricing: {
      title: 'Packs de séances',
      subtitle: 'Promo de rentrée',
      description: 'Choisissez le pack adapté : Collège, Lycée, ou Supérieur.',
      college: 'Collège',
      highSchool: 'Lycée',
      university: 'Supérieur',
      perCourse: '€/cours',
      discoverPack: 'Découvrir le pack',
      legalNotice: '*Offre de rentrée : −15 % sur les formules éligibles.',
    },
    stagePromo: {
      title: 'Offre de rentrée',
      subtitle: '−15 % sur votre accompagnement*',
      description: 'Démarrez l’année scolaire sereinement avec un accompagnement personnalisé et bénéficiez de 15 % de réduction sur les formules éligibles.',
      benefitReview: 'Revoir les notions difficiles',
      benefitConsolidate: 'Consolider ses bases',
      benefitConfidence: 'Reprendre confiance',
      cta: 'Découvrir l’offre',
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
        withGithub: 'Se connecter avec GitHub',
        emailPlaceholder: 'Adresse e-mail',
        passwordPlaceholder: 'Mot de passe',
        keepSignedIn: 'Rester connecté',
        forgotPassword: 'Mot de passe oublié ?',
        submit: 'Connexion',
        noAccount: "Vous n'avez pas de compte ?",
        signUpLink: "S'inscrire",
      },
      signup: {
        title: 'Créer un compte',
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
      signIn: 'My space',
    },
    hero: {
      title: 'Online tutoring from middle school to higher education',
      subtitle: 'Support tailored to every goal',
      description: 'Find a tutor matched to the level, subject and goals of your child or academic journey.',
      emailPlaceholder: 'Your email',
      reserveButton: 'Book my free trial session',
      secondaryButton: 'View pricing',
      freeTrial: 'First session free · No commitment · Book in a few steps',
      steps: {
        needs: 'Tell us what you need',
        schedule: 'Choose a time slot',
        learn: 'Start making progress',
      },
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
      subtitle: 'Back-to-school offer: 15% off*',
      description: 'Choose the pack that suits you: Middle School, High School, or University.',
      college: 'Middle School',
      highSchool: 'High School',
      university: 'University',
      perCourse: '€/course',
      discoverPack: 'Discover the pack',
      legalNotice: '*Back-to-school offer: 15% off eligible plans.',
    },
    stagePromo: {
      title: 'Back-to-school offer',
      subtitle: '15% off your tutoring plan*',
      description: 'Start the school year with confidence through personalised tutoring and receive 15% off eligible plans.',
      benefitReview: 'Review difficult topics',
      benefitConsolidate: 'Strengthen the basics',
      benefitConfidence: 'Regain confidence',
      cta: 'Discover the offer',
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
        withGithub: 'Sign in with GitHub',
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
