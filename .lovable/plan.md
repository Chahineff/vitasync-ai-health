
# Passage a 3 plans tarifaires : Gratuit / Go AI / Premium AI

## Objectif

Remplacer la structure actuelle a 2 plans (Gratuit + Premium a 7,99EUR) par 3 plans :
- **Gratuit** : 0EUR/mois (inchange)
- **Go AI** : 7,99EUR/mois ($7.99) - plan intermediaire pour commencer
- **Premium AI** : 24,99EUR/mois ($24.99) - plan professionnel complet

---

## Nouveau contenu des plans

### Plan Gratuit (inchange)
- 5 conversations IA/jour
- Chat texte uniquement
- Recommandations generales
- Historique 7 jours

### Plan Go AI (7,99EUR/mois)
- 20 conversations IA/jour
- Chat texte uniquement
- Analyse de documents limitee (5/mois)
- Recommandations personnalisees
- Historique 14 jours

### Plan Premium AI (24,99EUR/mois) - Recommande
- Conversations IA quasi-illimitees (x20)
- Chat texte + Voix
- Analyse de documents illimitee
- Modele IA avance (Pro)
- Suivi proactif temps reel
- Historique 90 jours
- Support prioritaire 24/7

---

## Modifications prevues

### 1. Fichier de traductions (`src/lib/i18n.ts`)

**Francais et Anglais** :
- Ajouter les cles `pricing.goPrice` ("7,99EUR" / "$7.99") et `pricing.premiumPrice` passe a "24,99EUR" / "$24.99"
- Ajouter les cles `pricing.plan2.*` pour Go AI (6 features)
- Renommer les anciennes cles `pricing.plan2.*` en `pricing.plan3.*` pour Premium AI (7 features)
- Mettre a jour `pricing.description` pour mentionner les 3 niveaux
- Ajouter les cles de comparaison pour la colonne Go AI (`row*Go`)

### 2. Section Pricing (`src/components/sections/PricingSection.tsx`)

- Ajouter un 3eme plan dans le tableau `plans[]`
- Passer la grille de `md:grid-cols-2` a `md:grid-cols-3` avec `max-w-6xl`
- Le badge "Recommande" passe sur le plan Premium AI (plan 3)
- Le tableau de comparaison passe a 4 colonnes : Feature / Gratuit / Go AI / Premium AI

### 3. Tableau de comparaison

Ajout d'une colonne "Go AI" avec les valeurs intermediaires :

| Feature | Gratuit | Go AI | Premium AI |
|---|---|---|---|
| Conversations IA/jour | 5 | 20 | Quasi-illimite |
| Chat texte | Oui | Oui | Oui |
| Voix | Non | Non | Oui |
| Analyse documents | Non | Limitee (5/mois) | Illimitee |
| Recommandations | Basiques | Personnalisees | Avancees + Proactif |
| Suivi proactif | Non | Non | Oui |
| Historique | 7 jours | 14 jours | 90 jours |
| Multi-appareils | Non | Oui | Oui |
| Support | Standard | Standard | Prioritaire 24/7 |

---

## Fichiers modifies

| Fichier | Modification |
|---|---|
| `src/lib/i18n.ts` | Nouvelles cles pour Go AI (plan2), Premium AI renomme en plan3, prix mis a jour, cles de comparaison Go AI |
| `src/components/sections/PricingSection.tsx` | 3 plans, grille 3 colonnes, tableau comparatif 4 colonnes |
