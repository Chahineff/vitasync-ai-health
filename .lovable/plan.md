

# Corps humain interactif dans le Coach IA

## Vue d'ensemble

Ajout d'un bouton "corps humain" dans la barre d'outils du chat qui ouvre un modal/drawer avec une silhouette humaine interactive en SVG. L'utilisateur clique sur une zone du corps (tete, epaules, dos, genoux, etc.), la zone s'illumine, son nom s'affiche, et un message est automatiquement envoye a l'IA du type "J'ai une douleur au [zone selectionnee]".

Approche SVG plutot que 3D : un SVG vectoriel est leger, rapide, responsive, fonctionne parfaitement sur mobile, et ne necessite aucune dependance lourde (Three.js, modeles 3D). Le resultat visuel sera premium grace au design glassmorphism du projet.

---

## Architecture

### Nouveau composant : `BodyMapModal.tsx`

**Fichier** : `src/components/dashboard/chat/BodyMapModal.tsx`

Un Dialog/Sheet contenant une silhouette humaine SVG avec des zones cliquables :

**Zones du corps (18 zones)** :
- Tete / Crane
- Cou / Nuque
- Epaule gauche / Epaule droite
- Bras gauche / Bras droit
- Poitrine / Thorax
- Abdomen / Ventre
- Dos (haut) / Dos (bas)
- Hanche gauche / Hanche droite
- Cuisse gauche / Cuisse droite
- Genou gauche / Genou droit
- Mollet gauche / Mollet droit
- Pied gauche / Pied droit

**Comportement** :
- Chaque zone est un `path` ou `rect` SVG avec `cursor-pointer`
- Au survol : la zone s'illumine (fill avec couleur primary a 30% d'opacite)
- Au clic : la zone se selectionne (fill primary a 50%, bordure primary), le nom de la zone s'affiche dans un label en dessous
- Un bouton "Envoyer a l'IA" en bas envoie le message : "J'ai une douleur au niveau de [zone]. Peux-tu m'aider ?"
- Possibilite de selectionner plusieurs zones
- Le modal se ferme automatiquement apres l'envoi

**Design** :
- Fond glassmorphism (`bg-background/95 backdrop-blur-xl`)
- Silhouette en trait fin blanc/gris clair
- Zones selectionnees en cyan/primary avec glow
- Label de la zone selectionnee avec animation fade-in
- Vue de face par defaut, bouton pour basculer en vue de dos

### Modification : `ChatInput.tsx`

**Fichier** : `src/components/dashboard/chat/ChatInput.tsx`

- Ajouter un bouton avec l'icone `PersonArmsSpread` (disponible dans @phosphor-icons/react) dans la barre d'outils, entre le bouton micro et le bouton fichier
- Au clic, ouvre le `BodyMapModal`
- Quand l'utilisateur selectionne une zone et confirme, le message est insere dans l'input et soumis automatiquement

### Modification : `ChatInput` interface

- Ajouter une prop `onBodyZoneSelect` ou utiliser directement `onSubmit` depuis le modal
- Le modal recoit `onSubmit` pour envoyer le message directement

---

## Detail technique du SVG

Le SVG sera dessine en inline dans le composant (pas de fichier externe) avec des `path` pour chaque zone anatomique. Chaque zone aura :

```text
<g id="zone-tete" onClick={() => toggleZone('Tete')} className="cursor-pointer">
  <path d="..." fill="transparent" stroke="currentColor" />
  <path d="..." fill={selected ? 'primary/50' : 'transparent'} /> (overlay)
</g>
```

La silhouette sera une forme humaine simplifiee mais reconnaissable, style medical/anatomique epure, coherent avec le design Bio-Tech Luxury.

Deux vues : **Face** et **Dos**, avec un toggle pour basculer (les zones du dos ne sont pas les memes : haut du dos, bas du dos, lombaires, omoplates).

---

## Flux utilisateur

```text
1. Clic sur le bouton "corps humain" (icone PersonArmsSpread)
2. Modal s'ouvre avec la silhouette SVG
3. L'utilisateur clique sur une ou plusieurs zones
4. Les zones selectionnees s'illuminent + label affiche
5. Bouton "Envoyer" -> message auto-genere :
   "J'ai une douleur au niveau de : [zone1], [zone2]. Peux-tu m'aider a identifier les causes possibles et me recommander des solutions ?"
6. Modal se ferme, message envoye, IA repond
```

---

## Fichiers

| Fichier | Modification |
|---|---|
| `src/components/dashboard/chat/BodyMapModal.tsx` | Nouveau - Modal avec silhouette SVG interactive (face + dos) |
| `src/components/dashboard/chat/ChatInput.tsx` | Ajout bouton PersonArmsSpread + ouverture du modal |
| `src/components/dashboard/chat/index.ts` | Export du nouveau composant si necessaire |

## Aucune nouvelle dependance

Tout est fait avec les outils existants : React, Framer Motion, Phosphor Icons, SVG inline, et les composants UI (Dialog/Sheet).

