# Caela Réputation — Dossier sourcing plaques NFC (Chine) + visuels

Compilé le 2026-08-04, par 5 agents en parallèle (3 sourcing fournisseurs + 1 visuels Stitch, dont 3 relances après blocage sur des pages Alibaba trop lourdes en JS). Même méthode que le dossier Gagnify (`~/Workspace/Projets/gagnify/documents/fournisseurs-chine/`).

**Méthode** : recherche sur Alibaba, Made-in-China, Global Sources. Fournisseurs retenus uniquement s'ils ont un statut Verified/Gold/Diamond/Audited Supplier, une ancienneté significative (majorité 8+ ans, plusieurs 12-20 ans), et des certifications vérifiables (ISO 9001, SGS, CCC selon les cas).

**Non vérifié / à faire avant commande** : aucun échantillon commandé, aucun fournisseur contacté. Ce dossier sert à présélectionner, pas à valider — étape suivante obligatoire : devis (RFQ) + échantillon avant tout engagement volume.

## Vue d'ensemble par format — et ce que ça change pour la marge

Prix de vente actuel (page `plaques-nfc`) : **19€/pièce** à l'unité, **15,80€/pièce** dès 5, **11,96€/pièce** dès 25. Le format carte (époxy) facture +3€, le logo personnalisé +5€/plaque dès 5 pièces.

| Format | Fichier | Meilleur fournisseur trouvé | Coût réel (au pièce, MOQ bas → volume) | MOQ mini | Marge estimée vs prix de vente actuel |
|---|---|---|---|---|---|
| Plaque acrylique ronde (produit principal, 19€ vendu) | [01](01-plaques-acryliques-rondes-9cm.md) | Jinjiang Conghe (rond 10cm, Gold/SGS depuis 2008) | 0,64€ → 2,30€ | 50 pcs | Coût actuel estimé 3-5€ → tombe à 0,65-2,30€. Marge nettement améliorée, sans toucher au prix client. |
| Carte époxy (option premium, +3€) | [02](02-cartes-epoxy-nfc.md) | Shenzhen Sunlanrfid (ISO 9001) | 0,09€ → 0,26€ | 50-500 pcs | Le +3€ facturé est largement couvert : surcoût réel de fabrication ~0,50-1,50€ seulement. |
| Sticker PVC (option économique) | [03](03-stickers-pvc-nfc.md) | Shenzhen Spv Field IOT (13 ans, 3M pcs/mois) | 0,06€ → 0,09€ | 100-1000 pcs | Confirmé le moins cher des 3 formats — cohérent avec le positionnement "entrée de gamme". |
| Visuels (3 formats, situation + produit) | [04](04-visuels-stitch.md) | — | 8 visuels générés, design system "Caela Réputation" activé pour la 1re fois | — | — |

## Ce qui a coincé (et n'a pas bloqué le résultat)

3 des 5 agents ont planté au premier essai : 2 sur des pages produit Alibaba trop chargées en JavaScript pour l'outil de lecture web (l'agent s'est mis à boucler sans avancer), 1 sur une coupure réseau ponctuelle côté API. Tous les 3 ont été relancés avec la même consigne mais l'instruction de privilégier Made-in-China/Global Sources et les extraits de recherche plutôt que de forcer l'ouverture de pages Alibaba récalcitrantes — les 3 relances ont abouti sans problème. Rien à signaler côté qualité du résultat final, juste plus lent que prévu (deux vagues d'agents au lieu d'une).

## Fichiers du dossier

1. [01-plaques-acryliques-rondes-9cm.md](01-plaques-acryliques-rondes-9cm.md) — 6 fournisseurs, le produit principal actuel
2. [02-cartes-epoxy-nfc.md](02-cartes-epoxy-nfc.md) — 7 fournisseurs, option premium
3. [03-stickers-pvc-nfc.md](03-stickers-pvc-nfc.md) — 6 fournisseurs, option économique
4. [04-visuels-stitch.md](04-visuels-stitch.md) — 8 visuels Stitch, même projet que Gagnify (`10974531513240075152`), design system "Caela Réputation" utilisé pour la première fois

## Prochaines étapes concrètes

1. Ouvrir le projet Stitch (ID `10974531513240075152`) pour voir les 8 nouveaux visuels — même limite que pour Gagnify : pas de téléchargement en masse fiable pour l'instant (bug `pannes-silencieuses` #104), passer par l'interface web.
2. Commander des échantillons chez **Jinjiang Conghe** (plaque principale) en priorité — c'est le poste qui pèse le plus dans le coût actuel et où le gain de marge est le plus net.
3. Si la marge sur la plaque acrylique se confirme après échantillon, envisager de baisser le prix de vente ou d'améliorer les marges packs (79€/299€) plutôt que de changer uniquement le fournisseur à prix de vente identique — décision business, pas technique.
