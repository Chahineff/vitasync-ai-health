

# Refonte de la question "Où souhaites-tu être livré ?"

## Changements prevus

### 1. Titre et sous-titre plus explicites
- Titre : "Où souhaites-tu recevoir tes compléments ?" (au lieu de "Où souhaites-tu être livré ?")
- Sous-titre : "Nous livrons dans le monde entier. Sélectionne ton pays pour voir les délais et frais de livraison."

### 2. Liste exhaustive des 196 pays avec drapeaux emoji
Remplacer la liste actuelle de 23 pays par les ~196 pays du monde, organisés par regions :
- **Amerique du Nord** (US, CA, MX) en premier
- **Europe** (~45 pays)
- **Asie** (~50 pays)
- **Amerique du Sud** (~15 pays)
- **Afrique** (~55 pays)
- **Oceanie** (~15 pays)
- **Moyen-Orient** (~15 pays)

Chaque pays aura son **drapeau emoji** (ex: 🇺🇸 🇫🇷 🇩🇪) affiche a cote du nom dans le bouton de selection.

### 3. Fichier modifie
- **`src/components/onboarding/CountrySelect.tsx`** : Remplacer le tableau `countries` par la liste complete des 196 pays avec drapeaux emoji. Ajouter un champ `flag` a l'interface Country. Afficher le drapeau dans chaque bouton. Reorganiser les regions (US first, puis EU, puis les autres continents).
- **`src/components/onboarding/OnboardingFlow.tsx`** : Mettre a jour le titre et sous-titre de la question `shipping_country`.

### Detail technique
- Les drapeaux seront des emoji Unicode natifs (ex: `🇺🇸`) - pas besoin de librairie externe
- L'ordre des regions sera : North America > Europe > Asia > South America > Africa > Oceania > Middle East
- La barre de recherche existante reste en place pour filtrer parmi les 196 pays

