import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/clients";
import { toProperty, type Property } from "./property-model";

export * from "./property-model";

export const PROPERTIES_TAG = "properties";

/** Biens publiés, du plus récent au plus ancien. Mis en cache, invalidé à chaque publication. */
export async function getPublishedProperties(): Promise<Property[]> {
  "use cache";
  cacheTag(PROPERTIES_TAG);
  cacheLife("hours");
  const { data, error } = await createPublicClient()
    .from("properties")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (error) throw new Error(`Lecture des biens impossible : ${error.message}`);
  return (data ?? []).map(toProperty);
}

export async function getPublishedProperty(slug: string): Promise<Property | null> {
  const all = await getPublishedProperties();
  return all.find((p) => p.slug === slug) ?? null;
}

