import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, DocumentRow } from "@/lib/supabase/database.types";
import type { DocItem, DocKind, DocStatus } from "./document-model";

export const DOCS_BUCKET = "owner-documents";
/** Les liens vers les pièces expirent rapidement : ce sont des documents d'identité. */
const SIGNED_TTL = 60 * 10;

/** Transforme les lignes en documents affichables, avec un lien signé temporaire par fichier. */
export async function withSignedUrls(supabase: SupabaseClient<Database>, rows: DocumentRow[]): Promise<DocItem[]> {
  if (!rows.length) return [];
  const { data } = await supabase.storage.from(DOCS_BUCKET).createSignedUrls(rows.map((r) => r.file_path), SIGNED_TTL);
  const urls = new Map((data ?? []).map((s) => [s.path, s.signedUrl]));
  return rows.map((r) => ({
    id: r.id,
    kind: r.kind as DocKind,
    propertyId: r.property_id,
    fileName: r.file_name,
    mime: r.mime,
    size: r.size,
    status: r.status as DocStatus,
    adminNote: r.admin_note,
    createdAt: r.created_at,
    url: urls.get(r.file_path) ?? null,
  }));
}

/** Pièces du compte d'un utilisateur. */
export async function getAccountDocuments(supabase: SupabaseClient<Database>, ownerId: string) {
  const { data } = await supabase
    .from("documents")
    .select("*")
    .eq("owner_id", ownerId)
    .is("property_id", null)
    .order("created_at", { ascending: false });
  return withSignedUrls(supabase, data ?? []);
}

/** Pièces d'un bien. */
export async function getPropertyDocuments(supabase: SupabaseClient<Database>, propertyId: string) {
  const { data } = await supabase
    .from("documents")
    .select("*")
    .eq("property_id", propertyId)
    .order("created_at", { ascending: false });
  return withSignedUrls(supabase, data ?? []);
}
