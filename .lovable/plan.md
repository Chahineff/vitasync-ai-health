

## Plan : 1000 paliers pour la Home, 200 pour les autres pages

### Approche

Rendre le composant `SplineBackground` configurable via une prop `steps` avec une valeur par defaut de 200. La page d'accueil passera `steps={1000}` pour des transitions 5x plus fines.

### Modifications

**1. `src/components/sections/SplineBackground.tsx`**

- Ajouter une prop `steps` (defaut : 200)
- Deplacer la generation des tableaux `opacityInputs/Outputs` et `colorInputs/Outputs` a l'interieur du composant avec `useMemo` pour reagir a la prop
- Le reste du composant reste identique

```text
Props:
  steps?: number  (defaut: 200)

useMemo(() => generateSteps(steps, 1, 0.25), [steps])  -> opacityInputs/Outputs
useMemo(() => generateSteps(steps, 0, 6), [steps])     -> colorInputs/Outputs
```

**2. `src/pages/Index.tsx`**

- Passer `<SplineBackground steps={1000} />` pour la home page

**3. Autres pages (About, Blog, Contact, Auth)**

- Aucun changement, elles utilisent deja le defaut de 200 paliers

### Details techniques

- `generateSteps` reste inchange
- Les constantes globales `STEPS`, `opacityInputs`, `opacityOutputs`, `colorInputs`, `colorOutputs` sont supprimees du scope module et recalculees dans le composant via `useMemo`
- Performance : `useMemo` garantit que les tableaux de 1000 points ne sont calcules qu'une seule fois

| Page | Paliers | Precision scroll |
|------|---------|-----------------|
| Home | 1000 | 0.1% du scroll |
| About | 200 | 0.5% du scroll |
| Blog | 200 | 0.5% du scroll |
| Contact | 200 | 0.5% du scroll |
| Auth | 200 | 0.5% du scroll |

