/**
 * ============================================================
 *  CONFIGURATION CENTRALE DU SITE
 *  Toutes les informations de l'agence sont ici.
 *  Pour adapter le site à un nouveau client, modifiez ce fichier
 *  (et src/lib/content.ts pour les biens, services, avis, articles).
 * ============================================================
 */

export const site = {
  name: "Ébène Immobilier",
  shortName: "Ébène",
  brandLine: "Immobilier",
  legalName: "Ébène Immobilier SARL",
  tagline: "Le bon bien. Au juste prix.",
  description:
    "Agence immobilière à Douala : achat, vente, location et gestion locative de villas, appartements, terrains et bureaux. Biens vérifiés, titres fonciers contrôlés, accompagnement jusqu'au notaire.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.ebene-immobilier.cm",
  locale: "fr_CM",
  foundingYear: 2013,

  contact: {
    phone: "+237 690 00 00 00",
    phoneHref: "tel:+237690000000",
    whatsapp: "237659715681", // +237 659 71 56 81 — format international sans "+" ni espaces
    whatsappMessage: "Bonjour Ébène Immobilier, je souhaite des informations pour un projet immobilier.",
    email: "contact@ebene-immobilier.cm",
  },

  address: {
    street: "Rue Njo-Njo, Bonapriso",
    city: "Douala",
    region: "Littoral",
    country: "Cameroun",
    countryCode: "CM",
    postalCode: "BP 0000",
    geo: { lat: 4.0275, lng: 9.6962 },
    mapsQuery: "Bonapriso, Douala, Cameroun",
  },

  hours: [
    { days: "Lundi – Vendredi", time: "08:30 – 18:30", schema: "Mo-Fr 08:30-18:30" },
    { days: "Samedi", time: "09:00 – 14:00", schema: "Sa 09:00-14:00" },
    { days: "Dimanche", time: "Visites sur rendez-vous", schema: "" },
  ],

  areaServed: ["Douala", "Yaoundé", "Kribi", "Limbé", "Buea"],

  social: {
    facebook: "https://www.facebook.com/",
    instagram: "https://www.instagram.com/",
    linkedin: "https://www.linkedin.com/",
    youtube: "https://www.youtube.com/",
  },

  rating: { value: 4.9, count: 214 },

  legal: {
    rccm: "RC/DLA/2013/B/0000",
    niu: "M000000000000X",
    capital: "10 000 000 FCFA",
    license: "Agrément d'agent immobilier n° 000/MINHDU (à compléter)",
    director: "Directeur de la publication : M. Samuel Ndjock",
    host: "Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis",
  },
} as const;

export const nav = [
  { href: "/", label: "Accueil" },
  { href: "/biens", label: "Nos biens" },
  { href: "/services", label: "Services" },
  { href: "/a-propos", label: "L'agence" },
  { href: "/temoignages", label: "Avis" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
] as const;

export const whatsappLink = (message: string = site.contact.whatsappMessage) =>
  `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(message)}`;

export const mapsDirectionsLink = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  site.address.mapsQuery,
)}`;

export const mapsEmbedSrc = `https://www.google.com/maps?q=${encodeURIComponent(
  site.address.mapsQuery,
)}&z=15&output=embed`;
