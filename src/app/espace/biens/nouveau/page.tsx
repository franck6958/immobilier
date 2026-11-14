import type { Metadata } from "next";
import { Suspense } from "react";
import { DashboardSkeleton } from "@/components/account/DashboardShell";
import { PropertyEditor } from "@/components/account/PropertyEditor";
import { requireUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Déposer un bien" };

async function NewProperty() {
  const user = await requireUser("/espace/biens/nouveau");
  return <PropertyEditor userId={user.id} area="owner" />;
}

export default function NewPropertyPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Déposer un bien</h1>
      <p className="max-w-2xl text-muted">
        Remplissez l&apos;annonce puis, à l&apos;étape suivante, ajoutez un justificatif de propriété (titre foncier, acte de vente ou
        certificat). L&apos;agence vérifie ces documents et votre identité avant de publier.
      </p>
      <Suspense fallback={<DashboardSkeleton />}>
        <NewProperty />
      </Suspense>
    </div>
  );
}
