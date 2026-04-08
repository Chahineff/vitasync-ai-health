import { LegalPageLayout } from "@/components/layout/LegalPageLayout";

export default function Terms() {
  return (
    <LegalPageLayout
      title="Conditions Générales d'Utilisation"
      subtitle="Règles d'utilisation de la plateforme VitaSync"
      date="8 avril 2026"
    >
      <h2>1. Préambule et Objet</h2>
      <p>Les présentes Conditions Générales d'Utilisation (ci-après « CGU ») régissent l'accès et l'utilisation de la plateforme VitaSync, accessible à l'adresse vitasync-ai-health.lovable.app (ci-après « la Plateforme »). VitaSync est une plateforme de bien-être et nutrition propulsée par l'intelligence artificielle, proposant un coach IA personnalisé, un suivi de compléments alimentaires, des analyses informatives de résultats sanguins, une boutique en ligne de compléments et des outils de suivi quotidien.</p>

      <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 my-6">
        <p className="text-foreground font-medium">
          ⚠️ AVERTISSEMENT FONDAMENTAL : VitaSync est une plateforme d'information sur le bien-être et le mode de vie. Elle ne constitue PAS un dispositif médical au sens du Règlement (UE) 2017/745 (MDR). Les informations et recommandations fournies ne constituent PAS un avis médical, un diagnostic ou un traitement. VitaSync n'est PAS un service de prescription. Consultez toujours un professionnel de santé qualifié avant toute décision concernant votre santé ou votre alimentation.
        </p>
      </div>

      <p>En créant un compte ou en utilisant la Plateforme, l'Utilisateur accepte sans réserve les présentes CGU ainsi que la Politique de Confidentialité, la Politique de Cookies, et le cas échéant les Conditions Générales de Vente.</p>

      <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 my-4">
        <p className="text-foreground">
          <strong>Périmètre géographique :</strong> La Plateforme (coach IA, suivi) est accessible internationalement. Cependant, la boutique VitaSync livre exclusivement aux États-Unis (48 États contigus hors Alaska et Hawaii) via son partenaire de fulfillment Supliful. Les utilisateurs hors USA peuvent utiliser le coach IA en mode freemium/abonnement mais ne peuvent pas commander de produits physiques.
        </p>
      </div>

      <h2>2. Définitions</h2>
      <ul>
        <li><strong>« Plateforme »</strong> : le site web VitaSync et l'ensemble de ses fonctionnalités.</li>
        <li><strong>« Utilisateur »</strong> : toute personne physique majeure (18 ans et plus) inscrite sur la Plateforme.</li>
        <li><strong>« Coach IA »</strong> : l'assistant d'intelligence artificielle VitaSync, basé sur les modèles Google Gemini.</li>
        <li><strong>« Stack »</strong> : l'ensemble des compléments alimentaires suivis par un Utilisateur.</li>
        <li><strong>« Check-in »</strong> : le bilan quotidien de bien-être saisi par l'Utilisateur.</li>
        <li><strong>« Produits »</strong> : les compléments alimentaires commercialisés via la boutique VitaSync (livraison US uniquement).</li>
        <li><strong>« Système IA »</strong> : tout composant utilisant l'intelligence artificielle (Coach, analyses sanguines, recommandations).</li>
      </ul>

      <h2>3. Inscription et Compte Utilisateur</h2>
      <p>3.1 L'inscription est réservée aux personnes majeures (18 ans et plus). L'Utilisateur s'engage à fournir des informations exactes et à jour. Le mot de passe doit contenir au minimum 8 caractères avec au moins une majuscule, un chiffre et un caractère spécial.</p>
      <p>3.2 Après l'inscription, l'Utilisateur est invité à compléter un questionnaire de santé (onboarding) pour permettre la personnalisation des recommandations. Ce questionnaire est volontaire mais nécessaire pour bénéficier des recommandations personnalisées.</p>
      <p>3.3 L'Utilisateur peut demander la suppression de son compte à tout moment via les paramètres du dashboard. Cette suppression entraîne l'effacement de l'ensemble des données conformément à la Politique de Confidentialité et au RGPD (Art. 17).</p>

      <h2>4. Description des Services</h2>

      <h3>4.1 Coach IA VitaSync</h3>
      <p>Le Coach IA est un assistant conversationnel de bien-être et nutrition fournissant des recommandations personnalisées basées sur le profil de l'Utilisateur. Plusieurs niveaux de modèles sont disponibles selon l'abonnement : Free (Lite), Pro (accès complet au coach IA avancé).</p>
      <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 my-4">
        <p className="text-foreground">
          <strong>Transparence IA (EU AI Act, Art. 50) :</strong> Vous interagissez avec un système d'intelligence artificielle propulsé par Google Gemini. Il ne s'agit pas d'un professionnel de santé humain. Toutes les réponses sont générées par une technologie IA. Les recommandations sont à titre informatif et éducatif uniquement.
        </p>
      </div>

      <h3>4.2 Suivi des compléments (Supplement Tracker)</h3>
      <p>L'Utilisateur peut ajouter, suivre et gérer ses compléments alimentaires quotidiens avec des rappels de prise. Un système de logs permet de suivre l'adhérence.</p>

      <h3>4.3 Analyses sanguines (information uniquement)</h3>
      <p>L'Utilisateur peut uploader ses résultats d'analyses sanguines au format PDF. L'IA fournit un contexte éducatif général sur les valeurs. Cette fonctionnalité ne constitue PAS une interprétation médicale, un diagnostic ou une évaluation clinique. Seul un professionnel de santé agréé peut interpréter correctement les résultats dans le contexte d'un historique médical complet.</p>

      <h3>4.4 Boutique VitaSync (USA uniquement)</h3>
      <p>VitaSync propose un catalogue de compléments alimentaires via Shopify, avec livraison exclusive aux États-Unis. Les conditions d'achat sont régies par les Conditions Générales de Vente et la Politique de Livraison et Retours.</p>

      <h2>5. Limitations de Responsabilité</h2>
      <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 my-4">
        <p className="text-foreground font-medium">⚠️ VitaSync n'est PAS un service médical. La Plateforme ne remplace en aucun cas une consultation médicale.</p>
      </div>
      <p>VitaSync décline toute responsabilité en cas de dommage résultant de l'utilisation des recommandations IA sans validation préalable par un professionnel de santé.</p>
      <ul>
        <li>VitaSync ne garantit pas l'exactitude des analyses IA sur les résultats sanguins.</li>
        <li>VitaSync ne peut être tenu responsable des effets indésirables liés à la prise de compléments alimentaires.</li>
        <li>VitaSync ne garantit pas la disponibilité permanente de la Plateforme.</li>
        <li>Les recommandations de produits sont des informations générales de bien-être, pas des prescriptions médicales.</li>
        <li>L'Utilisateur est seul responsable de l'utilisation qu'il fait des informations fournies.</li>
        <li>Les compléments alimentaires peuvent interagir avec des médicaments. L'Utilisateur doit consulter son médecin ou pharmacien avant tout nouveau complément.</li>
      </ul>
      <p><strong>Responsabilité IA :</strong> Conformément à la Directive (UE) 2024/2853 sur la responsabilité du fait des produits (applicable à partir du 9 décembre 2026), VitaSync sera soumis à un régime de responsabilité stricte pour les défauts liés à l'IA. Les clauses de limitation de responsabilité des présentes CGU ne peuvent pas exclure cette responsabilité légale, lorsqu'elle s'applique.</p>

      <h2>6. Obligations de l'Utilisateur</h2>
      <ul>
        <li>Fournir des informations exactes, notamment concernant ses allergies et conditions médicales.</li>
        <li>Ne pas utiliser la Plateforme à des fins illégales ou non autorisées.</li>
        <li>Ne pas tenter d'accéder aux données d'autres utilisateurs.</li>
        <li>Ne pas détourner le Coach IA de son usage prévu (bien-être et nutrition).</li>
        <li>Consulter un professionnel de santé avant de prendre des compléments, surtout en cas de grossesse, traitement médical ou pathologie existante.</li>
        <li>Signaler immédiatement toute faille de sécurité constatée à <a href="mailto:contact@vitasync.com">contact@vitasync.com</a>.</li>
        <li>Ne pas utiliser la Plateforme si l'Utilisateur est mineur (moins de 18 ans).</li>
      </ul>

      <h2>7. Tarification et Abonnements</h2>
      <ul>
        <li><strong>Free :</strong> Accès gratuit aux fonctionnalités de base (Coach IA Lite, suivi compléments, check-ins quotidiens).</li>
        <li><strong>Pro — 7,99 $/mois :</strong> Accès complet au Coach IA avancé, analyses sanguines illimitées, quiz interactifs, recommandations approfondies.</li>
      </ul>
      <p>Les achats de compléments via la boutique sont indépendants de l'abonnement et régis par les CGV. Les abonnements sont gérés via Shopify pour le paiement et la facturation. L'Utilisateur peut résilier son abonnement à tout moment depuis son compte Shopify ; la résiliation prend effet à la fin de la période de facturation en cours.</p>

      <h2>8. Propriété Intellectuelle</h2>
      <p>L'ensemble des éléments de la Plateforme (design, code, textes, logos, bases de données scientifiques) sont la propriété exclusive de VitaSync ou de ses partenaires. Toute reproduction, représentation ou exploitation non autorisée est interdite conformément aux articles L.335-2 et suivants du Code de la propriété intellectuelle. L'Utilisateur conserve la propriété de ses données personnelles et de santé. En utilisant la Plateforme, l'Utilisateur accorde à VitaSync une licence limitée et non exclusive d'utilisation de ses données aux seules fins de fourniture du service.</p>

      <h2>9. Résiliation</h2>
      <p>L'Utilisateur peut résilier son compte à tout moment. VitaSync se réserve le droit de suspendre ou supprimer un compte en cas de violation des présentes CGU, de comportement abusif ou de tentative de fraude. En cas de résiliation, les données sont traitées conformément à la Politique de Confidentialité.</p>

      <h2>10. Droit Applicable et Litiges</h2>
      <p>Les présentes CGU sont soumises au droit français. Si vous résidez dans l'Union européenne, vous bénéficiez également des dispositions impératives de la loi de protection des consommateurs du pays dans lequel vous résidez. Rien dans les présentes conditions n'affecte vos droits en tant que consommateur au titre de la législation nationale applicable.</p>
      <p>En cas de litige, les parties s'engagent à rechercher une solution amiable. Conformément à l'article L. 612-1 du Code de la consommation, l'Utilisateur consommateur peut recourir gratuitement à un médiateur de la consommation. Plateforme européenne de règlement des litiges en ligne : <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr</a>.</p>

      <h2>11. Modifications des CGU</h2>
      <p>VitaSync se réserve le droit de modifier les présentes CGU. Les modifications prennent effet dès leur publication. L'Utilisateur sera informé par email ou notification in-app en cas de modification substantielle. La poursuite de l'utilisation après modification vaut acceptation des nouvelles CGU.</p>
    </LegalPageLayout>
  );
}
