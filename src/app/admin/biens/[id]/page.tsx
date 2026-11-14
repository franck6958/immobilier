import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DashboardSkeleton } from "@/components/account/DashboardShell";
import { PropertyEditor } from "@/components/account/PropertyEditor";
import { StatusBadge } from "@/components/account/StatusBadge";
import { ModerationActions } from "@/components/admin/ModerationActions";
import { createClient, requireAdmin } from "@/lib/supabase/server";
import { team } from "@/lib/content";

export const metadata: Metadata = { title: "Modifier un bien" };

/** Page privée à identifiant dynamique : rendue à la demande (pas de pré-génération). */
export const instant = false;

async function EditAdminProperty({ params }: { params: PageProps<"/admin/biens/[id]">["params"] }) {
  const user = await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const supabase = await createClient();
  const { data } = await supabase.from("properties").select("*, owner:profiles(full_name, email, phone)").eq("id", id).maybeSingle();
  if (!data) notFound();
  const owner = data.owner as { full_name: string; email: string; phone: string } | null;
  return (
    <>
      <div className="space-y-4 rounded-3xl bg-white p-6 ring-1 ring-line">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold md:text-3xl">{data.title}</h1>
          <StatusBadge status={data.status} />
          <span className="text-sm text-muted">Réf. {data.ref}</span>
        </div>
        <p className="text-sm text-muted">
          Propriétaire : {owner ? <><strong className="text-ink">{owner.full_name}</strong> · {owner.email} · {owner.phone}</> : <strong className="text-ink">Agence</strong>}
        </p>
        <ModerationActions id={data.id} status={data.status} slug={data.slug} title={data.title} />
      </div>
      <PropertyEditor userId={user.id} area="admin" agents={team.map((t) => t.name)} initial={data} />
    </>
  );
}

export default function EditAdminPropertyPage(props: PageProps<"/admin/biens/[id]">) {
  return (
    <div className="space-y-6">
      <Suspense fallback={<DashboardSkeleton />}>
        <EditAdminProperty params={props.params} />
      </Suspense>
    </div>
  );
}
