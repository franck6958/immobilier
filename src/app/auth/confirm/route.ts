import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Point d'arrivée des liens envoyés par e-mail (confirmation d'inscription, mot de passe oublié).
 * Gère les deux formats de lien Supabase : `?code=` (PKCE) et `?token_hash=&type=`.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const rawNext = searchParams.get("next") ?? "/espace";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/espace";

  const supabase = await createClient();
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  let ok = false;
  if (code) {
    ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
  } else if (tokenHash && type) {
    ok = !(await supabase.auth.verifyOtp({ token_hash: tokenHash, type })).error;
  }

  const url = request.nextUrl.clone();
  url.search = "";
  if (ok) {
    url.pathname = next;
    if (next === "/espace") url.searchParams.set("bienvenue", "1");
  } else {
    url.pathname = "/connexion";
    url.searchParams.set("erreur", "lien");
  }
  return NextResponse.redirect(url);
}
