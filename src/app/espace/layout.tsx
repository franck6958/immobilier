import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DashboardShell } from "@/components/account/DashboardShell";
import type { NavItem } from "@/components/account/DashboardNav";

export const metadata: Metadata = {
  title: { default: "Espace propriétaire", template: "%s | Espace propriétaire" },
  robots: { index: false, follow: false },
};

const nav: NavItem[] = [
  { href: "/espace", label: "Mes biens", icon: "Home", exact: true },
  { href: "/espace/biens/nouveau", label: "Déposer un bien", icon: "PlusCircle" },
  { href: "/espace/verification", label: "Vérification", icon: "ShieldCheck" },
  { href: "/espace/profil", label: "Mon profil", icon: "UserRound" },
  { href: "/espace/mot-de-passe", label: "Mot de passe", icon: "KeyRound" },
];

export default function EspaceLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell area="owner" nav={nav}>
      {children}
    </DashboardShell>
  );
}
