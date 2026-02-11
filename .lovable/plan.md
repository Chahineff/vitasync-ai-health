
# Migration Gemini vers ChatGPT - Systeme de modeles par plan tarifaire

## Vue d'ensemble

Remplacement complet des modeles Google Gemini par les modeles OpenAI GPT-5 dans tout le systeme, avec un acces aux modeles conditionne par le plan tarifaire de l'utilisateur (Gratuit / Go AI / Premium AI). Integration du mode "thinking" pour GPT-5.2.

---

## 1. Nouveau mapping des modeles par plan

| Plan | Modeles disponibles | Restrictions |
|---|---|---|
| **Gratuit** | `openai/gpt-5-nano` | Seul modele, tres restreint |
| | `openai/gpt-5-mini` | Tres restreint (max_tokens bas, pas de thinking) |
| **Go AI** (7,99EUR) | `openai/gpt-5-nano` | Libre |
| | `openai/gpt-5-mini` | Presque pas restreint |
| | `openai/gpt-5` | Legerement restreint (max_tokens moyen) |
| **Premium AI** (24,99EUR) | `openai/gpt-5-nano` | Libre |
| | `openai/gpt-5-mini` | Libre |
| | `openai/gpt-5` | Presque pas restreint |
| | `openai/gpt-5.2` | Disponible avec mode Thinking |

---

## 2. ChatModelSelector.tsx - Refonte complete

**Changements :**
- Remplacer l'interface `AIModel` : supprimer `version`/`mode`, ajouter `tier` (free/go/premium) et `thinking` (boolean)
- Nouveau tableau `AI_MODELS` avec les 4 modeles OpenAI
- Le selecteur recoit le plan utilisateur en prop (`userPlan: 'free' | 'go' | 'premium'`) pour filtrer les modeles accessibles
- Les modeles non accessibles sont affiches en grise avec un badge "Go AI" ou "Premium AI" et un cadenas
- Regroupement par categorie : "Rapide" (Nano/Mini) et "Avance" (GPT-5/GPT-5.2)
- GPT-5.2 affiche un badge "Thinking" special avec icone Brain

**Nouveau tableau de modeles :**

```text
openai/gpt-5-nano    -> "VitaSync Nano"     - Rapide et leger     - tier: free
openai/gpt-5-mini    -> "VitaSync Mini"     - Equilibre           - tier: free
openai/gpt-5         -> "VitaSync Pro"      - Puissant            - tier: go
openai/gpt-5.2       -> "VitaSync Ultra"    - Reflexion avancee   - tier: premium
```

---

## 3. ChatInterface.tsx - Adaptations

- Le modele par defaut change selon le plan :
  - Free : `openai/gpt-5-nano`
  - Go AI : `openai/gpt-5-mini`
  - Premium AI : `openai/gpt-5`
- Passer `userPlan` au `ChatModelSelector`
- Ajouter le support du mode "thinking" : quand le modele est `openai/gpt-5.2`, parser les blocs de reflexion dans le flux SSE et les afficher dans une section pliable "En cours de reflexion..." avant la reponse finale
- Le message envoyé au backend inclut un flag `thinking: true` quand GPT-5.2 est selectionne

**Note sur le plan utilisateur :** Pour l'instant, le plan sera determine cote client (pas de verification backend stricte). On utilisera un champ du profil utilisateur ou une valeur par defaut "free".

---

## 4. Edge Function ai-coach/index.ts - Migration backend

**Changements :**
- Remplacer `ALLOWED_MODELS` par les 4 modeles OpenAI
- Modele par defaut : `openai/gpt-5-nano` (au lieu de gemini-3-flash)
- Ajuster `max_tokens` selon le modele :
  - `gpt-5-nano` : 2048
  - `gpt-5-mini` : 4096
  - `gpt-5` : 6144
  - `gpt-5.2` : 8192
- Quand le modele est `openai/gpt-5.2`, inclure les parametres de thinking/reasoning dans la requete API pour que le flux SSE contienne les tokens de reflexion

---

## 5. Autres Edge Functions - Migration

**`supabase/functions/ai-shop-recommendations/index.ts`** :
- Remplacer `google/gemini-3-pro-preview` par `openai/gpt-5`

**`supabase/functions/supplement-insights/index.ts`** :
- Remplacer `google/gemini-3-pro-preview` par `openai/gpt-5`

**`supabase/functions/parse-product-pdfs/index.ts`** :
- Remplacer `google/gemini-2.5-flash` par `openai/gpt-5-mini`

---

## 6. Affichage du mode Thinking (GPT-5.2)

**Dans ChatMessageBubble.tsx :**
- Detecter les blocs de reflexion dans le contenu streame (delimiteurs `<think>...</think>` ou champ `reasoning` du SSE selon le format de l'API)
- Afficher une section pliable au-dessus de la reponse :
  - Header : icone Brain + "Reflexion en cours..." (anime pendant le streaming)
  - Contenu : le texte de reflexion en police plus petite, couleur attenuee
  - Une fois le streaming termine : le header devient "Reflexion" et la section est repliee par defaut
- La reponse finale s'affiche normalement en dessous

**Dans TypingIndicator.tsx :**
- Quand le modele selectionne est GPT-5.2, changer les phrases rotatives pour inclure "Reflexion approfondie..." et "Analyse multi-etapes..."

---

## 7. Traductions (i18n.ts)

Ajouter les cles :
- `chat.model.nano` / `chat.model.mini` / `chat.model.pro` / `chat.model.ultra`
- `chat.model.nanoDesc` / `chat.model.miniDesc` / `chat.model.proDesc` / `chat.model.ultraDesc`
- `chat.thinking` : "Reflexion en cours..."
- `chat.thinkingDone` : "Reflexion"
- `chat.modelLocked` : "Disponible avec le plan {plan}"

---

## Fichiers modifies

| Fichier | Modification |
|---|---|
| `src/components/dashboard/chat/ChatModelSelector.tsx` | Refonte complete : modeles OpenAI, filtrage par plan, badge Thinking |
| `src/components/dashboard/ChatInterface.tsx` | Modele par defaut par plan, flag thinking, parsing blocs de reflexion |
| `src/components/dashboard/chat/ChatMessageBubble.tsx` | Section pliable "Reflexion" pour GPT-5.2 |
| `src/components/dashboard/TypingIndicator.tsx` | Phrases adaptees au mode thinking |
| `supabase/functions/ai-coach/index.ts` | Modeles OpenAI, max_tokens par modele, parametres thinking |
| `supabase/functions/ai-shop-recommendations/index.ts` | Gemini -> openai/gpt-5 |
| `supabase/functions/supplement-insights/index.ts` | Gemini -> openai/gpt-5 |
| `supabase/functions/parse-product-pdfs/index.ts` | Gemini -> openai/gpt-5-mini |
| `src/lib/i18n.ts` | Nouvelles cles pour les noms de modeles et le mode thinking |
