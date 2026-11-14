import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { DashboardShell, DashboardSkeleton } from "@/components/account/DashboardShell";
import type { NavItem } from "@/components/account/DashboardNav";
import { requireAdmin } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: { default: "Administration", template: "%s | Administration" },
  robots: { index: false, follow: false },
};

const nav: NavItem[] = [
  { href: "/admin", label: "Tableau de bord", icon: "LayoutDashboard", exact: true },
  { href: "/admin/biens", label: "Biens", icon: "Building2" },
  { href: "/admin/verifications", label: "Vérifications", icon: "ShieldCheck" },
  { href: "/admin/demandes", label: "Demandes", icon: "Inbox" },
  { href: "/admin/utilisateurs", label: "Utilisateurs", icon: "Users" },
  { href: "/espace", label: "Mon espace", icon: "UserRound", exact: true },
];

/** Vérifie le rôle admin avant d'afficher quoi que ce soit (les règles RLS protègent aussi les données). */
async function AdminGate({ children }: { children: ReactNode }) {
  await requireAdmin();
  return <>{children}</>;
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell area="admin" nav={nav}>
      <Suspense fallback={<DashboardSkeleton />}>
        <AdminGate>{children}</AdminGate>
      </Suspense>
    </DashboardShell>
  );
}
