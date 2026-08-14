/**
 * Contenu du blog — SOURCE UNIQUE. Chaque article est une suite de blocs
 * typés (titre, paragraphe, liste, citation) rendus par src/app/blog/[slug]/page.tsx.
 * Pas de markdown ni de CMS externe : le contenu est éditorial, écrit pour le
 * référencement naturel autour des avis Google et de la e-réputation locale.
 */

export type BlogBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "quote"; text: string; cite?: string };

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string;
  readMinutes: number;
  excerpt: string;
  blocks: BlogBlock[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "repondre-avis-google-negatif",
    title: "Comment répondre à un avis Google négatif sans se justifier",
    description:
      "5 exemples de réponses à des avis 1★ et 2★ qui désamorcent le conflit en public sans admettre une faute qui n'existe pas. Méthode et formulations concrètes.",
    category: "Réputation",
    date: "2026-03-02",
    readMinutes: 6,
    excerpt:
      "Un avis négatif se répond en public, jamais en privé. La méthode qui évite deux pièges : l'excuse qui sonne faux, et le silence qui confirme l'accusation.",
    blocks: [
      { type: "p", text: "Un commerçant sur deux fait la même erreur face à un avis 1★ : il répond « désolé pour la gêne occasionnée » et referme le sujet. Cette phrase ne convainc personne — ni le client mécontent, ni les 50 futurs clients qui liront cette réponse avant de réserver." },
      { type: "h2", text: "Pourquoi la réponse compte plus que l'avis lui-même" },
      { type: "p", text: "Un avis négatif isolé n'empêche pas de vendre. Une réponse absente ou maladroite, si. 89% des consommateurs lisent les réponses du commerçant avant de décider, d'après les études Google sur le comportement local — et une réponse posée transforme un avis négatif en preuve de sérieux plutôt qu'en repoussoir." },
      { type: "h2", text: "La structure qui fonctionne, en 4 temps" },
      { type: "ul", items: [
        "Accuser réception sans admettre une faute non prouvée — « Merci d'avoir pris le temps de nous laisser ce retour. »",
        "Recontextualiser factuellement, sans polémiquer publiquement — un fait vérifiable, jamais une accusation retour.",
        "Proposer un canal privé pour la suite — téléphone ou email, jamais un débat en commentaire.",
        "Signer avec un prénom, pas juste « L'équipe » — un humain répond, pas une entreprise anonyme.",
      ] },
      { type: "h2", text: "5 exemples concrets" },
      { type: "h3", text: "1. Avis 1★ sur un délai d'attente" },
      { type: "quote", text: "Bonjour, merci de votre retour. Le jeudi soir est effectivement notre créneau le plus chargé de la semaine et nous travaillons sur l'organisation des rendez-vous pour réduire ce temps d'attente. N'hésitez pas à nous appeler pour un créneau plus calme la prochaine fois. — Sarah" },
      { type: "h3", text: "2. Avis 2★ qui conteste un tarif" },
      { type: "quote", text: "Bonjour, nos tarifs sont affichés en vitrine et sur notre fiche Google, conformément à la réglementation. Si un malentendu a eu lieu au moment du paiement, contactez-nous au 04 XX XX XX XX, on regarde ça ensemble. — Karim" },
      { type: "h3", text: "3. Avis 1★ sans détail (juste une étoile)" },
      { type: "quote", text: "Bonjour, nous aimerions comprendre ce qui n'a pas convenu pour pouvoir nous améliorer. N'hésitez pas à nous écrire à contact@... — on lit chaque message. — L'équipe" },
      { type: "h3", text: "4. Avis négatif clairement injuste ou hors sujet" },
      { type: "quote", text: "Bonjour, nous ne retrouvons pas de réservation ou de passage correspondant à ce nom dans notre système sur cette période. Si vous pensez qu'il y a une confusion d'établissement, contactez-nous, on clarifie volontiers. — Iliès" },
      { type: "h3", text: "5. Avis 2★ sur un produit défectueux" },
      { type: "quote", text: "Bonjour, désolé pour ce désagrément. Nous reprenons systématiquement les articles présentant un défaut — passez en boutique avec votre ticket, ou écrivez-nous, on traite ça sous 48h. — Nadia" },
      { type: "h2", text: "Ce qu'il ne faut jamais faire" },
      { type: "ul", items: [
        "Répondre sous le coup de la colère, dans l'heure — attendre 24h change le ton de 90% des réponses.",
        "Copier-coller la même réponse générique sur tous les avis négatifs — Google et les lecteurs le remarquent.",
        "Signaler un avis à Google en espérant sa suppression, sans réponse publique en parallèle — le signalement prend parfois des semaines, la réponse est immédiate.",
        "Discuter les détails du litige en commentaire public — ça nourrit la polémique au lieu de l'éteindre.",
      ] },
      { type: "h2", text: "Et si vous n'avez pas le temps de répondre à chaque avis" },
      { type: "p", text: "C'est le cas le plus fréquent chez les commerçants qui reçoivent 15 à 40 avis par mois : la réponse aux avis positifs (4-5★) prend un temps qu'ils n'ont pas, et les avis négatifs finissent par attendre des semaines sans réponse — ce qui aggrave l'impression laissée. Caela Réputation répond automatiquement aux avis 4-5★ en 30 secondes et envoie 3 suggestions de réponse par email pour chaque avis négatif, à valider ou modifier en un clic." },
    ],
  },
  {
    slug: "delai-publication-avis-google",
    title: "Combien de temps Google met à publier un avis (et pourquoi certains disparaissent)",
    description:
      "Délai réel de publication d'un avis Google, causes de disparition (modération automatique, signalement, changement de fiche) et ce qu'un commerçant peut vérifier.",
    category: "Google Business Profile",
    date: "2026-02-18",
    readMinutes: 5,
    excerpt:
      "Un avis publié n'apparaît pas toujours instantanément — et un avis disparu n'a pas forcément été supprimé par erreur. Ce qui se passe réellement côté Google.",
    blocks: [
      { type: "p", text: "Un client vous dit avoir laissé un avis 5★ hier soir, mais vous ne le voyez toujours pas ce matin sur votre fiche. Un autre avis, présent depuis six mois, a disparu du jour au lendemain sans notification. Les deux situations ont des explications précises, rarement liées à une erreur de votre part." },
      { type: "h2", text: "Le délai normal : entre quelques minutes et 48h" },
      { type: "p", text: "La majorité des avis Google Maps apparaissent en quelques minutes à quelques heures. Google applique cependant une modération automatique (détection de spam, de langage inapproprié, de faux profils) qui peut retarder la publication jusqu'à 48h, parfois plus lors de pics de signalements sur une zone géographique." },
      { type: "h2", text: "Pourquoi un avis peut ne jamais apparaître" },
      { type: "ul", items: [
        "Le compte Google du client est trop récent ou n'a jamais publié d'autre contenu — Google le traite comme suspect.",
        "L'avis a été laissé depuis une adresse IP associée à de nombreux avis sur des établissements différents en peu de temps.",
        "Le texte contient des mots-clés que Google associe au spam commercial (liens, numéros de téléphone, promos).",
        "L'avis viole les règles Google sur les conflits d'intérêts (avis d'un employé, d'un concurrent, ou en échange d'une contrepartie non déclarée).",
      ] },
      { type: "h2", text: "Pourquoi un avis existant disparaît" },
      { type: "p", text: "Trois causes couvrent la quasi-totalité des cas observés :" },
      { type: "ul", items: [
        "Suppression volontaire par l'auteur — le client a modifié ou retiré son propre avis, souvent après une réponse en privé.",
        "Modération a posteriori — un algorithme Google réévalue en continu les avis existants, y compris ceux publiés depuis longtemps, et peut en retirer certains rétroactivement.",
        "Fusion de fiches Google Business Profile — un changement d'adresse, une fusion de doublons, ou une réclamation de fiche peut faire perdre des avis rattachés à l'ancienne fiche.",
      ] },
      { type: "h2", text: "Ce qu'un commerçant peut réellement vérifier" },
      { type: "p", text: "Aucun outil, y compris officiel, ne montre l'historique complet des avis supprimés par Google. Ce qui reste vérifiable : comparer le nombre total d'avis affiché à intervalles réguliers (une baisse ponctuelle confirme une suppression), et consulter le fil d'activité de Google Business Profile qui journalise parfois — pas systématiquement — les retraits liés à une modération." },
      { type: "h2", text: "Faut-il signaler un faux avis ?" },
      { type: "p", text: "Oui, mais sans attendre le résultat pour agir : le signalement via Google Business Profile prend en moyenne 1 à 3 semaines pour aboutir, quand il aboutit. En parallèle, répondre publiquement à l'avis contesté reste indispensable — les visiteurs qui liront l'avis avant sa éventuelle suppression verront votre réponse, pas votre silence." },
    ],
  },
  {
    slug: "fiche-google-business-profile-classement-local",
    title: "Fiche Google Business Profile : 12 signaux qui font monter le classement local",
    description:
      "Les facteurs qui influencent réellement le classement dans le pack local de 3 (Google Maps) : fraîcheur des avis, photos, cohérence NAP, catégories, et ce qui ne compte pas.",
    category: "SEO local",
    date: "2026-01-24",
    readMinutes: 8,
    excerpt:
      "Le classement dans les 3 résultats affichés sous la carte Google dépend d'une combinaison de signaux précis — la plupart gratuits, aucun ne s'achète directement.",
    blocks: [
      { type: "p", text: "Quand un client cherche « plombier près de moi » ou « restaurant [ville] », Google affiche une carte suivie de 3 établissements : le pack local. Être dans ces 3 résultats capte l'essentiel des clics — la position 4 et au-delà se voit dix fois moins cliquée. Google ne publie pas sa formule exacte, mais des années d'observation par des milliers de fiches permettent d'isoler les signaux qui pèsent réellement." },
      { type: "h2", text: "Pertinence, distance, notoriété : les 3 piliers officiels" },
      { type: "p", text: "Google indique lui-même s'appuyer sur trois familles de critères : la pertinence de la fiche par rapport à la recherche, la distance entre le chercheur et l'établissement, et la notoriété — un mélange de signaux en ligne (avis, presse, backlinks) et hors ligne. Concrètement, voici les 12 signaux qui traduisent ces piliers en actions." },
      { type: "h2", text: "Ce qui dépend directement de la fiche" },
      { type: "ul", items: [
        "Catégorie principale exacte — « Restaurant italien » classe mieux qu'un « Restaurant » générique sur les recherches spécifiques.",
        "Cohérence NAP (Nom, Adresse, Téléphone) identique partout — annuaires, site web, réseaux sociaux. Une incohérence dilue le signal de confiance.",
        "Description complète, avec les mots que tapent réellement les clients — pas de jargon marketing.",
        "Horaires exacts et à jour, y compris jours fériés — un horaire faux fait fuir Google autant que le client.",
        "Photos récentes et régulières — Google favorise les fiches actives, pas seulement complètes une fois.",
        "Attributs cochés (accessible PMR, terrasse, réservation en ligne) — ils filtrent et améliorent le matching avec les recherches précises.",
      ] },
      { type: "h2", text: "Ce qui dépend des avis" },
      { type: "ul", items: [
        "Volume d'avis — un établissement avec 80 avis a un avantage structurel sur un concurrent à 12, à qualité égale.",
        "Note moyenne — l'écart entre 4,2★ et 4,7★ pèse moins qu'on ne le croit dans le classement pur, mais énormément dans le taux de clic une fois affiché.",
        "Fraîcheur — des avis récents (moins de 3 mois) pèsent plus que des avis anciens dans le calcul de notoriété.",
        "Présence de mots-clés locaux dans le texte des avis — un client qui écrit « meilleur coiffeur du quartier Saint-Michel » renforce le lien géographique et sémantique de la fiche, sans que le commerçant ait rien à faire.",
        "Réponses du commerçant — Google interprète un taux de réponse élevé comme un signal d'activité et de sérieux.",
      ] },
      { type: "h2", text: "Ce qui compte moins qu'on le pense" },
      { type: "p", text: "L'ancienneté brute de la fiche, la longueur du texte de description au-delà de 300 mots, et le nombre de posts publiés sans lien avec l'activité réelle ont un effet marginal. Les commerçants qui investissent du temps là plutôt que sur la fraîcheur des avis et la cohérence NAP obtiennent généralement moins de résultat pour plus d'effort." },
      { type: "h2", text: "Le levier le plus sous-estimé : la régularité" },
      { type: "p", text: "Un établissement qui reçoit 3 avis par semaine, toute l'année, classe mieux qu'un établissement qui en reçoit 40 en une semaine puis plus aucun pendant six mois — même à volume total égal. C'est la raison pour laquelle une collecte automatisée et continue (QR code, plaque NFC, lien après passage) surpasse une campagne ponctuelle de sollicitation d'avis." },
    ],
  },
  {
    slug: "avis-google-ia-reglementation-2026",
    title: "Réponses aux avis Google par IA : ce que Google autorise (et sanctionne) en 2026",
    description:
      "Google n'interdit pas les réponses générées par IA, mais sanctionne certaines pratiques précises : contenu générique détecté, réponses non supervisées, faux avis générés.",
    category: "IA & conformité",
    date: "2026-04-11",
    readMinutes: 5,
    excerpt:
      "Utiliser l'IA pour répondre aux avis n'enfreint aucune règle Google — à condition de rester dans un cadre précis. Ce qui est toléré, ce qui déclenche une pénalité.",
    blocks: [
      { type: "p", text: "La question revient à chaque commerçant qui découvre un outil de réponse automatique : Google va-t-il sanctionner l'usage de l'IA sur sa fiche ? La réponse, d'après les règles publiques de Google Business Profile et les retours observés sur l'écosystème, est non — sous conditions précises." },
      { type: "h2", text: "Ce que Google interdit explicitement" },
      { type: "ul", items: [
        "Les faux avis, générés par IA ou non — un avis doit correspondre à une expérience réelle du client.",
        "Les avis incitatifs non déclarés — proposer une réduction en échange d'un avis positif, sans le mentionner, viole les règles quel que soit l'outil utilisé pour la collecte.",
        "Le contenu automatisé qui usurpe une identité humaine sans le signaler dans un contexte où cela induit en erreur.",
        "Le spam de contenu répétitif — publier des posts ou réponses identiques en masse sur plusieurs fiches déclenche la détection anti-spam de Google.",
      ] },
      { type: "h2", text: "Ce que Google tolère et n'a jamais sanctionné" },
      { type: "p", text: "Répondre à un avis client avec l'aide d'une IA, du moment que la réponse est cohérente avec le contenu réel de l'avis, personnalisée (pas un copier-coller identique sur 50 avis) et validée par un humain avant publication, n'a jamais fait l'objet d'une sanction documentée. Google ne dispose techniquement d'aucun moyen fiable de distinguer une réponse écrite par un humain d'une réponse assistée par IA quand elle est bien formulée — et ne cherche pas à le faire : ce qui compte pour Google est la qualité et la pertinence de l'interaction, pas l'outil derrière." },
      { type: "h2", text: "La ligne rouge : l'automatisation sans supervision" },
      { type: "p", text: "Le risque réel ne vient pas de l'IA elle-même mais de la publication sans relecture. Une réponse générée automatiquement et publiée sans validation humaine peut produire un contre-sens (répondre chaleureusement à un avis qui signale un vrai problème de sécurité, par exemple) — ce n'est pas Google qui sanctionne ce cas, c'est la crédibilité du commerçant qui en pâtit publiquement." },
      { type: "h2", text: "Bonne pratique observée : automatiser le facile, superviser le sensible" },
      { type: "p", text: "L'approche qui limite le risque tout en gagnant du temps : laisser l'IA répondre seule aux avis 4-5★, qui représentent la majorité du volume et où l'enjeu de nuance est faible, et systématiquement soumettre les avis négatifs à une validation humaine avant publication — via une suggestion à corriger plutôt qu'une publication automatique. C'est le fonctionnement retenu par Caela Réputation : réponse immédiate sur le positif, décision humaine sur le sensible." },
    ],
  },
  {
    slug: "plaque-nfc-avis-google-roi",
    title: "Plaque NFC avis Google : quel retour sur investissement réel pour un commerce de proximité",
    description:
      "Combien coûte une plaque NFC, combien d'avis supplémentaires elle génère réellement, et pour quel type de commerce l'investissement se rentabilise en quelques semaines.",
    category: "Collecte d'avis",
    date: "2026-05-06",
    readMinutes: 6,
    excerpt:
      "Une plaque NFC posée en caisse coûte entre 15 et 40€. Le calcul qui détermine si elle rapporte plus qu'elle ne coûte, avec des chiffres issus de commerces réels.",
    blocks: [
      { type: "p", text: "Une plaque NFC (« tap to review ») permet à un client de laisser un avis Google en approchant son téléphone, sans scanner de QR code ni taper d'URL. Le geste prend 3 secondes. La question qui reste : est-ce que ça change réellement le volume d'avis collectés, ou est-ce un gadget qui finit oublié en caisse ?" },
      { type: "h2", text: "Ce qui bloque un client qui voudrait laisser un avis" },
      { type: "p", text: "La quasi-totalité des clients satisfaits ont l'intention de laisser un avis en sortant — et l'oublient dans les 5 minutes qui suivent. Le frein n'est presque jamais la motivation, c'est le nombre d'étapes : ouvrir Google Maps, chercher l'établissement, trouver le bouton avis, attendre le chargement. Chaque étape supplémentaire perd une partie des clients en chemin. La NFC supprime toutes les étapes sauf une : approcher le téléphone." },
      { type: "h2", text: "Le calcul de rentabilité, avec des ordres de grandeur réels" },
      { type: "ul", items: [
        "Coût d'une plaque NFC de qualité (métal ou plastique premium, programmable) : 15 à 40€ selon le matériau, sans abonnement.",
        "Commerce sans dispositif de collecte : en moyenne 1 à 3 avis obtenus par mois sur la seule bonne volonté des clients.",
        "Commerce avec plaque NFC posée en caisse et demande verbale systématique : 8 à 20 avis par mois observés sur des commerces de proximité (coiffure, restauration, artisanat).",
        "Effet sur le classement local : passer de 3 à 15 avis mensuels accélère la fraîcheur des avis, un signal de classement direct (voir l'article sur les 12 signaux de classement).",
      ] },
      { type: "h2", text: "Pour quels commerces l'investissement se justifie le plus" },
      { type: "p", text: "L'effet est maximal pour les commerces à passage physique répété et à décision rapide : restauration, coiffure/esthétique, commerce de détail, artisanat avec devis sur place. Il est plus limité pour les activités sans point de contact physique final (vente à distance pure, prestations 100% à domicile sans repasser par un lieu fixe) — une plaque NFC n'a alors personne à qui la présenter." },
      { type: "h2", text: "Le geste qui multiplie l'effet de la plaque : la demande verbale" },
      { type: "p", text: "Une plaque NFC posée sans qu'on en parle au client capte une fraction du potentiel. Le même dispositif, accompagné d'une phrase simple au moment du paiement (« Si vous êtes satisfait, un avis nous aide beaucoup, il suffit d'approcher votre téléphone ici »), multiplie généralement le taux de conversion par 2 à 3 selon les retours terrain — la plaque lève la friction technique, la phrase lève la friction de l'oubli." },
      { type: "h2", text: "Et après l'avis : la vraie limite du dispositif seul" },
      { type: "p", text: "Une plaque NFC résout la collecte, pas le suivi. Une fois les avis multipliés par 5, y répondre un par un devient vite ingérable manuellement. C'est le complément naturel : Caela Réputation combine plaque NFC pour la collecte et réponses automatiques par IA pour le suivi, sans que le volume d'avis supplémentaire ne devienne une charge de travail supplémentaire." },
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find(p => p.slug === slug);
}
