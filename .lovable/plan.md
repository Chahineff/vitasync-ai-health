

## Plan : Supprimer les lignes visibles entre sections et rendre les fonds translucides

### Problemes identifies

1. **Lignes visibles entre sections** : Les classes CSS `bg-gradient-radial`, `bg-gradient-subtle` et `section-parallax::before` creent des fonds opaques avec des bords nets la ou les sections se rencontrent, ce qui cree des "lignes" visibles.

2. **Fonds non translucides sur About/Blog/Contact** : Ces pages utilisent `bg-gradient-radial` et `bg-gradient-subtle` qui contiennent `hsl(var(--background))` (opaque), ce qui bloque completement le SplineBackground derriere.

### Corrections

#### 1. `src/index.css` -- Rendre les gradients transparents

| Classe | Avant | Apres |
|--------|-------|-------|
| `.bg-gradient-subtle` | `hsl(var(--background))` aux extremites (opaque) | `transparent` aux extremites, garder juste le muted central avec opacite reduite |
| `.bg-gradient-radial` | Fond radial opaque | Reduire l'opacite a 0.04 et s'assurer que le fond est transparent |
| `.section-parallax::before` | `radial-gradient` avec fond fixe | Reduire l'opacite ou supprimer completement (le SplineBackground fait deja ce travail) |

Modifications CSS :

```css
.bg-gradient-subtle {
  background: linear-gradient(
    180deg,
    transparent 0%,
    hsl(var(--muted) / 0.15) 50%,
    transparent 100%
  );
}

.bg-gradient-radial {
  background: radial-gradient(
    ellipse at 50% 0%,
    hsl(var(--primary) / 0.05) 0%,
    transparent 60%
  );
}
```

Pour `.section-parallax::before` : reduire l'opacite des gradients a 0.015 (quasi invisible) pour eviter les bords durs.

#### 2. Sections de la Home page -- Supprimer les fonds opaques redondants

Les sections `HowItWorksSection`, `FeaturesSection`, `PricingSection`, `ProductPreviewSection` utilisent deja `bg-transparent` -- pas de changement necessaire.

La `FAQSection` utilise `section-padding bg-transparent section-parallax` -- verifier et corriger si besoin.

#### 3. Pages About/Blog/Contact -- Supprimer `bg-gradient-radial` et `bg-gradient-subtle`

Les sections hero de ces pages utilisent `bg-gradient-radial` et certaines sections utilisent `bg-gradient-subtle`. Avec les corrections CSS du point 1, ces classes deviendront transparentes automatiquement -- aucune modification de fichier necessaire pour ces pages.

### Fichiers modifies

| Fichier | Changement |
|---------|-----------|
| `src/index.css` | Rendre `.bg-gradient-subtle`, `.bg-gradient-radial` transparents aux bords ; reduire `.section-parallax::before` |

### Resultat attendu

- Les sections se fondent les unes dans les autres sans aucune ligne visible
- Le SplineBackground est visible a travers toutes les sections sur toutes les pages
- Les gradients subtils de couleur restent presents mais ne creent plus de bords nets

