

## Plan : IA Enrichie avec Check-ins + Page Produit Détaillée

---

### Phase 1 : Enrichir l'IA avec les Check-ins Récents

**Fichier : `supabase/functions/ai-coach/index.ts`**

L'Edge Function va récupérer les check-ins récents de l'utilisateur depuis la table `daily_checkins` et calculer les tendances directement côté serveur.

**Modifications :**

1. **Ajouter une fonction `fetchRecentCheckins`** qui récupère les 7 derniers check-ins de l'utilisateur :

```typescript
async function fetchRecentCheckins(supabase: any, userId: string) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);

  const { data, error } = await supabase
    .from("daily_checkins")
    .select("sleep_quality, energy_level, stress_level, mood, checkin_date")
    .eq("user_id", userId)
    .gte("checkin_date", startDate.toISOString().split("T")[0])
    .order("checkin_date", { ascending: false });

  return error ? [] : data;
}
```

2. **Ajouter une fonction `calculateTrends`** pour calculer les moyennes :

```typescript
function calculateTrends(checkins: any[]) {
  if (!checkins.length) return null;
  
  const avgSleep = checkins.reduce((sum, c) => sum + (c.sleep_quality || 0), 0) / checkins.length;
  const avgEnergy = checkins.reduce((sum, c) => sum + (c.energy_level || 0), 0) / checkins.length;
  const avgStress = checkins.reduce((sum, c) => sum + (c.stress_level || 0), 0) / checkins.length;
  
  return { avgSleep, avgEnergy, avgStress, count: checkins.length };
}
```

3. **Enrichir le prompt système** avec ces données :

```typescript
// Dans buildEnrichedSystemPrompt, ajouter un paramètre recentCheckins
if (trends) {
  contextParts.push(`\nSUIVI JOURNALIER (7 derniers jours):`);
  contextParts.push(`- Sommeil moyen: ${trends.avgSleep.toFixed(1)}/5`);
  contextParts.push(`- Énergie moyenne: ${trends.avgEnergy.toFixed(1)}/5`);
  contextParts.push(`- Stress moyen: ${trends.avgStress.toFixed(1)}/5`);
  
  if (trends.avgSleep < 3) {
    contextParts.push(`⚠️ ALERTE: L'utilisateur dort mal cette semaine`);
  }
  if (trends.avgEnergy < 3) {
    contextParts.push(`⚠️ ALERTE: Énergie basse détectée`);
  }
  if (trends.avgStress > 3.5) {
    contextParts.push(`⚠️ ALERTE: Niveau de stress élevé`);
  }
}
```

4. **Adapter le prompt de base** pour guider l'IA :

```typescript
const baseSystemPrompt = `Tu es le Coach IA VitaSync...

PERSONNALISATION BASÉE SUR LE SUIVI:
- Si le sommeil moyen est <3, priorise les conseils sommeil
- Si l'énergie est basse, recommande des boosters d'énergie
- Si le stress est élevé, propose des solutions anti-stress
- Mentionne les tendances observées dans tes conseils
`;
```

---

### Phase 2 : Créer la Page Produit Détaillée

**Nouvelle page : `src/pages/Product.tsx`**

Une page dédiée accessible via `/product/:handle` affichant :
- Galerie d'images (carrousel)
- Titre, prix, description complète
- Sélecteur de variantes
- Bouton Ajouter au panier
- Section bienfaits/ingrédients (depuis la description ou metafields Shopify)

**Structure du composant :**

```typescript
export default function Product() {
  const { handle } = useParams<{ handle: string }>();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  useEffect(() => {
    fetchProductByHandle(handle).then(setProduct);
  }, [handle]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header avec retour */}
      <header>
        <Button onClick={() => navigate(-1)}>
          <ArrowLeft /> Retour
        </Button>
      </header>
      
      <div className="grid md:grid-cols-2 gap-8 p-6">
        {/* Galerie d'images */}
        <ImageGallery images={product.images} />
        
        {/* Infos produit */}
        <div>
          <h1>{product.title}</h1>
          <p className="text-2xl font-bold">{price} {currency}</p>
          
          {/* Sélecteur variantes */}
          <VariantSelector variants={product.variants} />
          
          {/* Actions */}
          <Button onClick={handleAddToCart}>Ajouter au panier</Button>
          <Button variant="outline" onClick={handleAddToTracking}>
            Ajouter au suivi
          </Button>
          
          {/* Description / Bienfaits */}
          <Tabs>
            <TabsContent value="description">
              <ReactMarkdown>{product.description}</ReactMarkdown>
            </TabsContent>
            <TabsContent value="benefits">
              {/* Extraits de la description ou metafields */}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
```

---

### Phase 3 : Enrichir la Query Shopify avec Metafields

**Fichier : `src/lib/shopify.ts`**

Modifier la query `PRODUCT_BY_HANDLE_QUERY` pour récupérer les métadonnées supplémentaires :

```graphql
query GetProductByHandle($handle: String!) {
  productByHandle(handle: $handle) {
    id
    title
    description
    descriptionHtml  # Ajout pour le rendu HTML
    handle
    productType
    vendor
    tags  # Ajout pour les bienfaits/catégories
    priceRange {
      minVariantPrice { amount currencyCode }
    }
    images(first: 10) {
      edges { node { url altText } }
    }
    variants(first: 20) {
      edges {
        node {
          id
          title
          price { amount currencyCode }
          availableForSale
          selectedOptions { name value }
        }
      }
    }
    options { name values }
    # Metafields pour bienfaits et ingrédients (si configurés dans Shopify)
    benefitsMetafield: metafield(namespace: "custom", key: "benefits") {
      value
      type
    }
    ingredientsMetafield: metafield(namespace: "custom", key: "ingredients") {
      value
      type
    }
  }
}
```

**Ajouter au type `ShopifyProduct` :**

```typescript
export interface ProductDetail {
  // ... champs existants
  descriptionHtml?: string;
  tags?: string[];
  benefitsMetafield?: { value: string; type: string } | null;
  ingredientsMetafield?: { value: string; type: string } | null;
}
```

---

### Phase 4 : Rendre les ProductCard Cliquables

**Fichier : `src/components/dashboard/ProductCard.tsx`**

Ajouter un wrapper `Link` vers la page produit :

```typescript
import { Link } from 'react-router-dom';

// Entourer la carte avec un lien
<Link to={`/product/${node.handle}`} className="block">
  <motion.div 
    whileHover={{ y: -4 }}
    className="glass-card rounded-2xl overflow-hidden border border-white/10 group cursor-pointer"
  >
    {/* Image (inchangée) */}
    
    {/* Content */}
    <div className="p-4 space-y-3">
      {/* Titre et description */}
      
      {/* Bouton Ajouter au panier - stopPropagation pour éviter la navigation */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleAddToCart();
        }}
      >
        ...
      </button>
    </div>
  </motion.div>
</Link>
```

---

### Phase 5 : Ajouter la Route dans App.tsx

**Fichier : `src/App.tsx`**

```typescript
import Product from "./pages/Product";

<Routes>
  {/* ... routes existantes */}
  <Route path="/product/:handle" element={<Product />} />
  <Route path="*" element={<NotFound />} />
</Routes>
```

---

### Récapitulatif des Fichiers

| Action | Fichier |
|--------|---------|
| Modifier | `supabase/functions/ai-coach/index.ts` (fetch check-ins + enrichir prompt) |
| Créer | `src/pages/Product.tsx` (page détaillée) |
| Modifier | `src/lib/shopify.ts` (query enrichie + type ProductDetail) |
| Modifier | `src/components/dashboard/ProductCard.tsx` (lien vers page) |
| Modifier | `src/App.tsx` (nouvelle route /product/:handle) |

---

### Fonctionnalités de la Page Produit

| Section | Contenu |
|---------|---------|
| Galerie | Carrousel d'images avec miniatures |
| Infos | Titre, vendeur, type de produit, prix |
| Variantes | Sélecteur interactif (tailles, saveurs, etc.) |
| Actions | Ajouter au panier + Ajouter au suivi |
| Description | Onglet avec description complète en Markdown |
| Bienfaits | Onglet avec liste des bienfaits (depuis tags ou metafields) |
| Ingrédients | Liste des ingrédients (si disponible dans metafields) |

---

### Ordre d'Implémentation

1. **Edge Function** - Enrichir l'IA avec les check-ins récents
2. **Shopify Query** - Ajouter descriptionHtml, tags, metafields
3. **Page Produit** - Créer la nouvelle page complète
4. **ProductCard** - Rendre cliquable avec navigation
5. **App Routes** - Ajouter la nouvelle route

