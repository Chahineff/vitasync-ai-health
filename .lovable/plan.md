
# Plan d'amélioration : Multilingue complet + Switch de saveurs instantané

## Problèmes identifiés

### 1. Multilingue incomplet
Après analyse approfondie, j'ai identifié que le système i18n existe mais de nombreux composants n'utilisent pas les traductions :

| Composant | Problème |
|-----------|----------|
| `ProfileSection.tsx` | Labels "Paramètres", "Prénom", "Nom", etc. codés en dur |
| `FAQSection.tsx` | Questions/réponses en français uniquement |
| `ChatInterface.tsx` | Suggestions ("Améliorer mon sommeil", etc.) en français |
| Tous les composants PDP | Texte en français partout |
| `useTranslation.ts` | Langue par défaut = 'fr' au lieu de 'en' |

### 2. Switch de saveurs lent
Le problème vient du flux actuel dans `ProductDetailMaster.tsx` :

```text
Clic sur saveur → onFlavorChange(handle) → handle change
    → useEffect déclenché → setLoading(true) → Skeleton affiché
    → fetchProductByHandle(handle) → Requête API Shopify (~500ms-1s)
    → setProduct(data) → setLoading(false) → Nouveau rendu
```

**Le problème** : Les produits sont déjà chargés dans `allProducts` mais pas utilisés pour le switch !

## Solution proposée

### Étape 1 : Rendre le switch de saveurs instantané

**Nouvelle architecture :**
```text
1. Charger TOUS les produits du groupe au premier chargement
2. Stocker les données complètes de chaque saveur
3. Au clic sur une saveur → simplement changer le state (pas de fetch)
```

**Modifications dans `ProductDetailMaster.tsx` :**
- Créer un state `productsByHandle: Map<string, ProductDetail>` pour stocker tous les produits liés
- Au chargement initial, fetcher tous les produits du groupe en parallèle
- Quand on clique sur une saveur, utiliser les données déjà en mémoire
- Transition fluide sans loading state

**Code conceptuel :**
```typescript
// Au lieu de recharger à chaque changement de handle
const [productsByHandle, setProductsByHandle] = useState<Map<string, ProductDetail>>(new Map());
const [currentHandle, setCurrentHandle] = useState(handle);

// Charger tous les produits du groupe une seule fois
useEffect(() => {
  const loadAllRelatedProducts = async () => {
    // Fetch le produit principal
    const mainProduct = await fetchProductByHandle(handle);
    // Identifier les produits liés (mêmes saveurs)
    const relatedHandles = findRelatedHandles(allProducts, mainProduct);
    // Fetch tous en parallèle
    const allRelated = await Promise.all(
      relatedHandles.map(h => fetchProductByHandle(h))
    );
    // Stocker dans la Map
    const map = new Map();
    allRelated.forEach(p => map.set(p.handle, p));
    setProductsByHandle(map);
  };
  loadAllRelatedProducts();
}, [handle]); // Seulement au premier chargement

// Switch instantané
const handleFlavorSwitch = (newHandle: string) => {
  setCurrentHandle(newHandle); // Pas de loading !
};

// Produit affiché = celui dans la Map
const product = productsByHandle.get(currentHandle);
```

### Étape 2 : Compléter les traductions i18n

**Nouvelles clés à ajouter dans `src/lib/i18n.ts` :**

```text
Catégorie "settings" :
- settings.title, settings.subtitle
- settings.firstName, settings.lastName, settings.email, settings.dateOfBirth
- settings.avatarChange, settings.emailCantChange
- settings.save, settings.saving, settings.years

Catégorie "pdp" (Product Detail Page) :
- pdp.backToShop, pdp.howToTake, pdp.dosage, pdp.timing, pdp.notes
- pdp.duration, pdp.coachTip, pdp.shipping, pdp.returns, pdp.support
- pdp.disclaimer, pdp.flavorVariant, pdp.size, pdp.inStock, pdp.outOfStock
- pdp.addToCart, pdp.added, pdp.subscribeAndSave, pdp.comingSoon

Catégorie "faq" :
- Toutes les questions/réponses (faq.q1, faq.a1, etc.)

Catégorie "coach" :
- coach.suggestion1, coach.suggestion2, etc.
```

### Étape 3 : Changer la langue par défaut à l'anglais

**Modification dans `useTranslation.ts` :**
```typescript
export const useI18n = create<I18nStore>()(
  persist(
    (set, get) => ({
      locale: 'en', // Changé de 'fr' à 'en'
      // ...
    }),
    // ...
  )
);

export function detectBrowserLocale(): Locale {
  // ...
  return 'en'; // Fallback changé de 'fr' à 'en'
}
```

### Étape 4 : Ajouter sélecteur de langue dans les Paramètres

**Nouvelle section dans `ProfileSection.tsx` :**
```text
+----------------------------------------+
| 🌐 Langue / Language                   |
|                                        |
| [🇬🇧 English] [🇫🇷 Français] [🇪🇸 Español] |
+----------------------------------------+
```

## Fichiers à modifier

| Fichier | Action | Description |
|---------|--------|-------------|
| `src/lib/i18n.ts` | Modifier | Ajouter ~150 nouvelles clés de traduction |
| `src/hooks/useTranslation.ts` | Modifier | Changer langue par défaut à 'en' |
| `src/components/dashboard/ProfileSection.tsx` | Modifier | Utiliser t(), ajouter sélecteur de langue |
| `src/components/dashboard/pdp/ProductDetailMaster.tsx` | Modifier | Preload des saveurs, switch instantané |
| `src/components/dashboard/pdp/ProductPurchaseBox.tsx` | Modifier | Utiliser t() pour tous les textes |
| `src/components/dashboard/pdp/HowToTake.tsx` | Modifier | Utiliser t() |
| `src/components/dashboard/pdp/PDPFooter.tsx` | Modifier | Utiliser t() |
| `src/components/dashboard/pdp/IngredientsLabel.tsx` | Modifier | Utiliser t() |
| `src/components/dashboard/pdp/QualitySourcing.tsx` | Modifier | Utiliser t() |
| `src/components/dashboard/pdp/SafetyCautions.tsx` | Modifier | Utiliser t() |
| `src/components/dashboard/pdp/ScienceSection.tsx` | Modifier | Utiliser t() |
| `src/components/dashboard/pdp/ProductFAQ.tsx` | Modifier | Utiliser t() |
| `src/components/dashboard/pdp/ProductReviews.tsx` | Modifier | Utiliser t() |
| `src/components/dashboard/pdp/BuildYourStack.tsx` | Modifier | Utiliser t() |
| `src/components/dashboard/ChatInterface.tsx` | Modifier | Utiliser t() pour suggestions |
| `src/components/sections/FAQSection.tsx` | Modifier | Utiliser t() pour FAQ |

## Avantages

1. **Switch de saveurs instantané** : Les données sont préchargées, pas de latence réseau
2. **Expérience fluide** : Pas de skeleton/loading entre les saveurs
3. **Multilingue complet** : Tout le site traduit en 3 langues
4. **Langue par défaut anglais** : Plus accessible internationalement
5. **Sélecteur dans les paramètres** : L'utilisateur peut changer la langue facilement

## Détails techniques

### Performance du preload
- Environ 2-5 produits maximum par groupe de saveurs
- Fetch parallèle avec `Promise.all`
- Total ~1-2 secondes au premier chargement, puis 0ms pour les switches

### Structure des traductions
```text
translations = {
  en: { "pdp.backToShop": "Back to shop", ... },
  fr: { "pdp.backToShop": "Retour à la boutique", ... },
  es: { "pdp.backToShop": "Volver a la tienda", ... }
}
```
