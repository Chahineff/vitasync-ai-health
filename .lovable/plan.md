# Restructuration des modeles IA VitaSync

## Resume

Remplacement des 4 modeles actuels (1.0 Flash, 1.0 Pro, 2.0 Flash, 2.0 Pro) par 3 modeles alignes sur le modele economique :


| Ancien             | Nouveau            | Modele reel            | Usage                                                           |
| ------------------ | ------------------ | ---------------------- | --------------------------------------------------------------- |
| VitaSync 1.0 Flash | VitaSync 2.5 Flash | gemini-2.5-flash-lite  | Supplement Tracking + Shop Recommendations + Coach IA (default) |
| VitaSync 1.0 Pro   | *(supprime)*       | -                      | -                                                               |
| VitaSync 2.0 Flash | VitaSync 3 Flash   | gemini-3-flash-preview | Coach IA (defaut for premium member)                            |
| VitaSync 2.0 Pro   | VitaSync 3 Pro     | gemini-3-pro-preview   | Coach IA (premium)                                              |


---

## Modifications

### 1. ChatModelSelector.tsx -- Refonte du selecteur de modeles

- Remplacer les 4 modeles par 3 :
  - VitaSync 2.5 Flash (gemini-2.5-flash-lite) - "Rapide et economique"
  - VitaSync 3 Flash (gemini-3-flash-preview) - "Equilibre optimal"
  - VitaSync 3 Pro (gemini-3-pro-preview) - "Reflexion approfondie"
- Mettre a jour le type `AIModel` (version devient `'2.5' | '3.0'`)
- Adapter l'UI du dropdown (plus besoin de 2 sections separees)

### 2. ChatInterface.tsx -- Mise a jour du modele par defaut

- Changer `DEFAULT_MODEL` pour pointer sur VitaSync 3 Flash (gemini-3-flash-preview)
- Le `modelVersion` envoye au backend refletera `'2.5'` ou `'3.0'`

### 3. ai-coach/index.ts -- Backend du Coach IA

- Mettre a jour `ALLOWED_MODELS` pour inclure `google/gemini-2.5-flash-lite`
- Adapter la logique de quiz : disponible uniquement pour les modeles version 3.0 (remplace la condition `2.0`)
- Modele par defaut fallback : `google/gemini-3-flash-preview`

### 4. supplement-insights/index.ts -- Analyse IA des supplements

- Changer le modele de `google/gemini-3-pro-preview` a `google/gemini-2.5-flash-lite`
- Meme fonctionnalite, cout reduit

### 5. ai-shop-recommendations/index.ts -- Recommandations IA boutique

- Changer le modele de `google/gemini-3-pro-preview` a `google/gemini-2.5-flash-lite`
- Meme fonctionnalite, cout reduit

---

## Detail technique

### Nouveaux modeles (ChatModelSelector)

```text
VitaSync 2.5 Flash  -> google/gemini-2.5-flash-lite  (version: '2.5', mode: 'flash')
VitaSync 3 Flash    -> google/gemini-3-flash-preview  (version: '3.0', mode: 'flash')
VitaSync 3 Pro      -> google/gemini-3-pro-preview    (version: '3.0', mode: 'pro')
```

### Impact sur les fonctionnalites

- Quiz interactifs : reserves aux modeles version `3.0` (VitaSync 3 Flash et 3 Pro)
- Supplement Tracking et Shop : utiliseront `gemini-2.5-flash-lite` (le moins cher) au lieu de `gemini-3-pro-preview`
- Coach IA : par defaut VitaSync 3 Flash, avec option Pro

### Fichiers modifies


| Fichier                                               | Changement                                |
| ----------------------------------------------------- | ----------------------------------------- |
| `src/components/dashboard/chat/ChatModelSelector.tsx` | 3 modeles, nouveau nommage, UI simplifiee |
| `src/components/dashboard/ChatInterface.tsx`          | DEFAULT_MODEL mis a jour                  |
| `supabase/functions/ai-coach/index.ts`                | ALLOWED_MODELS + logique quiz version 3.0 |
| `supabase/functions/supplement-insights/index.ts`     | Modele -> gemini-2.5-flash-lite           |
| `supabase/functions/ai-shop-recommendations/index.ts` | Modele -> gemini-2.5-flash-lite           |
