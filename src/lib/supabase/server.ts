import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { cache } from "react";
import type { Database, ProfileRow } from "./database.types";
import { SUPABASE_KEY, SUPABASE_URL } from "./clients";

/** Client Supabase lié à la session du visiteur (cookies). À n'utiliser que derrière un <Suspense> ou dans une action. */
export async function createClient() {
  // Toujours à la requête : Supabase lit l'heure pour vérifier la session, ce qui est interdit pendant un pré-rendu.
  await connection();
  const cookieStore = await cookies();
  return createServerClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet) => {
        try {
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Appelé depuis un Server Component : le proxy se charge de rafraîchir la session.
        }
      },
    },
  });
}

export type SessionUser = Pick<ProfileRow, "id" | "email" | "full_name" | "phone" | "role">;

/** Utilisateur connecté + profil, ou null (mémorisé pour la durée d'une requête). */
export const getSessionUser = cache(async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createClient();
  // getClaims vérifie la signature du jeton localement (clés asymétriques) : pas d'aller-retour réseau
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, phone, role")
    .eq("id", claims.sub)
    .single();
  return profile ?? { id: claims.sub, email: (claims.email as string) ?? "", full_name: "", phone: "", role: "owner" };
});

/** Exige un utilisateur connecté, sinon redirige vers la connexion. */
export async function requireUser(next = "/espace") {
  const user = await getSessionUser();
  if (!user) redirect(`/connexion?next=${encodeURIComponent(next)}`);
  return user;
}

/** Exige un administrateur. */
export async function requireAdmin() {
  const user = await requireUser("/admin");
  if (user.role !== "admin") redirect("/espace?refus=admin");
  return user;
}
