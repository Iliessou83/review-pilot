# Source de travail — audit Google de Caela Réputation

Date de vérification : 8 septembre 2026.

## Périmètre vérifié

- Site public et pages produit du dépôt correspondant au déploiement `8e86c6d`.
- Parcours OAuth Google Business Profile, synchronisation, publication des réponses, déconnexion.
- Conservation, affichage et agrégation des avis issus des API.
- Collecte d'avis, plaque NFC, roue et widget.
- Marque Google, apparence, wording, contenus éditoriaux et promesses commerciales.
- Pages juridiques et principaux écarts RGPD/droit français visibles.

## Sources primaires

1. Google Business Profile APIs policies, mise à jour 28 août 2026 : https://developers.google.com/my-business/content/policies
2. Google Business Profile API Terms : https://developers.google.com/my-business/content/terms
3. Google APIs Terms : https://developers.google.com/terms
4. Google API Services User Data Policy : https://developers.google.com/terms/api-services-user-data-policy
5. Google OAuth 2.0 Policies : https://developers.google.com/identity/protocols/oauth2/policies
6. Google OAuth Verification Requirements : https://support.google.com/cloud/answer/13464321
7. Google Business Profile third-party policies : https://support.google.com/business/answer/7353941
8. Google Business eligibility and ownership guidelines : https://support.google.com/business/answer/13763036
9. Google Maps User Generated Content Policy : https://support.google.com/contributionpolicy/answer/7400114
10. Google Brand Resource Center Guidance : https://about.google/brand-resource-center/guidance/
11. Google Product co-branding guidance : https://partnermarketinghub.withgoogle.com/brands/google/use-cases/product-co-branding/
12. Google Search review snippet documentation : https://developers.google.com/search/docs/appearance/structured-data/review-snippet
13. Google local ranking guidance : https://support.google.com/business/answer/7091
14. Google review reply guidance : https://support.google.com/business/answer/3474122
15. Code de la consommation L121-2 : https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000044563114
16. Code de la consommation L122-1 : https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000032227222
17. DGCCRF — pratiques commerciales trompeuses : https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques/pratiques-commerciales-trompeuses-les-cles-pour-les-reconnaitre-et-sen-premunir
18. DGCCRF — obligations de médiation : https://www.economie.gouv.fr/mediation-conso/vous-etes-un-professionnel/vos-principales-obligations-0
19. CNIL — durées de conservation : https://www.cnil.fr/fr/passer-laction/les-durees-de-conservation-des-donnees
20. CNIL — clauses contractuelles et sous-traitance : https://www.cnil.fr/fr/clauses-contractuelles-types-entre-responsable-de-traitement-et-sous-traitant
21. Règlement UE 2024/3228, fermeture de la plateforme RLL : https://eur-lex.europa.eu/eli/reg/2024/3228/oj
22. Places API policies, mise à jour 1er septembre 2026 : https://developers.google.com/maps/documentation/places/web-service/policies
23. Google Maps Platform EEA Terms : https://cloud.google.com/terms/maps-platform/eea
24. Google Maps Platform EEA Service Specific Terms : https://cloud.google.com/terms/maps-platform/eea/maps-service-terms
25. EEA Places API Permitted Uses : https://cloud.google.com/terms/maps-platform/eea-places-api-permitted-uses

## Constats techniques probants

- Projet OAuth partagé et scope global `business.manage` : `src/lib/google-oauth.ts`.
- Refresh tokens persistants et cron horaire : `src/lib/google-oauth.ts`, `src/app/api/cron/sync/route.ts`, `vercel.json`.
- Réponses 4–5 étoiles publiées automatiquement : `src/lib/review-processing.ts`.
- Auto-réponse positive activée par défaut : `src/db/schema.ts`, `src/app/api/businesses/route.ts`.
- Option auto-réponse négative enregistrée mais jamais consommée par le moteur : `src/app/dashboard/settings/page.tsx`, recherche globale `autoReplyNegative`.
- Conservation active indéfinie puis 12 mois après résiliation : `src/app/api/cron/data-retention-purge/route.ts`, `src/app/cgv/page.tsx`, `src/app/politique-de-confidentialite/page.tsx`.
- Agrégation et diffusion publique des avis Google : `src/app/api/widget/[id]/route.ts`, `public/widget.js`, `src/app/api/analytics/route.ts`.
- JSON-LD auto-inséré pour obtenir des étoiles : `public/widget.js`.
- Déconnexion sans appel de révocation Google : `src/app/api/google/disconnect/route.ts`.
- Refresh token placé temporairement dans un JWT signé côté navigateur : `src/app/api/google/callback/route.ts`.
- Palette exacte Google, mot Google multicolore, quatre points et simulation d'interface : `src/app/HomeClient.tsx`; 136 occurrences de la palette ou de Google Sans dans `src`.
- Google Sans demandé depuis Google Fonts et appliqué globalement : `src/app/layout.tsx`.
- Wording de review gating sur la page d'accueil : `src/app/HomeClient.tsx` (« Les mécontents sont invités à vous écrire en privé d'abord »).
- Parcours roue réel séparé du gain et de l'avis : `src/app/r/[slug]/WheelClient.tsx`.
- Promesses non sourcées et causalités SEO : `src/app/HomeClient.tsx`, `src/data/blogPosts.ts`, `src/app/api/chat/route.ts`.
- Audit gratuit Google utilisant Places API Legacy pour transformer des données Maps en score et recommandations commerciales, sans attribution Maps visible : `src/app/api/audit/route.ts`.
- Score et constats dérivés de Places transmis à Anthropic pour générer les priorités : `src/app/api/audit/route.ts`, fonction `generateAIPriorities`.
- Identité légale et médiateur laissés à `À_RENSEIGNER`; lien RLL fermé : `src/config/legal.config.ts`, `src/app/cgv/page.tsx`.

## Conclusion de recherche

Statut recommandé : NO-GO pour commercialiser l'automatisation Google sous l'architecture actuelle. Les écarts les plus graves ne sont pas cosmétiques : accès programmatique de clients via un projet partagé, automatisation, conservation et agrégation du contenu API. L'audit public Places constitue un second blocage indépendant pour une exploitation depuis l'EEE. Obtenir une validation écrite de Google est nécessaire avant de conserver ces architectures.
