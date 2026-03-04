import { LegalPageLayout } from "@/components/layout/LegalPageLayout";

export default function Privacy() {
  return (
    <LegalPageLayout
      title="Politique de Confidentialité"
      subtitle="Protection des données personnelles et de santé — Conformité RGPD, CCPA, HDS"
      date="4 mars 2026"
    >
      <p>VitaSync accorde une importance primordiale à la protection de vos données personnelles, en particulier vos données de santé. Cette politique décrit de manière transparente comment nous collectons, utilisons, stockons et protégeons vos informations conformément au Règlement Général sur la Protection des Données (RGPD — UE 2016/679), à la loi Informatique et Libertés du 6 janvier 1978 modifiée, au California Consumer Privacy Act (CCPA) et aux autres réglementations applicables.</p>

      <h2>1. Responsable du Traitement</h2>
      <p><strong>VitaSync</strong> — Plateforme de bien-être et nutrition propulsée par l'IA<br />Contact DPO : <a href="mailto:contact@vitasync.com">contact@vitasync.com</a><br />Site web : vitasync-ai-health.lovable.app</p>
      <p><em>Note importante : VitaSync est en cours de structuration juridique. Dès la création de la structure juridique (SASU envisagée), les informations complètes seront mises à jour.</em></p>

      <h2>2. Données Collectées</h2>

      <h3>2.1 Données d'identification</h3>
      <ul>
        <li>Prénom, nom, adresse email (lors de l'inscription)</li>
        <li>Date de naissance (facultatif, pour personnaliser les recommandations)</li>
        <li>Photo de profil (avatar, stocké dans un bucket privé)</li>
        <li>Identifiant unique UUID généré automatiquement</li>
      </ul>

      <h3>2.2 Données de santé (catégorie spéciale — Art. 9 RGPD)</h3>
      <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 my-4">
        <p className="text-foreground">
          <strong>⚠️ ATTENTION — Données sensibles :</strong> Ces données constituent des données de santé au sens de l'article 4(15) et du considérant 35 du RGPD, ainsi que des données relatives à la santé au sens de l'article 9(1). Leur traitement repose exclusivement sur votre consentement explicite (Art. 9(2)(a) RGPD). Vous pouvez retirer ce consentement à tout moment.
        </p>
      </div>
      <ul>
        <li>Objectifs de santé (énergie, performance, sommeil, nutrition)</li>
        <li>Problèmes de santé actuels déclarés</li>
        <li>Niveau d'activité physique et types de sport pratiqués</li>
        <li>Qualité du sommeil, niveau de stress, humeur (check-ins quotidiens notés de 1 à 5)</li>
        <li>Allergies et conditions médicales déclarées</li>
        <li>Régime alimentaire et préférences de formes de compléments</li>
        <li>Budget mensuel pour les compléments</li>
        <li>Analyses sanguines (fichiers PDF uploadés dans un bucket privé chiffré)</li>
        <li>Résultats d'analyses : biomarqueurs, valeurs anormales, carences détectées</li>
        <li>Historique des compléments alimentaires suivis (nom, dosage, horaire de prise)</li>
      </ul>

      <h3>2.3 Données de navigation et techniques</h3>
      <ul>
        <li>Adresse IP (anonymisée), type de navigateur, système d'exploitation</li>
        <li>Pages visitées, durée des sessions (via Lovable Analytics)</li>
        <li>Préférences d'interface : thème (clair/sombre), langue, état de la sidebar</li>
        <li>Données de session d'authentification (tokens JWT)</li>
      </ul>

      <h3>2.4 Données de transactions</h3>
      <ul>
        <li>Historique des commandes via Shopify (lié au compte Shopify de l'utilisateur)</li>
        <li>Tokens d'accès Shopify Customer Account API (chiffrés, stockés côté serveur uniquement)</li>
        <li>Adresse de livraison (gérée via Shopify, pas stockée directement par VitaSync)</li>
      </ul>

      <h2>3. Finalités et Bases Légales du Traitement</h2>
      <table>
        <thead>
          <tr><th>Finalité</th><th>Base légale (RGPD)</th><th>Données concernées</th></tr>
        </thead>
        <tbody>
          <tr><td>Gestion du compte utilisateur</td><td>Exécution du contrat (Art. 6(1)(b))</td><td>Email, nom, mot de passe</td></tr>
          <tr><td>Personnalisation IA des recommandations</td><td>Consentement explicite (Art. 9(2)(a))</td><td>Profil santé, check-ins, analyses</td></tr>
          <tr><td>Suivi des compléments alimentaires</td><td>Consentement explicite (Art. 9(2)(a))</td><td>Stack, dosages, horaires</td></tr>
          <tr><td>Analyse des résultats sanguins par IA</td><td>Consentement explicite (Art. 9(2)(a))</td><td>PDF analyses, biomarqueurs</td></tr>
          <tr><td>Boutique et transactions Shopify</td><td>Exécution du contrat (Art. 6(1)(b))</td><td>Commandes, adresse livraison</td></tr>
          <tr><td>Coach IA (conversations)</td><td>Consentement explicite (Art. 9(2)(a))</td><td>Messages, profil santé</td></tr>
          <tr><td>Amélioration du service et analytics</td><td>Intérêt légitime (Art. 6(1)(f))</td><td>Données navigation anonymisées</td></tr>
          <tr><td>Sécurité et prévention des fraudes</td><td>Intérêt légitime (Art. 6(1)(f))</td><td>Logs, adresses IP, tokens</td></tr>
        </tbody>
      </table>

      <h2>4. Stockage, Sécurité et Hébergement des Données de Santé</h2>

      <h3>4.1 Infrastructure technique</h3>
      <p>Vos données sont hébergées sur une infrastructure sécurisée. Les mesures de sécurité suivantes sont implémentées :</p>
      <ul>
        <li><strong>Row Level Security (RLS) :</strong> Chaque table est protégée par des politiques RLS garantissant qu'un utilisateur ne peut accéder qu'à ses propres données.</li>
        <li><strong>Chiffrement au repos :</strong> Chiffrement AES-256 au niveau du disque.</li>
        <li><strong>Chiffrement en transit :</strong> Toutes les communications utilisent HTTPS/TLS 1.2+.</li>
        <li><strong>Buckets de stockage privés :</strong> Les fichiers d'analyses sanguines et avatars sont dans des buckets privés avec accès restreint par user_id.</li>
        <li><strong>Tokens Shopify :</strong> Stockés côté serveur uniquement via service_role_key, inaccessibles depuis le client.</li>
        <li><strong>Authentification :</strong> Auth avec JWT, refresh automatique, vérification par email.</li>
        <li><strong>Validation des entrées :</strong> Validation stricte dans les edge functions.</li>
      </ul>

      <h3>4.2 Hébergement des données de santé (HDS)</h3>
      <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 my-4">
        <p className="text-foreground">
          <strong>AVIS IMPORTANT — Certification HDS :</strong> L'article L.1111-8 du Code de la santé publique impose que tout hébergeur de données de santé à caractère personnel soit certifié HDS. VitaSync s'engage à migrer le stockage des données de santé vers un hébergeur certifié HDS avant la mise en production définitive. Dans l'intervalle, les données de santé sont traitées avec les garanties maximales offertes (chiffrement, RLS, isolation).
        </p>
      </div>

      <h3>4.3 Analyse d'Impact (AIPD)</h3>
      <p>Conformément à l'article 35 du RGPD, VitaSync réalise une Analyse d'Impact relative à la Protection des Données (AIPD) préalablement à tout traitement de données de santé par IA.</p>

      <h3>4.4 Durée de conservation</h3>
      <table>
        <thead>
          <tr><th>Type de données</th><th>Durée de conservation</th></tr>
        </thead>
        <tbody>
          <tr><td>Compte utilisateur</td><td>Jusqu'à la suppression du compte</td></tr>
          <tr><td>Données de santé (profil, check-ins)</td><td>Jusqu'à la suppression du compte ou retrait du consentement</td></tr>
          <tr><td>Analyses sanguines (PDF)</td><td>Jusqu'à suppression manuelle par l'utilisateur</td></tr>
          <tr><td>Conversations IA</td><td>Jusqu'à suppression manuelle par l'utilisateur</td></tr>
          <tr><td>Tokens Shopify</td><td>Jusqu'à déconnexion ou expiration</td></tr>
          <tr><td>Logs techniques</td><td>90 jours maximum</td></tr>
          <tr><td>Données de facturation</td><td>10 ans (obligation légale comptable)</td></tr>
        </tbody>
      </table>

      <h2>5. Sous-traitants et Transferts de Données</h2>
      <table>
        <thead>
          <tr><th>Sous-traitant</th><th>Rôle</th><th>Localisation</th><th>Garanties</th></tr>
        </thead>
        <tbody>
          <tr><td>Supabase</td><td>BDD, auth, stockage</td><td>USA (AWS)</td><td>SOC 2 Type II, AES-256</td></tr>
          <tr><td>Lovable Cloud</td><td>Déploiement, gateway IA</td><td>UE / USA</td><td>Infrastructure sécurisée</td></tr>
          <tr><td>Google (Gemini)</td><td>Modèles IA (coach, analyses)</td><td>USA</td><td>DPA Google Cloud, ISO 27001, certifié DPF</td></tr>
          <tr><td>Shopify</td><td>E-commerce, paiements</td><td>Canada/USA</td><td>PCI DSS Level 1, SOC 2</td></tr>
          <tr><td>ElevenLabs</td><td>Transcription vocale</td><td>USA</td><td>Chiffrement en transit</td></tr>
          <tr><td>Supliful</td><td>Fulfillment (white-label)</td><td>USA (Colorado)</td><td>FDA-registered, GMP</td></tr>
        </tbody>
      </table>
      <p><strong>Transferts internationaux :</strong> Les transferts vers les États-Unis sont encadrés par le Data Privacy Framework UE-USA (décision d'adéquation du 10 juillet 2023) et/ou les clauses contractuelles types (CCT) de la Commission européenne. Les données transmises à l'IA Google Gemini sont pseudonymisées avant envoi.</p>

      <h2>6. Vos Droits (RGPD Art. 15-22)</h2>
      <ul>
        <li><strong>Droit d'accès (Art. 15) :</strong> Obtenir une copie de l'ensemble de vos données personnelles.</li>
        <li><strong>Droit de rectification (Art. 16) :</strong> Corriger vos données inexactes ou incomplètes.</li>
        <li><strong>Droit à l'effacement (Art. 17) :</strong> Demander la suppression de votre compte et de toutes les données associées.</li>
        <li><strong>Droit à la limitation (Art. 18) :</strong> Restreindre temporairement le traitement de vos données.</li>
        <li><strong>Droit à la portabilité (Art. 20) :</strong> Recevoir vos données dans un format structuré et lisible par machine (JSON).</li>
        <li><strong>Droit d'opposition (Art. 21) :</strong> Vous opposer au traitement basé sur l'intérêt légitime.</li>
        <li><strong>Retrait du consentement :</strong> Retirer votre consentement à tout moment sans affecter la légalité du traitement antérieur.</li>
        <li><strong>Droit de ne pas faire l'objet d'une décision automatisée (Art. 22) :</strong> Les recommandations IA de VitaSync sont informatives et ne produisent pas d'effets juridiques.</li>
      </ul>
      <p>Pour exercer vos droits, contactez-nous à : <a href="mailto:contact@vitasync.com">contact@vitasync.com</a>. Nous répondrons dans un délai de 30 jours.</p>
      <p>Vous disposez également du droit de déposer une réclamation auprès de la CNIL (3 Place de Fontenoy, 75007 Paris, <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">www.cnil.fr</a>) ou de l'autorité de protection des données de votre pays.</p>

      <h2>7. Traitement Spécifique des Données de Santé et IA</h2>
      <p>VitaSync traite des données de santé au sens de l'article 9 du RGPD. Ce traitement est strictement encadré :</p>
      <ul>
        <li>Le consentement explicite est recueilli avant tout traitement de données de santé, via des cases à cocher distinctes pour chaque finalité.</li>
        <li>L'IA VitaSync (Google Gemini) ne pose aucun diagnostic médical. Toutes les suggestions sont à titre informatif et éducatif uniquement.</li>
        <li>Les analyses sanguines sont traitées par l'IA en mode stateless : aucune donnée n'est conservée par le modèle IA après le traitement.</li>
        <li>Les données transmises à Google Gemini sont pseudonymisées (aucun identifiant direct).</li>
        <li>L'utilisateur peut supprimer ses analyses sanguines et ses conversations IA à tout moment.</li>
        <li>Les recommandations de compléments sont basées sur des données scientifiques et des allégations de santé autorisées par l'EFSA.</li>
      </ul>
      <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 my-4">
        <p className="text-foreground">
          <strong>Transparence IA (EU AI Act, Art. 50) :</strong> Conformément au Règlement (UE) 2024/1689, VitaSync informe clairement les utilisateurs qu'ils interagissent avec un système d'intelligence artificielle (Google Gemini). Le Coach IA et l'analyse de résultats sanguins sont des fonctionnalités alimentées par l'IA, pas des services médicaux humains.
        </p>
      </div>

      <h2>8. Protection des Mineurs</h2>
      <p>VitaSync s'adresse exclusivement aux personnes majeures (18 ans et plus). Lors de l'onboarding, une vérification d'âge est effectuée. Si l'utilisateur déclare être mineur, l'accès aux fonctionnalités de recommandation est restreint. Nous ne collectons pas sciemment de données sur les mineurs. Si nous découvrons avoir collecté des données d'un mineur, nous les supprimerons immédiatement.</p>

      <h2>9. Droits spécifiques CCPA (résidents californiens)</h2>
      <p>Si vous résidez en Californie, vous bénéficiez de droits supplémentaires en vertu du CCPA : droit de connaître les catégories de données collectées et leur finalité, droit de suppression, droit de refuser la vente de vos données (VitaSync ne vend aucune donnée personnelle), droit de non-discrimination. Pour exercer ces droits : <a href="mailto:contact@vitasync.com">contact@vitasync.com</a>.</p>

      <h2>10. Modifications de cette Politique</h2>
      <p>Nous nous réservons le droit de modifier cette politique à tout moment. En cas de modification substantielle, vous serez informé par email ou notification in-app au moins 30 jours avant l'entrée en vigueur des modifications.</p>

      <h2>11. Contact</h2>
      <p>Pour toute question relative à cette politique ou à vos données personnelles :</p>
      <p>Email : <a href="mailto:contact@vitasync.com">contact@vitasync.com</a><br />Délégué à la Protection des Données (DPO) : <a href="mailto:contact@vitasync.com">contact@vitasync.com</a><br />Site web : vitasync-ai-health.lovable.app</p>
    </LegalPageLayout>
  );
}
