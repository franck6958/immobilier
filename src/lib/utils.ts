import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(iso: string) {
  return new Date(iso + "T12:00:00Z").toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

const NBSP = String.fromCharCode(0xa0); // espace insécable classique
const NNBSP = String.fromCharCode(0x202f); // espace fine insécable (trop étroite avec certaines polices)

/** 1500 → « 1 500 » */
export function formatNumber(n: number, maxDecimals = 0) {
  return n.toLocaleString("fr-FR", { maximumFractionDigits: maxDecimals }).split(NNBSP).join(NBSP);
}

/** 485000000 → « 485 000 000 FCFA » */
export function formatPrice(n: number) {
  return `${formatNumber(n)}${NBSP}FCFA`;
}

/** Prix court pour les cartes : 485 M FCFA, 850 000 FCFA */
export function formatPriceShort(n: number) {
  if (n >= 1_000_000) {
    return `${formatNumber(n / 1_000_000, 1)}${NBSP}M${NBSP}FCFA`;
  }
  return formatPrice(n);
}
