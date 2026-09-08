# Demande Google — Caela Réputation

Mise à jour : 8 septembre 2026

## Où faire la demande

Google ne publie pas d'adresse email générale pour approuver une intégration Business Profile. La demande officielle passe par :

1. créer un compte d'organisation/agence : https://business.google.com/agencysignup ;
2. créer un projet Google Cloud appartenant à Caela ;
3. utiliser une adresse professionnelle du domaine Caela ;
4. demander l'accès de base aux Business Profile APIs : https://support.google.com/business/contact/api_default ;
5. choisir « Application for Basic API Access » ;
6. après approbation, ouvrir un dossier au même support avec le numéro du projet pour demander la confirmation écrite ci-dessous ;
7. configurer et faire vérifier l'écran de consentement OAuth avant l'ouverture publique.

Google annonce un examen de la demande d'accès API sous 14 jours. Ce délai ne garantit pas le délai de vérification OAuth ni celui d'une question juridique particulière.

## Comment constater l'approbation

- Dans Google Cloud Console, la Business Profile API devient disponible pour le projet.
- Un quota standard apparaît pour les API Business Profile ; un quota à 0 indique que le projet n'a pas encore l'accès utilisable.
- L'approbation API et la vérification OAuth sont deux contrôles distincts : il faut obtenir les deux avant la mise en production auprès de clients externes.
- Conserver l'email de décision, le numéro du dossier, le Project ID et une copie des réponses dans le registre de conformité Caela.

## Message prêt à envoyer en anglais

**Subject: Written policy confirmation request — Caela agency-managed review replies and local posts**

Hello Google Business Profile API Support,

Caela Réputation is a French reputation-management agency and software platform. We are preparing a Business Profile API integration under Google Cloud project **[PROJECT ID / PROJECT NUMBER]** and agency organization **[ORGANIZATION ID]**.

Our intended operating model is the following:

- Each merchant remains the owner or co-owner of every Business Profile.
- Each merchant signs in with Google and grants OAuth access once through Google's consent screen.
- Review automation is disabled by default.
- Before Caela replies, the merchant takes a separate, explicit digital action by checking an unticked checkbox. We retain a timestamped, versioned proof of this mandate.
- The merchant chooses one of three scopes: (1) manual replies, (2) automatic replies to 4–5 star reviews while 1–3 star replies require merchant approval, or (3) full delegation to Caela, where 4–5 star replies may be generated and published automatically and 1–3 star or sensitive replies are reviewed and approved by a Caela employee before publication.
- Replies are unique and based only on genuine reviews already published by users. Caela does not create, purchase, filter, suppress, redirect or incentivize positive reviews.
- Caela may also create and publish local posts within the merchant's expressly delegated scope.
- Merchants can revoke the mandate and disconnect Google at any time. Caela revokes the OAuth token and disables automation. We will disassociate access within seven business days after termination.
- Google API review content is cached securely for no more than 30 days. Long-term reporting contains only Caela-generated operational events, such as the number of replies published and response latency, without reviewer name, review text, rating or Google review identifier.
- The merchant does not receive API credentials and does not run API calls. Caela operates the integration as the merchant's authorized agency representative.

Could you please confirm in writing:

1. Is this agency-operated model permitted under the Business Profile API policies, including the policy provision concerning a developer's own use of its project?
2. Does the separate unticked checkbox described above constitute sufficient prior specific and express consent for automatic 4–5 star replies, provided the wording clearly states the scope?
3. May Caela employees review and publish replies to 1–3 star or sensitive reviews when the merchant expressly delegates that work?
4. May Caela retain the described content-free operational event counts and response-latency measurements beyond 30 days?
5. May Caela store and display historical metrics obtained from the Business Profile Performance API, and under what retention conditions?
6. May Caela use the Places API in France/EEA for a public self-audit that searches for a business and derives a reputation score or recommendations? If not, would Places UI Kit or another Google-approved implementation be required?
7. Are local posts created and published by Caela under the same express mandate permitted?

We would appreciate a written response tied to our Project ID so that we can implement any required safeguards before launch. We can provide screenshots, the exact consent wording, a data-flow diagram and a demo account on request.

Kind regards,

**[NAME]**<br>
Caela Réputation / Caela Agency<br>
**[PROFESSIONAL EMAIL]**<br>
**[WEBSITE]**<br>
**[PHONE]**

## Version française de travail

Objet : Demande de confirmation écrite — réponses aux avis et posts gérés par l'agence Caela

Bonjour,

Caela Réputation est une agence française de gestion de réputation et une plateforme logicielle. Chaque commerçant reste propriétaire ou copropriétaire de sa fiche, se connecte une première fois avec Google et donne son autorisation OAuth. Toute automatisation est désactivée par défaut.

Le commerçant choisit explicitement, au moyen d'une case décochée par défaut, entre un mode manuel, l'automatisation des réponses 4–5 étoiles avec validation commerçant pour les avis 1–3 étoiles, ou une délégation complète à Caela. Dans ce dernier mode, les réponses négatives et sensibles sont relues et validées par un salarié Caela avant publication. Caela ne crée pas de faux avis, ne filtre pas les clients, ne redirige pas les avis négatifs et ne conditionne aucune récompense à une note positive.

Merci de confirmer par écrit que ce fonctionnement est autorisé pour notre projet, ainsi que les conditions de conservation des indicateurs opérationnels, d'utilisation de la Performance API, de publication de posts et d'utilisation éventuelle de Places dans l'EEE.

Les questions détaillées figurent dans la version anglaise ci-dessus.

## Sources officielles à joindre au dossier interne

- Politiques Business Profile API : https://developers.google.com/my-business/content/policies
- Configuration OAuth pour les plateformes : https://developers.google.com/my-business/content/oauth-setup
- Prérequis et demande d'accès : https://developers.google.com/my-business/content/prereqs
- FAQ Business Profile API : https://developers.google.com/my-business/content/faq
- Notifications temps réel : https://developers.google.com/my-business/content/notification-setup
- Politique des tiers : https://support.google.com/business/answer/7353941
- Règles Places API pour l'EEE : https://cloud.google.com/terms/maps-platform/eea-places-api-permitted-uses
