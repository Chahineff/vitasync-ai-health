
## Plan : VitaSync AI Coach Premium - Refonte Complète

Ce plan couvre 3 domaines majeurs : **1) Refonte du prompt IA**, **2) Améliorations UI Dashboard**, **3) Correction de la dictée vocale**.

---

## 1. Refonte du System Prompt AI Coach

**Fichier : `supabase/functions/ai-coach/index.ts`**

Remplacement complet du `baseSystemPrompt` actuel par le nouveau prompt ultra-structuré qui inclut :

### Nouveau Comportement IA

| Aspect | Avant | Après |
|--------|-------|-------|
| Style | "Réponses courtes" | "Calme, premium, simple" + max 6-10 lignes |
| Vente | Recommandation directe | "Conseil → Options → Achat" (jamais l'inverse) |
| Quiz | Aucune mention | CTA systématique "Quiz 10 questions" |
| Sécurité | Mention générique | Protocole risque (Low/Medium/High) |
| Format | Libre | "Recommandation → Pourquoi → Comment → Précautions → Next step" |

### Moteur de Décision (5 étapes)

```
A. Classifier l'intention (10 catégories : Énergie, Performance, Sommeil, etc.)
B. Évaluer le niveau de risque (Low/Medium/High)
C. Vérifier statut du quiz (fait ou non)
D. Poser max 3 questions si nécessaire
E. Répondre en format standard
```

### Playbooks par Contexte

- **Landing (4 boutons)** : Mini-intro → 2-3 questions → 2 options (Starter/Optimal) → CTA Quiz
- **Question produit** : Définition → 3 bénéfices → Usage → Précaution → CTA "Ajouter au stack?"
- **Stack complet** : Routine AM/PM → 3-6 produits max → CTA "Pack mensuel"
- **Effets indésirables** : Sécurité prioritaire → Pause/simplification → Alternative douce

### Limites Anti-Vendeur

```typescript
// Règle : prospect = max 3 produits starter | client quiz = max 6 produits
// Jamais "Achète X maintenant" en première intention
// Toujours "Voici 2 options, tu préfères laquelle ?"
```

---

## 2. Améliorations UI Dashboard

### 2.1 CTA Principal "Quiz 10 Questions"

**Fichier : `src/components/dashboard/ChatInterface.tsx`**

Ajouter un bouton proéminent au-dessus des 4 cartes de suggestion :

```typescript
// Nouveau composant QuizCTA
<motion.button
  onClick={() => navigate("/onboarding?edit=true")}
  className="w-full p-4 rounded-2xl bg-gradient-to-r from-primary to-secondary..."
>
  <span>🎯 Personnaliser mon plan (60 sec)</span>
</motion.button>
```

**Position** : En haut de l'écran d'accueil du chat, avant les 4 cartes

### 2.2 Mini-Résumé Profil

**Fichier : `src/components/dashboard/ChatInterface.tsx`** (si quiz fait)

Afficher une carte compacte avec :
- Objectif principal
- Budget
- Préférences/Allergies
- Bouton "Modifier mon profil"

```typescript
// Conditionnel : seulement si onboarding_completed === true
{healthProfile?.onboarding_completed && (
  <ProfileSummaryCard 
    goals={healthProfile.health_goals}
    allergies={healthProfile.allergies}
    budget={healthProfile.monthly_budget}
    onEdit={() => navigate("/onboarding?edit=true")}
  />
)}
```

### 2.3 Plan du Jour Automatique

**Nouveau composant : `src/components/dashboard/DailyPlanWidget.tsx`**

Afficher une carte "Aujourd'hui" avec :
- Routine AM : 2-3 compléments suggérés
- Routine PM : 2-3 compléments suggérés  
- 2 habitudes du jour
- Bouton "Ajuster"

**Logique** : Basé sur les compléments suivis + objectifs du profil

### 2.4 Boutons "Guidés" Multi-Étapes

**Fichier : `src/components/dashboard/ChatInterface.tsx`**

Améliorer les 4 cartes de suggestion pour afficher une progression :
- Étape 1/3 : Questions contextuelles
- Étape 2/3 : Recommandation personnalisée
- Étape 3/3 : CTA Quiz ou Pack

**Implémentation** : L'IA gère naturellement ce flow via le nouveau prompt structuré

### 2.5 Disclaimer Amélioré

**Fichier : `src/components/dashboard/ChatInterface.tsx`**

Ajouter un lien "En savoir plus" sous le chat qui ouvre un modal explicatif :
- "VitaSync est un outil de bien-être, pas un diagnostic médical"
- Consultez un professionnel pour tout problème de santé

---

## 3. Correction Dictée Vocale

### Problème Identifié

Le hook `useSpeechToText.tsx` utilise ElevenLabs Scribe qui nécessite un token valide. Les logs montrent aucun appel à l'edge function, suggérant un problème avant même l'appel.

### Solution : Fallback Web Speech API (Option A recommandée)

**Fichier : `src/hooks/useSpeechToText.tsx`**

Refactoriser le hook pour utiliser la **Web Speech API native** (gratuit, 0 coût) avec fallback ElevenLabs si indisponible :

```typescript
export function useSpeechToText(): UseSpeechToTextReturn {
  // Priorité 1 : Web Speech API (navigateur natif)
  const webSpeechSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  
  const startListening = useCallback(async () => {
    if (webSpeechSupported) {
      // Utiliser Web Speech API gratuite
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'fr-FR';
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setPartialTranscript(interimTranscript);
        if (finalTranscript) {
          setTranscript(prev => prev + ' ' + finalTranscript);
        }
      };
      
      recognition.start();
      recognitionRef.current = recognition;
    } else {
      // Fallback : ElevenLabs (implémentation existante)
      await startElevenLabsListening();
    }
  }, [webSpeechSupported]);
  
  // ...
}
```

### Avantages

| Critère | Web Speech API | ElevenLabs |
|---------|---------------|------------|
| Coût | Gratuit | Payant |
| Latence | ~300ms | ~500-800ms |
| Langues | FR supporté | Excellent multilangue |
| Compatibilité | Chrome/Edge/Safari | Tous navigateurs |

---

## 4. Correction Bug Build

**Fichier : `src/components/sections/TestimonialsSection.tsx`**

Le composant retourne `undefined` (ligne 50: `return;`). Il faut restaurer le JSX complet.

---

## Récapitulatif des Fichiers à Modifier

| Action | Fichier | Priorité |
|--------|---------|----------|
| Modifier | `supabase/functions/ai-coach/index.ts` | Haute |
| Modifier | `src/hooks/useSpeechToText.tsx` | Haute |
| Modifier | `src/components/dashboard/ChatInterface.tsx` | Haute |
| Corriger | `src/components/sections/TestimonialsSection.tsx` | Haute |
| Créer | `src/components/dashboard/DailyPlanWidget.tsx` | Moyenne |
| Créer | `src/components/dashboard/ProfileSummaryCard.tsx` | Moyenne |
| Créer | `src/components/dashboard/DisclaimerModal.tsx` | Basse |
| Modifier | `src/pages/Dashboard.tsx` | Moyenne |

---

## Détails Techniques du Nouveau System Prompt

Le nouveau prompt sera structuré en sections :

```
RÔLE : Coach santé & nutrition VitaSync AI
CONTEXTE BUSINESS : USA uniquement, bien-être, pas médicaments
PRINCIPES NON-NÉGOCIABLES : Sécurité, Style, Conversion soft
MOTEUR DE DÉCISION : 5 étapes systématiques
PLAYBOOKS : 6 contextes prédéfinis
LOGIQUE PRODUITS : Anti-vendeur direct
TÉLÉMÉTRIE : Tags internes pour analytics
```

Cela permettra à l'IA de :
- Classer automatiquement chaque demande
- Évaluer le risque avant de répondre
- Adapter le flow selon le statut quiz
- Proposer des options sans pression commerciale
- Rediriger vers le quiz pour personnalisation

---

## Ordre d'Implémentation Recommandé

1. **Correction build** - `TestimonialsSection.tsx`
2. **Dictée vocale** - `useSpeechToText.tsx` (Web Speech API)
3. **System Prompt** - Edge Function `ai-coach`
4. **UI Quiz CTA** - `ChatInterface.tsx`
5. **Profil Summary** - Nouveau composant
6. **Daily Plan** - Nouveau widget
7. **Disclaimer Modal** - Composant + intégration
