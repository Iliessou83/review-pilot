# Plan de lancement — Caela Réputation

Dernière mise à jour : 9 septembre 2026

Ce document est la mémoire opérationnelle du projet. Il distingue ce qui est déjà protégé dans le code, ce qu'Iliès doit configurer et ce qui exige une validation externe.

## Décision produit retenue

Le commerçant reste toujours propriétaire ou copropriétaire de sa fiche. Caela agit uniquement comme représentant autorisé.

Le parcours comporte deux autorisations séparées :

1. connexion Google : deux cases non précochées confirment que la personne est propriétaire/gérant autorisé et qu'elle autorise OAuth ;
2. mandat de réponse : dans Réglages, une nouvelle case non précochée décrit précisément ce qui sera publié.

Trois modes sont prévus :

- manuel : Caela prépare, le commerçant vérifie et publie ;
- positif automatisé : réponses 4–5 étoiles automatiques ; 1–3 étoiles vérifiées par le commerçant ;
- délégation complète sur contrat : 4–5 étoiles automatiques ; 1–3 étoiles et sujets sensibles contrôlés par une personne de l'équipe Caela.

Une réponse négative ne doit pas être publiée sans contrôle humain au lancement. Les mots-clés santé, sécurité, hygiène, allergène, litige, accusation et données personnelles forcent aussi ce contrôle, quelle que soit la note.

## Ce que « suppression après 30 jours » signifie

Google impose que le contenu obtenu par Business Profile API soit seulement stocké temporairement, au plus 30 jours.

Exemple : Julie publie le 1er septembre : « 2 étoiles — attente de 40 minutes. »

Caela copie temporairement dans sa base :

- « Julie Martin » : le nom public de l'auteur ;
- « 2 » : la note copiée ;
- le texte de l'avis ;
- accounts/123/locations/456/reviews/789 : l'identifiant technique de l'avis ;
- la réponse préparée ou publiée.

Au plus tard le 1er octobre, ces champs disparaissent de la base Caela. Rien n'est supprimé sur Google : l'avis de Julie et la réponse publique restent sur la fiche.

Caela garde ses propres événements sans recopier le contenu :

- un avis a été détecté ;
- une réponse a été publiée ;
- publication automatique, validation commerçant ou validation Caela ;
- délai de réponse, par exemple 2 520 secondes, soit 42 minutes.

Ces événements permettent d'afficher sur 12 mois le volume traité, le taux de prise en charge et le délai moyen. Ils ne permettent pas de conserver l'historique des textes, auteurs, notes individuelles ou identifiants Google.

L'évolution historique de la note Google et les données de visibilité ne doivent pas être inventées. Il faut utiliser les données accessibles en direct ou Business Profile Performance API dans les conditions validées par Google.

## Écritures atomiques et index, en français simple

Une écriture atomique est une opération « tout ou rien ». Quand un commerçant active l'automatisation, Caela modifie le réglage et enregistre la preuve du mandat dans la même transaction PostgreSQL. Si la preuve échoue, l'automatisation n'est pas activée.

Un index est le sommaire d'un livre. Sans index, PostgreSQL parcourt beaucoup de lignes. Avec les index adaptés, il retrouve rapidement les avis d'un établissement, les événements récents ou un ticket OAuth. L'index unique business_id + platform_review_id empêche aussi le cron et un clic manuel de créer deux copies du même avis en même temps.

## Cron, Pub/Sub et VPS

### Situation actuelle

Le cron Vercel s'exécute une fois par heure. Il sert de synchronisation de sécurité et traite toutes les fiches. Dix secondes seraient une mauvaise fréquence :

- toutes les 10 secondes = environ 259 200 déclenchements par mois ;
- toutes les minutes = environ 43 200 ;
- toutes les heures = environ 720.

Le coût n'est pas seulement le déclenchement : chaque passage ouvre la fonction, interroge la base et appelle Google, même quand aucun avis n'est arrivé. Vercel facture les Cron Jobs comme des invocations de Functions. Un plan Vercel Pro accepte au minimum une minute, pas dix secondes.

### Architecture recommandée après approbation Google

1. Google publie un événement « nouvel avis » dans Google Cloud Pub/Sub.
2. Une subscription push appelle une route sécurisée Caela.
3. Caela met l'événement dans une file idempotente.
4. Un worker récupère seulement l'avis concerné, génère la réponse ou crée la tâche humaine.
5. Le cron horaire reste un filet de sécurité et réconcilie les événements manqués.

Pub/Sub ne répond pas lui-même à l'avis. C'est une sonnette fiable envoyée par Google. Les premiers 10 Go mensuels Pub/Sub sont annoncés sans frais ; des notifications d'avis représentent un volume minuscule.

Un VPS peut exécuter un cron ou un worker et coûter moins cher à volume stable. Il n'est pas obligatoire que les tâches soient sur Vercel. En revanche, un VPS unique ajoute maintenance, mises à jour, supervision, sauvegarde des secrets et point de panne unique. Recommandation : garder l'interface et les webhooks sur Vercel, utiliser Pub/Sub pour le temps réel, conserver le cron horaire sur Vercel, et déplacer seulement les traitements lourds vers un worker/queue lorsque les métriques prouvent que c'est rentable.

## Coût indicatif des réponses

Le code utilise actuellement Claude Sonnet 4.6, facturé officiellement 3 $/million de tokens en entrée et 15 $/million en sortie.

Ordres de grandeur prudents, à confirmer par la télémétrie réelle :

- 1 000 réponses positives courtes : environ 5 à 15 $ d'IA ;
- 1 000 avis négatifs avec trois suggestions : environ 12 à 35 $ d'IA ;
- emails : coût normalement faible par rapport au prix de l'abonnement ;
- contrôle humain : coût principal. À 5 à 10 minutes par avis, 500 avis négatifs représentent 42 à 83 heures de travail.

Conclusion tarifaire retenue dans le site :

- Starter : 30 avis/mois ; Solo : 100 ; Pro : 300 ; Studio : 1 000 ; Agence : 3 000 ;
- ces volumes sont suffisamment hauts pour orienter clairement le choix sans vendre un « illimité » risqué ;
- le service continue temporairement si le volume est dépassé et Caela contacte le client si cela se répète ;
- aucun supplément automatique par avis n'est annoncé ou facturé tant qu'une facturation d'usage Stripe n'est pas réellement implémentée et acceptée ;
- vendre la prise en charge humaine des 1–3 étoiles séparément, avec volume inclus, délai de service et tarif par avis supplémentaire ;
- ne jamais vendre « humain illimité » à bas prix.

La limite technique doit rester haute et rassurante. La limite humaine doit être contractuelle. Proposition à valider : 20 avis 1–3 étoiles contrôlés/mois dans un module à 149–199 €, puis 6–10 € par avis, ou devis pour les réseaux.

## Audit public Google / Trustpilot

Décision : garder les branches désactivées tant que les licences ne sont pas confirmées.

Un audit public sans authentification attire les concurrents, consomme l'API et peut enfreindre les usages permis de GoogleLocation/Places. Une simulation par IA donne une fausse impression de données réelles et est interdite dans Caela.

Version recommandée :

- aperçu gratuit déterministe, sans IA payante, à partir de quelques données saisies par le prospect ;
- résultat complet après connexion OAuth de sa propre fiche ;
- une analyse gratuite par établissement et par période ;
- email vérifié et limite par empreinte IP ;
- aucun texte complet d'avis stocké au-delà de 30 jours ;
- rapport approfondi IA seulement pour un prospect qualifié ou un client.

L'audit reste utile s'il donne des faits vérifiables : avis sans réponse disponibles, délai Caela, complétude, volumes récents et métriques Performance autorisées. Il ne doit promettre ni classement, ni hausse de note, ni « score Google » officiel.

## Concurrents vérifiés au 8 septembre 2026

- Partoo : centralisation, réponses IA et modèles, statistiques, demandes d'avis SMS, benchmark et multi-établissements.
- Birdeye : réponses automatiques ou avec approbation, règles de marque, reporting, sentiment et routage des problèmes.
- Podium : assistant IA, collecte d'avis et messagerie.
- ReviewReply/Respondyr : réponses Google automatiques ou en file d'approbation.

L'idée existe donc déjà. La différence crédible de Caela n'est pas « personne ne le fait », mais :

- offre française accessible aux commerces indépendants ;
- contrôle humain réel sur le négatif ;
- réponse fondée sur une fiche de faits fournie par le commerçant ;
- preuve claire du mandat et révocation simple ;
- services Caela complémentaires ;
- rapport centré sur les actions réellement effectuées, sans promesses SEO invérifiables.

## État technique déjà prêt

- [x] Automatisation désactivée à la création.
- [x] Deux consentements séparés, non précochés, versionnés et horodatés.
- [x] Mise à jour du réglage et preuve du mandat dans une transaction atomique.
- [x] OAuth uniquement pour connecter Google ; ajout manuel Google bloqué.
- [x] Refresh token chiffré ; ticket multi-établissements opaque, serveur et valable 15 minutes.
- [x] Déconnexion Google stoppant l'automatisation.
- [x] Réponses 1–3 étoiles et sujets sensibles dirigés vers un humain.
- [x] Automatisation Google verrouillée avant approbation.
- [x] Délégation humaine verrouillée avant validation du prix et de la capacité.
- [x] Trustpilot et widget externe verrouillés avant validation de licence.
- [x] Widget protégé par identifiant aléatoire, domaines autorisés et limite de requêtes.
- [x] JSON-LD AggregateRating retiré.
- [x] Purge quotidienne du contenu Google après 30 jours.
- [x] Statistiques opérationnelles indépendantes du cache Google.
- [x] Pagination OAuth comptes/établissements.
- [x] Synchronisation Google paginée jusqu'à 500 avis récents par passage.
- [x] Déduplication PostgreSQL des avis concurrents.
- [x] Lien officiel Google « travailler avec un tiers » dans les footers.
- [x] Information que Business Profile est gratuit et que Caela facture son service.
- [x] Tarifs logiciel alignés entre accueil, dashboard, chatbot et configuration : 49 / 69 / 149 / 299 €, puis Agence 449 €.
- [x] Packs NFC alignés partout : 1 plaque 19 €, 3 plaques 47 €, 5 plaques 69 €.
- [x] Formulaire NFC réellement envoyé par email, validé et limité, sans faux succès côté navigateur.
- [x] Les avis déjà répondus sur Google ne sont ni reproposés ni remplacés lors de la première synchronisation.
- [x] Anciennes images de plaques utilisant le mot-symbole Google retirées et remplacées par des visuels Caela.
- [x] Migration de consentement/widget appliquée à la base de production et index vérifiés.
- [x] `TOKEN_ENCRYPTION_KEY` créée dans les variables Vercel de production sans exposer sa valeur.

## À faire par Iliès, dans cet ordre

### Bloquant avant commercialisation

- [ ] Renseigner SIRET et adresse dans les mentions légales.
- [ ] Souscrire un médiateur de la consommation et renseigner ses coordonnées.
- [ ] Faire relire CGV, politique de confidentialité, DPA client et mandat par un juriste/avocat.
- [ ] Vérifier et archiver les DPA/CCT, régions et durées de Vercel, Supabase, Anthropic, Resend et Stripe.
- [ ] Confirmer la durée Anthropic applicable au compte API ; ne promettre ZDR que si activé.
- [ ] Créer le projet Google Cloud au nom de Caela avec une adresse du domaine professionnel.
- [ ] Demander l'accès Business Profile API et conserver Project ID, Project Number, ticket et réponse.
- [ ] Configurer l'écran OAuth, le domaine vérifié, les URL légales et le callback production.
- [ ] Envoyer le message de docs/DEMANDE-AUTORISATION-GOOGLE.md.
- [ ] Préparer un compte de démonstration que Google peut demander sous sept jours.
- [ ] Obtenir la licence/confirmation Trustpilot avant d'activer son intégration ou son widget.

### Configuration Google Cloud

- [ ] Activer Business Profile Account Management API.
- [ ] Activer Business Profile Business Information API.
- [ ] Activer l'API avis/réponses et obtenir un quota supérieur à zéro.
- [ ] Activer Business Profile Performance API.
- [ ] Activer My Business Notifications API.
- [ ] Activer Cloud Pub/Sub et créer un topic production.
- [ ] Donner Publisher à mybusiness-api-pubsub@system.gserviceaccount.com.
- [ ] Créer une subscription push authentifiée vers une future route Caela.
- [ ] Configurer NEW_REVIEW et UPDATED_REVIEW pour chaque compte.

### Variables production après validation

- [ ] GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET.
- [ ] ENABLE_GOOGLE_REVIEW_AUTOMATION=true.
- [ ] ENABLE_CAELA_HUMAN_DELEGATION=true après prix, capacité, SLA et REVIEW_TEAM_EMAIL.
- [ ] ENABLE_TRUSTPILOT_INTEGRATION=true seulement après licence.
- [ ] ENABLE_EXTERNAL_REVIEW_WIDGET=true seulement si les droits d'affichage le permettent.
- [ ] Laisser les deux audits externes à false jusqu'à validation.

### Performance API et preuve de valeur

- [ ] Collecter quotidiennement les métriques autorisées : impressions Search/Maps, appels, clics site, itinéraires et réservations disponibles.
- [ ] Stocker des mesures journalières datées, leur source et période, jamais une promesse de causalité.
- [ ] Afficher « évolution observée depuis la prise en charge » et non « gain causé par Caela ».
- [ ] Comparer avant/après avec une période comparable et signaler les données insuffisantes.
- [ ] Ne pas présenter une position locale comme garantie.

### Exploitation

- [ ] Mettre en place une file avec répétitions, déduplication et dead-letter queue pour Pub/Sub.
- [ ] Ajouter un journal des erreurs de publication et une nouvelle tentative.
- [ ] Mesurer tokens et coût IA par réponse.
- [ ] Mesurer les minutes humaines par avis négatif avant de figer le prix.
- [ ] Mettre une veille mensuelle des politiques Google et Trustpilot.
- [ ] Tester mobile, OAuth, révocation, consentement, dépassements et purge sur un compte pilote.

## Sources opérationnelles

- Google API policies : https://developers.google.com/my-business/content/policies
- Google third-party policies : https://support.google.com/business/answer/7353941
- Google working with third parties : https://support.google.com/business/answer/7163406
- Google Pub/Sub : https://developers.google.com/my-business/content/notification-setup
- Google OAuth : https://developers.google.com/my-business/content/implement-oauth
- Google API access : https://support.google.com/business/workflow/16726127
- Vercel Cron : https://vercel.com/docs/cron-jobs/usage-and-pricing
- Vercel Functions : https://vercel.com/docs/functions/usage-and-pricing
- Google Pub/Sub pricing : https://cloud.google.com/pubsub/pricing
- Claude Sonnet 4.6 : https://platform.claude.com/docs/en/models/sonnet-4-6/overview
- Partoo : https://www.partoo.co/en/pricing/
- Birdeye : https://birdeye.com/reviews/
- Podium : https://www.podium.com/
