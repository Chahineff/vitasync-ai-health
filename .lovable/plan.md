

## Plan : 200 paliers ultra-lisses + SplineBackground sur les 4 pages

### 1. SplineBackground.tsx -- Passer a 200 paliers

Remplacer les tableaux manuels de 6-7 valeurs par des tableaux generes programmatiquement avec 200 points pour chaque transition :

- **splineOpacity** : 200 paliers lineaires de `scrollYProgress` (0 a 1), avec opacite allant de 1 a 0.25 via une courbe douce.
- **colorIndex** : 200 paliers mappant scroll (0-1) vers index couleur (0-6).
- **hueShift** : Reste a 2 paliers (deja lineaire, pas besoin de plus).
- **Transitions entre couleurs de section** : Elargir encore les zones de fondu dans le `useTransform` de chaque overlay couleur (passer de 1.2 a 1.5 de rayon).

Generation des paliers via une fonction utilitaire au debut du fichier :
```typescript
function generateSteps(count: number, from: number, to: number): [number[], number[]] {
  const inputs = Array.from({ length: count }, (_, i) => i / (count - 1));
  const outputs = inputs.map(t => from + (to - from) * t);
  return [inputs, outputs];
}
```

### 2. Ajouter SplineBackground aux 4 pages

Ajouter `<SplineBackground />` et `relative z-10` sur le contenu principal de chaque page :

| Page | Fichier | Changement |
|------|---------|-----------|
| Auth | `src/pages/Auth.tsx` | Ajouter `<SplineBackground />`, wrapper le contenu avec `relative z-10` |
| About | `src/pages/About.tsx` | Ajouter `<SplineBackground />`, `relative z-10` sur `<main>` |
| Blog | `src/pages/Blog.tsx` | Ajouter `<SplineBackground />`, `relative z-10` sur `<main>` |
| Contact | `src/pages/Contact.tsx` | Ajouter `<SplineBackground />`, `relative z-10` sur `<main>` |

Le Dashboard n'est PAS concerne.

### Details techniques

**Fichiers modifies :**
- `src/components/sections/SplineBackground.tsx` -- generation de 200 paliers pour `splineOpacity` et `colorIndex`
- `src/pages/Auth.tsx` -- ajout SplineBackground + z-index
- `src/pages/About.tsx` -- ajout SplineBackground + z-index
- `src/pages/Blog.tsx` -- ajout SplineBackground + z-index
- `src/pages/Contact.tsx` -- ajout SplineBackground + z-index

**Approche pour les 200 paliers :**
```text
Scroll:   0.000  0.005  0.010  ...  0.995  1.000
Opacity:  1.000  0.996  0.993  ...  0.254  0.250
Color:    0.000  0.030  0.060  ...  5.970  6.000
```

Chaque micro-step represente 0.5% du scroll -- les transitions deviennent mathematiquement imperceptibles.
