# État durable du projet — Caela Réputation / Review Pilot

Dernière mise à jour : 10 septembre 2026, Europe/Paris  
Statut : pré-lancement sécurisé, production déployée, intégrations externes sensibles volontairement verrouillées  
Responsable produit : Iliès  
Projet local : /Users/iliessou/Workspace/Projets/review-pilot  
Dépôt GitHub : https://github.com/Iliessou83/review-pilot.git  
Branche : main  
Site public : https://review-pilot-iota.vercel.app

## Règle de reprise

Ce fichier est la mémoire opérationnelle du projet. Il doit être lu avant toute nouvelle intervention et mis à jour à la fin de chaque session substantielle.

Avant de reprendre :

1. lire ce fichier et docs/PLAN-AVANT-COMMERCIALISATION.md ;
2. vérifier git status, la branche et le dernier commit ;
3. vérifier le dernier déploiement Vercel et les variables nécessaires sans afficher leur valeur ;
4. vérifier les migrations avant d'en appliquer une nouvelle ;
5. ne pas réactiver Google, Trustpilot, le widget externe ou les audits sans satisfaire les conditions indiquées ici ;
6. ne jamais enregistrer de secret, token OAuth, mot de passe ou donnée client dans cette mémoire.

Les informations juridiques, les prix de fournisseurs, les règles Google/Trustpilot et l'état des services externes sont volatils : les revérifier au moment de la reprise.

## Vision et décisions produit confirmées par Iliès

- Le commerçant reste toujours propriétaire ou copropriétaire de sa fiche Google Business Profile.
- Caela est un prestataire indépendant et un représentant autorisé, jamais le propriétaire de la fiche.
- L'objectif est de gérer les avis, réponses, publications et tâches de réputation à la place du commerçant selon un mandat clair.
- Le commerçant choisit le niveau de délégation.
- Les réponses 4–5 étoiles peuvent être automatisées après autorisation Google et consentement exprès du commerçant.
- Les avis 1–3 étoiles peuvent être gérés par Caela, mais les sujets sensibles doivent être contrôlés par une personne.
- Au lancement, aucune réponse négative ne doit être publiée sans contrôle humain.
- Les cas santé, sécurité, hygiène, allergène, accusation, litige, remboursement important, données personnelles et secteurs réglementés sont toujours humains.
- Aucun faux avis, review gating, redirection des clients mécontents, achat d'avis ou récompense conditionnée à un avis n'est autorisé.
- Les plaques et Ganify peuvent inviter tous les clients à laisser un avis authentique, positif ou négatif. Le gain ne dépend jamais de l'avis.
- Aucune promesse de première place, de gain SEO garanti, de hausse certaine de note ou de ROI invérifiable.
- La différenciation commerciale retenue est : service français accessible, contrôle humain réel sur le négatif, mandat traçable, révocation simple, écosystème Caela et rapports fondés sur des actions observables.
- La page légale pourra encore être retravaillée, mais les champs obligatoires manquants bloquent la commercialisation complète.

## Dernier état Git et déploiement confirmé

État constaté le 10 septembre 2026 avant l'ajout de cette mémoire :

- branche main synchronisée avec origin/main ;
- arbre de travail propre ;
- dernier commit fonctionnel : b1f03ba — Harden Google consent and launch safeguards ;
- commit précédent : 4ae9bb8 — Disable unlicensed audit simulations ;
- commit précédent : a209813 — Reconcile deployed compliance update.

Déploiement de production confirmé le 9 septembre 2026 :

- Vercel deployment ID : dpl_HdbN8rcwYFRjH9BngJVunqrkAFNw ;
- URL immuable : https://review-pilot-j63lzr2wh-bourbouane2002-9496s-projects.vercel.app ;
- alias public : https://review-pilot-iota.vercel.app ;
- état Vercel : Ready ;
- build Next.js et TypeScript réussi.

Ne pas supposer que ce déploiement est encore le dernier lors de la reprise : utiliser vercel inspect.

## Travail terminé

### 1. Consentement Google et propriété du commerçant

- Nouvelle page src/app/businesses/google-consent/page.tsx.
- Deux cases distinctes, obligatoires et non précochées :
  - confirmation que l'utilisateur est propriétaire ou gestionnaire autorisé ;
  - autorisation d'accès OAuth à Caela.
- Le texte précise que le commerçant conserve la propriété/copropriété.
- Le texte précise que Google Business Profile est gratuit et que Caela facture son propre service.
- La connexion OAuth ne déclenche pas l'automatisation.
- Un mandat séparé est demandé dans le dashboard pour changer de mode de réponse.
- Consentements horodatés, versionnés et append-only.
- Modes prévus :
  - manual ;
  - positive_auto ;
  - all_delegated.
- Activation du mode et preuve du mandat enregistrées dans une même transaction PostgreSQL.
- Les réglages d'automatisation sont désactivés par défaut.
- La déconnexion Google coupe les automatisations, révoque le token à distance, efface le token local et conserve les événements de révocation nécessaires.
- L'accès doit être dissocié conformément au délai Google applicable après résiliation.

### 2. OAuth et sécurité des tokens

- L'ancienne possibilité de faire passer un refresh token dans le navigateur a été supprimée.
- Le choix multi-établissements utilise un ticket serveur opaque et non devinable.
- Ticket aléatoire de 32 octets, hashé en base, valable 15 minutes.
- Refresh token chiffré en base.
- Cookie HttpOnly, Secure et SameSite.
- State OAuth signé, lié à la session, versionné et valable 10 minutes.
- Le callback vérifie le state, la session et la version des conditions.
- Les comptes et établissements Google sont paginés.
- Lors de la sélection, le serveur recharge les établissements réellement autorisés et ignore les titres ou chemins inventés par le client.
- Aucun fallback Bearer non sécurisé n'est accepté.
- TOKEN_ENCRYPTION_KEY a été ajoutée dans Vercel Production sans enregistrer sa valeur ici.
- Au contrôle du 9 septembre, aucun token métier historique non chiffré n'était présent dans les lignes vérifiées.
- GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET n'étaient pas encore configurés en production au dernier contrôle.

### 3. Gestion et synchronisation des avis

- Cron de synchronisation : /api/cron/sync, toutes les heures en UTC.
- La route refuse l'exécution si CRON_SECRET est absent ou incorrect.
- Synchronisation Google paginée, maximum 500 avis récents par passage.
- Un avis déjà répondu sur Google est marqué responded et n'est jamais reproposé ou remplacé.
- Index unique business_id + platform_review_id pour empêcher les doublons en cas de chevauchement cron/clic manuel.
- Événements opérationnels séparés dans review_activity_events.
- Les quotas mensuels utilisent les événements de détection et non le cache temporaire de 30 jours.
- Les sujets sensibles et avis négatifs passent par un parcours humain.
- Le mode de délégation humaine complète existe mais reste verrouillé par ENABLE_CAELA_HUMAN_DELEGATION.
- La publication automatique Google reste verrouillée par ENABLE_GOOGLE_REVIEW_AUTOMATION.
- Les dépassements de volume ne déclenchent aucune surfacturation automatique : alerte et contact commercial seulement.
- Les emails de validation et les confirmations doivent conduire à une publication par POST explicite, jamais par simple ouverture d'un lien GET.
- Un POST explicite signifie que la page affiche d'abord le récapitulatif, puis que l'utilisateur clique volontairement sur Confirmer et publier. L'ouverture d'un email ne publie rien.

### 4. Conservation et statistiques

Cron quotidien : /api/cron/data-retention-purge à 05:00 UTC.

Contenu Google copié localement et supprimé au plus tard 30 jours après publishedAt :

- nom public de l'auteur ;
- note individuelle ;
- texte de l'avis ;
- identifiant Google de l'avis ;
- suggestion ou réponse stockée localement.

Exemple : Julie publie « 2 étoiles — attente de 40 minutes ». Après 30 jours, cette copie disparaît de Caela. L'avis original, ses étoiles et toute réponse déjà publiée restent sur Google.

Données opérationnelles longues durées possibles sans recopier le contenu :

- avis détecté ;
- réponse publiée ;
- mode de traitement ;
- délai de réponse ;
- date de l'événement.

Douze mois après une résiliation, le cron supprime l'établissement Caela et les données opérationnelles qui lui sont rattachées. Il ne supprime pas le compte de connexion users. Les données de facturation soumises à une obligation légale peuvent suivre une autre durée. Un export JSON est disponible avant purge et n'inclut jamais les secrets OAuth/API.

Attention à la reprise : la durée exacte et les catégories conservables doivent rester alignées avec les conditions Google et la validation juridique. Ne jamais annoncer une conservation illimitée des contenus Google.

### 5. Écritures atomiques et index

- Écriture atomique = tout ou rien. Le réglage d'automatisation et la preuve de consentement réussissent ensemble ou échouent ensemble.
- Index = structure PostgreSQL accélérant les recherches.
- Index unique = garantie en base empêchant deux copies du même avis même si deux workers travaillent simultanément.
- Indexes ajoutés pour consentements, tickets OAuth, événements d'activité et token public du widget.

### 6. Widget et audit

Widget :

- Identifiant public remplacé par un UUID aléatoire non devinable.
- Désactivé par défaut avec widget_enabled=false.
- Maximum cinq origines autorisées par commerce.
- Pas de CORS wildcard.
- Limitation partagée en base : 240 requêtes par heure, IP et token.
- JSON-LD AggregateRating supprimé.
- Le script indique la source Caela et la sélection éventuelle.
- L'ancien widget public répond volontairement 503 tant que la licence n'est pas validée.
- ENABLE_EXTERNAL_REVIEW_WIDGET doit rester false avant validation écrite des droits.

Audit :

- Branches Google Places et Trustpilot désactivées.
- Aucune simulation IA présentée comme une vraie note.
- La page reste visible comme fonctionnalité en préparation.
- L'accueil et la navigation ne conduisent plus à un faux audit exploitable.
- Recommandation future :
  - aperçu déterministe peu coûteux ;
  - résultat complet après OAuth de la propre fiche du commerçant ;
  - email vérifié ;
  - quota par établissement et période ;
  - limitation IP ;
  - données factuelles, jamais score officiel Google ;
  - IA approfondie seulement pour un prospect qualifié ou un client.
- Ne pas réactiver ENABLE_GOOGLE_PLACES_AUDIT avant confirmation écrite du cas d'usage EEE.
- Ne pas réactiver ENABLE_TRUSTPILOT_AUDIT avant licence Trustpilot.

### 7. Site, mobile, marketing et marque

- Section « Fait partie de l'écosystème Caela » déplacée juste au-dessus du footer.
- Carrousel marketing corrigé pour un défilement infini sans saut visible.
- Débordements horizontaux mobile corrigés.
- Formulaires et cartes NFC adaptés au mobile.
- Test visuel effectué en 375 × 812.
- Le mot-symbole Google multicolore, les quatre points Google et les anciennes plaques trop proches de la marque ont été retirés.
- L'identité utilise désormais Caela et des bleus propres à Caela.
- Le mot Google reste utilisable en texte ordinaire uniquement pour décrire le service.
- Les couleurs isolées ne sont pas interdites ; c'est l'impression d'ensemble, l'imitation du logo/interface ou la fausse affiliation qu'il faut éviter.
- Les affirmations non prouvées sur le classement, le délai, le ROI, les pourcentages de vues et la supériorité absolue ont été retirées ou reformulées.
- Les conseils de review gating dans l'accueil, le blog et le chatbot ont été retirés.
- Mention d'indépendance de Caela et lien officiel « travailler avec un tiers » ajoutés.
- Le faux AggregateRating global a été supprimé.
- Le JSON-LD SoftwareApplication restant décrit les offres publiques.
- L'ancienne plateforme européenne RLL fermée a été retirée de la configuration juridique.
- Il reste des champs légaux à compléter avant vente.

### 8. Plaques NFC et commande

Tarifs harmonisés :

- Solo : 1 plaque, 19 € ;
- Trio : 3 plaques, 47 € ;
- Établissement : 5 plaques, 69 €.

Commande :

- Route réelle POST /api/nfc-orders.
- Envoi via Resend.
- Validation des champs et longueurs.
- Échappement HTML.
- Limite partagée : 5 commandes par heure et par IP.
- Réponse 503 si l'email échoue ; aucun faux succès côté navigateur.
- Confirmation affichée seulement après réponse serveur positive.

Visuels actuels :

- public/nfc/plaque-produit-caela.png ;
- public/nfc/plaque-lifestyle-caela.png.

Anciens fichiers supprimés du dépôt mais récupérables via l'historique Git :

- public/nfc/plaque-produit.jpg ;
- public/nfc/plaque-lifestyle.jpg.

Méthode d'image utilisée : édition par l'outil imagegen intégré. Le visuel produit remplace le mot-symbole tiers par trois points bleus et CAELA en blanc, tout en conservant la plaque, les étoiles, le symbole NFC et la scène. Le visuel lifestyle remplace la référence tierce par « Laissez-nous un avis » et conserve « en 10 secondes », le produit et l'ambiance. Une première variante lifestyle non retenue contenait encore « avis Google » et a été écartée.

### 9. Prix logiciel publics

Prix mensuels harmonisés entre accueil, dashboard, chatbot et configuration :

- Starter : 49 €/mois, 30 avis/mois ;
- Solo : 69 €/mois, 100 avis/mois ;
- Pro : 149 €/mois, 300 avis/mois, jusqu'à 5 établissements ;
- Studio : 299 €/mois, 1 000 avis/mois, jusqu'à 5 établissements ;
- Agency : 449 €/mois, 3 000 avis/mois, établissements illimités.

Équivalents annuels affichés :

- Starter 39 €/mois ;
- Solo 55 €/mois ;
- Pro 119 €/mois ;
- Studio 239 €/mois ;
- Agency 359 €/mois.

Aucun prix de dépassement automatique n'est actuellement implémenté ou annoncé. La prise en charge humaine du négatif doit être un module séparé avec volume, SLA et prix contractuels. Hypothèse de travail non validée : 20 avis sensibles par mois pour 149–199 €, puis 6–10 € par avis supplémentaire, ou devis réseau.

Estimations à confirmer par télémétrie :

- 1 000 réponses positives courtes : environ 5–15 $ d'IA ;
- 1 000 avis négatifs avec trois suggestions : environ 12–35 $ d'IA ;
- 500 avis négatifs à 5–10 minutes de contrôle : environ 42–83 heures humaines.

### 10. Crons, Pub/Sub et VPS

Crons Vercel actuels dans vercel.json :

- sync : chaque heure ;
- reminders : tous les jours à 09:00 UTC ;
- trial-reminder : tous les jours à 08:00 UTC ;
- weekly-report : lundi à 08:00 UTC ;
- referral-reward : tous les jours à 09:00 UTC ;
- content-reminder : lundi à 09:00 UTC ;
- internal-alerts : tous les jours à 07:00 UTC ;
- data-retention-purge : tous les jours à 05:00 UTC.

Fréquences comparées :

- toutes les 10 secondes : environ 259 200 déclenchements/mois ;
- toutes les minutes : environ 43 200 ;
- toutes les heures : environ 720.

Architecture cible :

1. Google envoie NEW_REVIEW ou UPDATED_REVIEW dans Cloud Pub/Sub ;
2. une subscription push authentifiée appelle Caela ;
3. l'événement entre dans une file idempotente ;
4. un worker récupère l'avis concerné ;
5. la réponse est générée ou envoyée au contrôle humain ;
6. le cron horaire réconcilie les notifications manquées.

Pub/Sub est une sonnette, pas le moteur de réponse. Un VPS est possible mais non nécessaire au lancement et ajoute supervision, mises à jour, secrets et point de panne. Recommandation : Vercel pour l'interface/webhooks/crons légers, Pub/Sub pour le temps réel, puis worker/queue dédié seulement quand les métriques le justifient.

### 11. Concurrents et positionnement

Concurrents déjà identifiés au 8 septembre 2026 :

- Partoo ;
- Birdeye ;
- Podium ;
- ReviewReply ;
- Respondyr.

Le produit n'est donc pas sans concurrent. Les comparatifs devront être datés, sourcés, objectifs et vérifiables. Ne jamais réutiliser « personne ne le propose » ou « six fois moins cher » sans preuve actuelle.

## Drapeaux de sécurité

Valeurs par défaut dans .env.example :

- ENABLE_GOOGLE_PLACES_AUDIT=false ;
- ENABLE_TRUSTPILOT_AUDIT=false ;
- ENABLE_EXTERNAL_REVIEW_WIDGET=false ;
- ENABLE_GOOGLE_REVIEW_AUTOMATION=false ;
- ENABLE_CAELA_HUMAN_DELEGATION=false ;
- ENABLE_TRUSTPILOT_INTEGRATION=false.

Le code exige strictement la chaîne true. Une variable absente équivaut donc à false.

État de production constaté le 9 septembre 2026 :

- ces drapeaux n'étaient pas présents et restaient donc false ;
- TOKEN_ENCRYPTION_KEY était présente ;
- GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET étaient absents.

Toujours recontrôler cet état avant de conclure qu'une fonction est active ou inactive. Ne jamais afficher les valeurs des secrets.

## Migrations et base de données

Migrations récentes pertinentes :

- drizzle/manual/2026-09-06_add_billing_cycle.sql ;
- drizzle/manual/2026-09-06_add_pending_processing_at.sql ;
- drizzle/manual/2026-09-06_reliability_indexes.sql ;
- drizzle/manual/2026-09-08_add_review_automation_consents.sql ;
- drizzle/manual/2026-09-08_google_consent_and_widget_security.sql.

La migration 2026-09-08_google_consent_and_widget_security.sql a été appliquée en production et vérifiée.

Contrôles confirmés :

- table google_access_consents présente ;
- table google_connection_tickets présente ;
- index businesses_widget_public_token_unique présent ;
- index reviews_business_platform_review_unique présent ;
- aucun groupe de doublons business_id/platform_review_id avant création de l'index ;
- aucun token métier historique non chiffré détecté lors du contrôle.

La migration review_automation_consents définit business_consents et review_activity_events et remet les anciennes automatisations en mode manuel. Avant toute future migration, vérifier l'état réel avec to_regclass ou la table de migrations, puis utiliser une transaction et ON_ERROR_STOP.

## Vérifications déjà réussies

Local :

- npm run build réussi ;
- compilation Next.js réussie ;
- TypeScript réussi ;
- 34 pages statiques générées lors du build concerné ;
- git diff --check propre ;
- aucun script de tests automatisés n'existe actuellement dans package.json ;
- serveur local de test et Chrome headless arrêtés après contrôle.

Mobile 375 × 812 :

- accueil sans débordement horizontal ;
- page NFC sans débordement ;
- carrousel infini fonctionnel ;
- section écosystème au-dessus du footer ;
- nouveau visuel Caela visible.

Contrôle public après déploiement :

- GET / : 200 ;
- GET /plaques-nfc : 200 ;
- GET /audit : 200 ;
- GET /nfc/plaque-produit-caela.png : 200 ;
- ancien /nfc/plaque-produit.jpg : 404 attendu ;
- GET /api/settings sans session : 401 attendu ;
- GET /api/widget/test-token : 503 attendu tant que le widget est verrouillé ;
- POST /api/nfc-orders avec corps vide : 400 attendu.

Attention : /plaques-google et /api/businesses/settings ne sont pas des routes du projet. Les routes réelles sont /plaques-nfc et /api/settings.

## Documents existants à consulter

- docs/PLAN-AVANT-COMMERCIALISATION.md : plan opérationnel détaillé et checklist.
- docs/DEMANDE-AUTORISATION-GOOGLE.md : procédure officielle et email anglais prêt à envoyer.
- docs/CHECKLIST-LICENCE-TRUSTPILOT.md : étapes de validation Trustpilot.
- docs/AUDIT-CONFORMITE-GOOGLE-2026-09-08.md : audit initial et statut des corrections.
- docs/GUIDE-VISUEL-CONFORMITE-GOOGLE.pdf : guide visuel simple.
- docs/google-compliance/report-source.md : source du rapport.
- drizzle/manual/2026-09-08_google_consent_and_widget_security.sql : sécurité OAuth/widget.
- drizzle/manual/2026-09-08_add_review_automation_consents.sql : mandat et événements d'activité.

## Travail restant, dans l'ordre

### P0 — obligatoire avant commercialisation complète

- [ ] Renseigner la forme juridique exacte, le SIRET et l'adresse professionnelle.
- [ ] Souscrire un médiateur de la consommation et publier ses coordonnées.
- [ ] Faire relire les CGV, la politique de confidentialité, le DPA client et le mandat par un avocat/juriste.
- [ ] Vérifier et archiver DPA/CCT, régions, transferts et durées de Vercel, base PostgreSQL/Supabase, Anthropic, Resend et Stripe.
- [ ] Confirmer la durée de conservation Anthropic réellement applicable ; ne jamais promettre Zero Data Retention sans activation contractuelle prouvée.
- [ ] Acheter/configurer un domaine Caela propre et le vérifier dans Google Search Console.
- [ ] Ne pas lancer publiquement les automatisations avant autorisations et tests pilote.

### P1 — Google Cloud et autorisation

- [ ] Créer une organisation/agence Google Business au nom de Caela.
- [ ] Créer le projet Google Cloud au nom de l'entreprise avec une adresse du domaine.
- [ ] Déposer la demande Business Profile API.
- [ ] Conserver Project ID, Project Number, Organization ID, ticket et réponse écrite.
- [ ] Configurer l'écran OAuth avec domaine vérifié, accueil et URL légales.
- [ ] Ajouter le callback de production.
- [ ] Demander et obtenir la vérification OAuth.
- [ ] Envoyer le message préparé dans docs/DEMANDE-AUTORISATION-GOOGLE.md.
- [ ] Préparer un compte de démonstration accessible à Google dans le délai demandé.
- [ ] Ajouter ensuite GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET dans Vercel.
- [ ] Tester connexion, sélection multi-établissements, révocation et reconnexion sur un compte pilote.

API/services à activer selon l'accès accordé :

- [ ] Business Profile Account Management API ;
- [ ] Business Profile Business Information API ;
- [ ] API avis/réponses avec quota supérieur à zéro ;
- [ ] Business Profile Performance API ;
- [ ] My Business Notifications API ;
- [ ] Cloud Pub/Sub.

### P2 — Pub/Sub et fiabilité

- [ ] Créer un topic de production.
- [ ] Donner Publisher à mybusiness-api-pubsub@system.gserviceaccount.com.
- [ ] Créer une subscription push authentifiée vers une nouvelle route Caela.
- [ ] Construire cette route ; elle n'existe pas encore.
- [ ] Configurer NEW_REVIEW et UPDATED_REVIEW pour chaque compte.
- [ ] Ajouter une file idempotente, tentatives, backoff et dead-letter queue.
- [ ] Ajouter journal d'erreurs et reprise des publications.
- [ ] Garder le cron horaire comme réconciliation.

### P3 — Mesure de valeur

- [ ] Intégrer Business Profile Performance API ; l'intégration n'est pas encore développée.
- [ ] Stocker des mesures journalières datées, source et période.
- [ ] Mesurer impressions Search/Maps, appels, clics site, itinéraires et réservations lorsqu'ils sont autorisés/disponibles.
- [ ] Afficher « évolution observée depuis la prise en charge », jamais une causalité garantie.
- [ ] Comparer des périodes comparables et signaler les données insuffisantes.
- [ ] Ajouter un vrai tableau de suivi client : volumes détectés, pris en charge, automatiques, humains, délai médian/moyen et erreurs.
- [ ] Ne pas promettre une position locale.

### P4 — Équipe humaine et économie unitaire

- [ ] Définir qui contrôle les avis 1–3 étoiles.
- [ ] Définir horaires, SLA, escalade, congés et continuité.
- [ ] Définir REVIEW_TEAM_EMAIL.
- [ ] Mesurer les minutes humaines par avis sur un pilote.
- [ ] Fixer le module négatif humain, son volume inclus et son prix.
- [ ] Fixer le comportement en dépassement contractuel.
- [ ] Activer ENABLE_CAELA_HUMAN_DELEGATION seulement ensuite.
- [ ] Ajouter télémétrie tokens, coût IA et coût email par client.
- [ ] Valider les marges des cinq offres avec des données réelles.

### P5 — Trustpilot, widget et audit

- [ ] Obtenir une confirmation/licence Trustpilot écrite.
- [ ] Vérifier les droits de lecture, réponse, stockage, affichage et widget.
- [ ] Activer ENABLE_TRUSTPILOT_INTEGRATION seulement après accord.
- [ ] Activer ENABLE_EXTERNAL_REVIEW_WIDGET seulement si l'affichage est autorisé.
- [ ] Repenser l'audit public comme aperçu limité ou audit OAuth de la propre fiche.
- [ ] Ajouter quota partagé, email vérifié et prévention d'abus.
- [ ] Obtenir une réponse Google explicite avant toute branche Places EEE commerciale.

### P6 — qualité avant lancement

- [ ] Ajouter des tests automatisés pour consentement, OAuth state/ticket, routes protégées, publication POST, purge et quotas.
- [ ] Ajouter un test E2E mobile et desktop.
- [ ] Tester le parcours Stripe complet et les webhooks.
- [ ] Tester export, résiliation, révocation et purge sur un compte pilote.
- [ ] Vérifier accessibilité, Core Web Vitals, Web Analytics et Speed Insights.
- [ ] Ajouter OpenTelemetry si nécessaire.
- [ ] Mettre en place une veille mensuelle des règles Google et Trustpilot.
- [ ] Faire un pilote fermé avant activation générale.

## Première action exacte à la prochaine reprise

Si Iliès n'apporte pas encore d'informations externes, commencer par :

1. git status et vercel inspect ;
2. relire les checklists Google et Trustpilot ;
3. demander uniquement les informations légales manquantes ou commencer la préparation guidée du projet Google Cloud ;
4. ne pas changer les drapeaux de sécurité ;
5. si la priorité est technique, développer les tests automatisés avant Pub/Sub ;
6. mettre à jour ce fichier et sa copie centrale avant la fin de la session.

Si Iliès fournit les informations Google, suivre docs/DEMANDE-AUTORISATION-GOOGLE.md dans l'ordre et enregistrer seulement les identifiants non secrets et l'état des validations.

## Sources réglementaires et techniques de référence

- Google Business Profile API policies : https://developers.google.com/my-business/content/policies
- Google third-party policies : https://support.google.com/business/answer/7353941
- Google working with third parties : https://support.google.com/business/answer/7163406
- Google ownership and representatives : https://support.google.com/business/answer/13763036
- Google OAuth : https://developers.google.com/my-business/content/implement-oauth
- Google Pub/Sub notifications : https://developers.google.com/my-business/content/notification-setup
- Google API access workflow : https://support.google.com/business/workflow/16726127
- Google Maps user-generated content : https://support.google.com/contributionpolicy/answer/7400114
- Google Maps EEA terms : https://cloud.google.com/terms/maps-platform/eea
- Vercel Cron : https://vercel.com/docs/cron-jobs/usage-and-pricing
- Vercel Functions : https://vercel.com/docs/functions/usage-and-pricing
- Google Pub/Sub pricing : https://cloud.google.com/pubsub/pricing
- Partoo : https://www.partoo.co/en/pricing/
- Birdeye : https://birdeye.com/reviews/
- Podium : https://www.podium.com/

## Journal synthétique des dernières sessions

### 8 septembre 2026

- Audit Google, marque, automatisation, conservation, widget, audit public et claims.
- Préparation du rapport, du guide visuel et de la demande écrite Google.
- Désactivation des simulations d'audit non licenciées.

### 9 septembre 2026

- Refonte consentement Google et mandat dashboard.
- Sécurisation OAuth, tickets, tokens et déconnexion.
- Migrations consentement/widget/index appliquées et vérifiées.
- Purge 30 jours et statistiques opérationnelles séparées.
- Verrouillage Google/Trustpilot/widget/audits par drapeaux.
- Harmonisation des prix et quotas.
- Refonte NFC, endpoint email, rate limits et nouveaux visuels Caela.
- Nettoyage marketing, marque, blog, chatbot et documents légaux.
- Tests build/mobile/API.
- Commit b1f03ba poussé sur main et déploiement Vercel Production Ready.

### 10 septembre 2026

- Création de la mémoire durable globale.
- Ajout de la convention de reprise dans /Users/iliessou/AGENTS.md.
- Création de la copie centrale Finder et de la copie versionnée du projet.

