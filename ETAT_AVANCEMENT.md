# Caela Réputation — État d'avancement

Dernière mise à jour : 2026-07-19
Prod : https://review-pilot-iota.vercel.app (le domaine court `review-pilot.vercel.app` est un vieux projet séparé, ne pas utiliser)
Déploiement : `npx vercel --prod` PUIS réassigner l'alias `review-pilot-iota.vercel.app`

---

## ✅ Ce qui est fait (et vérifié en réel)

### Produit vendable en autonomie
- **Mobile** : tableau de bord, avis, analytics, établissements tiennent sur téléphone (zéro débordement, testé à 375px). Tableaux qui défilent, grilles qui s'enroulent.
- **Cloisonnement multi-client** : chaque client ne voit QUE ses commerces. Toi (admin) tu vois tout. Prouvé (un client A ne voit pas les données de B, accès croisé bloqué).
- **Inscription autonome** : page `/signup`, un prospect crée son compte sans passer par le Hub. Connexion réparée (rôle correct, plus admin par défaut). Table `users` (mot de passe chiffré bcrypt).
- **Connexion Google en 1 clic** : bouton "Se connecter avec Google" (OAuth). Le commerce se crée tout seul au nom du client. Code prêt, dégrade proprement sans les clés. → voir `GOOGLE_1CLIC.md`
- **Collecte d'avis par SMS** : réutilise les numéros captés par la Roue + ajout manuel. Envoi groupé d'un SMS avec lien direct vers l'avis Google, suivi des clics. Écran `/dashboard/collecte`. Code prêt, dégrade sans fournisseur SMS.
- **Fédération au cerveau Caela** : un client Réputation apparaît automatiquement dans le Hub central (relié par email), à l'inscription et à la connexion d'établissement. Prouvé bout en bout.

### Déjà en place avant cette session
- Sync avis Google/Trustpilot, auto-réponse IA, file de validation, réponse "1 clic" depuis l'email.
- Module Roue (2 modes : boutique + jeu-concours), tirage anti-triche.
- Fiche produits anti-hallucination IA + détection de risque (santé/hygiène/litige → validation humaine forcée).
- Widget d'avis embeddable + étoiles Google (rich snippets JSON-LD).
- Facturation Stripe essai-avec-CB (table `subscriptions`, quota par plan), page `/dashboard/billing`.
- 40 plaques NFC print-ready.

---

## ⏳ Ce qui manque — TES décisions (pas du code)

Le code est prêt. Ces 3 points attendent une action de ta part, avec un coût ou un choix.

### 1. Activer Google 1-clic (Google Cloud)
Sans ça, le bouton Google marche mais ne récupère pas les vrais avis.
- Activer 3 API Business Profile + demander l'accès (Google valide en quelques jours).
- Configurer l'écran d'autorisation OAuth.
- Créer les clés (Client ID + Secret) et me les donner pour les poser sur Vercel.
- **Guide pas à pas complet : `GOOGLE_1CLIC.md`**

### 2. Activer les SMS de collecte (choix + coût)
Sans ça, tu peux constituer tes listes mais rien ne part.
- Choisir un fournisseur. Par défaut : **Brevo** (~0,045 €/SMS en France). Alternative : Twilio.
- Créer le compte, acheter des crédits, me donner la clé (`BREVO_API_KEY` + `SMS_SENDER`).
- **Je n'engage aucun coût sans ton accord chiffré.**

### 3. Carte bancaire à l'inscription (choix produit)
Aujourd'hui l'inscription crée un compte gratuit (1 établissement en essai sans carte). La landing promet "CB requise à l'essai".
- Option A : garder l'essai gratuit léger (plus de conversions).
- Option B : forcer la carte dès `/signup` (enchaîner sur le paiement Stripe). Nécessite que les clés/prix Stripe soient bien en prod.

---

## 🔧 Ce qui reste (côté technique / à finir)

- **Onboarding client Google** : le vrai bouton "Connecter Google" attend l'activation Google Cloud (point 1). L'ajout manuel demande encore le Place ID + token à la main.
- **WhatsApp** (collecte) : phase 2, nécessite la validation de Meta (même logique que Google 1-clic).
- **STOP entrant (SMS)** : le désabonnement STOP par retour SMS demande un webhook du fournisseur, à brancher avant gros volume. Le flag opt-out est déjà respecté.
- **Domaine propre** : `review-pilot.vercel.app` (court) appartient à un autre compte Vercel non contrôlé. À terme, récupérer/renommer proprement.
- **Boucle collecte email** (en plus du SMS) : possible via Resend, non fait.
- **Diffusion multi-plateformes** (au-delà de Google/Trustpilot) : Tripadvisor/Facebook/PagesJaunes sont importables en CSV, pas synchronisés en direct.

---

## 📌 Rappels techniques
- Base = projet Supabase dédié `eozuxlzmfblvetkhs` (Réputation est un îlot, base séparée de Caelenda).
- Migrations appliquées en direct (SQL `IF NOT EXISTS`) : `0001` Roue, `0002` collecte SMS, `0003` users. Toujours vérifier les colonnes réelles après (piège : une table déjà prise par un autre code casse en silence).
- Secrets Vercel : jamais de retour à la ligne final (`printf`, jamais `echo`).
- Fédération cerveau : passe par l'ingest signé du Hub (`CAELA_SSO_SECRET`), aucune clé du cerveau dans ce projet.
