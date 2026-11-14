/**
 * Contenus éditoriaux : services, avis, articles, équipe, FAQ.
 * Les biens immobiliers sont gérés depuis le tableau de bord admin (base Supabase).
 * Remplacez textes, prix et images par ceux de l'agence cliente.
 */

export type Faq = { q: string; a: string };

/* Les biens immobiliers sont stockés dans Supabase : voir src/lib/data/properties.ts */
export { propertyTypes, transactions, cities as propertyCities } from "@/lib/data/property-model";
export type { Property, PropertyType, Transaction } from "@/lib/data/property-model";

/* ------------------------------------------------------------------ */
/* Services                                                            */
/* ------------------------------------------------------------------ */

export type Service = {
  slug: string;
  title: string;
  kicker: string;
  short: string;
  intro: string;
  image: string;
  imageAlt: string;
  benefits: { title: string; text: string }[];
  includes: string[];
  price: string;
  faq: Faq[];
};

export const services: Service[] = [
  {
    slug: "achat-immobilier",
    title: "Achat",
    kicker: "Trouver le bien idéal",
    short: "Recherche ciblée, visites, vérification foncière et négociation jusqu'à la signature chez le notaire.",
    intro:
      "Dites-nous ce que vous cherchez : nous sélectionnons les biens qui correspondent vraiment, vérifions chaque dossier foncier et négocions pour vous. Vous ne visitez que l'essentiel et vous signez en toute sécurité.",
    image: "/images/villa-contemporaine.webp",
    imageAlt: "Villa contemporaine avec piscine proposée à la vente",
    benefits: [
      { title: "Biens vérifiés", text: "Titre foncier, plan de situation et identité du vendeur contrôlés avant toute visite." },
      { title: "Gain de temps", text: "Une présélection sur mesure : vous ne visitez que des biens qui correspondent à vos critères." },
      { title: "Négociation", text: "Nous connaissons les prix réels du marché et défendons votre budget." },
    ],
    includes: [
      "Définition précise de votre recherche",
      "Accès aux biens en exclusivité",
      "Visites physiques ou en vidéo",
      "Vérification du titre foncier",
      "Négociation du prix",
      "Accompagnement jusqu'au notaire",
    ],
    price: "Honoraires indicatifs : 3 % du prix d'achat, payables uniquement à la signature",
    faq: [
      { q: "Comment vérifiez-vous un titre foncier ?", a: "Nous consultons le registre au service des domaines, contrôlons le bornage et l'identité du propriétaire, puis faisons valider le dossier par le notaire avant tout versement." },
      { q: "Dois-je payer avant d'avoir trouvé ?", a: "Non. Nos honoraires ne sont dus qu'à la signature de l'acte de vente." },
    ],
  },
  {
    slug: "vente-de-bien",
    title: "Vente",
    kicker: "Vendre vite et bien",
    short: "Estimation juste, photos professionnelles, diffusion ciblée et acheteurs qualifiés.",
    intro:
      "Nous vendons votre bien au meilleur prix et dans les meilleurs délais : estimation fondée sur les ventes réelles, mise en valeur professionnelle, diffusion auprès de notre fichier d'acheteurs au Cameroun et dans la diaspora.",
    image: "/images/accord-clients.webp",
    imageAlt: "Conseillers immobiliers célébrant la signature d'une vente",
    benefits: [
      { title: "Prix juste", text: "Une estimation argumentée, basée sur les transactions récentes du quartier." },
      { title: "Visibilité", text: "Photos et visite vidéo professionnelles, diffusion sur le site, les portails et les réseaux." },
      { title: "Acheteurs qualifiés", text: "Nous vérifions la capacité de financement avant chaque visite." },
    ],
    includes: [
      "Estimation gratuite et écrite",
      "Photos et vidéo professionnelles",
      "Diffusion multicanale",
      "Organisation des visites",
      "Négociation et offres",
      "Suivi jusqu'à l'acte notarié",
    ],
    price: "Honoraires indicatifs : 5 % du prix de vente, payables à la signature",
    faq: [
      { q: "Combien de temps pour vendre ?", a: "En moyenne 3 à 5 mois pour un bien estimé au prix du marché à Douala ou Yaoundé." },
      { q: "Dois-je signer une exclusivité ?", a: "Ce n'est pas obligatoire, mais un mandat exclusif nous permet d'investir davantage dans la mise en valeur de votre bien et accélère généralement la vente." },
    ],
  },
  {
    slug: "location",
    title: "Location",
    kicker: "Louer sereinement",
    short: "Appartements, villas et bureaux : sélection des locataires, bail et état des lieux.",
    intro:
      "Que vous cherchiez un logement ou un locataire, nous sécurisons la location : biens visités et conformes, locataires vérifiés, bail rédigé dans les règles et état des lieux détaillé avec photos.",
    image: "/images/appartement-meuble.webp",
    imageAlt: "Appartement meublé lumineux proposé à la location",
    benefits: [
      { title: "Locataires vérifiés", text: "Pièces d'identité, justificatifs de revenus et références contrôlés." },
      { title: "Bail sécurisé", text: "Contrat clair, conforme à la réglementation, avec état des lieux photographié." },
      { title: "Réactivité", text: "Visites possibles sous 48 h, y compris le samedi." },
    ],
    includes: [
      "Recherche de logement ou de locataire",
      "Visites accompagnées",
      "Étude du dossier locataire",
      "Rédaction du contrat de bail",
      "État des lieux d'entrée et de sortie",
      "Remise des clés",
    ],
    price: "Honoraires indicatifs : l'équivalent d'un mois de loyer",
    faq: [
      { q: "Combien de mois de caution faut-il prévoir ?", a: "Selon le bien, comptez généralement 2 à 3 mois de caution et un ou plusieurs mois d'avance, précisés dans chaque annonce." },
    ],
  },
  {
    slug: "gestion-locative",
    title: "Gestion locative",
    kicker: "Vos revenus sans souci",
    short: "Encaissement des loyers, entretien, relances et rapports mensuels, même depuis l'étranger.",
    intro:
      "Confiez-nous votre bien et percevez vos loyers sans vous en occuper : recherche de locataires, encaissement par virement ou Mobile Money, entretien, relances et compte rendu mensuel détaillé.",
    image: "/images/immeuble-balcons.webp",
    imageAlt: "Immeuble résidentiel avec balcons géré par l'agence",
    benefits: [
      { title: "Loyers encaissés", text: "Virement bancaire, Orange Money ou MTN MoMo : vous êtes payé chaque mois." },
      { title: "Entretien suivi", text: "Notre réseau d'artisans intervient rapidement, sur devis validé par vous." },
      { title: "Transparence", text: "Un relevé mensuel avec chaque encaissement et chaque dépense." },
    ],
    includes: [
      "Recherche et sélection des locataires",
      "Encaissement et reversement des loyers",
      "Relances et gestion des impayés",
      "Entretien et petites réparations",
      "Visites de contrôle régulières",
      "Relevé de gestion mensuel",
    ],
    price: "À partir de 8 % des loyers encaissés",
    faq: [
      { q: "Je vis à l'étranger, comment suivre mon bien ?", a: "Vous recevez un relevé mensuel par e-mail et WhatsApp, avec photos lors des visites de contrôle et des travaux." },
    ],
  },
  {
    slug: "estimation-gratuite",
    title: "Estimation",
    kicker: "Connaître la vraie valeur",
    short: "Avis de valeur écrit sous 48 h, fondé sur les ventes réelles de votre quartier.",
    intro:
      "Vous envisagez de vendre, de louer ou simplement de connaître la valeur de votre patrimoine ? Un conseiller visite votre bien et vous remet un avis de valeur écrit et argumenté, gratuitement et sans engagement.",
    image: "/images/cles-maison.webp",
    imageAlt: "Maquette de maison et trousseau de clés posés sur une table",
    benefits: [
      { title: "Gratuit", text: "Sans frais et sans aucune obligation de nous confier votre bien." },
      { title: "Argumentée", text: "Comparaison avec les ventes et locations récentes, état du bien, situation foncière." },
      { title: "Rapide", text: "Visite sous 72 h, avis de valeur écrit sous 48 h." },
    ],
    includes: [
      "Visite du bien par un conseiller",
      "Analyse des ventes comparables",
      "Vérification de la situation foncière",
      "Estimation du loyer potentiel",
      "Avis de valeur écrit",
      "Conseils de mise en valeur",
    ],
    price: "Gratuit et sans engagement",
    faq: [
      { q: "L'estimation m'engage-t-elle à vendre avec vous ?", a: "Non, l'estimation est totalement gratuite et sans engagement." },
    ],
  },
  {
    slug: "diaspora-investissement",
    title: "Diaspora & investissement",
    kicker: "Investir à distance",
    short: "Acheter, faire construire ou investir au Cameroun depuis l'étranger, en toute sécurité.",
    intro:
      "Vous vivez à Paris, Montréal ou Bruxelles et souhaitez investir au pays ? Nous sommes vos yeux et vos mains sur place : recherche, visites vidéo en direct, vérifications juridiques, paiement sécurisé chez le notaire et gestion de votre bien.",
    image: "/images/poignee-de-main.webp",
    imageAlt: "Conseiller immobilier serrant la main d'un client",
    benefits: [
      { title: "Visites vidéo", text: "Visitez chaque bien en direct depuis votre téléphone, à l'heure qui vous convient." },
      { title: "Fonds sécurisés", text: "Les paiements transitent par le compte séquestre du notaire, jamais en espèces." },
      { title: "Clé en main", text: "De la recherche à la mise en location, un seul interlocuteur." },
    ],
    includes: [
      "Visio de cadrage de votre projet",
      "Recherche et visites vidéo",
      "Vérifications foncières complètes",
      "Signature par procuration",
      "Mise en location du bien",
      "Gestion locative à distance",
    ],
    price: "Sur devis selon l'accompagnement choisi",
    faq: [
      { q: "Puis-je acheter sans venir au Cameroun ?", a: "Oui, la signature peut se faire par procuration notariée. Nous vous accompagnons dans toutes les démarches." },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Avis, chiffres, méthode, équipe                                     */
/* ------------------------------------------------------------------ */

export type Testimonial = { name: string; role: string; text: string; rating: number; project: string };

export const testimonials: Testimonial[] = [
  { name: "Christelle M.", role: "Diaspora, Paris", rating: 5, project: "Achat d'une villa à Kribi", text: "J'ai acheté sans me déplacer. Visites en vidéo, vérification du titre foncier, signature par procuration : tout était carré. Je recommande les yeux fermés." },
  { name: "Dr. Paul E.", role: "Propriétaire, Douala", rating: 5, project: "Gestion locative", text: "Depuis qu'Ébène gère mes trois appartements, je reçois mes loyers à date fixe et un relevé clair chaque mois. Plus aucun souci d'impayés." },
  { name: "Aïcha B.", role: "Vendeuse, Yaoundé", rating: 5, project: "Vente d'une maison", text: "Estimation juste, photos superbes et acheteur trouvé en sept semaines. L'équipe m'a accompagnée jusqu'au notaire." },
  { name: "Jean-Marc T.", role: "Directeur RH, multinationale", rating: 5, project: "Location pour expatriés", text: "Ils logent nos cadres expatriés depuis quatre ans. Biens conformes, réactivité impeccable, interlocuteur unique." },
  { name: "Famille Nkodo", role: "Diaspora, Montréal", rating: 5, project: "Achat d'un terrain", text: "Nous avions failli acheter un terrain litigieux ailleurs. Ébène a tout vérifié et nous a trouvé un terrain titré au juste prix." },
  { name: "Sandrine K.", role: "Locataire, Douala", rating: 4, project: "Location d'un appartement", text: "Appartement trouvé en dix jours, conforme aux photos. Le dossier a été un peu long à constituer, mais tout était bien expliqué." },
];

export const stats = [
  { value: 12, suffix: " ans", label: "d'expérience au Cameroun" },
  { value: 850, suffix: "+", label: "biens vendus et loués" },
  { value: 320, suffix: "", label: "biens en gestion locative" },
  { value: 4.9, suffix: "/5", label: "note moyenne Google", decimals: 1 },
];

export const processSteps = [
  { n: "01", title: "Votre projet", text: "Un échange pour cerner vos critères, votre budget et votre calendrier. Gratuit et sans engagement." },
  { n: "02", title: "Sélection & visites", text: "Une présélection de biens vérifiés, visités sur place ou en vidéo, à votre rythme." },
  { n: "03", title: "Vérifications", text: "Titre foncier, bornage, identité du vendeur : notre service juridique contrôle tout avant la moindre offre." },
  { n: "04", title: "Signature & clés", text: "Négociation, acte chez le notaire, paiement sécurisé et remise des clés. Nous restons à vos côtés après." },
];

export const values = [
  { title: "Transparence", text: "Prix, honoraires et état des biens annoncés clairement, sans frais cachés." },
  { title: "Sécurité", text: "Aucun bien proposé sans vérification de la situation foncière." },
  { title: "Engagement", text: "Un conseiller dédié qui répond vite et vous accompagne jusqu'au bout." },
  { title: "Proximité", text: "Une connaissance fine de chaque quartier de Douala, Yaoundé et Kribi." },
];

export const team = [
  { name: "Samuel Ndjock", role: "Directeur & agent immobilier agréé", image: "/images/equipe-3.webp", phone: "+237 690 00 00 01" },
  { name: "Mireille Ekotto", role: "Responsable transactions & location", image: "/images/equipe-2.webp", phone: "+237 690 00 00 02" },
  { name: "Rodrigue Tchami", role: "Responsable gestion locative", image: "/images/equipe-1.webp", phone: "+237 690 00 00 03" },
];

export const districts = ["Bonapriso", "Bonanjo", "Akwa", "Bali", "Kotto", "Makepe", "Bonamoussadi", "Logpom", "Bastos", "Golf", "Odza", "Kribi"];

/* ------------------------------------------------------------------ */
/* Blog                                                                */
/* ------------------------------------------------------------------ */

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string; // ISO
  readingTime: string;
  category: string;
  image: string;
  imageAlt: string;
  body: ({ type: "p"; text: string } | { type: "h2"; text: string } | { type: "list"; items: string[] })[];
};

export const posts: Post[] = [
  {
    slug: "verifier-titre-foncier-avant-achat",
    title: "Titre foncier : 7 vérifications avant d'acheter un terrain au Cameroun",
    excerpt: "Double vente, terrain litigieux, faux titres : la liste des contrôles indispensables avant de verser le moindre franc.",
    date: "2026-10-02",
    readingTime: "6 min",
    category: "Juridique",
    image: "/images/terrain.webp",
    imageAlt: "Terrain dégagé au coucher du soleil",
    body: [
      { type: "p", text: "Le foncier est la première source de litiges immobiliers au Cameroun. Quelques vérifications simples permettent pourtant d'éviter la plupart des mauvaises surprises." },
      { type: "h2", text: "Les 7 contrôles indispensables" },
      { type: "list", items: ["Obtenir une copie du titre foncier et la vérifier au service des domaines", "Contrôler l'identité du vendeur et sa qualité de propriétaire", "Faire vérifier le bornage par un géomètre", "S'assurer qu'aucune opposition ni hypothèque n'est inscrite", "Vérifier le plan d'urbanisme de la zone", "Visiter le terrain et rencontrer les voisins", "Payer uniquement via le notaire"] },
      { type: "h2", text: "Le rôle du notaire" },
      { type: "p", text: "Le notaire authentifie la vente et sécurise les fonds. Ne versez jamais d'argent directement au vendeur avant la signature de l'acte." },
    ],
  },
  {
    slug: "acheter-depuis-la-diaspora",
    title: "Acheter au Cameroun depuis l'étranger : le guide de la diaspora",
    excerpt: "Visites vidéo, procuration, paiement sécurisé : les étapes pour investir au pays sans se faire arnaquer.",
    date: "2026-08-18",
    readingTime: "8 min",
    category: "Diaspora",
    image: "/images/poignee-de-main.webp",
    imageAlt: "Conseiller serrant la main d'un client",
    body: [
      { type: "p", text: "Chaque année, de nombreux membres de la diaspora perdent de l'argent dans des achats mal sécurisés. Voici comment investir sereinement." },
      { type: "h2", text: "1. Passer par un professionnel vérifiable" },
      { type: "list", items: ["Agence avec RCCM, NIU et agrément", "Biens visitables en vidéo en direct", "Mandat écrit et honoraires annoncés"] },
      { type: "h2", text: "2. Ne jamais payer en dehors du notaire" },
      { type: "p", text: "Les fonds doivent transiter par le compte du notaire. Méfiez-vous des demandes d'acompte en espèces ou par transfert à un particulier." },
      { type: "h2", text: "3. Signer par procuration" },
      { type: "p", text: "Une procuration notariée permet à un proche ou à votre conseiller de signer en votre nom, sans voyager." },
    ],
  },
  {
    slug: "investir-locatif-douala-2026",
    title: "Investir dans le locatif à Douala : quels quartiers rapportent le plus en 2026 ?",
    excerpt: "Rendements, demande locative, profils de locataires : notre analyse quartier par quartier.",
    date: "2026-06-05",
    readingTime: "5 min",
    category: "Investissement",
    image: "/images/immeuble-balcons.webp",
    imageAlt: "Immeuble résidentiel avec balcons",
    body: [
      { type: "p", text: "La demande locative reste très forte à Douala. Mais tous les quartiers ne se valent pas en termes de rendement et de risque." },
      { type: "h2", text: "Les quartiers premium" },
      { type: "p", text: "Bonapriso et Bonanjo attirent expatriés et cadres : loyers élevés, vacance faible, mais prix d'achat importants. Rendement brut constaté : 6 à 8 %." },
      { type: "h2", text: "Les quartiers en croissance" },
      { type: "list", items: ["Kotto et Logpom : forte demande des jeunes actifs", "Bonamoussadi : familles et classes moyennes", "Makepe : bon compromis prix / rendement"] },
      { type: "p", text: "Dans ces quartiers, les rendements bruts atteignent 8 à 11 % sur les appartements de 2 à 3 chambres." },
    ],
  },
];

export const generalFaq: Faq[] = [
  { q: "Quels sont vos honoraires ?", a: "Ils dépendent du service : 5 % pour une vente, un mois de loyer pour une location, à partir de 8 % des loyers pour la gestion. L'estimation est gratuite." },
  { q: "Comment vérifiez-vous les biens que vous proposez ?", a: "Chaque bien est visité par un conseiller et sa situation foncière est contrôlée (titre, bornage, identité du propriétaire) avant d'être mis en ligne." },
  { q: "Puis-je visiter un bien à distance ?", a: "Oui, nous organisons des visites vidéo en direct sur WhatsApp, idéales pour la diaspora." },
  { q: "Quels moyens de paiement acceptez-vous ?", a: "Virement bancaire, Orange Money et MTN Mobile Money. Pour un achat, les fonds transitent toujours par le notaire." },
];
