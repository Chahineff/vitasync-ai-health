

# Plan : Base de Connaissances Scientifiques Produits

## Objectif
Creer une table `product_knowledge` dans la base de donnees pour stocker les donnees scientifiques extraites des rapports de recherche, puis connecter cette base a toutes les IA (Coach, Recommandations) et aux fiches produits (PDP).

## Etape 1 : Creer la table `product_knowledge`

Nouvelle table avec les colonnes suivantes :

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | uuid | Cle primaire |
| `shopify_product_id` | text | ID Shopify du produit (ex: "15002251886960") |
| `product_name` | text | Nom du produit (ex: "5-HTP") |
| `product_handle` | text | Handle Shopify pour le lien PDP |
| `tldr` | text | Resume scientifique en 2-3 phrases |
| `key_findings` | jsonb | Liste des conclusions cles des etudes |
| `ingredients_analysis` | jsonb | Analyse detaillee des ingredients (dosages reels vs cliniques) |
| `clinical_references` | jsonb | Sources scientifiques (titre, journal, annee, URL) |
| `safety_warnings` | jsonb | Avertissements et contre-indications specifiques |
| `regulatory_status` | jsonb | Statut reglementaire (FDA, EFSA, etc.) |
| `efficacy_score` | text | Evaluation globale (ex: "modere", "fort", "faible") |
| `synergies` | jsonb | Produits complementaires recommandes |
| `raw_content` | text | Contenu brut du rapport de recherche |
| `created_at` | timestamptz | Date de creation |
| `updated_at` | timestamptz | Date de mise a jour |

Politique RLS : lecture publique (tous les utilisateurs connectes), ecriture reservee aux admins via service_role.

## Etape 2 : Peupler la table avec les 10 premiers rapports

Je lirai le contenu complet de chaque fichier .txt uploade et j'extrairai les donnees structurees pour les 10 produits :

1. **5-HTP** -> shopify ID 15002251886960
2. **Brain & Focus Formula** -> shopify ID 15009468121456
3. **Complete Multivitamin** -> shopify ID 15013981389168
4. **Bone & Heart Support** -> shopify ID 15009469825392
5. **Mushroom Extract Complex** -> (a identifier dans le catalogue)
6. **Alpha Energy** -> shopify ID 15009468744048
7. **BCAA Post Workout** -> shopify ID 15009463599472
8. **Bee Bread Powder** -> shopify ID 15014339969392
9. **Bee Pearl** -> shopify ID 15002782138736
10. **Birch Chaga Truffles** -> shopify ID 15012318413168

## Etape 3 : Enrichir la section "Science" des fiches produits (PDP)

Modifier `ScienceSection.tsx` pour :
- Accepter un `productHandle` ou `shopifyProductId` en prop
- Requeter la table `product_knowledge` pour ce produit
- Remplacer les placeholders actuels par les vraies donnees :
  - TL;DR personnalise
  - Conclusions d'etudes reelles
  - Sources scientifiques avec vrais liens/titres
  - Score d'efficacite
- Afficher un etat de chargement et un fallback si pas de donnees

## Etape 4 : Enrichir le Coach IA

Modifier l'Edge Function `ai-coach` pour :
- Requeter `product_knowledge` quand l'utilisateur pose une question sur un produit specifique
- Injecter le `tldr`, les `key_findings` et `safety_warnings` dans le contexte de l'IA
- Permettre a l'IA de donner des reponses basees sur de vraies donnees scientifiques au lieu de reponses generiques

## Etape 5 : Enrichir les recommandations IA

Modifier l'Edge Function `ai-shop-recommendations` pour :
- Acceder aux `efficacy_score`, `synergies` et `safety_warnings` lors de la generation de recommandations
- Eviter de recommander des produits avec des alertes de securite pertinentes pour le profil de l'utilisateur

---

## Details techniques

### Migration SQL

```sql
CREATE TABLE public.product_knowledge (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shopify_product_id text,
  product_name text NOT NULL,
  product_handle text,
  tldr text,
  key_findings jsonb DEFAULT '[]',
  ingredients_analysis jsonb DEFAULT '[]',
  clinical_references jsonb DEFAULT '[]',
  safety_warnings jsonb DEFAULT '[]',
  regulatory_status jsonb DEFAULT '{}',
  efficacy_score text,
  synergies jsonb DEFAULT '[]',
  raw_content text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.product_knowledge ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read product knowledge"
  ON public.product_knowledge FOR SELECT
  TO authenticated USING (true);

CREATE UNIQUE INDEX idx_product_knowledge_handle
  ON public.product_knowledge(product_handle);
```

### Structure JSON des donnees extraites

Chaque rapport sera structure ainsi :

```text
key_findings: [
  { "finding": "Le dosage de X est sous-clinique...", "confidence": "high" },
  ...
]

clinical_references: [
  { "title": "...", "journal": "...", "year": 2024, "url": "..." },
  ...
]

safety_warnings: [
  { "level": "caution", "warning": "Interaction avec les ISRS", "detail": "..." },
  ...
]

synergies: [
  { "product_handle": "vitamin-d3", "reason": "Synergie pour absorption calcium" },
  ...
]
```

### Fichiers modifies

| Fichier | Modification |
|---------|-------------|
| Migration SQL | Nouvelle table `product_knowledge` |
| `src/components/dashboard/pdp/ScienceSection.tsx` | Remplacer placeholders par donnees reelles de la DB |
| `src/components/dashboard/pdp/ProductDetailMaster.tsx` | Passer le handle a ScienceSection |
| `supabase/functions/ai-coach/index.ts` | Requeter product_knowledge pour enrichir le contexte |
| `supabase/functions/ai-shop-recommendations/index.ts` | Utiliser les donnees scientifiques pour les recommandations |

