import type { Metadata } from "next";
import { Suspense } from "react";
import { DashboardSkeleton } from "@/components/account/DashboardShell";
import { LeadsBoard } from "@/components/admin/LeadsBoard";

export const metadata: Metadata = { title: "Demandes de projet" };

async function Board({ searchParams }: { searchParams: PageProps<"/admin/demandes">["searchParams"] }) {
  const sp = await searchParams;
  return (
    <LeadsBoard
      kind="projet"
      basePath="/admin/demandes"
      title="Demandes de projet"
      intro="Formulaire « Votre projet » : achat, location, vente, gestion locative, investissement."
      statut={sp.statut}
    />
  );
}

export default function AdminDemandesPage(props: PageProps<"/admin/demandes">) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Board searchParams={props.searchParams} />
    </Suspense>
  );
}
