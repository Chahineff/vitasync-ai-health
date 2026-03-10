

# Plan : Hiérarchie des modèles VitaSync — Bridage progressif

## Matrice des capacités (mise à jour)

```text
Fonctionnalité              │ 2.5 Flash │ 3 Flash │ 3 Pro
────────────────────────────┼───────────┼─────────┼──────
Catalogue produits          │ ✓ Oui     │ ✓ Oui   │ ✓ Oui
Recommandations produits    │ 1/réponse │ 2/rép   │ 2/rép
Stack IA (panneau latéral)  │ ✗ Non     │ ✓ Oui   │ ✓ Oui
Quiz interactif             │ ✗ Non     │ ✓ Oui   │ ✓ Oui
Graphiques                  │ ✗ Non     │ ✓ Oui   │ ✓ Oui
Références interactives     │ ✗ Non     │ Partiel │ ✓ Tout
Analyses sanguines          │ ✗ Non     │ ✗ Non   │ ✓ Oui
Base scientifique enrichie  │ ✗ Non     │ ✗ Non   │ ✓ Oui
Historique check-ins        │ 7 jours   │ 90 jours│ 90 j
Max tokens réponse          │ 2 048     │ 8 192   │ 16 384
Messages conversation       │ 10        │ 20      │ 20
Profil santé                │ Complet   │ Complet │ Complet
Compléments actifs          │ ✓ Oui     │ ✓ Oui   │ ✓ Oui
```

## Modifications

### 1. `supabase/functions/ai-coach/index.ts`

Ajouter une fonction `getModelTier(model)` retournant `'lite' | 'standard' | 'pro'`.

**Bridage par tier dans `buildSystemPrompt`** (nouveau paramètre `tier`) :
- **Lite** : Inclut catalogue + compléments actifs + profil complet. Exclut : analyses sanguines, base scientifique enrichie, check-ins bruts (seuls les trends agrégés). System prompt ajoute : "Max 1 produit/réponse. Tu ne peux PAS générer de quiz, graphiques, ni de commandes [[STACK_ADD]]. Si l'utilisateur demande ces fonctions, suggère VitaSync 3."
- **Standard** : Tout sauf analyses sanguines et base scientifique enrichie. Quiz + graphiques + stack IA activés.
- **Pro** : Tout, inchangé.

**Bridage du `max_tokens`** : lite=2048, standard=8192, pro=16384.

**Bridage des messages** : lite=`.slice(-10)`, standard/pro=`.slice(-20)`.

**Bridage du system prompt** pour lite : supprimer les sections STACK, QUIZ, GRAPHIQUES, RÉFÉRENCES du prompt. Remplacer "Max 2 produits/réponse" par "Max 1 produit/réponse".

### 2. `src/components/dashboard/chat/ChatModelSelector.tsx`

Mettre à jour les descriptions :
- 2.5 Flash : "Conseils rapides · Recommandations"
- 3 Flash : "Quiz · Graphiques · Stack IA"
- 3 Pro : "Analyse complète · Sang · Science"

### Fichiers impactés

| Fichier | Modification |
|---|---|
| `supabase/functions/ai-coach/index.ts` | Bridage données/tokens/prompt par tier |
| `src/components/dashboard/chat/ChatModelSelector.tsx` | Descriptions mises à jour |

