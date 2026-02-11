

# Correction des reponses tronquees et animation typewriter

## Problemes identifies

1. **Reponses tronquees** : L'IA termine parfois avec "produit:" sans afficher la carte produit. Cause : `max_tokens: 4096` est insuffisant avec un system prompt de 130 000 caracteres. Le parsing nettoie les tags malformes mais le texte brut "produit:" reste visible.

2. **Pas d'effet typewriter** : Le SSE met a jour le contenu directement dans le state React, ce qui affiche le texte d'un coup a chaque chunk. L'utilisateur veut un reveal progressif caractere par caractere, comme si quelqu'un tapait.

---

## Modifications

### 1. Augmenter max_tokens (Edge Function)

**Fichier** : `supabase/functions/ai-coach/index.ts`

- Passer `max_tokens` de `4096` a `8192` (ligne 931) pour eviter les reponses tronquees
- Ajouter dans le system prompt une instruction explicite : "TERMINE TOUJOURS tes tags produit. Ne laisse JAMAIS un tag [[PRODUCT:...]] incomplet."

### 2. Meilleur nettoyage des tags incomplets

**Fichier** : `src/components/dashboard/ProductRecommendationCard.tsx`

- Ameliorer le regex de nettoyage pour capturer aussi les fragments partiels comme `[[PRODUCT:` sans fermeture, ou le texte brut "produit:" orphelin en fin de message
- Ajouter un nettoyage de `\[\[PROD` et `\[\[P` (debut de tag coupe)

### 3. Systeme typewriter avec buffer progressif

**Fichier** : `src/components/dashboard/ChatInterface.tsx`

Implementer un systeme a deux buffers :

- `fullContent` : le contenu complet recu du SSE (mis a jour en temps reel)
- `displayedContent` : le contenu affiche a l'ecran (revele progressivement)

Logique :
- Un `useRef` stocke le contenu complet du SSE
- Un `setInterval` (toutes les 15-20ms) ajoute 2-3 caracteres au `displayedContent`
- Quand le SSE est termine ET que `displayedContent` rattrape `fullContent`, le streaming est "termine"
- Le `isStreaming` passe a `false` uniquement quand le reveal est fini (pas quand le SSE finit)

Cela garantit que meme si l'IA repond vite, le texte s'affiche progressivement.

### 4. Masque gradient pendant le reveal

**Fichier** : `src/components/dashboard/chat/ChatMessageBubble.tsx`

Le masque gradient existant (lignes 206-208) reste en place. Il est deja conditionne a `isStreaming`, donc avec le nouveau systeme de buffer, il restera actif pendant toute la duree du reveal progressif.

---

## Flux technique

```text
SSE chunks ──> fullContentRef (instantane)
                    │
            setInterval 15ms
                    │
                    v
          displayedContent (state, +3 chars)
                    │
                    v
           ChatMessageBubble
           (isRevealing = true tant que displayed < full)
           (masque gradient en bas)
```

---

## Fichiers modifies

| Fichier | Modification |
|---|---|
| `supabase/functions/ai-coach/index.ts` | max_tokens 4096 -> 8192, instruction "ne jamais tronquer les tags" |
| `src/components/dashboard/ProductRecommendationCard.tsx` | Nettoyage ameliore des tags partiels |
| `src/components/dashboard/ChatInterface.tsx` | Systeme typewriter a deux buffers (fullContent + displayedContent), isStreaming etendu au reveal |
| `src/components/dashboard/chat/ChatMessageBubble.tsx` | Aucun changement structurel, le masque gradient fonctionne deja |

