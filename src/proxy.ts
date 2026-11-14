import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Rafraîchit la session Supabase et protège les espaces privés.
 * Ne s'exécute que sur les routes de compte (les pages publiques restent statiques).
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  // Rafraîchit le jeton si besoin puis le vérifie localement (clés asymétriques)
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims?.sub ?? null;
  const { pathname, search } = request.nextUrl;

  const isPrivate = pathname.startsWith("/espace") || pathname.startsWith("/admin");
  if (isPrivate && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/connexion";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  const isAuthPage = pathname === "/connexion" || pathname === "/inscription";
  if (isAuthPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/espace";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/espace/:path*", "/admin/:path*", "/connexion", "/inscription", "/auth/:path*"],
};
