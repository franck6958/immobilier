import type { Metadata } from "next";
import { Suspense } from "react";
import { DashboardSkeleton } from "@/components/account/DashboardShell";
import { PropertyEditor } from "@/components/account/PropertyEditor";
import { requireAdmin } from "@/lib/supabase/server";
import { team } from "@/lib/content";

export const metadata: Metadata = { title: "Ajouter un bien" };

async function NewAdminProperty() {
  const user = await requireAdmin();
  return <PropertyEditor userId={user.id} area="admin" agents={team.map((t) => t.name)} initial={{ status: "published" }} />;
}

export default function NewAdminPropertyPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Ajouter un bien</h1>
      <Suspense fallback={<DashboardSkeleton />}>
        <NewAdminProperty />
      </Suspense>
    </div>
  );
}
