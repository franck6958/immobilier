import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { ExternalLink, LogOut } from "lucide-react";
import { signOut } from "@/lib/auth-actions";
import { getSessionUser } from "@/lib/supabase/server";
import { DashboardNav, type NavItem } from "./DashboardNav";

async function Greeting({ area }: { area: "owner" | "admin" }) {
  const user = await getSessionUser();
  const first = user?.full_name?.split(" ")[0] || user?.email || "";
  return (
    <>
      <p className="text-paper/70">{area === "admin" ? "Administration" : "Espace propriétaire"}</p>
      <p className="mt-1 text-2xl font-bold md:text-3xl">Bonjour {first}</p>
      {area === "owner" && user?.role === "admin" && (
        <Link href="/admin" className="mt-3 inline-flex text-sm font-semibold text-accent underline-offset-4 hover:underline">
          Aller au tableau de bord admin →
        </Link>
      )}
    </>
  );
}

/** Cadre des espaces connectés : bandeau, navigation latérale et contenu. */
export function DashboardShell({ area, nav, children }: { area: "owner" | "admin"; nav: NavItem[]; children: ReactNode }) {
  return (
    <div className="min-h-[100svh] bg-sand">
      <div className="dark-section bg-ink pb-10 pt-28 text-paper md:pt-32">
        <div className="container-x flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Suspense fallback={<div className="h-16" />}>
              <Greeting area={area} />
            </Suspense>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 px-4 text-sm font-semibold transition-colors hover:bg-white hover:text-ink">
              <ExternalLink className="size-4" aria-hidden /> Voir le site
            </Link>
            <form action={signOut}>
              <button type="submit" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white/10 px-4 text-sm font-semibold transition-colors hover:bg-white hover:text-ink">
                <LogOut className="size-4" aria-hidden /> Déconnexion
              </button>
            </form>
          </div>
        </div>
      </div>
      <div className="container-x grid grid-cols-1 gap-8 py-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:py-12">
        <DashboardNav items={nav} />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}

/** Squelette de chargement pour le contenu des espaces. */
export function DashboardSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Chargement">
      <div className="h-10 w-64 animate-pulse rounded-xl bg-white" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-28 animate-pulse rounded-3xl bg-white" />
      ))}
    </div>
  );
}
