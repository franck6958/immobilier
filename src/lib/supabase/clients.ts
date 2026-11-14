import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

/**
 * Client « public » sans session ni cookies.
 * Utilisé pour les lectures mises en cache (biens publiés) et l'envoi des formulaires.
 * Les règles RLS limitent ce client aux données publiques.
 */
export function createPublicClient() {
  return createSupabaseClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Origine publique d'une image du stockage Supabase (pour next/image). */
export const STORAGE_HOST = new URL(SUPABASE_URL).hostname;
