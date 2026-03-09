

# Plan: Blog Shopify + Corrections Coach IA

## 1. Blog via Shopify Storefront API

Le Storefront API expose les articles de blog via la query `articles`. On remplace la table `blog_posts` par un fetch Shopify.

### Modifications :

**`src/pages/Blog.tsx`** — Remplacer le query Supabase par un fetch Shopify Storefront API :
- Query GraphQL : `{ articles(first: 20, sortKey: PUBLISHED_AT, reverse: true) { edges { node { id title handle excerpt publishedAt image { url altText } blog { title } author { name } } } } }`
- Utiliser `storefrontApiRequest` depuis `src/lib/shopify.ts` (déjà existant)
- Mapper les champs : `publishedAt` → date, `blog.title` → catégorie, `excerpt` → extrait
- Garder le design actuel (GlassCard, gradients, hero)
- La page `/blog/:slug` charge un article individuel via `articleByHandle` ou on utilise le handle

**`src/pages/BlogPost.tsx`** (nouveau) — Page article individuel :
- Query : `{ blog(handle: "news") { articleByHandle(handle: $handle) { title content contentHtml publishedAt image { url } author { name } } } }`
- Rendu du contenu HTML avec DOMPurify (déjà installé)
- Bouton retour vers /blog

**`src/App.tsx`** — Ajouter route `/blog/:slug` vers `BlogPost`

**`src/pages/Dashboard.tsx`** — Ajouter "Blog" dans le menu sidebar (section `generalItems`) avec icône `BookOpen` (déjà importé), qui navigue vers `/blog` via `window.open` ou `navigate`

### Note : La table `blog_posts` reste en place mais n'est plus utilisée par la page Blog.

---

## 2. Correction Quiz — Le quiz ne s'affiche pas

**Problème identifié** : Le quiz est parsé inline dans le message. Quand l'IA génère le quiz, le streaming progressif (3-5 chars à la fois) fait que `parseQuizBlock` ne trouve jamais `[[QUIZ_START]]` et `[[QUIZ_END]]` en même temps car le contenu arrive par morceaux. Le quiz apparaît comme du texte brut.

**Solution** : Le parsing du quiz se fait dans `MessageContent` qui reçoit le `content` progressif. Mais le vrai problème est que l'IA génère souvent le format quiz avec des variations (espaces, retours à la ligne entre les tags). Il faut :

**`supabase/functions/ai-coach/index.ts`** — Améliorer les instructions quiz dans le system prompt :
- Ajouter des exemples plus explicites avec le format exact attendu
- Préciser : "Chaque question DOIT être sur une seule ligne. Le format `Q1: Question ? | Option A | Option B | Option C | Option D` est OBLIGATOIRE. N'utilise PAS de Markdown entre les tags QUIZ."
- Ajouter une règle : "Ne génère le quiz que quand l'utilisateur le demande explicitement"

**`src/components/dashboard/chat/ChatQuizBlock.tsx`** — Rendre le parsing plus tolérant :
- Accepter `[[QUIZ_START]]` avec espaces/retours avant/après
- Accepter des variations comme `Q1 :` (espace avant les deux-points)
- Accepter des lignes avec retours supplémentaires

**UX Quiz amélioré** : Le quiz s'affiche en overlay (3/4 écran) au lieu d'inline :
- Quand un quiz est détecté dans le message, afficher un bouton "Ouvrir le quiz" dans le chat
- Le quiz s'ouvre en modal/overlay occupant ~75% de l'écran avec le chat visible derrière (fond semi-transparent)
- Bouton "Quitter" pour fermer sans terminer
- Bouton "Envoyer les résultats" à la fin qui envoie le résumé au coach

**`src/components/dashboard/ChatInterface.tsx`** — Ajouter un state `activeQuiz` pour gérer l'overlay quiz

---

## 3. Produits dupliqués dans les recommandations

**`supabase/functions/ai-coach/index.ts`** — Le system prompt dit déjà "jamais même ProductID 2 fois" mais l'IA ne respecte pas toujours. Renforcer :
- Ajouter en gras dans le prompt : "⚠️ RÈGLE ABSOLUE : Ne recommande JAMAIS 2 fois le même produit dans une conversation. Vérifie les messages précédents avant de recommander."
- Côté client dans `ChatMessageBubble.tsx`, ajouter un filtre de déduplication sur les `productId` dans `parseProductRecommendations`

---

## 4. Stack commands visibles après rechargement

**Problème** : Quand on recharge la conversation, les messages sauvegardés contiennent les tags `[[STACK_ADD:...]]` bruts car `parseStackCommands` ne s'exécute qu'au moment du streaming.

**`src/components/dashboard/chat/ChatMessageBubble.tsx`** — Dans `MessageContent`, appliquer `parseStackCommands` sur le contenu affiché pour nettoyer les tags. Ajouter un bouton "📦 Voir le stack IA" quand des commandes stack sont détectées dans un message, qui ouvre le panneau `AIStackPanel` et y injecte les items.

---

## 5. Animation "Réflexion" VitaSync 3 Pro s'arrête trop tôt

**Problème** : Le `TypingIndicator` s'affiche uniquement quand `isLoading && messages[messages.length - 1]?.role === 'user'`. Dès que le premier chunk SSE arrive et crée le message assistant vide, cette condition devient fausse et l'indicateur disparaît. L'animation de réflexion ne dure que le temps avant le premier token.

**`src/components/dashboard/ChatInterface.tsx`** — Pour le modèle 3 Pro (qui a un temps de réflexion long avant les premiers tokens), maintenir le TypingIndicator visible tant que le contenu de l'assistant est vide ou ne contient que des balises `<think>`. Modifier la condition :
```
{isLoading && (messages[messages.length - 1]?.role === 'user' || 
  (messages[messages.length - 1]?.role === 'assistant' && 
   messages[messages.length - 1]?.content.trim().length === 0)) && (
  <TypingIndicator selectedModel={selectedModel.model} />
)}
```

Aussi, pendant le streaming, si le contenu ne contient que `<think>...</think>` (pas encore de réponse visible), continuer à afficher l'indicateur de réflexion.

---

## Fichiers impactés

| Fichier | Action |
|---|---|
| `src/pages/Blog.tsx` | Refonte : fetch Shopify au lieu de Supabase |
| `src/pages/BlogPost.tsx` | Nouveau : page article individuel |
| `src/App.tsx` | Ajouter route BlogPost |
| `src/pages/Dashboard.tsx` | Ajouter lien Blog dans sidebar |
| `supabase/functions/ai-coach/index.ts` | Renforcer instructions quiz + déduplication |
| `src/components/dashboard/chat/ChatQuizBlock.tsx` | Parsing tolérant + UX overlay |
| `src/components/dashboard/chat/ChatMessageBubble.tsx` | Nettoyage stack commands + bouton stack + dédup produits |
| `src/components/dashboard/ChatInterface.tsx` | Overlay quiz + fix TypingIndicator 3 Pro |
| `src/components/dashboard/TypingIndicator.tsx` | Aucun changement (la logique est dans ChatInterface) |

