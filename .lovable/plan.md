
# Plan d'amelioration du Chat IA VitaSync

## Resume des demandes

1. **Selecteur de modele IA** : Switch entre VitaSync 1.0 (Gemini 2.5) et VitaSync 2.0 (Gemini 3.0) avec options Flash/Pro
2. **Suppression de la bulle pour les reponses IA** : L'IA doit occuper toute la largeur sans etre dans une bulle
3. **Amelioration du Thinking Indicator** : Pas dans une bulle + meilleure animation
4. **Correction des recommandations produits incompletes** : L'IA doit afficher tous les produits recommandes
5. **Recherche dans les chats** : Fonctionnalite de recherche dans l'historique des conversations

---

## Solution 1 : Selecteur de modele IA

### Architecture

```text
+------------------------------------------------------------------+
|  HEADER DU CHAT                                                  |
|  +---------------------------+  +----------------------------+   |
|  | VitaSync 1.0          ▼  |  | VitaSync 2.0           ▼   |   |
|  |  ○ Flash (rapide)        |  |  ○ Flash (rapide)          |   |
|  |  ○ Pro (reflexion)       |  |  ○ Pro (reflexion)         |   |
|  +---------------------------+  +----------------------------+   |
+------------------------------------------------------------------+
```

### Nouveau composant : `ChatModelSelector.tsx`

Bouton dropdown en haut a gauche du chat permettant de :
- Choisir entre VitaSync 1.0 et 2.0
- Sous-options pour Flash ou Pro

### Mapping des modeles

| Version | Mode | Modele Lovable AI |
|---------|------|-------------------|
| VitaSync 1.0 | Flash | `google/gemini-2.5-flash` |
| VitaSync 1.0 | Pro | `google/gemini-2.5-pro` |
| VitaSync 2.0 | Flash | `google/gemini-3-flash-preview` |
| VitaSync 2.0 | Pro | `google/gemini-3-pro-preview` |

### Modifications requises

**Fichier : `src/components/dashboard/ChatInterface.tsx`**
- Ajouter un state pour le modele selectionne : `selectedModel`
- Passer le modele dans la requete a l'edge function
- Afficher le selecteur en haut du chat

**Fichier : `supabase/functions/ai-coach/index.ts`**
- Accepter un parametre `model` dans le body de la requete
- Utiliser ce modele pour l'appel a Lovable AI (avec validation des modeles autorises)

---

## Solution 2 : Suppression de la bulle pour les reponses IA

### Design actuel vs nouveau design

**AVANT :**
```text
+----------------------------------------------------+
|  [Avatar IA]  +------------------------------+     |
|               |  Bulle avec fond + bordure   |     |
|               |  Contenu du message          |     |
|               +------------------------------+     |
|               [Copy] [TTS] [Regenerate]            |
+----------------------------------------------------+
```

**APRES :**
```text
+----------------------------------------------------+
|  [Avatar IA] VitaSync AI                           |
|                                                    |
|  Contenu du message sans bulle, pleine largeur    |
|  Lorem ipsum dolor sit amet...                     |
|                                                    |
|  [Carte produit recommande]                        |
|                                                    |
|  Suite du message...                               |
|                                                    |
|  [Copy] [TTS] [Regenerate]                         |
+----------------------------------------------------+
```

### Fichier : `src/components/dashboard/chat/ChatMessageBubble.tsx`

Modifications :
- Supprimer le fond et la bordure pour les messages `assistant`
- Conserver la bulle uniquement pour les messages `user`
- Ajouter le label "VitaSync AI" a cote de l'avatar
- Garder les boutons d'action en dessous

---

## Solution 3 : Amelioration du Thinking Indicator

### Nouveau design sans bulle

```text
+----------------------------------------------------+
|  [Avatar IA anime]                                 |
|                                                    |
|  ✨ VitaSync reflechit...                          |
|  ▪ ▪ ▪ (animation wave)                            |
|                                                    |
+----------------------------------------------------+
```

### Fichier : `src/components/dashboard/TypingIndicator.tsx`

Ameliorations :
- Design plus epure sans bulle
- Animation plus fluide avec pulsation de l'icone
- Texte "VitaSync reflechit..." avec shimmer

### Fichier : `src/components/dashboard/ChatInterface.tsx`

Modifier la zone du typing indicator pour supprimer la bulle englobante.

---

## Solution 4 : Correction des recommandations produits incompletes

### Probleme identifie

Le systeme prompt de l'IA demande d'utiliser le format `[[PRODUCT:...]]` mais parfois l'IA :
- Ne termine pas sa reponse
- Oublie certains produits

### Solutions

**Fichier : `supabase/functions/ai-coach/index.ts`**

1. Augmenter le `max_tokens` pour eviter les reponses tronquees
2. Renforcer le system prompt pour insister sur l'affichage de TOUS les produits recommandes
3. Ajouter une instruction claire : "Affiche chaque produit sur une ligne separee"

**Modifications du prompt :**
```text
REGLE CRITIQUE POUR LES RECOMMANDATIONS:
- Quand tu recommandes plusieurs produits, AFFICHE CHAQUE PRODUIT SEPAREMENT
- Ne groupe JAMAIS plusieurs [[PRODUCT:...]] sur la meme ligne
- Ajoute une ligne vide entre chaque recommandation de produit
- Assure-toi de TERMINER ta reponse complete
```

---

## Solution 5 : Recherche dans les chats

### Design de la fonctionnalite

```text
+------------------------------------------------------------------+
|  SIDEBAR                                                          |
|  +------------------------------------------------------------+  |
|  |  [🔍] Rechercher dans les conversations...                  |  |
|  +------------------------------------------------------------+  |
|                                                                   |
|  [+ Nouvelle conversation]                                        |
|                                                                   |
|  Aujourd'hui                                                      |
|  - Conv 1 (avec highlight si match)                              |
|  - Conv 2                                                        |
+------------------------------------------------------------------+
```

### Fichier : `src/components/dashboard/chat/ChatSidebar.tsx`

Modifications :
- Ajouter un champ de recherche en haut de la sidebar
- State local pour le terme de recherche
- Filtrer les conversations affichees en fonction du terme
- Highlight le texte qui matche dans les titres

### Logique de recherche

```typescript
// Filtrage local cote client
const filteredConversations = useMemo(() => {
  if (!searchTerm.trim()) return conversations;
  
  const term = searchTerm.toLowerCase();
  return conversations.filter(conv => 
    conv.title?.toLowerCase().includes(term)
  );
}, [conversations, searchTerm]);
```

---

## Fichiers a creer/modifier

| Fichier | Action | Description |
|---------|--------|-------------|
| `src/components/dashboard/chat/ChatModelSelector.tsx` | Creer | Selecteur de modele IA avec dropdown |
| `src/components/dashboard/ChatInterface.tsx` | Modifier | Integrer le selecteur + passer le modele |
| `src/components/dashboard/chat/ChatMessageBubble.tsx` | Modifier | Supprimer la bulle pour l'IA |
| `src/components/dashboard/TypingIndicator.tsx` | Modifier | Nouveau design sans bulle |
| `src/components/dashboard/chat/ChatSidebar.tsx` | Modifier | Ajouter la recherche |
| `supabase/functions/ai-coach/index.ts` | Modifier | Support du parametre model + prompt ameliore |
| `src/components/dashboard/chat/index.ts` | Modifier | Exporter le nouveau composant |

---

## Details techniques

### ChatModelSelector.tsx

```typescript
interface AIModel {
  version: '1.0' | '2.0';
  mode: 'flash' | 'pro';
  label: string;
  description: string;
  model: string; // Modele Lovable AI
}

const AI_MODELS: AIModel[] = [
  { 
    version: '1.0', 
    mode: 'flash', 
    label: 'VitaSync 1.0 Flash',
    description: 'Reponse rapide',
    model: 'google/gemini-2.5-flash'
  },
  { 
    version: '1.0', 
    mode: 'pro', 
    label: 'VitaSync 1.0 Pro',
    description: 'Reflexion approfondie',
    model: 'google/gemini-2.5-pro'
  },
  { 
    version: '2.0', 
    mode: 'flash', 
    label: 'VitaSync 2.0 Flash',
    description: 'Nouvelle generation rapide',
    model: 'google/gemini-3-flash-preview'
  },
  { 
    version: '2.0', 
    mode: 'pro', 
    label: 'VitaSync 2.0 Pro',
    description: 'Nouvelle generation avancee',
    model: 'google/gemini-3-pro-preview'
  },
];
```

### Structure du dropdown

Deux niveaux de selection :
1. Version (1.0 ou 2.0) - affiche comme onglets ou toggle
2. Mode (Flash ou Pro) - radio buttons sous la version

### Modification de l'edge function

```typescript
// Valider le modele recu
const ALLOWED_MODELS = [
  'google/gemini-2.5-flash',
  'google/gemini-2.5-pro',
  'google/gemini-3-flash-preview',
  'google/gemini-3-pro-preview'
];

const requestedModel = requestBody.model || 'google/gemini-3-flash-preview';
const model = ALLOWED_MODELS.includes(requestedModel) 
  ? requestedModel 
  : 'google/gemini-3-flash-preview';
```

---

## Nouveau style pour les messages IA

```css
/* Message utilisateur - garde la bulle */
.user-message {
  background: gradient(primary/15 → primary/5);
  border: 1px solid primary/20;
  border-radius: 16px;
  padding: 16px 20px;
  max-width: 75%;
}

/* Message IA - sans bulle */
.assistant-message {
  background: transparent;
  border: none;
  padding: 0;
  width: 100%;
}
```

---

## Barre de recherche dans la sidebar

Caracteristiques :
- Icone loupe a gauche
- Placeholder "Rechercher..."
- Bouton X pour effacer quand text present
- Animation d'expansion au focus
- Filtre en temps reel pendant la frappe

---

## Avantages

1. **Flexibilite** : L'utilisateur choisit le modele adapte a ses besoins (rapide vs approfondi)
2. **Lisibilite** : Les reponses de l'IA prennent plus de place et sont plus faciles a lire
3. **Coherence** : Le typing indicator s'integre mieux au design sans bulle
4. **Fiabilite** : Les recommandations produits seront completes
5. **Productivite** : Recherche rapide dans l'historique des conversations
