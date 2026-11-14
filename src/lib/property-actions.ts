"use server";

import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, requireAdmin, requireUser } from "@/lib/supabase/server";
import { SUPABASE_URL } from "@/lib/supabase/clients";
import {
  badges,
  makeSlug,
  propertyTypes,
  transactions,
  type PropertyStatus,
} from "@/lib/data/property-model";
import { PROPERTIES_TAG } from "@/lib/data/properties";
import { DOCS_BUCKET } from "@/lib/data/documents";
import type { Database } from "@/lib/supabase/database.types";

export type PropertyFormState = {
  status: "idle" | "error";
  message?: string;
  errors?: Record<string, string>;
  /** Valeurs saisies, renvoyées pour ne rien perdre en cas d'erreur */
  values?: Record<string, string>;
};

type PropertyInsert = Database["public"]["Tables"]["properties"]["Insert"];

const STORAGE_PREFIX = `${SUPABASE_URL}/storage/v1/object/public/property-images/`;
const STATUSES: PropertyStatus[] = ["pending", "published", "rejected", "archived"];

/** Messages des règles de publication appliquées par la base. */
function verificationError(message: string) {
  if (message.includes("VERIF_COMPTE")) return "Publication impossible : le compte du propriétaire n'est pas encore vérifié (pièce d'identité).";
  if (message.includes("VERIF_PROPRIETE")) return "Publication impossible : aucun justificatif de propriété (titre foncier, acte de vente ou certificat) n'a été validé pour ce bien.";
  return null;
}

function str(fd: FormData, key: string, max = 200) {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}
function int(fd: FormData, key: string) {
  const raw = str(fd, key, 20).replace(/[\s  .]/g, "");
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? Math.round(n) : NaN;
}

/** Création / modification d'un bien (propriétaire ou admin). */
export async function saveProperty(_prev: PropertyFormState, fd: FormData): Promise<PropertyFormState> {
  const user = await requireUser("/espace");
  const isAdmin = user.role === "admin";
  const id = str(fd, "id", 60);

  const title = str(fd, "title", 120);
  const transaction = str(fd, "transaction", 20);
  const type = str(fd, "type", 20);
  const city = str(fd, "city", 80);
  const district = str(fd, "district", 80);
  const price = int(fd, "price");
  const surface = int(fd, "surface");
  const land = int(fd, "land");
  const bedrooms = int(fd, "bedrooms");
  const bathrooms = int(fd, "bathrooms");
  const summary = str(fd, "summary", 220);
  const description = str(fd, "description", 5000);
  const features = str(fd, "features", 2000)
    .split(/[\n,]/)
    .map((f) => f.trim())
    .filter(Boolean)
    .slice(0, 20);
  let images: string[] = [];
  try {
    const parsed = JSON.parse(str(fd, "images", 20000) || "[]");
    if (Array.isArray(parsed)) images = parsed.filter((u): u is string => typeof u === "string");
  } catch {
    /* ignoré : validé plus bas */
  }
  images = images.filter((u) => u.startsWith(STORAGE_PREFIX) || /^\/images\/[a-z0-9-]+\.webp$/.test(u)).slice(0, 12);

  const errors: Record<string, string> = {};
  if (title.length < 3) errors.title = "Donnez un titre à votre annonce (3 caractères minimum).";
  if (!transactions.includes(transaction as never)) errors.transaction = "Choisissez vente ou location.";
  if (!propertyTypes.includes(type as never)) errors.type = "Choisissez le type de bien.";
  if (city.length < 2) errors.city = "Indiquez la ville.";
  if (price === null || Number.isNaN(price) || price <= 0) errors.price = "Indiquez un prix en FCFA (chiffres uniquement).";
  if (surface === null || Number.isNaN(surface) || surface <= 0) errors.surface = "Indiquez la surface en m².";
  if (land !== null && (Number.isNaN(land) || land <= 0)) errors.land = "Surface de terrain invalide.";
  if (bedrooms !== null && (Number.isNaN(bedrooms) || bedrooms < 0 || bedrooms > 50)) errors.bedrooms = "Nombre invalide.";
  if (bathrooms !== null && (Number.isNaN(bathrooms) || bathrooms < 0 || bathrooms > 50)) errors.bathrooms = "Nombre invalide.";
  if (summary.length < 10) errors.summary = "Résumez le bien en une phrase (10 caractères minimum).";
  if (images.length === 0) errors.images = "Ajoutez au moins une photo.";
  const values: Record<string, string> = {};
  for (const k of ["title", "type", "city", "district", "price", "surface", "land", "bedrooms", "bathrooms", "summary", "description", "features", "image_alt", "status", "badge", "agent", "admin_note"]) {
    values[k] = str(fd, k, 5000);
  }
  values.furnished = fd.get("furnished") === "on" ? "on" : "";
  if (Object.keys(errors).length) return { status: "error", message: "Merci de corriger les champs signalés.", errors, values };

  const row: Omit<PropertyInsert, "slug" | "ref"> = {
    title,
    transaction,
    type,
    city,
    district,
    price: price!,
    surface: surface!,
    land,
    bedrooms,
    bathrooms,
    furnished: fd.get("furnished") === "on",
    summary,
    description,
    features,
    images,
    image_alt: str(fd, "image_alt", 160),
  };

  if (isAdmin) {
    const status = str(fd, "status", 20) as PropertyStatus;
    const badge = str(fd, "badge", 30);
    const agent = int(fd, "agent");
    Object.assign(row, {
      status: STATUSES.includes(status) ? status : "pending",
      badge: badges.includes(badge as never) ? badge : null,
      agent: agent !== null && !Number.isNaN(agent) ? Math.max(0, Math.min(10, agent)) : 0,
      admin_note: str(fd, "admin_note", 500) || null,
    });
  }

  const supabase = await createClient();
  const { data: saved, error } = id
    ? await supabase.from("properties").update(row).eq("id", id).select("id").single()
    : await supabase.from("properties").insert({ ...row, slug: makeSlug(title), ref: "" }).select("id").single();

  if (error || !saved) {
    console.error("[bien] enregistrement", error?.message);
    const message = (error && verificationError(error.message)) || "L'enregistrement a échoué. Réessayez dans un instant.";
    return { status: "error", message, values };
  }

  updateTag(PROPERTIES_TAG);
  if (isAdmin && str(fd, "area", 10) === "admin") redirect("/admin/biens?ok=enregistre");
  // Nouveau bien : on emmène le propriétaire vers l'envoi des justificatifs de propriété
  redirect(id ? "/espace?ok=envoye" : `/espace/biens/${saved.id}?ok=cree#documents`);
}

/** Suppression : le propriétaire ne peut supprimer qu'un bien non publié (règle RLS). */
export async function deleteProperty(fd: FormData) {
  const user = await requireUser("/espace");
  const id = str(fd, "id", 60);
  const supabase = await createClient();
  const { data: docs } = await supabase.from("documents").select("file_path").eq("property_id", id);
  const { data: deleted, error } = await supabase.from("properties").delete().eq("id", id).select("images");
  if (deleted?.length && docs?.length) {
    const { error: docErr } = await supabase.storage.from(DOCS_BUCKET).remove(docs.map((d) => d.file_path));
    if (docErr) console.error("[bien] suppression justificatifs", docErr.message);
  }
  if (error) console.error("[bien] suppression", error.message);
  // Efface aussi les photos envoyées (les images d'exemple du dossier /images restent intactes)
  const paths = (deleted?.[0]?.images ?? [])
    .filter((u) => u.startsWith(STORAGE_PREFIX))
    .map((u) => decodeURIComponent(u.slice(STORAGE_PREFIX.length)));
  if (paths.length) {
    const { error: rmErr } = await supabase.storage.from("property-images").remove(paths);
    if (rmErr) console.error("[bien] suppression photos", rmErr.message);
  }
  updateTag(PROPERTIES_TAG);
  redirect(user.role === "admin" && str(fd, "area", 10) === "admin" ? "/admin/biens?ok=supprime" : "/espace?ok=supprime");
}

/** Modération (admin) : publier, refuser avec motif, archiver, remettre en attente. */
export type StatusFormState = { error?: string };

export async function setPropertyStatus(_prev: StatusFormState, fd: FormData): Promise<StatusFormState> {
  await requireAdmin();
  const id = str(fd, "id", 60);
  const status = str(fd, "status", 20) as PropertyStatus;
  if (!STATUSES.includes(status)) return { error: "Action invalide." };
  const note = str(fd, "admin_note", 500);
  const supabase = await createClient();
  const patch: Database["public"]["Tables"]["properties"]["Update"] = { status };
  if (status === "rejected") patch.admin_note = note || "Annonce incomplète : contactez l'agence pour plus de détails.";
  if (status === "published") patch.admin_note = null;
  const { error } = await supabase.from("properties").update(patch).eq("id", id);
  if (error) {
    console.error("[bien] statut", error.message);
    return { error: verificationError(error.message) ?? "La mise à jour a échoué. Réessayez." };
  }
  updateTag(PROPERTIES_TAG);
  refresh();
  return {};
}
