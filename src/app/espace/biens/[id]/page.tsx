import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DashboardSkeleton } from "@/components/account/DashboardShell";
import { PropertyEditor } from "@/components/account/PropertyEditor";
import { StatusBadge } from "@/components/account/StatusBadge";
import { createClient, requireUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Modifier un bien" };

/** Page privée à identifiant dynamique : rendue à la demande (pas de pré-génération). */
export const instant = false;

async function EditProperty({ params }: { params: PageProps<"/espace/biens/[id]">["params"] }) {
  const { id } = await params;
  const user = await requireUser(`/espace/biens/${id}`);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const supabase = await createClient();
  const { data } = await supabase.from("properties").select("*").eq("id", id).eq("owner_id", user.id).maybeSingle();
  if (!data || data.status === "archived") notFound();
  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold">{data.title}</h1>
        <StatusBadge status={data.status} />
      </div>
      <PropertyEditor userId={user.id} area="owner" initial={data} />
    </>
  );
}

export default function EditPropertyPage(props: PageProps<"/espace/biens/[id]">) {
  return (
    <div className="space-y-6">
      <Suspense fallback={<DashboardSkeleton />}>
        <EditProperty params={props.params} />
      </Suspense>
    </div>
  );
}
