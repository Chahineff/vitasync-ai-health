
Plan : correction réelle du sticky de la galerie PDP

1. Diagnostic du bug
- Le sticky est déjà déclaré dans `ProductDetailMaster.tsx`, donc le problème vient très probablement du contexte parent.
- Deux causes ressortent dans le code actuel :
  - `ProductDetailMaster.tsx` utilise un wrapper animé avec `overflow-x-hidden`, ce qui peut casser `position: sticky` en créant un contexte de scroll/clipping intermédiaire.
  - `Dashboard.tsx` rend la PDP dans un `motion.div` avec animation en `y` + `className="h-full"`, ce qui rend souvent le sticky instable ou inactif sur ce type de layout.

2. Correctif à appliquer
- `src/pages/Dashboard.tsx`
  - Supprimer `h-full` du wrapper de la vue produit.
  - Remplacer l’animation verticale `y` du wrapper produit par une animation sans transform perturbateur pour le sticky (par ex. opacity only, ou animation déplacée sur un inner wrapper non parent de la galerie sticky).

- `src/components/dashboard/pdp/ProductDetailMaster.tsx`
  - Retirer `overflow-x-hidden` du conteneur principal de la PDP.
  - Garder la galerie dans une vraie colonne sticky desktop :
    - wrapper gauche en `lg:sticky`
    - offset top recalibré pour tenir compte du header PDP
    - hauteur de zone sticky conservée pour centrer la galerie verticalement
  - S’assurer que la galerie reste collée à gauche pendant le scroll du bloc infos de droite, puis se libère seulement quand on atteint la fin de la section prévue.

3. Ajustement de structure si nécessaire
- Si le sticky s’arrête encore trop tôt, élargir son conteneur logique pour qu’il accompagne toute la zone d’infos produit voulue à droite avant les sections full width suivantes.
- Ne pas appliquer le sticky sur mobile.

4. Fichiers concernés
- `src/pages/Dashboard.tsx`
- `src/components/dashboard/pdp/ProductDetailMaster.tsx`
- Éventuellement `src/components/dashboard/pdp/ProductGallery.tsx` seulement pour de petits ajustements de hauteur/centrage si besoin

5. Résultat attendu
- Sur desktop :
  - la galerie reste fixe à gauche
  - elle reste visuellement centrée dans sa colonne
  - le contenu produit à droite scrolle indépendamment dans le flux
  - la galerie ne “descend” plus avec le scroll
  - elle se décroche seulement au bon moment, lorsqu’elle atteint la limite de sa section

6. Vérification après implémentation
- Tester une PDP longue dans le dashboard
- Vérifier le comportement sticky sur grand écran
- Vérifier qu’aucun overflow/clip n’a cassé les autres sections PDP
- Vérifier que mobile reste normal, sans sticky parasite
