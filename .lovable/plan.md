

# Plan : Corriger la redirection OAuth et l'acces a la page d'accueil

## Problemes identifies

### 1. Page d'accueil inaccessible quand on est connecte
Le composant `OAuthRedirectHandler` dans `App.tsx` redirige **systematiquement** tout utilisateur connecte qui visite `/` vers `/dashboard`. Cela empeche les utilisateurs connectes d'acceder a la page d'accueil, au logo VitaSync, etc.

### 2. Google OAuth ne redirige pas vers le dashboard dans un nouvel onglet
Apres le retour OAuth sur `/`, la session n'est pas encore chargee au moment ou le handler s'execute, donc la redirection ne se fait pas.

---

## Solution

### Modifier `OAuthRedirectHandler` pour ne rediriger que pendant un retour OAuth

Au lieu de rediriger **tous** les utilisateurs connectes depuis `/`, on detecte un **retour OAuth** en verifiant la presence de parametres OAuth dans l'URL (`access_token` dans le hash ou `code` dans les query params). On utilise aussi un flag `sessionStorage` pour gerer le cas ou le hash est nettoye avant que le composant ne s'execute.

Logique :
1. Au chargement, verifier si l'URL contient des indicateurs OAuth (hash `access_token` ou query `code`)
2. Si oui, marquer un flag `sessionStorage('oauth_redirect_pending', 'true')`
3. Quand `user` est charge et que le flag est present, rediriger vers `/dashboard` et supprimer le flag
4. Si pas de flag OAuth, ne rien faire -- l'utilisateur peut rester sur `/`

### Modifier la page `Auth.tsx` pour ne pas rediriger automatiquement

Actuellement, `Auth.tsx` (ligne 47-51) redirige aussi tout utilisateur connecte vers `/dashboard`. Si un utilisateur connecte veut revenir a la page de connexion pour changer de compte, il ne peut pas. On garde cette redirection car c'est le comportement attendu pour la page `/auth` (si on est deja connecte, on va au dashboard).

---

## Details techniques

**Fichier modifie :** `src/App.tsx`

Changements dans `OAuthRedirectHandler` :
- Detecter un retour OAuth via `window.location.hash.includes('access_token')` ou `window.location.search.includes('code=')`
- Utiliser `sessionStorage` comme flag temporaire
- Ne rediriger vers `/dashboard` que si le flag est actif et l'utilisateur est authentifie
- Supprimer le flag apres la redirection

Cela permet :
- Aux utilisateurs connectes de naviguer librement sur la page d'accueil
- Au retour OAuth (Google/Apple) de rediriger correctement vers le dashboard
- Au clic sur le logo VitaSync de fonctionner normalement

