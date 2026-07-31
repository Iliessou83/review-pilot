# Caela Réputation — à reprendre

Arrêt volontaire le **2026-07-31**. Rien n'est cassé, rien n'est urgent. Ce
fichier existe pour qu'on reprenne sans réenquêter.

---

## 1. L'adresse publique ne pointe pas sur ce projet

**C'est le point à traiter en premier**, parce qu'il touche peut-être un client.

`https://review-pilot.vercel.app` répond `200` et affiche bien
« ReviewPilot — Réponses automatiques à vos avis Google ». Tout semble normal.
Mais :

```
$ npx vercel inspect https://review-pilot.vercel.app
Error: Can't find the deployment "review-pilot.vercel.app"
       under the context "bourbouane2002-9496s-projects"
```

Et surtout, plusieurs routes de l'API y sont introuvables alors qu'elles
répondent parfaitement sur le déploiement réel :

| route | sur `review-pilot.vercel.app` | sur le déploiement du projet |
|---|---|---|
| `/api/audit/search` | 404 | 405 en GET, 400 en POST (elle existe) |
| `/api/audit` | 404 | existe |
| `/api/chat` | 404 | existe |
| `/api/auth/login` | 400 (elle existe) | existe |

Donc cette adresse sert **une version figée et partielle** du site. C'est le
motif des pannes 9 et 51 du catalogue : un alias qui ne suit pas les
déploiements, ou qui appartient à un autre projet.

**À faire, dans cet ordre :**
1. Ouvrir le tableau de bord Vercel et chercher qui possède le domaine
   `review-pilot.vercel.app` (il n'apparaît pas dans `vercel alias ls` de ce
   compte, ce qui est déjà anormal).
2. Retrouver quelle URL a été communiquée à un client ou mise dans un email.
   Si c'est celle-là, la corriger AVANT toute autre chose.
3. Rattacher l'alias au bon projet, ou en poser un propre.
4. Preuve attendue : `curl -X POST .../api/audit/search` rend un `400` ou un
   `429`, jamais un `404`.

**Ne pas conclure en regardant la page d'accueil.** Elle répond, avec le bon
titre. C'est exactement ce qui rend la panne invisible.

---

## 2. La table `login_attempts` stocke l'adresse IP en clair

Colonne `ip_key`, valeurs du type `login:89.93.14.31`. Un compteur n'a jamais
besoin de savoir qui, seulement combien.

Défaut **préexistant**, pas introduit le 31 juillet. Il est moins grave que son
équivalent sur la base partagée de l'écosystème (déjà corrigé, panne 97) parce
que cette base-ci n'est utilisée que par Réputation. Mais c'est la même nature :
une table technique qui devient un fichier de personnes.

**Correctif type**, déjà appliqué ailleurs, à recopier dans
`src/lib/rate-limit.ts` :

```ts
function cleAnonyme(key: string): string {
  const i = key.indexOf(":");
  if (i === -1) return key;
  return `${key.slice(0, i)}:${createHash("sha256").update(key.slice(i + 1)).digest("hex").slice(0, 24)}`;
}
```

Puis `dbRateLimit` écrit `cleAnonyme(key)` au lieu de `key`. Le compte est
rigoureusement identique, un hash étant stable.

**Détection / preuve :**
```sql
select ip_key from login_attempts where ip_key ~ '\d+\.\d+\.\d+\.\d+';
-- zéro ligne attendue après correctif
```
Purger les lignes existantes au passage : `delete from login_attempts;`
(ce sont des compteurs, pas des données métier).

---

## 3. Le ménage de `login_attempts` n'est branché sur aucun cron

La table garde une ligne par clé vue, indéfiniment. Rien ne la purge.

Sur la base partagée de l'écosystème, ce ménage existe déjà : le cron mensuel de
Nexus `/api/cron/purge-mesure` supprime les lignes de plus de 24 h. Réputation
a sa propre base, elle n'est pas couverte.

Option la plus simple : ajouter à un cron existant du projet
`delete from login_attempts where reset_at < now() - interval '1 day';`

---

## Ce qui a été fait le 2026-07-31 (ne pas refaire)

**La table `login_attempts` n'existait pas en base.** La migration
`drizzle/manual/2026-07-20_add_login_attempts.sql` était écrite et commitée
depuis onze jours, jamais exécutée. `dbRateLimit()` levait donc à chaque appel,
et le `try/catch` de la route de connexion retombait sur un compteur en mémoire,
qui ne protège rien sur Vercel. Résultat : `/api/auth/login` et
`/api/auth/forgot-password` n'étaient protégés par rien pendant onze jours.
Catalogué en panne 98.

Table créée le 2026-07-31, RLS activée, aucun droit pour `anon` ni
`authenticated` (comme les 10 autres tables du projet). Compteur atomique
prouvé : trois appels successifs rendent `1, 2, 3`.

**Cinq routes de plus sont passées de la mémoire à la base** : `chat`,
`auth/register`, `wheel/spin`, `audit`, `audit/search`. Les deux premières
comptent, mais `chat` et `audit` appellent un modèle payant : sans plafond réel,
la facture était ouverte.

Nouveau helper `limitePartagee()` dans `src/lib/rate-limit.ts` : les deux étages
et le repli au même endroit, au lieu du `try/catch` recopié à la main.

**Preuve en production**, sur le déploiement réel du projet :
`/api/audit/search`, 13 appels d'affilée →
`400 400 400 400 400 400 400 400 400 400 429 429 429`.
Dix passent, le onzième est bloqué, exactement le seuil visé.

Commit `bbd9929`, poussé sur GitHub.

---

## Le piège à connaître avant de tester quoi que ce soit ici

Un corps de requête invalide se fait rejeter **avant** le limiteur. Dix `400`
d'affilée ne prouvent donc rien du tout sur la limite. Lire l'ordre des
contrôles dans la route, et vérifier qu'on atteint bien le compteur.
