# Connexion Google en 1 clic — ce qu'il reste à activer

Le code est entièrement posé et déployé. Le bouton "Se connecter avec Google"
fonctionne déjà (il dégrade proprement tant que les clés ne sont pas là).
Il reste **3 actions côté Google Cloud** que moi (Claude) je ne peux pas faire à ta place,
car elles demandent ton compte Google et une validation par Google.

## Étape 1 — Créer le projet et activer les API
Dans https://console.cloud.google.com :
1. Crée un projet (ou réutilise-en un).
2. Active ces API (barre de recherche → "Activer") :
   - **My Business Account Management API**
   - **My Business Business Information API**
   - **Google My Business API** (l'API v4 des avis, sur liste d'autorisation)
3. Demande l'accès à la **Business Profile API** via le formulaire Google
   (https://developers.google.com/my-business/content/prereqs). Google valide en quelques jours.
   Sans cette autorisation, la lecture des avis renvoie une erreur de quota.

## Étape 2 — Écran de consentement OAuth
1. "APIs & Services" → "OAuth consent screen".
2. Type "External", renseigne le nom de l'app + email de support.
3. Ajoute le scope sensible : `https://www.googleapis.com/auth/business.manage`.
4. Publie l'app (ou ajoute les comptes de test le temps de la validation).

## Étape 3 — Identifiants + variables Vercel
1. "APIs & Services" → "Credentials" → "Create credentials" → "OAuth client ID".
2. Type **Application Web**.
3. URI de redirection autorisée (exactement) :
   `https://review-pilot-iota.vercel.app/api/google/callback`
   (ajoute aussi le futur domaine propre le jour venu).
4. Récupère le **Client ID** et le **Client Secret**, puis pose-les sur Vercel :

```
printf '%s' 'TON_CLIENT_ID' | npx vercel env add GOOGLE_CLIENT_ID production
printf '%s' 'TON_CLIENT_SECRET' | npx vercel env add GOOGLE_CLIENT_SECRET production
```

(Attention : `printf`, jamais `echo`, pour éviter le retour à la ligne qui casse tout en silence.)
Puis redéploie : `npx vercel --prod` et réassigne l'alias `review-pilot-iota.vercel.app`.

## Comment ça marche une fois branché
- Le commerçant clique "Se connecter avec Google" → écran de consentement Google.
- Retour sur `/api/google/callback` : on lit ses établissements.
  - 1 seul établissement → rattaché tout seul, direction le tableau de bord.
  - Plusieurs → écran `/businesses/connect` pour choisir.
- On stocke son **refresh_token** (colonne `platform_token`) ; la synchro et les
  réponses IA en tirent un jeton d'accès frais à chaque fois. Rien à renouveler à la main.
- Le commerce est créé à **son** email (`owner_email`), donc cloisonné : lui seul le voit.
