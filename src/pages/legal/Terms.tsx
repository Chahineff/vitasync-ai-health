import { LegalPageLayout } from "@/components/layout/LegalPageLayout";
import { useTranslation } from "@/hooks/useTranslation";
import type { Locale } from "@/lib/i18n";

type LegalContent = {
  title: string;
  subtitle: string;
  date: string;
  body: React.ReactNode;
};

const FDA_DISCLAIMER_EN =
  "These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.";

const buildContent = (locale: "fr" | "en"): LegalContent => {
  if (locale === "fr") {
    return {
      title: "Conditions d'utilisation",
      subtitle: "Règles régissant l'utilisation de la plateforme VitaSync",
      date: "8 avril 2026",
      body: (
        <>
          <h2>1. Préambule et Objet</h2>
          <p>Les présentes Conditions d'utilisation (« Conditions ») régissent l'accès à et l'utilisation de la plateforme VitaSync, accessible à l'adresse vitasync.ai (la « Plateforme »). VitaSync est une plateforme de bien-être et de nutrition propulsée par l'intelligence artificielle, proposant un coach IA personnalisé, le suivi de compléments alimentaires, l'analyse informationnelle de bilans sanguins, une boutique de compléments en ligne et des outils de bien-être quotidien.</p>

          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 my-6">
            <p className="text-foreground font-medium">
              ⚠️ AVERTISSEMENT IMPORTANT : VitaSync est une plateforme d'information sur le bien-être et le mode de vie. Ce n'est PAS un dispositif médical au sens du Règlement (UE) 2017/745 (MDR) ni du <span lang="en">US FDA 21 CFR Part 820</span>. Les informations et recommandations fournies ne constituent PAS un avis médical, un diagnostic ou un traitement. VitaSync n'est PAS un service de prescription. Consultez toujours un professionnel de santé qualifié avant toute décision concernant votre santé ou votre alimentation.
            </p>
          </div>

          <p>En créant un compte ou en utilisant la Plateforme, l'Utilisateur accepte sans réserve les présentes Conditions ainsi que la Politique de Confidentialité, la Politique de Cookies et, le cas échéant, les Conditions Générales de Vente.</p>

          <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 my-4">
            <p className="text-foreground">
              <strong>Champ d'application géographique :</strong> La Plateforme (coach IA, suivi) est accessible internationalement. Toutefois, la boutique VitaSync livre exclusivement aux États-Unis (48 États contigus, hors Alaska et Hawaii) via notre partenaire logistique Supliful. Les utilisateurs hors USA peuvent utiliser le coach IA en mode freemium ou par abonnement, mais ne peuvent pas commander de produits physiques.
            </p>
          </div>

          <h2>2. Définitions</h2>
          <ul>
            <li><strong>« Plateforme »</strong> : le site VitaSync et l'ensemble de ses fonctionnalités.</li>
            <li><strong>« Utilisateur »</strong> : toute personne physique majeure (18 ans ou plus) inscrite sur la Plateforme.</li>
            <li><strong>« Coach IA »</strong> : l'assistant d'intelligence artificielle de VitaSync, propulsé par les modèles Google Gemini.</li>
            <li><strong>« Stack »</strong> : l'ensemble des compléments alimentaires suivis par un Utilisateur.</li>
            <li><strong>« Check-in »</strong> : le journal de bien-être quotidien renseigné par l'Utilisateur.</li>
            <li><strong>« Produits »</strong> : les compléments alimentaires vendus via la boutique VitaSync (livraison USA uniquement).</li>
            <li><strong>« Système d'IA »</strong> : tout composant utilisant l'intelligence artificielle (Coach, analyses sanguines, recommandations).</li>
          </ul>

          <h2>3. Inscription et Compte Utilisateur</h2>
          <p>3.1 L'inscription est réservée aux personnes majeures (18 ans ou plus). L'Utilisateur s'engage à fournir des informations exactes et à jour. Les mots de passe doivent contenir au moins 8 caractères, dont une majuscule, un chiffre et un caractère spécial.</p>
          <p>3.2 Après inscription, l'Utilisateur est invité à compléter un questionnaire santé (onboarding) afin de bénéficier de recommandations personnalisées. Ce questionnaire est facultatif mais nécessaire pour recevoir des recommandations adaptées.</p>
          <p>3.3 L'Utilisateur peut demander la suppression de son compte à tout moment depuis les paramètres du dashboard. Cette suppression entraîne l'effacement de l'ensemble des données conformément à la Politique de Confidentialité et aux lois applicables (RGPD Art. 17 pour les utilisateurs UE ; <span lang="en">CCPA/CPRA</span> pour les résidents de Californie).</p>

          <h2>4. Description des Services</h2>

          <h3>4.1 Coach IA VitaSync</h3>
          <p>Le Coach IA est un assistant conversationnel de bien-être et de nutrition fournissant des recommandations personnalisées basées sur le profil de l'Utilisateur. Plusieurs niveaux de modèle sont disponibles selon l'abonnement : Free (Lite) et Pro (accès complet au coach IA avancé).</p>
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 my-4">
            <p className="text-foreground">
              <strong>Transparence IA (EU AI Act, Art. 50) :</strong> Vous interagissez avec un système d'intelligence artificielle propulsé par Google Gemini. Il ne s'agit pas d'un professionnel de santé humain. Toutes les réponses sont générées par une technologie d'IA. Les recommandations sont fournies à titre informatif et éducatif uniquement.
            </p>
          </div>

          <h3>4.2 Suivi des compléments</h3>
          <p>L'Utilisateur peut ajouter, suivre et gérer ses compléments alimentaires quotidiens avec des rappels de prise. Un système de journal permet de suivre l'observance dans le temps.</p>

          <h3>4.3 Analyse de bilans sanguins (information uniquement)</h3>
          <p>L'Utilisateur peut téléverser des résultats d'analyses sanguines au format PDF. L'IA fournit un contexte éducatif général concernant les valeurs. Cette fonctionnalité ne constitue PAS une interprétation médicale, un diagnostic ou une évaluation clinique. Seul un professionnel de santé qualifié peut interpréter correctement les résultats dans le contexte d'un dossier médical complet.</p>

          <h3>4.4 Boutique VitaSync (USA uniquement)</h3>
          <p>VitaSync propose un catalogue de compléments alimentaires via Shopify, avec livraison exclusive aux États-Unis. Les conditions d'achat sont régies par les Conditions Générales de Vente et la Politique de Livraison & Retours.</p>

          <h2>5. Limitations de Responsabilité</h2>
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 my-4">
            <p className="text-foreground font-medium">⚠️ VitaSync n'est PAS un service médical. La Plateforme ne se substitue en aucun cas à une consultation médicale.</p>
          </div>
          <p>VitaSync décline toute responsabilité pour les dommages résultant de l'utilisation de recommandations IA sans validation préalable par un professionnel de santé.</p>
          <ul>
            <li>VitaSync ne garantit pas l'exactitude des analyses IA des bilans sanguins.</li>
            <li>VitaSync ne saurait être tenu responsable des effets indésirables liés à la prise de compléments alimentaires.</li>
            <li>VitaSync ne garantit pas la disponibilité permanente de la Plateforme.</li>
            <li>Les recommandations produits sont des informations générales de bien-être, non des prescriptions médicales.</li>
            <li>L'Utilisateur est seul responsable de l'usage qu'il fait des informations fournies.</li>
            <li>Les compléments alimentaires peuvent interagir avec des médicaments. L'Utilisateur doit consulter son médecin ou son pharmacien avant d'ajouter tout nouveau complément.</li>
          </ul>
          <p><strong>Responsabilité IA :</strong> Pour les utilisateurs UE, conformément à la Directive (UE) 2024/2853 sur la responsabilité du fait des produits (applicable à compter du 9 décembre 2026), VitaSync sera soumis à un régime de responsabilité de plein droit pour les défauts liés à l'IA. Les clauses de limitation de responsabilité des présentes Conditions ne peuvent exclure cette responsabilité légale lorsqu'elle s'applique. Pour les utilisateurs américains, les lois fédérales et étatiques de protection des consommateurs et de <span lang="en">product liability</span> de l'État de résidence de l'Utilisateur s'appliquent.</p>

          <h2>6. Obligations de l'Utilisateur</h2>
          <ul>
            <li>Fournir des informations exactes, en particulier concernant les allergies et les conditions médicales.</li>
            <li>Ne pas utiliser la Plateforme à des fins illégales ou non autorisées.</li>
            <li>Ne pas tenter d'accéder aux données d'autres utilisateurs.</li>
            <li>Ne pas détourner le Coach IA de sa finalité (bien-être et nutrition).</li>
            <li>Consulter un professionnel de santé avant toute prise de compléments, en particulier en cas de grossesse, de traitement médical en cours ou de conditions préexistantes.</li>
            <li>Signaler immédiatement toute faille de sécurité à <a href="mailto:contact@vitasync.ai">contact@vitasync.ai</a>.</li>
            <li>Ne pas utiliser la Plateforme si l'Utilisateur est mineur (moins de 18 ans).</li>
          </ul>

          <h2>7. Tarifs & Abonnements</h2>
          <ul>
            <li><strong>Free :</strong> accès gratuit aux fonctionnalités de base (Coach IA Lite, suivi de compléments, check-ins quotidiens).</li>
            <li><strong>Pro — 7,99 $/mois :</strong> accès complet au Coach IA avancé, analyses de bilans sanguins illimitées, quiz interactifs et recommandations approfondies.</li>
          </ul>
          <p>Les achats de compléments via la boutique sont indépendants de l'abonnement et sont régis par les Conditions Générales de Vente. Les abonnements sont gérés via Shopify pour le paiement et la facturation. L'Utilisateur peut annuler son abonnement à tout moment depuis son compte Shopify ; l'annulation prend effet à la fin de la période de facturation en cours.</p>

          <h2>8. Propriété Intellectuelle</h2>
          <p>L'ensemble des éléments de la Plateforme (design, code, textes, logos, bases de données scientifiques) sont la propriété exclusive de VitaSync ou de ses partenaires. Toute reproduction, représentation ou exploitation non autorisée est interdite, conformément au droit américain du copyright (<span lang="en">17 U.S.C.</span>) et aux lois applicables en matière de propriété intellectuelle. L'Utilisateur conserve la propriété de ses données personnelles et de santé. En utilisant la Plateforme, l'Utilisateur accorde à VitaSync une licence limitée et non exclusive d'usage de ses données aux seules fins de fourniture du service.</p>

          <h2>9. Résiliation</h2>
          <p>L'Utilisateur peut résilier son compte à tout moment. VitaSync se réserve le droit de suspendre ou de supprimer un compte en cas de violation des présentes Conditions, de comportement abusif ou de tentative de fraude. À la résiliation, les données sont traitées conformément à la Politique de Confidentialité.</p>

          <h2>10. Droit Applicable & Litiges</h2>
          <p>Les présentes Conditions sont régies par les lois des États-Unis et de l'État du Delaware, à l'exclusion des règles de conflits de lois. Pour les utilisateurs résidant dans l'Union européenne, les dispositions impératives de protection des consommateurs de leur pays de résidence s'appliquent également. Aucune disposition des présentes Conditions n'affecte vos droits en tant que consommateur en vertu du droit national applicable.</p>
          <p>En cas de litige, les parties s'engagent à rechercher d'abord une solution amiable. Pour les consommateurs américains, les litiges peuvent être soumis à un arbitrage exécutoire selon les règles de l'<span lang="en">American Arbitration Association (AAA)</span>, sauf interdiction légale. Les utilisateurs UE peuvent également recourir à la plateforme européenne de règlement en ligne des litiges : <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr</a>.</p>

          <h2>11. Modifications des Présentes Conditions</h2>
          <p>VitaSync se réserve le droit de modifier les présentes Conditions à tout moment. Les modifications prennent effet dès leur publication. L'Utilisateur sera informé par e-mail ou par notification in-app en cas de changement substantiel. La poursuite de l'utilisation de la Plateforme après modification vaut acceptation des nouvelles Conditions.</p>
        </>
      ),
    };
  }
  // English (and fallback for other locales)
  return {
    title: "Terms of Service",
    subtitle: "Rules governing use of the VitaSync platform",
    date: "April 8, 2026",
    body: (
      <>
        <h2>1. Preamble and Purpose</h2>
        <p>These Terms of Service ("Terms") govern your access to and use of the VitaSync platform, accessible at vitasync.ai ("Platform"). VitaSync is an AI-powered wellness and nutrition platform offering a personalized AI coach, supplement tracking, informational blood test analysis, an online supplement store, and daily wellness tools.</p>

        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 my-6">
          <p className="text-foreground font-medium">
            ⚠️ IMPORTANT NOTICE: VitaSync is a wellness and lifestyle information platform. It is NOT a medical device under EU Regulation 2017/745 (MDR) or the US FDA 21 CFR Part 820. The information and recommendations provided do NOT constitute medical advice, diagnosis, or treatment. VitaSync is NOT a prescription service. Always consult a qualified healthcare professional before making any decisions about your health or diet.
          </p>
        </div>

        <p>By creating an account or using the Platform, the User unconditionally accepts these Terms as well as the Privacy Policy, the Cookie Policy, and, where applicable, the Terms of Sale.</p>

        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 my-4">
          <p className="text-foreground">
            <strong>Geographic scope:</strong> The Platform (AI coach, tracking) is accessible internationally. However, the VitaSync shop ships exclusively within the United States (48 contiguous states, excluding Alaska and Hawaii) through our fulfillment partner Supliful. Users outside the USA can use the AI coach in freemium/subscription mode but cannot order physical products.
          </p>
        </div>

        <h2>2. Definitions</h2>
        <ul>
          <li><strong>"Platform"</strong>: the VitaSync website and all of its features.</li>
          <li><strong>"User"</strong>: any adult individual (18 years or older) registered on the Platform.</li>
          <li><strong>"AI Coach"</strong>: the VitaSync artificial intelligence assistant, powered by Google Gemini models.</li>
          <li><strong>"Stack"</strong>: the set of dietary supplements tracked by a User.</li>
          <li><strong>"Check-in"</strong>: the daily wellness log submitted by the User.</li>
          <li><strong>"Products"</strong>: dietary supplements sold through the VitaSync shop (US shipping only).</li>
          <li><strong>"AI System"</strong>: any component using artificial intelligence (Coach, blood test analyses, recommendations).</li>
        </ul>

        <h2>3. Registration and User Account</h2>
        <p>3.1 Registration is restricted to adults (18 years or older). The User agrees to provide accurate and up-to-date information. Passwords must contain at least 8 characters with at least one uppercase letter, one number, and one special character.</p>
        <p>3.2 After registration, the User is invited to complete a health questionnaire (onboarding) to enable personalized recommendations. This questionnaire is voluntary but necessary to receive tailored recommendations.</p>
        <p>3.3 The User may request deletion of their account at any time through the dashboard settings. Such deletion results in the erasure of all data in accordance with the Privacy Policy and applicable privacy laws (GDPR Art. 17 for EU users; CCPA/CPRA for California residents).</p>

        <h2>4. Description of Services</h2>

        <h3>4.1 VitaSync AI Coach</h3>
        <p>The AI Coach is a conversational wellness and nutrition assistant providing personalized recommendations based on the User's profile. Several model tiers are available depending on the subscription: Free (Lite) and Pro (full access to the advanced AI coach).</p>
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 my-4">
          <p className="text-foreground">
            <strong>AI Transparency (EU AI Act, Art. 50):</strong> You are interacting with an artificial intelligence system powered by Google Gemini. This is not a human healthcare professional. All responses are generated by AI technology. Recommendations are for informational and educational purposes only.
          </p>
        </div>

        <h3>4.2 Supplement Tracker</h3>
        <p>The User can add, track, and manage their daily dietary supplements with intake reminders. A logging system allows tracking of adherence over time.</p>

        <h3>4.3 Blood Test Analysis (informational only)</h3>
        <p>The User may upload blood test results in PDF format. The AI provides general educational context regarding the values. This feature does NOT constitute medical interpretation, diagnosis, or clinical evaluation. Only a licensed healthcare professional can properly interpret results within the context of a complete medical history.</p>

        <h3>4.4 VitaSync Shop (USA only)</h3>
        <p>VitaSync offers a catalog of dietary supplements through Shopify, with shipping exclusively to the United States. Purchase conditions are governed by the Terms of Sale and the Shipping & Returns Policy.</p>

        <h2>5. Limitations of Liability</h2>
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 my-4">
          <p className="text-foreground font-medium">⚠️ VitaSync is NOT a medical service. The Platform is not a substitute for a medical consultation under any circumstances.</p>
        </div>
        <p>VitaSync disclaims any liability for damages resulting from the use of AI recommendations without prior validation by a healthcare professional.</p>
        <ul>
          <li>VitaSync does not guarantee the accuracy of AI analyses of blood test results.</li>
          <li>VitaSync cannot be held liable for adverse effects related to the use of dietary supplements.</li>
          <li>VitaSync does not guarantee permanent availability of the Platform.</li>
          <li>Product recommendations are general wellness information, not medical prescriptions.</li>
          <li>The User is solely responsible for how they use the information provided.</li>
          <li>Dietary supplements may interact with medications. The User must consult their physician or pharmacist before adding any new supplement.</li>
        </ul>
        <p><strong>AI Liability:</strong> For EU users, in accordance with Directive (EU) 2024/2853 on product liability (applicable from December 9, 2026), VitaSync will be subject to a strict liability regime for AI-related defects. The limitation of liability clauses in these Terms cannot exclude this statutory liability where it applies. For US users, applicable consumer protection and product liability laws of the User's state of residence apply.</p>

        <h2>6. User Obligations</h2>
        <ul>
          <li>Provide accurate information, particularly regarding allergies and medical conditions.</li>
          <li>Not use the Platform for illegal or unauthorized purposes.</li>
          <li>Not attempt to access other users' data.</li>
          <li>Not misuse the AI Coach beyond its intended purpose (wellness and nutrition).</li>
          <li>Consult a healthcare professional before taking supplements, especially in case of pregnancy, ongoing medical treatment, or pre-existing conditions.</li>
          <li>Immediately report any security vulnerability to <a href="mailto:contact@vitasync.ai">contact@vitasync.ai</a>.</li>
          <li>Not use the Platform if the User is a minor (under 18 years old).</li>
        </ul>

        <h2>7. Pricing & Subscriptions</h2>
        <ul>
          <li><strong>Free:</strong> Free access to basic features (AI Coach Lite, supplement tracking, daily check-ins).</li>
          <li><strong>Pro — $7.99/month:</strong> Full access to the advanced AI Coach, unlimited blood test analyses, interactive quizzes, and in-depth recommendations.</li>
        </ul>
        <p>Supplement purchases through the shop are independent of the subscription and are governed by the Terms of Sale. Subscriptions are managed through Shopify for payment and billing. The User can cancel their subscription at any time from their Shopify account; cancellation takes effect at the end of the current billing period.</p>

        <h2>8. Intellectual Property</h2>
        <p>All elements of the Platform (design, code, text, logos, scientific databases) are the exclusive property of VitaSync or its partners. Any unauthorized reproduction, representation, or exploitation is prohibited in accordance with United States copyright law (17 U.S.C.) and applicable intellectual property laws. The User retains ownership of their personal and health data. By using the Platform, the User grants VitaSync a limited, non-exclusive license to use their data solely for the purpose of providing the service.</p>

        <h2>9. Termination</h2>
        <p>The User may terminate their account at any time. VitaSync reserves the right to suspend or delete an account in case of violation of these Terms, abusive behavior, or attempted fraud. Upon termination, data is processed in accordance with the Privacy Policy.</p>

        <h2>10. Governing Law &amp; Disputes</h2>
        <p>These Terms are governed by the laws of the United States and the State of Delaware, without regard to conflict of law principles. For users residing in the European Union, mandatory consumer protection provisions of their country of residence also apply. Nothing in these Terms affects your rights as a consumer under applicable national law.</p>
        <p>In the event of a dispute, the parties agree to first seek an amicable resolution. For US consumers, disputes may be submitted to binding arbitration under the American Arbitration Association (AAA) rules, except where prohibited by law. EU users may also use the European Online Dispute Resolution platform: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr</a>.</p>

        <h2>11. Changes to These Terms</h2>
        <p>VitaSync reserves the right to modify these Terms at any time. Changes take effect upon publication. The User will be notified by email or in-app notification in case of substantial changes. Continued use of the Platform after modification constitutes acceptance of the new Terms.</p>
      </>
    ),
  };
};

export default function Terms() {
  const { locale } = useTranslation();
  const effectiveLocale: "fr" | "en" = locale === "fr" ? "fr" : "en";
  const c = buildContent(effectiveLocale);
  return (
    <LegalPageLayout title={c.title} subtitle={c.subtitle} date={c.date}>
      {c.body}
    </LegalPageLayout>
  );
}
