# Audit de conformité Google — Caela Réputation

**Date :** 8 septembre 2026<br>
**Site audité :** https://review-pilot-iota.vercel.app<br>
**Version du code examinée :** `8e86c6d`

> Ce rapport est une analyse technique et documentaire, pas un avis juridique opposable. Personne ne peut garantir « 100 % légal » ni l'absence de litige. Pour la marque et les contrats, il faut une validation finale par un avocat français en propriété intellectuelle/numérique et, pour l'API, une confirmation écrite de Google.

> **État après corrections du 9 septembre 2026 :** les constats ci-dessous décrivent le site au moment de l'audit initial. Le code a depuis reçu les garde-fous recommandés : identité visuelle Caela indépendante, double consentement non précoché, OAuth sans jeton exposé au navigateur, révocation journalisée, cache Google limité à 30 jours, métriques opérationnelles séparées, audit externe/Trustpilot/widget verrouillés, absence de remplacement des réponses Google existantes et automatisation Google coupée par défaut. Les blocages externes restent l'approbation du projet API/OAuth, la licence Trustpilot, les informations légales manquantes et la validation juridique finale. Le suivi à jour se trouve dans `docs/PLAN-AVANT-COMMERCIALISATION.md`.

## Verdict

**Un bot de réponse n'est pas interdit en lui-même : Google documente expressément la réponse aux avis au moyen de jetons OAuth mis en cache. Caela ne doit toutefois pas ouvrir cette automatisation aux clients avant l'approbation de son projet API/OAuth et la validation de son modèle exact de mandat d'agence.**

Le risque principal n'est pas seulement la couleur du site. Google autorise les plateformes et représentants à répondre aux avis et publier des posts pour les propriétaires, après connexion OAuth. En parallèle, sa politique encadre l'accès indirect au projet API, limite le stockage du contenu API à **30 jours** et exige un consentement préalable, spécifique et exprès avant toute réponse automatique. La qualification réelle de Caela comme agence opératrice, plutôt que simple revendeur d'accès API, doit être décrite à Google par écrit.

### Niveau de risque global

| Domaine | Niveau | Conclusion |
|---|---:|---|
| Architecture API et cron | **À faire approuver** | Usage prévu par l'API, mais frontière agence/SaaS à confirmer pour le projet Caela |
| Audit public via Places API | **Critique** | Le scoring de réputation ne figure pas parmi les usages Places autorisés en EEE et l'attribution manque |
| Conservation des avis | **Critique** | Historique actif indéfini + 12 mois après résiliation, au lieu de 30 jours maximum pour le contenu API |
| Marque et apparence Google | **Critique** | Imitation globale de l'identité visuelle et du mot-symbole Google |
| Collecte d'avis | **Critique** | Le produit réel est neutre, mais la page commerciale promet du review gating |
| OAuth et révocation | **Élevé** | Domaine Vercel, révocation incomplète, preuve de vérification non constatée |
| Promesses commerciales | **Élevé** | Chiffres et causalités SEO non démontrés; affirmation de conformité fausse |
| Widget et étoiles SEO | **Élevé** | Agrégation d'avis tiers et balisage auto-évaluatif inéligible |
| Mentions légales/RGPD | **Critique avant vente** | SIRET, adresse et médiateur manquants; politique de confidentialité inexacte |

## 1. Les sept blocages à corriger avant tout lancement

### 1.1 Projet Google partagé + automatisation par cron

Le code utilise un seul `GOOGLE_CLIENT_ID`/secret, conserve les refresh tokens de tous les commerçants et lance une synchronisation horaire. À chaque nouvel avis 4–5 étoiles, une réponse peut être générée et publiée sans action du commerçant.

Google documente qu'une plateforme peut conserver des autorisations OAuth et répondre aux avis ou créer des posts au nom du propriétaire. Le commerçant doit néanmoins se connecter lui-même au moins une fois et accepter l'écran OAuth. Une autre clause interdit de fournir à des agences ou end-clients un accès indirect ou automatisé au projet API du fournisseur, tout en préservant l'usage propre du fournisseur. Caela doit donc démontrer qu'elle opère réellement comme représentant mandaté et que les clients n'utilisent pas son projet comme une API en marque blanche.

**Éléments du code :**

- [`src/lib/google-oauth.ts`](../src/lib/google-oauth.ts) : projet OAuth unique et scope `business.manage`;
- [`src/app/api/cron/sync/route.ts`](../src/app/api/cron/sync/route.ts) : traitement programmatique de tous les établissements;
- [`vercel.json`](../vercel.json) : exécution toutes les heures;
- [`src/lib/review-processing.ts`](../src/lib/review-processing.ts) : publication automatique 4–5 étoiles.

**Décision recommandée :** conserver le produit, mais laisser l'automatisation désactivée par défaut et ne l'ouvrir commercialement qu'après approbation du projet API/OAuth. Envoyer au support le modèle exact : trois niveaux de délégation, mandat horodaté, équipe Caela sur les avis sensibles, révocation et cache 30 jours.

Sources : [Google Business Profile APIs policies](https://developers.google.com/my-business/content/policies), [OAuth usage by platforms](https://developers.google.com/my-business/content/oauth-setup).

### 1.2 Conservation et agrégation du contenu API

Google autorise seulement une quantité limitée de contenu mise en cache pour améliorer les performances. Ce contenu doit être stocké temporairement pendant **30 jours maximum**, de manière sécurisée, et ne doit pas être manipulé ni agrégé.

Le site conserve les noms d'auteurs, notes, textes, dates et réponses pendant toute la durée de l'abonnement, puis jusqu'à 12 mois après résiliation. Il calcule aussi des moyennes, tendances, scores, rapports et agrégats, et republie certains avis via un widget public.

**C'est incompatible avec la règle Google actuelle.** La règle des 12 mois peut être une durée RGPD interne, mais elle ne peut pas dépasser la limite contractuelle Google applicable au contenu API.

Important : supprimer la copie locale chez Caela **ne supprime pas l'avis original ni la réponse déjà publiée sur Google**. Ces éléments restent sur la fiche Google tant que Google ou leur auteur ne les supprime pas. Ce qui disparaît est uniquement l'historique, le texte et les statistiques conservés dans la base Caela.

**Décision recommandée :**

- supprimer automatiquement de la base Caela les contenus Google âgés de plus de 30 jours;
- ne pas présenter une conservation illimitée comme une fonctionnalité;
- séparer les données créées par Caela des contenus récupérés auprès de Google;
- demander à Google quels identifiants et indicateurs dérivés peuvent être conservés;
- retirer les agrégations d'avis Google jusqu'à confirmation écrite.

Sources : [règle de stockage Business Profile](https://developers.google.com/my-business/content/policies), [Google APIs Terms, contenu](https://developers.google.com/terms), [CNIL, durées de conservation](https://www.cnil.fr/fr/passer-laction/les-durees-de-conservation-des-donnees).

### 1.3 Identité visuelle trop proche de Google

Une couleur isolée n'appartient pas automatiquement à Google. Le problème vient de l'ensemble : palette exacte, séquence bleu-rouge-jaune-vert, mot « Google » recoloré lettre par lettre, quatre points colorés, Google Sans, cartes et barre de recherche simulant l'interface Google Business Profile.

Le code contient notamment :

- la palette exacte `#1A73E8`, `#EA4335`, `#FBBC04`, `#34A853`;
- un composant `GL` qui recrée le mot-symbole Google en couleurs;
- un composant `GDots` reprenant les quatre couleurs dans le même ordre;
- une fausse barre de recherche et une carte Business Profile;
- 136 références à cette palette ou à Google Sans dans `src`.

Google interdit d'imiter son logo ou son identité visuelle, y compris ses combinaisons de couleurs, graphismes, icônes et images associées. La politique Business Profile interdit aussi de reproduire le look and feel de son interface.

**À retirer immédiatement :** le mot Google multicolore, les quatre points, Google Sans, la palette utilisée comme système de marque, les maquettes trop fidèles et tout visuel laissant penser que Caela est un produit Google.

**À conserver :** le mot « Google » en texte ordinaire, pour une description factuelle comme « Compatible avec Google Business Profile », sans logo, sans couleurs Google et sans implication de partenariat.

Sources : [Google Brand Resource Center](https://about.google/brand-resource-center/guidance/), [Google Product co-branding](https://partnermarketinghub.withgoogle.com/brands/google/use-cases/product-co-branding/), [Business Profile API branding rules](https://developers.google.com/my-business/content/policies).

### 1.4 Review gating et roue à cadeaux

Google interdit :

- les cadeaux, remises ou services offerts en échange d'un avis;
- le fait de décourager les avis négatifs;
- la sollicitation sélective des seuls clients satisfaits;
- les demandes qui influencent la note ou le contenu.

Le parcours réel de la roue est plutôt bien conçu : le gain est obtenu avant l'invitation à laisser un avis, l'avis est facultatif et un texte indique qu'il peut être positif ou négatif. Cette séparation est un bon point.

En revanche, la page d'accueil affirme : **« Les mécontents sont invités à vous écrire en privé d'abord »**. Cette promesse décrit précisément un filtrage des clients insatisfaits. L'article NFC conseille aussi de demander un avis uniquement « si vous êtes satisfait ». Ces deux formulations doivent disparaître. La roue ne doit jamais être présentée comme une « roue à avis » ni installée de façon à laisser croire que le lot dépend de l'avis.

Formulation sûre : « Tous les clients peuvent partager librement une expérience authentique, positive ou négative. Aucun avantage n'est lié au dépôt, à la note, à la modification ou à la suppression d'un avis. »

Source : [Google Maps User Generated Content Policy](https://support.google.com/contributionpolicy/answer/7400114).

### 1.5 Affirmations fausses ou non démontrées

Les mentions suivantes doivent être retirées ou accompagnées d'une preuve robuste, datée et accessible :

- « 100% conforme aux CGU Google »;
- « Zéro risque pour votre fiche Google »;
- « Google Maps favorise les fiches qui répondent vite »;
- « Google t'en récompense sur Maps »;
- « +12% de vues Maps », « 45% reconvertis », « 89% lisent tes réponses »;
- « Collectez 3× plus d'avis »;
- « Aucun concurrent français… » et « 6× moins cher »;
- « Google ne peut pas distinguer une réponse IA » ou « l'IA n'a jamais été sanctionnée ».

Google indique que le classement local dépend principalement de la pertinence, de la distance et de la notoriété. Il confirme que le volume et la note des avis peuvent aider, et qu'une réponse utile aide l'entreprise à se démarquer; il ne dit pas que la vitesse de réponse apporte un bonus algorithmique de 12 %.

En droit français, une présentation créant une confusion avec une marque ou reposant sur des résultats attendus, prix et comparaisons invérifiables peut être qualifiée de pratique commerciale trompeuse. Une publicité comparative doit être objective, pertinente, vérifiable et représentative.

Sources : [Google, classement local](https://support.google.com/business/answer/7091), [Google, conseils de réponse](https://support.google.com/business/answer/3474122), [Code de la consommation L121-2](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000044563114), [Code de la consommation L122-1](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000032227222).

### 1.6 OAuth, domaine et déconnexion

Une application OAuth de production doit avoir une page d'accueil publique sur un domaine vérifié que l'éditeur possède. Un sous-domaine `vercel.app` n'est pas un domaine racine détenu par Caela; il faut utiliser un domaine propre, le vérifier dans Search Console et le déclarer dans Google Cloud.

Le scope `business.manage` doit être déclaré et l'application de production vérifiée selon sa classification dans Google Cloud. Le dépôt ne permet pas de prouver que cette vérification a été obtenue.

Autres écarts :

- la déconnexion met le refresh token local à vide mais n'appelle pas l'endpoint Google de révocation;
- le refresh token est placé pendant 15 minutes dans un JWT signé stocké côté navigateur; une signature n'est pas un chiffrement;
- le consentement à l'auto-réponse 4–5 étoiles est activé par défaut, donc il ne constitue pas un choix exprès;
- aucune preuve d'autorisation versionnée et horodatée n'est stockée.

**À faire :** domaine propre, vérification OAuth, révocation distante puis suppression locale, ticket serveur opaque pour le choix d'établissement, option auto-réponse désactivée par défaut et journal de consentement.

Sources : [Google OAuth 2.0 Policies](https://developers.google.com/identity/protocols/oauth2/policies), [OAuth Verification Requirements](https://support.google.com/cloud/answer/13464321), [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy).

### 1.7 Audit gratuit fondé sur Places API

L'audit public n'utilise pas `GoogleLocations` : le code appelle bien **Places API (Legacy)** (`findplacefromtext` puis `details`) pour récupérer notamment le nom, la note, le nombre d'avis, l'adresse, les photos, le site et le téléphone. Il transforme ensuite ces données en score `/100`, constats et recommandations; le score et les constats dérivés alimentent aussi une génération de recommandations par Anthropic.

Pour un compte de facturation situé dans l'Espace économique européen et une intégration créée ou substantiellement modifiée après le 8 juillet 2025, Google limite Places API à une liste fermée de neuf cas d'usage. Un audit commercial de réputation ou un scoring destiné à convertir des prospects ne figure pas dans cette liste. Les conditions EEE interdisent aussi certains usages de création de contenu à partir de Maps Content. Même hors EEE, l'affichage de données Places sans carte exige une attribution Google Maps conforme et les conditions imposent des restrictions de cache et de republication.

Le résultat et l'email Caela affichent actuellement les données et le score sans attribution Google Maps visible. Les conditions publiques du site doivent également indiquer que les fonctionnalités/contenus Google Maps sont soumis aux conditions d'utilisation finales de Google Maps et à la politique de confidentialité de Google.

**Décision recommandée :** désactiver la branche Google de l'audit gratuit. La remplacer temporairement par des informations saisies directement par le commerçant, sans récupération Places, ou obtenir de Google une confirmation écrite que ce cas d'usage et son traitement par un prestataire IA sont autorisés. Si l'intégration est conservée, ajouter les attributions et clauses obligatoires, ne stocker que ce qui est permis et réévaluer séparément la branche Trustpilot selon sa propre licence.

Sources : [Places API policies](https://developers.google.com/maps/documentation/places/web-service/policies), [Google Maps Platform EEA Terms](https://cloud.google.com/terms/maps-platform/eea), [EEA Service Specific Terms](https://cloud.google.com/terms/maps-platform/eea/maps-service-terms), [EEA Places API Permitted Uses](https://cloud.google.com/terms/maps-platform/eea-places-api-permitted-uses).

## 2. Audit détaillé par zone du site

| Zone | Ce qui va | Ce qui ne va pas |
|---|---|---|
| Accueil | Disclaimer « non affilié » en footer; usages descriptifs du nom | Identité Google imitée, fausse garantie de conformité, chiffres invérifiables, review gating, causalités SEO |
| Onboarding/OAuth | OAuth standard, state anti-CSRF, tokens chiffrés en base | Projet partagé automatisé, auto-réponse positive par défaut, refresh token dans un JWT client, absence de preuve de vérification |
| Dashboard Avis | Suggestions et publication directe possibles | Historique permanent, agrégations interdites, look Google omniprésent |
| Email avis négatif | Le clic ouvre une confirmation et ne publie rien | Le lien est un bearer token; il faut une preuve d'autorisation plus forte pour les actions sensibles |
| Confirmation avis négatif | Bonne page de prévisualisation; publication par POST explicite | Ajouter édition libre sur cette page et identité/authentification renforcée selon le risque |
| Auto-réponse 4–5 | Détection de sujets sensibles et secteurs réglementés | Publication automatique via cron; consentement activé par défaut; pas de validation par avis |
| Option auto-réponse 1–3 | Désactivée par défaut dans l'UI | Le bouton est trompeur : la valeur est enregistrée mais le moteur ne l'utilise jamais |
| Plaques NFC | Lien direct vers le formulaire Google autorisé | Promesse « mécontents en privé » et sollicitation « si satisfait » interdites |
| Roue | Lot indépendant dans le code, avis libre et facultatif | Risque élevé si la communication physique ou commerciale relie lot et avis; wording « roue à avis » à éviter |
| Widget | Affichage lisible et source Caela indiquée | Re-publication sélective des seuls 4–5★, absence d'attribution Google visible, contenu API conservé/diffusé, agrégation interdite |
| Étoiles SEO | Données visibles dans le widget | `AggregateRating` injecté sur le site de l'entreprise évaluée : auto-évaluation inéligible; Google interdit aussi d'agréger des avis venant d'autres sites |
| Audit gratuit | Limitation à 3 requêtes/heure/IP; résultats simulés signalés comme tels | Places API sert à produire un score commercial hors des usages EEE listés; attribution et clauses Maps absentes; données dérivées transmises à Anthropic |
| Blog/chatbot | Certains conseils de modération sont prudents | Conseils 2026 contredits par la règle du 28 août; fausses assurances sur l'IA, la conformité, les concurrents et le classement |
| CGV/confidentialité | Sous-traitants listés, droits et export prévus | Durée Google erronée, responsabilités excessivement transférées au client, fournisseurs/régions non vérifiés, affirmation ZDR non prouvée |
| Mentions légales | Pages accessibles | SIRET, adresse et médiateur affichent `À_RENSEIGNER`; lien RLL fermé depuis juillet 2025 |

## 3. Réponses précises sur le mot « Google » et les couleurs

### Autorisé en principe

- Écrire « Google » ou « Google Business Profile » en texte simple pour décrire une compatibilité réelle.
- Dire « Caela Réputation s'intègre à Google Business Profile » si l'intégration est effectivement autorisée.
- Créer un lien ou QR code vers une page Google.
- Montrer ponctuellement une capture Google non modifiée dans une vraie instruction ou documentation.
- Ajouter une attribution juridique correcte et un disclaimer de non-affiliation.

### À proscrire

- Recolorer le mot Google comme le logo.
- Faire des quatre couleurs Google le signe distinctif de Caela.
- Employer Google Sans comme police de marque ou tenter de la charger depuis Google Fonts.
- Reproduire l'interface Business Profile pour l'habillage général du produit.
- Utiliser un logo/icône Google comme badge de confiance ou près d'un bouton commercial.
- Dire ou suggérer « partenaire », « approuvé », « certifié », « recommandé » ou « garanti par Google » sans autorisation écrite.

Le disclaimer en bas de page est utile, mais il ne neutralise pas une impression d'ensemble trompeuse créée plus haut.

## 4. Modèle produit recommandé

### Version la plus prudente, exploitable sans automatisation

1. Le commerçant se connecte manuellement.
2. Les avis sont lus en direct ou mis en cache au plus 30 jours.
3. Caela génère des suggestions.
4. Le commerçant choisit, édite ou écrit sa réponse.
5. Une page récapitule l'avis, la réponse et l'action publique.
6. Le commerçant clique sur « Confirmer et publier »; l'envoi se fait par POST.
7. Le contenu Google local expire automatiquement; la réponse reste sur Google.

Ce parcours existe déjà pour les avis 1–3 étoiles et constitue une bonne base. Il ne résout toutefois pas à lui seul la question du projet partagé : Google doit confirmer que l'usage interactif proposé est accepté.

### Si l'auto-réponse reste indispensable

Ne pas choisir seul une interprétation favorable. Fournir à Google un schéma précis : projet utilisé, rôle de Caela, rôle du commerçant, refresh tokens, cron, consentement, durée de cache, modèle multi-tenant et opérations exactes. Demander une validation écrite avant activation. Si Google impose une architecture ou un accord partenaire particulier, l'implémenter avant de vendre la promesse.

## 5. Corrections juridiques hors Google

Ces défauts rendent également le site impropre à une commercialisation publique :

- renseigner le SIRET et l'adresse de l'entreprise individuelle;
- souscrire réellement à un médiateur référencé et publier son nom, son adresse et son site;
- supprimer le lien vers l'ancienne plateforme européenne RLL, fermée le 20 juillet 2025;
- vérifier chaque sous-traitant, région d'hébergement, DPA/CCT et mécanisme de transfert;
- ne pas promettre le « zero data retention » Anthropic sans option contractuelle effectivement activée et documentée;
- corriger la mention d'un worker Oracle Cloud si les crons tournent en réalité sur Vercel;
- ajouter un accord de sous-traitance RGPD avec les clients professionnels et documenter les instructions, sous-traitants ultérieurs, sécurité, assistance et suppression;
- permettre la suppression du compte, pas uniquement l'export et la résiliation;
- documenter la base légale et l'information des auteurs d'avis dont le nom et le texte sont retraités par IA.

Sources : [obligations de médiation](https://www.economie.gouv.fr/mediation-conso/vous-etes-un-professionnel/vos-principales-obligations-0), [CNIL, contrats de sous-traitance](https://www.cnil.fr/fr/clauses-contractuelles-types-entre-responsable-de-traitement-et-sous-traitant), [fermeture de la plateforme RLL](https://eur-lex.europa.eu/eli/reg/2024/3228/oj).

## 6. Plan d'action priorisé

### P0 — avant toute nouvelle connexion Google

- Couper le cron Google et l'auto-publication 4–5 étoiles.
- Désactiver l'audit Google fondé sur Places API jusqu'à validation écrite du cas d'usage.
- Retirer « 100% conforme », « zéro risque » et les garanties SEO.
- Retirer le mot-symbole Google multicolore, les points, Google Sans et les maquettes imitatives.
- Retirer toute phrase de review gating.
- Désactiver l'injection JSON-LD du widget.
- Contacter Google avec le dossier d'architecture et demander une décision écrite.

### P1 — sous 7 jours

- Mettre une expiration de 30 jours sur tout contenu API Google et cesser les agrégations non approuvées.
- Révoquer réellement les tokens lors d'une déconnexion.
- Passer toutes les automatisations à `false` par défaut et enregistrer le consentement.
- Ajouter dans le footer le lien Google obligatoire « Working with a third party ».
- Informer par écrit que Google Business Profile est fourni gratuitement par Google et que Caela facture uniquement son service de gestion.
- Corriger ou retirer les articles de blog et réponses chatbot non sourcés.

### P2 — avant encaissement

- Brancher un domaine propre et le vérifier pour OAuth.
- Finaliser la vérification de marque et de scope Google.
- Renseigner SIRET, adresse et médiateur; retirer le lien RLL obsolète.
- Vérifier les contrats et transferts RGPD avec Vercel, Supabase, Anthropic, Resend et Stripe.
- Faire relire la nouvelle identité et les CGV par un avocat.

### P3 — contrôle de mise en production

- Préparer un compte de démonstration complet, que Google peut demander sous sept jours.
- Conserver les preuves de consentement et notifications des changements.
- Mettre en place une veille mensuelle des politiques Google.
- Tester chaque texte d'IA contre les contenus interdits, promotions, données personnelles et répétitions.
- Faire un nouvel audit après chaque modification de l'OAuth, des scopes, de la conservation ou de la collecte.

## 7. Ce qui est déjà bien conçu

- Les refresh tokens stockés en base sont chiffrés.
- Le state OAuth protège contre le CSRF et la session est vérifiée au callback.
- Le parcours email d'avis négatif affiche une confirmation; un GET ne publie rien et seul un POST explicite agit.
- Les secteurs réglementés et sujets sensibles peuvent forcer une validation humaine.
- La roue réelle sépare le gain de l'avis et accepte explicitement les avis positifs ou négatifs.
- Le commerçant peut exporter ses données.
- Le footer précise que Caela n'est pas affilié à Google et attribue les marques.

Ces protections doivent être conservées, mais elles ne compensent pas les blocages P0.

## Conclusion opérationnelle

Le risque le plus probable à court terme est la **désactivation du projet Business Profile API**, éventuellement sans avertissement. Le risque de marque vient ensuite, car l'apparence cumulée peut faire croire à un produit Google malgré le disclaimer. Le risque français est également concret à cause des mentions légales incomplètes et des allégations commerciales non prouvées.

La bonne décision n'est pas de cacher davantage Google : il faut garder les références factuelles en texte simple, créer une identité Caela autonome et reconstruire l'intégration autour de l'autorisation écrite de Google, du consentement explicite et de la limite de 30 jours.
