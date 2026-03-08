# Plan: Nettoyage des modèles + Debug Coach IA

## Diagnostic

Le coach renvoie "indisponible / réessaye dans 30 secondes" quand le fetch vers le gateway echoue (network error ou 429/500 apres 2 tentatives). Les causes possibles :

- **Rate limit 429** sur le gateway Lovable AI (trop de requetes rapprochees)
- **Timeout 60s** si le systeme prompt est trop gros + modele lent
- `**max_tokens: 8192**` dans l'edge function -- potentiellement bas pour des reponses complexes avec graphiques/quiz, mais suffisant pour la plupart des cas

## Changements

### 1. Nettoyer les modeles (ChatModelSelector.tsx)

Supprimer les 2 modeles OpenAI. Retirer le groupement "Google Gemini" / "OpenAI GPT" -- afficher une liste plate avec 3 modeles :

- VitaSync 2.5 Flash (`google/gemini-2.5-flash-lite`)
- VitaSync 3 Flash (`google/gemini-3-flash-preview`)  
- VitaSync 3 Pro (`google/gemini-3-pro-preview`)

Supprimer les `DropdownMenuLabel` et `DropdownMenuSeparator` de groupe.

### 2. Nettoyer l'edge function (ai-coach/index.ts)

- Retirer `openai/gpt-5-mini` et `openai/gpt-5.2` du tableau `ALLOWED_MODELS`
- Retirer les references OpenAI dans `getHistoryDays`
- Supprimer la reference `openai` dans `supportsCharts`
- Augmenter `max_tokens` de 8192 a 16384 pour plus de marge sur les reponses longues
- Augmenter le timeout de 60s a 90s pour les modeles Pro qui reflechissent plus longtemps
- Ajouter un log plus explicite quand le gateway repond en erreur

### 3. Ameliorer la gestion d'erreur client (ChatInterface.tsx)

- Augmenter le delai de retry de 3s a 5s pour laisser le rate limit se dissiper
- Ameliorer le message d'erreur : differencier timeout vs rate limit vs erreur reseau
- Ajouter un retry sur status 504 (timeout gateway)

### 4. Mettre a jour le tutoriel Coach (TutorialCoachDemo.tsx)

Retirer les modeles OpenAI du dropdown mock pour refleter les 3 modeles restants.

### 5. Mettre a jour l'export (chat/index.ts)

Aucun changement necessaire -- les types sont deja exportes correctement.

6. Tester pour verfier s'y l'IA fonctionne !

## Fichiers impactes


| Fichier                                                   | Action                                        |
| --------------------------------------------------------- | --------------------------------------------- |
| `src/components/dashboard/chat/ChatModelSelector.tsx`     | Retirer OpenAI, liste plate                   |
| `supabase/functions/ai-coach/index.ts`                    | Retirer OpenAI, max_tokens 16384, timeout 90s |
| `src/components/dashboard/ChatInterface.tsx`              | Retry 5s, retry sur 504                       |
| `src/components/dashboard/tutorial/TutorialCoachDemo.tsx` | Retirer modeles OpenAI du mock                |
