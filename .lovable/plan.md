

## Plan : Modèle 3D interactif du corps humain

### Concept
Remplacer le SVG actuel de `BodyMapModal` par un vrai modèle 3D humain réaliste en couleur, manipulable à 360° (orbit controls). L'utilisateur clique directement sur le corps pour placer des "points de douleur" qui sont automatiquement mappés au nom anatomique le plus proche. Plus de bouton Face/Dos — on tourne le modèle librement.

### Stack technique
- **@react-three/fiber@^8.18** + **three@^0.170** + **@react-three/drei@^9.122.0** (versions compatibles React 18)
- Modèle GLB réaliste chargé via `useGLTF` depuis un CDN public (modèle humain texturé)
- `OrbitControls` pour la rotation 3D libre
- Raycasting natif Three.js pour détecter le point cliqué sur le mesh

### Architecture

```text
BodyMapModal.tsx (refonte complète)
├── Canvas (R3F)
│   ├── OrbitControls (rotation libre, zoom limité)
│   ├── Lighting (ambient + directional)
│   ├── HumanModel (GLB loader)
│   │   └── onClick → raycaster → point 3D → nearest anatomy label
│   └── PainMarkers (sphères rouges sur les points cliqués)
├── Selected labels chips (comme avant)
└── Send button (comme avant)
```

### Mapping anatomique
Définir ~30 points anatomiques avec coordonnées 3D (x,y,z) et un label français. Quand l'utilisateur clique sur le modèle, on calcule le point anatomique le plus proche (distance euclidienne) et on affiche son nom. Si la distance est trop grande (>seuil), on ignore le clic.

### Fichiers impactés
1. **package.json** — Ajouter `@react-three/fiber@^8.18`, `three@^0.170`, `@react-three/drei@^9.122.0`, `@types/three`
2. **src/components/dashboard/chat/BodyMapModal.tsx** — Refonte complète : remplacer le SVG par un Canvas R3F avec le modèle 3D, orbit controls, raycasting et pain markers
3. **index.html** — Potentiellement ajouter le domaine CDN du modèle GLB dans le CSP `connect-src` et `img-src`

### Détails clés
- Le modèle GLB sera chargé depuis un CDN public (ex: models.readyplayer.me ou un modèle libre sur GitHub)
- Fallback : si le modèle 3D ne charge pas (mobile lent), afficher un message avec un loader
- Les pain markers sont des petites sphères rouges pulsantes placées sur la surface du mesh
- Le tooltip affiche le nom de la zone au survol/clic
- Le message envoyé à l'IA reste identique : "J'ai une douleur au niveau de : [zones]. Peux-tu m'aider..."

### UX
- Rotation : drag pour tourner le modèle
- Zoom : scroll (limité pour éviter de rentrer dans le modèle)
- Clic : place un point de douleur (sphère rouge + label)
- Re-clic sur un point existant : le supprime
- Bouton "Envoyer X zones" en bas

