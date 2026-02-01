export type Locale = 'fr' | 'en' | 'es';

export const locales: Locale[] = ['fr', 'en', 'es'];

export const languages = [
  { code: 'fr' as Locale, label: 'Français', flag: '🇫🇷' },
  { code: 'en' as Locale, label: 'English', flag: '🇬🇧' },
  { code: 'es' as Locale, label: 'Español', flag: '🇪🇸' },
];

// Translations organized by namespace
export const translations: Record<Locale, Record<string, string>> = {
  fr: {
    // Navigation
    "nav.howItWorks": "Comment ça marche",
    "nav.features": "Fonctionnalités",
    "nav.testimonials": "Témoignages",
    "nav.pricing": "Tarifs",
    "nav.faq": "FAQ",
    "nav.about": "À propos",
    "nav.blog": "Blog",
    "nav.contact": "Contact",
    "nav.signin": "Se connecter",
    "nav.start": "Démarrer",
    "nav.startFree": "Démarrer gratuitement",

    // Hero
    "hero.badge": "Nouveau : Analyse vocale IA disponible",
    "hero.title": "Votre Santé,",
    "hero.titleHighlight": "Propulsée par l'Intelligence Artificielle",
    "hero.subtitle": "VitaSync analyse vos besoins en temps réel pour créer la routine de compléments parfaite, adaptée à votre mode de vie.",
    "hero.cta": "Démarrer mon bilan gratuit",
    "hero.secondary": "Comment ça marche",

    // Features
    "features.badge": "Technologie de pointe",
    "features.title": "Une IA qui",
    "features.titleHighlight": "comprend vraiment",
    "features.titleEnd": "votre corps",
    "features.subtitle": "Découvrez les fonctionnalités qui font de VitaSync le coach santé le plus avancé du marché.",

    // Pricing
    "pricing.title": "Tarification simple",
    "pricing.subtitle": "Choisissez votre niveau d'intelligence",
    "pricing.free": "Gratuit",
    "pricing.freePrice": "0€",
    "pricing.freeForever": "Pour toujours",
    "pricing.premium": "Premium IA",
    "pricing.premiumPrice": "7,99€",
    "pricing.perMonth": "/mois",
    "pricing.startFree": "Commencer gratuitement",
    "pricing.upgrade": "Passer au Premium",
    "pricing.recommended": "Recommandé",
    "pricing.compare": "Comparer en détail",

    // FAQ
    "faq.title": "Questions fréquentes",
    "faq.subtitle": "Tout ce que vous devez savoir sur VitaSync",

    // Auth
    "auth.signin": "Se connecter",
    "auth.signup": "Créer un compte",
    "auth.email": "Email",
    "auth.password": "Mot de passe",
    "auth.forgotPassword": "Mot de passe oublié ?",
    "auth.noAccount": "Pas encore de compte ?",
    "auth.hasAccount": "Déjà un compte ?",

    // Common
    "common.loading": "Chargement...",
    "common.error": "Une erreur est survenue",
    "common.success": "Succès",
    "common.cancel": "Annuler",
    "common.confirm": "Confirmer",
    "common.save": "Enregistrer",
    "common.continue": "Continuer",
    "common.back": "Retour",
    "common.next": "Suivant",
    "common.skip": "Passer",
    "common.finish": "Terminer",
  },
  en: {
    // Navigation
    "nav.howItWorks": "How it works",
    "nav.features": "Features",
    "nav.testimonials": "Testimonials",
    "nav.pricing": "Pricing",
    "nav.faq": "FAQ",
    "nav.about": "About",
    "nav.blog": "Blog",
    "nav.contact": "Contact",
    "nav.signin": "Sign in",
    "nav.start": "Get Started",
    "nav.startFree": "Start for free",

    // Hero
    "hero.badge": "New: AI Voice Analysis available",
    "hero.title": "Your Health,",
    "hero.titleHighlight": "Powered by Artificial Intelligence",
    "hero.subtitle": "VitaSync analyzes your needs in real-time to create the perfect supplement routine, tailored to your lifestyle.",
    "hero.cta": "Start my free assessment",
    "hero.secondary": "How it works",

    // Features
    "features.badge": "Cutting-edge technology",
    "features.title": "An AI that",
    "features.titleHighlight": "truly understands",
    "features.titleEnd": "your body",
    "features.subtitle": "Discover the features that make VitaSync the most advanced health coach on the market.",

    // Pricing
    "pricing.title": "Simple pricing",
    "pricing.subtitle": "Choose your intelligence level",
    "pricing.free": "Free",
    "pricing.freePrice": "$0",
    "pricing.freeForever": "Forever",
    "pricing.premium": "AI Premium",
    "pricing.premiumPrice": "$7.99",
    "pricing.perMonth": "/month",
    "pricing.startFree": "Start for free",
    "pricing.upgrade": "Upgrade to Premium",
    "pricing.recommended": "Recommended",
    "pricing.compare": "Compare in detail",

    // FAQ
    "faq.title": "Frequently asked questions",
    "faq.subtitle": "Everything you need to know about VitaSync",

    // Auth
    "auth.signin": "Sign in",
    "auth.signup": "Create account",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.forgotPassword": "Forgot password?",
    "auth.noAccount": "Don't have an account?",
    "auth.hasAccount": "Already have an account?",

    // Common
    "common.loading": "Loading...",
    "common.error": "An error occurred",
    "common.success": "Success",
    "common.cancel": "Cancel",
    "common.confirm": "Confirm",
    "common.save": "Save",
    "common.continue": "Continue",
    "common.back": "Back",
    "common.next": "Next",
    "common.skip": "Skip",
    "common.finish": "Finish",
  },
  es: {
    // Navigation
    "nav.howItWorks": "Cómo funciona",
    "nav.features": "Características",
    "nav.testimonials": "Testimonios",
    "nav.pricing": "Precios",
    "nav.faq": "FAQ",
    "nav.about": "Acerca de",
    "nav.blog": "Blog",
    "nav.contact": "Contacto",
    "nav.signin": "Iniciar sesión",
    "nav.start": "Comenzar",
    "nav.startFree": "Comenzar gratis",

    // Hero
    "hero.badge": "Nuevo: Análisis de voz IA disponible",
    "hero.title": "Tu Salud,",
    "hero.titleHighlight": "Impulsada por la Inteligencia Artificial",
    "hero.subtitle": "VitaSync analiza tus necesidades en tiempo real para crear la rutina de suplementos perfecta, adaptada a tu estilo de vida.",
    "hero.cta": "Comenzar mi evaluación gratuita",
    "hero.secondary": "Cómo funciona",

    // Features
    "features.badge": "Tecnología de vanguardia",
    "features.title": "Una IA que",
    "features.titleHighlight": "realmente entiende",
    "features.titleEnd": "tu cuerpo",
    "features.subtitle": "Descubre las características que hacen de VitaSync el coach de salud más avanzado del mercado.",

    // Pricing
    "pricing.title": "Precios simples",
    "pricing.subtitle": "Elige tu nivel de inteligencia",
    "pricing.free": "Gratis",
    "pricing.freePrice": "0€",
    "pricing.freeForever": "Para siempre",
    "pricing.premium": "Premium IA",
    "pricing.premiumPrice": "7,99€",
    "pricing.perMonth": "/mes",
    "pricing.startFree": "Comenzar gratis",
    "pricing.upgrade": "Actualizar a Premium",
    "pricing.recommended": "Recomendado",
    "pricing.compare": "Comparar en detalle",

    // FAQ
    "faq.title": "Preguntas frecuentes",
    "faq.subtitle": "Todo lo que necesitas saber sobre VitaSync",

    // Auth
    "auth.signin": "Iniciar sesión",
    "auth.signup": "Crear cuenta",
    "auth.email": "Correo electrónico",
    "auth.password": "Contraseña",
    "auth.forgotPassword": "¿Olvidaste tu contraseña?",
    "auth.noAccount": "¿No tienes cuenta?",
    "auth.hasAccount": "¿Ya tienes cuenta?",

    // Common
    "common.loading": "Cargando...",
    "common.error": "Ocurrió un error",
    "common.success": "Éxito",
    "common.cancel": "Cancelar",
    "common.confirm": "Confirmar",
    "common.save": "Guardar",
    "common.continue": "Continuar",
    "common.back": "Atrás",
    "common.next": "Siguiente",
    "common.skip": "Saltar",
    "common.finish": "Terminar",
  },
};

export function getTranslation(locale: Locale, key: string): string {
  return translations[locale][key] || key;
}

export function detectBrowserLocale(): Locale {
  if (typeof navigator === 'undefined') return 'fr';
  
  const browserLang = navigator.language.split('-')[0];
  if (locales.includes(browserLang as Locale)) {
    return browserLang as Locale;
  }
  return 'fr';
}
