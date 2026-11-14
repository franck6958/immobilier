import type { PropertyRow } from "@/lib/supabase/database.types";

/* Types et constantes des biens — utilisables côté serveur ET navigateur. */

export type Transaction = "Vente" | "Location";
export type PropertyType = "Villa" | "Appartement" | "Maison" | "Terrain" | "Bureau";
export type PropertyBadge = "Exclusivité" | "Nouveau" | "Coup de cœur" | "Sous compromis";
export type PropertyStatus = "pending" | "published" | "rejected" | "archived";

export const propertyTypes: PropertyType[] = ["Villa", "Appartement", "Maison", "Terrain", "Bureau"];
export const transactions: Transaction[] = ["Vente", "Location"];
export const badges: PropertyBadge[] = ["Exclusivité", "Nouveau", "Coup de cœur", "Sous compromis"];
export const cities = ["Douala", "Yaoundé", "Kribi", "Limbé", "Buea"];

export const statusLabels: Record<PropertyStatus, string> = {
  pending: "En attente de validation",
  published: "Publié",
  rejected: "Refusé",
  archived: "Archivé",
};

export type Property = {
  id: string;
  slug: string;
  ref: string;
  status: PropertyStatus;
  title: string;
  transaction: Transaction;
  type: PropertyType;
  city: string;
  district: string;
  price: number;
  surface: number;
  land?: number;
  bedrooms?: number;
  bathrooms?: number;
  furnished?: boolean;
  badge?: PropertyBadge;
  images: string[];
  imageAlt: string;
  summary: string;
  description: string[];
  features: string[];
  agent: number;
  ownerId: string | null;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
};

const PLACEHOLDER_IMAGE = "/images/cles-maison.webp";

export function toProperty(r: PropertyRow): Property {
  return {
    id: r.id,
    slug: r.slug,
    ref: r.ref,
    status: r.status as PropertyStatus,
    title: r.title,
    transaction: r.transaction as Transaction,
    type: r.type as PropertyType,
    city: r.city,
    district: r.district,
    price: Number(r.price),
    surface: r.surface,
    land: r.land ?? undefined,
    bedrooms: r.bedrooms ?? undefined,
    bathrooms: r.bathrooms ?? undefined,
    furnished: r.furnished,
    badge: (r.badge as PropertyBadge | null) ?? undefined,
    images: r.images.length ? r.images : [PLACEHOLDER_IMAGE],
    imageAlt: r.image_alt || `${r.type} ${r.transaction === "Vente" ? "à vendre" : "à louer"} à ${r.district || r.city}`,
    summary: r.summary,
    description: r.description.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean),
    features: r.features,
    agent: r.agent,
    ownerId: r.owner_id,
    adminNote: r.admin_note,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

/** "Villa avec piscine" → "villa-avec-piscine-x7k2" */
export function makeSlug(title: string) {
  const base = title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${base || "bien"}-${Math.random().toString(36).slice(2, 6)}`;
}
