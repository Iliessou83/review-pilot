# À faire : le fichier de conformité ment sur son propre rôle

Écrit le 2026-07-30.

## Le problème

`src/config/legal.config.ts` annonce en tête :

> SOURCE UNIQUE DE VÉRITÉ — Conformité légale & facturation.
> Tout le contenu juridique (mentions légales, CGV, confidentialité, cookies)
> et le tunnel d'essai/abonnement lisent CE fichier.

**C'est faux.** Les pages `cgv`, `mentions-legales` et `parrainage` recopiaient
tout en dur et n'importaient même pas ce fichier. Un commentaire qui affirme une
garantie inexistante est pire que pas de commentaire : la prochaine personne
modifie la configuration, vérifie qu'elle est juste, et croit le site à jour.

Seule `entity.siteUrl` a été branchée le 30/07, parce qu'elle causait un dégât
concret (voir plus bas). Le reste est toujours recopié.

## Ce qui a été corrigé le 30/07

Les CGV, les mentions légales et le lien de parrainage annonçaient
`caela-reputation.fr`, **qui ne résout pas** (`curl` rend `000`, aucun DNS).

Le plus coûteux n'était pas le texte légal : le lien de parrainage partagé par
les clients en WhatsApp menait dans le vide. Le filleul tombait sur rien, le
parrainage était perdu, et **personne ne pouvait le signaler puisque celui qui
partage ne clique jamais sur son propre lien**.

Corrigé (commit `2e2aa0b`), prouvé en production : zéro occurrence du domaine
mort sur les trois pages, l'adresse réelle y apparaît 6, 4 et 2 fois, et elle
répond `200`. L'adresse vit maintenant dans `entity.siteUrl`, alimentée par
`NEXT_PUBLIC_APP_URL` : le jour où un vrai domaine existe, une seule variable à
poser.

## Ce qui reste

### 1. Renseigner l'identité légale — bloquant (LCEN art. 6 III-1)
Dans `legal.config.ts`, bloc `entity.micro` :
```ts
siret: "À_RENSEIGNER",     // OBLIGATOIRE et visible. Ne pas masquer.
address: "À_RENSEIGNER",
```
Et dans `src/app/mentions-legales/page.tsx`, en dur :
`SIRET : [À COMPLÉTER — 14 chiffres]` et `Adresse : [À COMPLÉTER]`.

**Même entité que Gagnify et Anhaya**, qui ont le même trou : un seul
renseignement débloque les trois projets.

### 2. Câbler vraiment les pages sur la configuration
Faire lire `entity` par `cgv/page.tsx` et `mentions-legales/page.tsx` au lieu de
recopier. Sinon le prochain changement d'entité (micro → LTD, que le fichier
prévoit explicitement) laissera des pages fausses en production, sans qu'aucune
erreur n'apparaisse.

### 3. Vérifier que `contact@caela.fr` reçoit vraiment
L'adresse est annoncée comme contact légal sur toutes les pages. `caela.fr` a
bien un MX chez hostedemail, donc il reçoit du courrier, mais **cette boîte
précise n'a pas été testée**. Une adresse de contact légal qui n'arrive nulle
part vide de sens l'obligation. À tester par un envoi réel.

Note connexe : `caela.fr` **n'est pas vérifié chez Resend** (`403` prouvé le
30/07), c'est pourquoi ce projet expédie depuis `caelenda.fr`. Recevoir et
émettre sont deux choses différentes.
