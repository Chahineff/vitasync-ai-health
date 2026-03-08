# Diagnostic : "Désolé, une erreur s'est produite"

## Le probleme identifie

Le system prompt de l'Edge Function `ai-coach` fait **127 837 caracteres** (~32K tokens en entree). Avec 97 produits enrichis, le catalogue Shopify complet, les check-ins, le profil sante et l'historique de conversations, la requete envoyee au gateway IA est enorme.

Combine avec `max_tokens: 128000` en sortie, le gateway IA met trop de temps a repondre ou depasse les limites de tokens/rate. L'Edge Function attend la reponse du gateway, et si celui-ci echoue (timeout, rate limit 429, depassement de contexte), l'erreur est attrapee par le `catch` generique (ligne 1181) qui renvoie simplement `"Une erreur s'est produite"` — et le frontend affiche le message que tu vois.

**Pourquoi ca marche apres ~1h :** Les rate limits du gateway IA se reinitialisant par minute/heure, apres une periode d'attente, les requetes passent a nouveau.

**Pourquoi ca casse apres des modifications :** Chaque redeploy de l'Edge Function declenche de nouveaux appels de test/premiers messages qui saturent les rate limits.

## Causes racines

1. **System prompt trop volumineux** (128K chars) — les 97 fiches produits enrichies sont injectees en entier a chaque requete
2. **max_tokens: 128000** inutilement eleve — le modele n'a jamais besoin de generer 128K tokens de sortie
3. **Pas de logging granulaire des erreurs gateway** — le `catch` masque si c'est un 429, un timeout, ou un depassement de contexte
4. **Pas de retry/backoff** cote frontend en cas d'echec transitoire

## Plan de correction

### 1. Reduire le system prompt (~60-70% plus petit)

- Condenser les fiches produits enrichies : garder uniquement `title`, `best_for_tags`, `coach_tip` (pas les ingredients detailles, safety warnings complets, etc.)
- Limiter le catalogue Shopify a 50 produits les plus pertinents ou ne garder que titre + prix + ID
- Tronquer le prompt de base : supprimer les exemples redondants

### 2. Reduire max_tokens de 128000 a 4096

- Les reponses du coach font rarement plus de 500-1000 tokens. 4096 est largement suffisant et evite de bloquer le contexte du modele.

### 3. Ajouter du logging specifique pour les erreurs gateway

- Logger le `response.status` et le corps de la reponse en cas d'erreur du gateway
- Differencier 429 (rate limit), 402 (credits), timeout, et erreurs de contexte dans les logs

### 4. Ajouter un retry automatique cote frontend

- Si la reponse est une 500 ou 429, retenter 1 fois apres 3 secondes avant d'afficher l'erreur
- Afficher un message plus specifique selon le type d'erreur (rate limit vs erreur serveur)

### 5. (Optionnel) Cache du system prompt

- Stocker le system prompt construit en cache (localStorage edge function ou variable globale Deno) pendant 5 min pour eviter de recalculer le catalogue Shopify + produits enrichis a chaque message

## Fichiers impactes

- `supabase/functions/ai-coach/index.ts` — Reduction prompt, max_tokens, logging
- `src/components/dashboard/ChatInterface.tsx` — Retry logic, messages d'erreur specifiques

## Priorite

1. **Reduire max_tokens** (1 ligne, impact immediat)
2. **Condenser le system prompt** (impact majeur sur la fiabilite)
3. **Logging granulaire** (pour diagnostiquer les futurs problemes)
4. **Retry frontend** (UX resiliente)

Point Important l'IA doit toujous pouvoir proposer tout les different produit du store et analysé les info de l'utlisateur.