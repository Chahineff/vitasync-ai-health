

# Ajout de VitaSync 5 Mini et VitaSync 5.2 (OpenAI GPT-5-mini & GPT-5.2)

## Modifications

### 1. `src/components/dashboard/chat/ChatModelSelector.tsx`

- Elargir le type `AIModel` : ajouter `version: '5.0' | '5.2'` et `mode: 'mini'` aux unions existantes
- Ajouter 2 nouveaux modeles dans `AI_MODELS` :
  - `{ version: '5.0', mode: 'mini', label: 'VitaSync 5 Mini', description: 'Rapide et polyvalent', model: 'openai/gpt-5-mini' }`
  - `{ version: '5.2', mode: 'pro', label: 'VitaSync 5.2', description: 'Raisonnement avancé', model: 'openai/gpt-5.2' }`
- Ajouter une icone distincte pour les modeles OpenAI dans `ModelIcon` (ex: `ChatCircleDots` ou `Robot` de Phosphor en bleu/vert)
- Ajouter un separateur visuel dans le dropdown entre les modeles Gemini et OpenAI (label "Google" / "OpenAI")

### 2. `supabase/functions/ai-coach/index.ts`

- Ajouter `'openai/gpt-5-mini'` et `'openai/gpt-5.2'` dans le tableau `ALLOWED_MODELS` (ligne 359)
- Dans `getHistoryDays()` : `gpt-5-mini` → 30 jours, `gpt-5.2` → 90 jours (equivalent aux modeles Gemini avances)
- Dans la condition quiz/chart : activer quiz pour `gpt-5.2`, activer charts+references pour les deux modeles OpenAI (memes capacites que Gemini 3 Flash/Pro)
- Le system prompt reste strictement identique — memes regles, memes formats `[[PRODUCT:...]]`, `[[STACK_ADD:...]]`, etc.

### Fichiers impactes
- `src/components/dashboard/chat/ChatModelSelector.tsx` — nouveaux modeles + icones + separateurs
- `supabase/functions/ai-coach/index.ts` — ALLOWED_MODELS + getHistoryDays + conditions quiz/chart

