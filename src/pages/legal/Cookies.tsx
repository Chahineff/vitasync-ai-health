import { LegalPageLayout } from "@/components/layout/LegalPageLayout";

export default function Cookies() {
  return (
    <LegalPageLayout
      title="Politique de Cookies"
      subtitle="Utilisation des cookies et technologies similaires — Art. 82 Loi Informatique et Libertés"
      date="4 mars 2026"
    >
      <h2>1. Qu'est-ce qu'un Cookie ?</h2>
      <p>Un cookie est un petit fichier texte déposé sur votre navigateur lors de la visite d'un site web. Les cookies permettent au site de mémoriser certaines informations pour améliorer votre expérience. Les technologies similaires (localStorage, sessionStorage) sont également couvertes par cette politique.</p>

      <h2>2. Cookies Utilisés par VitaSync</h2>
      <table>
        <thead>
          <tr><th>Cookie / Stockage</th><th>Type</th><th>Finalité</th><th>Durée</th><th>Requis</th></tr>
        </thead>
        <tbody>
          <tr><td>sb-*-auth-token (Supabase)</td><td>Technique</td><td>Session JWT, refresh auto</td><td>Session + refresh</td><td>Oui</td></tr>
          <tr><td>theme (localStorage)</td><td>Préférence</td><td>Thème clair/sombre</td><td>Persistant</td><td>Non</td></tr>
          <tr><td>sidebar-collapsed (localStorage)</td><td>Préférence</td><td>État de la sidebar</td><td>Persistant</td><td>Non</td></tr>
          <tr><td>locale (localStorage)</td><td>Préférence</td><td>Langue (fr/en/es)</td><td>Persistant</td><td>Non</td></tr>
          <tr><td>oauth_redirect (sessionStorage)</td><td>Technique</td><td>Redirection OAuth</td><td>Session</td><td>Oui</td></tr>
          <tr><td>cookie-consent (localStorage)</td><td>Technique</td><td>Choix cookies</td><td>Persistant</td><td>Oui</td></tr>
          <tr><td>Lovable Analytics</td><td>Analytics</td><td>Stats anonymisées</td><td>Variable</td><td>Non</td></tr>
        </tbody>
      </table>

      <h2>3. Cookies et Services Tiers</h2>
      <ul>
        <li><strong>Shopify :</strong> Cookies de session pour le panier d'achat et le processus de paiement.</li>
        <li><strong>Supabase :</strong> Cookies d'authentification pour la gestion de la session.</li>
        <li><strong>Spline :</strong> Chargement 3D de la landing page (aucun tracking).</li>
      </ul>

      <h2>4. Gestion de vos Cookies</h2>
      <p>Vous pouvez configurer votre navigateur pour accepter, refuser ou supprimer les cookies. Le refus des cookies techniques d'authentification rendra impossible l'utilisation de votre compte VitaSync.</p>

      <h2>5. Base Légale</h2>
      <p>Les cookies strictement nécessaires sont déposés sans consentement préalable (article 82 de la loi Informatique et Libertés, lignes directrices CNIL). Les cookies non essentiels (analytics) sont soumis à votre consentement recueilli via la bannière de cookies.</p>

      <h2>6. Contact</h2>
      <p>Pour toute question relative aux cookies : <a href="mailto:contact@vitasync.com">contact@vitasync.com</a></p>
    </LegalPageLayout>
  );
}
