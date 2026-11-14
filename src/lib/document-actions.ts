"use server";

import { refresh, updateTag } from "next/cache";
import { createClient, requireAdmin, requireUser } from "@/lib/supabase/server";
import { DOCS_BUCKET } from "@/lib/data/documents";
import { PROPERTIES_TAG } from "@/lib/data/properties";
import {
  ACCOUNT_KINDS,
  ALL_KINDS,
  DOC_MIME,
  MAX_DOC_BYTES,
  REQUIRED_ACCOUNT_KINDS,
  type DocKind,
} from "@/lib/data/document-model";

export type DocActionResult = { ok: true } | { ok: false; error: string };
export type VerificationFormState = { status: "idle" | "error"; message?: string };

function str(fd: FormData, key: string, max = 200) {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}
const isUuid = (s: string) => /^[0-9a-f-]{36}$/i.test(s);

/**
 * Enregistre une pièce déjà envoyée dans le stockage privé (appelé par le navigateur après l'envoi).
 * Les règles RLS vérifient aussi que le fichier est dans le dossier de l'utilisateur et que le bien lui appartient.
 */
export async function registerDocument(input: {
  kind: string;
  path: string;
  fileName: string;
  mime: string;
  size: number;
  propertyId?: string | null;
}): Promise<DocActionResult> {
  const user = await requireUser("/espace");
  const supabase = await createClient();
  const kind = input.kind as DocKind;
  const propertyId = input.propertyId && isUuid(input.propertyId) ? input.propertyId : null;
  const cleanup = () => supabase.storage.from(DOCS_BUCKET).remove([input.path]);

  const valid =
    ALL_KINDS.includes(kind) &&
    input.path.startsWith(`${user.id}/`) &&
    !input.path.includes("..") &&
    DOC_MIME.includes(input.mime) &&
    input.size > 0 &&
    input.size <= MAX_DOC_BYTES &&
    (ACCOUNT_KINDS.includes(kind) ? !propertyId : kind === "autre" || !!propertyId);
  if (!valid) {
    await cleanup();
    return { ok: false, error: "Ce document n'est pas accepté (format JPG, PNG, WebP ou PDF, 10 Mo maximum)." };
  }

  const { error } = await supabase.from("documents").insert({
    owner_id: user.id,
    property_id: propertyId,
    kind,
    file_path: input.path,
    file_name: input.fileName.slice(0, 160),
    mime: input.mime,
    size: Math.round(input.size),
  });
  if (error) {
    console.error("[document] enregistrement", error.message);
    await cleanup();
    return { ok: false, error: "Le document n'a pas pu être enregistré. Réessayez dans un instant." };
  }
  refresh();
  return { ok: true };
}

/** Suppression d'une pièce (le propriétaire ne peut pas supprimer une pièce déjà validée). */
export async function deleteDocument(fd: FormData) {
  await requireUser("/espace");
  const id = str(fd, "id", 60);
  if (!isUuid(id)) return;
  const supabase = await createClient();
  const { data, error } = await supabase.from("documents").delete().eq("id", id).select("file_path");
  if (error) console.error("[document] suppression", error.message);
  const path = data?.[0]?.file_path;
  if (path) {
    const { error: rmErr } = await supabase.storage.from(DOCS_BUCKET).remove([path]);
    if (rmErr) console.error("[document] suppression fichier", rmErr.message);
  }
  refresh();
}

/** Le propriétaire demande la vérification de son compte. */
export async function requestVerification(_prev: VerificationFormState, _fd: FormData): Promise<VerificationFormState> {
  const user = await requireUser("/espace/verification");
  const supabase = await createClient();
  await supabase.from("profiles").update({ verification_status: "pending" }).eq("id", user.id);
  // Le déclencheur refuse silencieusement si les pièces obligatoires manquent : on relit pour le savoir
  const { data } = await supabase.from("profiles").select("verification_status").eq("id", user.id).single();
  if (data?.verification_status !== "pending" && data?.verification_status !== "verified") {
    return { status: "error", message: "Ajoutez le recto et le verso de votre pièce d'identité avant d'envoyer la demande." };
  }
  refresh();
  return { status: "idle" };
}

/** Admin : valider ou refuser une pièce. */
export async function reviewDocument(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id", 60);
  const status = str(fd, "status", 20);
  if (!isUuid(id) || !["approved", "rejected", "pending"].includes(status)) return;
  const note = str(fd, "admin_note", 500);
  const supabase = await createClient();
  const { error } = await supabase
    .from("documents")
    .update({
      status,
      admin_note: status === "rejected" ? note || "Document illisible ou non conforme. Merci d'en envoyer un nouveau." : null,
    })
    .eq("id", id);
  if (error) console.error("[document] examen", error.message);
  refresh();
}

/** Admin : statut de vérification d'un compte. */
export async function setAccountVerification(_prev: VerificationFormState, fd: FormData): Promise<VerificationFormState> {
  await requireAdmin();
  const id = str(fd, "id", 60);
  const status = str(fd, "status", 20);
  if (!isUuid(id) || !["verified", "rejected", "unverified"].includes(status)) return { status: "error", message: "Action invalide." };
  const supabase = await createClient();

  if (status === "verified") {
    const { data: docs } = await supabase.from("documents").select("kind, status").eq("owner_id", id).is("property_id", null);
    const ok = REQUIRED_ACCOUNT_KINDS.every((k) => (docs ?? []).some((d) => d.kind === k && d.status === "approved"));
    if (!ok) return { status: "error", message: "Validez d'abord le recto et le verso de la pièce d'identité." };
  }

  const note = str(fd, "note", 500);
  const { error } = await supabase
    .from("profiles")
    .update({
      verification_status: status,
      verification_note: status === "rejected" ? note || "Pièces d'identité non conformes." : null,
    })
    .eq("id", id);
  if (error) {
    console.error("[compte] vérification", error.message);
    return { status: "error", message: "La mise à jour a échoué. Réessayez." };
  }
  updateTag(PROPERTIES_TAG);
  refresh();
  return { status: "idle" };
}
