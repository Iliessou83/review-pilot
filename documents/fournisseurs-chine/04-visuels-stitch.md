# Visuels Stitch — Plaques NFC Caela Réputation

**Projet Stitch :** `projects/10974531513240075152` ("Gagnify Chevalets & Caela Réputation Plaques NFC — 30 visuels")
**Design system utilisé :** "Caela Réputation — Plaque NFC" (`assets/4466677187066008753`) — vérifié via `list_design_systems`, jamais utilisé avant cette session. Base claire, or/champagne #E8B44A pour les étoiles, logo Google multicolore, logo Facebook bleu #1877F2, typo Space Grotesk / Inter. Appliqué automatiquement à chaque génération via le paramètre `designSystem`.

**Consultation :** ouvrir https://stitch.withgoogle.com, se connecter avec le compte Google utilisé pour Stitch, puis chercher le projet par son ID `10974531513240075152` (ou via la liste des projets récents). Chaque écran ci-dessous est un visuel image, identifiable par son ID de screen dans l'URL `projects/10974531513240075152/screens/<id>`.

⚠️ **Bug connu (catalogue pannes-silencieuses #104) :** `download_assets` répond "succès" mais ne dépose rien sur disque, et `list_screens` peut renvoyer vide même après génération réussie sur ce projet. Ne pas perdre de temps à contourner — les IDs et `downloadUrl` ci-dessous (valables un temps limité, à re-générer via `get_screen` si expirés) sont la seule trace fiable en dehors de l'interface Stitch elle-même.

## 8 screens générés

### 1. Plaque acrylique ronde 9cm — produit principal (19€)

| Vue | Screen ID | Description |
|---|---|---|
| Studio (fond neutre) | `8cf7a9821fdc42a88b6b6bce1e177b2e` | Packshot 3/4, acrylique noir poli, logo Google + 5 étoiles or, picto NFC, texte "Votre avis compte / Approchez votre téléphone" |
| En situation (comptoir) | `bb08322b1ab1499fb3bdb9d577d7e6b8` | Plaque acrylique blanc posée sur comptoir bois clair à côté d'un terminal de paiement, ambiance boutique, éclairage naturel |
| Variante couleur — blanc laqué | `101bb405cb994f7a8be13c97997b0b9e` | Même mise en page, acrylique blanc laqué, zone discrète "Votre logo ici" ajoutée |
| Variante couleur — bleu marine | `e038b51aa7824bfa9653d33bf4ff3b80` | Même mise en page, acrylique bleu marine, typo blanche, zone "Votre logo ici" |

### 2. Carte époxy résine bombée — option premium (+3€)

| Vue | Screen ID | Description |
|---|---|---|
| Studio (fond neutre) | `4dde0527d8ec4187b434e4c4a849ec37` | Packshot 3/4 montrant le bombé (doming) et les reflets de la résine, format carte de visite |
| En situation (comptoir) | `726c871ec63e490caf461f0d81eda148` | Carte debout sur petit présentoir acrylique, à côté d'un terminal de paiement, comptoir bois clair |

### 3. Sticker PVC fin format carte bancaire — option économique

| Vue | Screen ID | Description |
|---|---|---|
| Studio (fond neutre) | `4c4b08d8b92e422aaf29d636ad1a6b4b` | Vue de dessus (flat lay), montre la finesse (0.76mm), éclairage plat |
| En situation (comptoir/vitrine) | `26b08b02e7d34d6ebf30d59e905e57e3` | Sticker collé sur le bord d'un comptoir bois près d'un terminal de paiement, lumière naturelle, arrière-plan flouté |

## Notes de génération

- Toutes les images demandent : logo Google (étoiles/avis), geste "posez votre téléphone / tap NFC", ton pro/épuré (explicitement demandé "pas festif" dans chaque prompt, cohérent avec la page de vente `/plaques-nfc`).
- 2 appels ont échoué au premier essai (`Network failure connecting to Stitch API: fetch failed` sur la vue en situation acrylique, `Request contains an invalid argument` sur la vue en situation époxy) — relancés à l'identique et réussis au deuxième essai. Aucune perte de contenu.
- `get_project` a échoué avec `Request contains an invalid argument` (format `name` testé : `projects/10974531513240075152`) — non bloquant, `list_design_systems` a suffi pour confirmer l'existence et l'ID du design system.
- Les `downloadUrl` renvoyés par chaque appel (voir sorties des tool calls de cette session) sont des liens Google signés temporaires (`lh3.googleusercontent.com/aida/...`) — ils expirent. Pour récupérer l'image plus tard, rouvrir le projet dans stitch.withgoogle.com ou rappeler `get_screen` avec l'ID ci-dessus.
