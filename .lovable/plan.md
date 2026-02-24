

# Plan : Corriger la connexion Google/Apple OAuth

## Probleme racine

Quand l'utilisateur clique "Continuer avec Google" dans un nouvel onglet :
1. La page redirige vers le broker OAuth (`/~oauth/initiate`)
2. Google authentifie l'utilisateur (cela fonctionne -- les logs montrent des logins reussis)
3. Le broker redirige vers la page d'accueil (`/`)
4. Supabase detecte les tokens dans l'URL et etablit la session **avant** que React ne s'execute
5. Quand `OAuthRedirectHandler` verifie `window.location.hash`, les tokens ont deja ete nettoyes
6. Le flag `sessionStorage` n'est jamais pose, donc pas de redirection vers `/dashboard`
7. L'utilisateur reste sur la page d'accueil et pense ne pas etre connecte

## Solution

### 1. Poser le flag AVANT la redirection OAuth (Auth.tsx)

Dans les boutons Google et Apple de la page `/auth`, ajouter `sessionStorage.setItem('oauth_redirect_pending', 'true')` **avant** d'appeler `lovable.auth.signInWithOAuth()`. Ainsi, quand l'utilisateur revient apres l'authentification, le flag est deja present.

### 2. Simplifier OAuthRedirectHandler (App.tsx)

Retirer la detection des parametres URL (hash/code) qui est peu fiable. Le handler ne fait plus qu'une seule chose : si le flag `oauth_redirect_pending` existe dans sessionStorage et que l'utilisateur est authentifie, rediriger vers `/dashboard` et supprimer le flag.

---

## Details techniques

**Fichiers modifies :**

### `src/pages/Auth.tsx`
- Dans le `onClick` du bouton Google : ajouter `sessionStorage.setItem('oauth_redirect_pending', 'true')` avant l'appel a `lovable.auth.signInWithOAuth("google", ...)`
- Meme chose pour le bouton Apple

### `src/App.tsx`
- Supprimer le premier `useEffect` qui detecte `access_token` / `code` dans l'URL (lignes 31-37)
- Garder le second `useEffect` qui redirige vers `/dashboard` quand le flag est present et l'utilisateur authentifie

Cela garantit que le flag est toujours present au retour de l'OAuth, independamment du traitement de l'URL par Supabase.
