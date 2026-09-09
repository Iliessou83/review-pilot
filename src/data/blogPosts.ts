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
      "Un avis négatif se répond en public, __jamais en privé__. La méthode qui évite deux pièges : l'excuse qui sonne faux, et le silence qui confirme l'accusation.",
    blocks: [
      { type: "p", text: "Une réponse trop générique comme « désolé pour la gêne occasionnée » peut donner l'impression que le sujet est refermé sans avoir été compris. Une réponse utile doit rester factuelle et adaptée au retour publié." },
      { type: "h2", text: "Pourquoi la réponse compte plus que l'avis lui-même" },
      { type: "p", text: "Un avis négatif isolé n'empêche pas nécessairement de vendre. Une réponse publique, factuelle et respectueuse montre aux lecteurs que le commerçant prend les retours au sérieux. Google recommande de répondre aux avis, sans publier de pourcentage universel de conversion." },
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
        "Répondre sous le coup de la colère — prendre un temps de relecture aide à garder un ton factuel.",
        "Copier-coller la même réponse générique sur tous les avis négatifs — Google et les lecteurs le remarquent.",
        "Signaler un avis à Google en espérant sa suppression, sans réponse publique en parallèle — le signalement prend parfois des semaines, la réponse est immédiate.",
        "Discuter les détails du litige en commentaire public — ça nourrit la polémique au lieu de l'éteindre.",
      ] },
      { type: "h2", text: "Et si vous n'avez pas le temps de répondre à chaque avis" },
      { type: "p", text: "Lorsque les avis reviennent régulièrement, leur suivi peut devenir une tâche à part entière. Après autorisation de la plateforme et mandat explicite du commerçant, Caela peut répondre aux avis 4-5★ après détection et préparer trois suggestions pour chaque avis négatif, à relire ou modifier avant publication." },
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
      { type: "h2", text: "Un délai de publication variable" },
      { type: "p", text: "Un avis peut apparaître rapidement ou rester temporairement absent pendant les contrôles de Google. Google ne garantit pas de délai universel : il faut éviter de promettre une publication sous un nombre d'heures précis." },
      { type: "h2", text: "Pourquoi un avis peut ne jamais apparaître" },
      { type: "ul", items: [
        "Le contenu est détecté ou signalé comme faux, trompeur ou issu d'un conflit d'intérêts.",
        "Le contenu est hors sujet, répétitif, promotionnel ou contient des éléments interdits par les règles de contenu.",
        "L'avis a été publié en échange d'un paiement, d'une remise ou d'un autre avantage.",
        "Le compte ou le contenu fait l'objet d'un contrôle de Google dont le détail n'est pas communiqué au commerçant.",
      ] },
      { type: "h2", text: "Pourquoi un avis existant disparaît" },
      { type: "p", text: "Plusieurs causes sont possibles, notamment :" },
      { type: "ul", items: [
        "Suppression volontaire par l'auteur — le client a modifié ou retiré son propre avis, souvent après une réponse en privé.",
        "Modération a posteriori — un algorithme Google réévalue en continu les avis existants, y compris ceux publiés depuis longtemps, et peut en retirer certains rétroactivement.",
        "Évolution d'une fiche Google Business Profile — lors d'une fusion ou d'un changement important, l'affichage des avis peut évoluer et doit être vérifié avec l'assistance Google.",
      ] },
      { type: "h2", text: "Ce qu'un commerçant peut réellement vérifier" },
      { type: "p", text: "Le commerçant peut vérifier l'état actuel de sa fiche, conserver ses propres relevés de volume et utiliser les voies d'assistance Google lorsqu'un avis conforme semble manquer. Un relevé Caela indique une évolution observée, pas la raison interne d'une décision de modération Google." },
      { type: "h2", text: "Faut-il signaler un faux avis ?" },
      { type: "p", text: "Oui si l'avis enfreint réellement une règle, mais Google ne garantit ni retrait ni délai fixe. En parallèle, une réponse publique factuelle peut informer les visiteurs pendant l'examen, sans révéler de donnée personnelle ni accuser l'auteur." },
    ],
  },
  {
    slug: "fiche-google-business-profile-classement-local",
    title: "Fiche Google Business Profile : 12 actions utiles pour la présence locale",
    description:
      "Les trois facteurs publiés par Google — pertinence, distance et notoriété — et les actions qu'un commerçant peut réellement maîtriser.",
    category: "SEO local",
    date: "2026-01-24",
    readMinutes: 8,
    excerpt:
      "Google explique que les résultats locaux reposent principalement sur la pertinence, la distance et la notoriété. Voici les actions concrètes qui améliorent surtout la qualité de la fiche.",
    blocks: [
      { type: "p", text: "Quand un client cherche « plombier près de moi » ou « restaurant [ville] », Google peut afficher un ensemble de résultats locaux. Google ne publie pas sa formule exacte et aucune agence ne peut garantir une position. Les recommandations ci-dessous séparent les facteurs officiellement décrits des bonnes pratiques utiles aux clients." },
      { type: "h2", text: "Pertinence, distance, notoriété : les 3 piliers officiels" },
      { type: "p", text: "Google indique lui-même s'appuyer sur trois familles de critères : la pertinence de la fiche par rapport à la recherche, la distance entre le chercheur et l'établissement, et la notoriété — un mélange de signaux en ligne (avis, presse, backlinks) et hors ligne. Concrètement, voici les 12 signaux qui traduisent ces piliers en actions." },
      { type: "h2", text: "Ce qui dépend directement de la fiche" },
      { type: "ul", items: [
        "Catégorie principale exacte — « Restaurant italien » classe mieux qu'un « Restaurant » générique sur les recherches spécifiques.",
        "Cohérence NAP (Nom, Adresse, Téléphone) identique partout — annuaires, site web, réseaux sociaux. Une incohérence dilue le signal de confiance.",
        "Description complète, avec les mots que tapent réellement les clients — pas de jargon marketing.",
        "Horaires exacts et à jour, y compris jours fériés — un horaire faux fait fuir Google autant que le client.",
        "Photos récentes et représentatives — elles aident les clients à comprendre l'offre et l'établissement.",
        "Attributs cochés (accessible PMR, terrasse, réservation en ligne) — ils filtrent et améliorent le matching avec les recherches précises.",
      ] },
      { type: "h2", text: "Ce qui dépend des avis" },
      { type: "ul", items: [
        "Volume et note — Google indique que davantage d'avis et des évaluations positives peuvent contribuer au classement local, sans publier de seuil ni promettre une position.",
        "Fraîcheur pour le lecteur — de nouveaux avis authentiques donnent surtout aux futurs clients une vision plus actuelle de l'expérience.",
        "Réponses du commerçant — Google recommande des réponses utiles et positives pour montrer que l'entreprise accorde de l'importance à ses clients ; il ne présente pas la vitesse de réponse comme une garantie de classement.",
        "Contenu authentique — ne dictez jamais de mots-clés aux auteurs et ne conditionnez jamais un avantage à une note ou à un texte positif.",
        "Traitement équitable — demandez un avis de la même façon à tous les clients, quelle que soit leur satisfaction supposée.",
      ] },
      { type: "h2", text: "Ce qui compte moins qu'on le pense" },
      { type: "p", text: "Google ne publie pas de pondération permettant d'affirmer qu'un nombre précis de mots, de posts ou d'années d'ancienneté garantit une position. Ces éléments doivent d'abord servir à fournir des informations exactes et utiles aux clients." },
      { type: "h2", text: "Le levier le plus sous-estimé : la régularité" },
      { type: "p", text: "Une demande d'avis neutre et régulière donne un retour client plus représentatif qu'une campagne ponctuelle. Elle peut utiliser un QR code, une plaque NFC ou un lien après passage, à condition de s'adresser à tous les clients sans filtrage selon leur satisfaction." },
    ],
  },
  {
    slug: "avis-google-ia-reglementation-2026",
    title: "Réponses aux avis Google par IA : ce que Google autorise (et sanctionne) en 2026",
    description:
      "Les réponses assistées par IA restent soumises à l'autorisation expresse du commerçant, aux règles de contenu et aux politiques Business Profile API.",
    category: "IA & conformité",
    date: "2026-04-11",
    readMinutes: 5,
    excerpt:
      "L'IA n'est pas interdite en tant que telle pour rédiger une réponse, mais son usage ne dispense jamais du consentement préalable ni des règles de contenu Google.",
    blocks: [
      { type: "p", text: "La question revient à chaque commerçant qui découvre un outil de réponse automatique. Les politiques Business Profile API autorisent un représentant à répondre pour un client autorisé, mais interdisent de déclencher des réponses automatisées sans consentement préalable, spécifique et exprès. Chaque réponse doit aussi respecter les règles de contenu." },
      { type: "h2", text: "Ce que Google interdit explicitement" },
      { type: "ul", items: [
        "Les faux avis, générés par IA ou non — un avis doit correspondre à une expérience réelle du client.",
        "Les avis incitatifs — proposer un paiement, une remise ou un avantage en échange du dépôt, de la modification ou de la suppression d'un avis est interdit, que l'avantage soit déclaré ou non.",
        "Le contenu automatisé qui usurpe une identité humaine sans le signaler dans un contexte où cela induit en erreur.",
        "Le spam de contenu répétitif — publier des posts ou réponses identiques en masse sur plusieurs fiches déclenche la détection anti-spam de Google.",
      ] },
      { type: "h2", text: "Ce que les règles Google permettent sous conditions" },
      { type: "p", text: "Les API Business Profile permettent aux plateformes et représentants autorisés de répondre aux avis. L'usage d'une IA n'est pas interdit en soi, mais le commerçant doit avoir donné une autorisation préalable, spécifique et expresse, et chaque réponse doit respecter les règles de contenu. Google peut contrôler le projet et demander un compte de démonstration." },
      { type: "h2", text: "La ligne rouge : l'automatisation sans supervision" },
      { type: "p", text: "Le risque réel ne vient pas de l'IA elle-même mais de la publication sans relecture. Une réponse générée automatiquement et publiée __sans validation humaine__ peut produire un contre-sens (répondre chaleureusement à un avis qui signale un vrai problème de sécurité, par exemple) — ce n'est pas Google qui sanctionne ce cas, c'est la crédibilité du commerçant qui en pâtit publiquement." },
      { type: "h2", text: "Bonne pratique observée : automatiser le facile, superviser le sensible" },
      { type: "p", text: "L'approche qui limite le risque consiste à réserver l'automatisation aux avis 4-5★ qui ne présentent aucun signal sensible, puis à soumettre les avis négatifs ou ambigus à une validation humaine. C'est le fonctionnement retenu par Caela Réputation après activation explicite : **automatisation encadrée sur le positif, décision humaine sur le sensible**." },
    ],
  },
  {
    slug: "plaque-nfc-avis-google-roi",
    title: "Plaque NFC avis Google : quel retour sur investissement réel pour un commerce de proximité",
    description:
      "Ce que coûte une plaque NFC, comment mesurer son usage et pour quels commerces elle peut réellement simplifier le parcours d'avis.",
    category: "Collecte d'avis",
    date: "2026-05-06",
    readMinutes: 6,
    excerpt:
      "Une plaque NFC réduit le nombre d'étapes avant le formulaire d'avis. Sa valeur doit être mesurée avec des scans et des avis réellement observés.",
    blocks: [
      { type: "p", text: "Une plaque NFC (« tap to review ») ouvre un lien d'avis lorsqu'un client approche un téléphone compatible, sans avoir à rechercher lui-même l'établissement. La question utile reste la même : est-ce que le support est suffisamment visible et utilisé pour simplifier réellement le parcours ?" },
      { type: "h2", text: "Ce qui bloque un client qui voudrait laisser un avis" },
      { type: "p", text: "Certains clients souhaitent partager leur expérience mais abandonnent face au nombre d'étapes : ouvrir Maps, chercher l'établissement puis trouver le formulaire. Une plaque NFC réduit ce parcours à l'ouverture du lien d'avis ; elle ne garantit pas qu'un avis sera publié." },
      { type: "h2", text: "Le calcul de rentabilité, avec des ordres de grandeur réels" },
      { type: "ul", items: [
        "Coût d'une plaque NFC de qualité (métal ou plastique premium, programmable) : 15 à 40€ selon le matériau, sans abonnement.",
        "Sans mesure initiale, relevez d'abord votre volume d'avis habituel sur une période comparable.",
        "Commerce avec plaque NFC : le résultat dépend du passage, de la visibilité du support et de la demande verbale. Mesurez le nombre de scans et d'avis plutôt que d'utiliser une promesse générique.",
        "Effet possible sur la présence locale : Google indique que le nombre d'avis et les notes positives peuvent contribuer au classement local, sans garantir une position.",
      ] },
      { type: "h2", text: "Pour quels commerces l'investissement se justifie le plus" },
      { type: "p", text: "L'effet est maximal pour les commerces à passage physique répété et à décision rapide : restauration, coiffure/esthétique, commerce de détail, artisanat avec devis sur place. Il est plus limité pour les activités sans point de contact physique final (vente à distance pure, prestations 100% à domicile sans repasser par un lieu fixe) — une plaque NFC n'a alors personne à qui la présenter." },
      { type: "h2", text: "Le geste qui multiplie l'effet de la plaque : la demande verbale" },
      { type: "p", text: "Une plaque NFC posée sans explication peut passer inaperçue. Une phrase neutre au moment du paiement est préférable : « Si vous souhaitez partager votre expérience, positive ou négative, vous pouvez approcher votre téléphone ici. » Aucun avantage ne doit dépendre du dépôt, de la note, de la modification ou de la suppression d'un avis." },
      { type: "h2", text: "Et après l'avis : la vraie limite du dispositif seul" },
      { type: "p", text: "Une plaque NFC facilite l'accès au formulaire d'avis, pas le suivi. Si le volume augmente, Caela peut centraliser les nouveaux avis et appliquer le mode de réponse explicitement choisi par le commerçant." },
    ],
  },
  {
    slug: "faire-retirer-faux-avis-google",
    title: "Faire retirer un faux avis Google : ce qui marche, et ce qui ne sert à rien",
    description:
      "Un faux avis, un avis diffamatoire ou posté par un concurrent peut être retiré par Google — à condition de viser le bon motif. La méthode, et pourquoi répondre poliment ne suffit jamais.",
    category: "Réputation",
    date: "2026-08-29",
    readMinutes: 5,
    excerpt:
      "Un avis ne peut être retiré que s'il enfreint les règles de contenu. La décision et le délai appartiennent à Google.",
    blocks: [
      { type: "p", text: "Un commerçant confronté à un faux avis fait presque toujours la même erreur : il y répond, poliment, en espérant calmer le jeu. Répondre ne retire jamais un avis. Seul un signalement argumenté auprès de Google peut le faire disparaître — et encore, uniquement s'il viole une règle précise des CGU Google, pas simplement parce qu'il est injuste." },
      { type: "h2", text: "Ce que Google retire réellement" },
      { type: "p", text: "Google ne retire pas un avis parce qu'il est négatif, dur, ou même de mauvaise foi ressentie. Il le retire quand il viole une règle documentée de sa politique de contenu : contenu non pertinent (l'avis ne parle pas d'une expérience vécue dans l'établissement), conflit d'intérêt (posté par un concurrent, un ex-salarié, ou un tiers sans lien client réel), contenu offensant ou diffamatoire, spam, ou usurpation. Un avis simplement injuste mais sincère — un vrai client mécontent à tort — ne sera presque jamais retiré, et le signaler abîme la crédibilité du dossier pour les cas suivants." },
      { type: "h2", text: "Les signaux qui rendent un signalement crédible" },
      { type: "ul", items: [
        "Aucune trace du client dans le système de réservation, de caisse ou de facturation sur la période mentionnée.",
        "Des éléments objectifs démontrent un conflit d'intérêts ou l'absence d'expérience réelle, sans déduire cela du seul âge du compte.",
        "Des détails factuellement impossibles : un établissement fermé ce jour-là, un produit qui n'a jamais été au menu, un prix qui n'a jamais existé.",
        "Un langage qui ressemble à une accusation personnelle contre un salarié nommément visé, plutôt qu'à un retour sur un produit ou un service.",
      ] },
      { type: "h2", text: "Pourquoi la capture d'écran seule ne suffit pas" },
      { type: "p", text: "Un signalement utile identifie la règle précise qui semble violée et rassemble les éléments factuels disponibles (planning, facture ou échange pertinent), sans transmettre plus de données personnelles que nécessaire. Affirmer simplement « cet avis est faux » ne démontre pas la violation." },
      { type: "h2", text: "Le délai dépend de Google" },
      { type: "p", text: "Google ne garantit pas un délai fixe ni le retrait. Le suivi doit utiliser les voies d'appel ou d'assistance disponibles et présenter au commerçant l'état réel du dossier, sans annoncer de date certaine." },
      { type: "h2", text: "Ce que fait Caela Réputation" },
      { type: "p", text: "Caela peut préparer le dossier — argumentaire, preuves, dépôt et suivi jusqu'à la décision de Google — pour **19,90€ par dossier soumis**. La décision appartient toujours à Google. Si le retrait est refusé, la prestation est remboursée selon les conditions annoncées." },
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find(p => p.slug === slug);
}

// Identité visuelle par catégorie (bandeau + pastille) — palette Caela.
export const CATEGORY_STYLE: Record<string, { icon: string; color: string; bg: string }> = {
  "Réputation": { icon: "💬", color: "#D6455D", bg: "linear-gradient(135deg, #D6455D, #C5221F)" },
  "Google Business Profile": { icon: "📍", color: "#2457C5", bg: "linear-gradient(135deg, #2457C5, #183F93)" },
  "SEO local": { icon: "🔍", color: "#16856B", bg: "linear-gradient(135deg, #16856B, #1E7A3D)" },
  "IA & conformité": { icon: "🤖", color: "#7C3AED", bg: "linear-gradient(135deg, #7C3AED, #5B21B6)" },
  "Collecte d'avis": { icon: "📲", color: "#E0A11A", bg: "linear-gradient(135deg, #E0A11A, #C88A00)" },
};
