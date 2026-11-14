import "server-only";
import { site } from "@/lib/site";

/**
 * Alerte WhatsApp envoyée à l'agence à chaque nouveau message / demande.
 * Service : CallMeBot (gratuit, pour recevoir des notifications sur son propre numéro).
 * Activation : voir README (« Notifications WhatsApp »). Sans CALLMEBOT_APIKEY, rien n'est envoyé.
 * Ne bloque jamais le formulaire : en cas d'échec, l'erreur est seulement journalisée.
 */
export async function notifyWhatsApp(text: string) {
  const apikey = process.env.CALLMEBOT_APIKEY;
  if (!apikey) return false;
  const phone = process.env.WHATSAPP_NOTIFY_PHONE ?? site.contact.whatsapp;
  const url =
    `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}` +
    `&text=${encodeURIComponent(text.slice(0, 1500))}&apikey=${encodeURIComponent(apikey)}`;
  try {
    const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(8000) });
    if (!res.ok) console.error("[whatsapp] échec de la notification", res.status);
    return res.ok;
  } catch (err) {
    console.error("[whatsapp] notification impossible", err);
    return false;
  }
}

/** Lien direct vers la rubrique du tableau de bord. */
export function adminLink(path: string) {
  // Adresse réelle du site : variable explicite, sinon domaine de production fourni par Vercel
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? (vercel ? `https://${vercel}` : site.url);
  return `${base.replace(/\/$/, "")}${path}`;
}
