import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DashboardSkeleton } from "@/components/account/DashboardShell";
import { PropertyEditor } from "@/components/account/PropertyEditor";
import { StatusBadge } from "@/components/account/StatusBadge";
import { ModerationActions } from "@/components/admin/ModerationActions";
import { DocumentReview } from "@/components/admin/DocumentReview";
import { VerificationBadge } from "@/components/account/VerificationBadge";
import { getPropertyDocuments } from "@/lib/data/documents";
import { ownershipLabels, ownershipState, publishBlockers } from "@/lib/data/document-model";
import { cn } from "@/lib/utils";
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
  const [{ data }, docs] = await Promise.all([
    supabase.from("properties").select("*, owner:profiles(id, full_name, email, phone, role, verification_status)").eq("id", id).maybeSingle(),
    getPropertyDocuments(supabase, id),
  ]);
  if (!data) notFound();
  const owner = data.owner as { id: string; full_name: string; email: string; phone: string; role: string; verification_status: string } | null;
  const proof = ownershipState(docs);
  const blockers = publishBlockers(owner, docs);
  const ownerIsClient = owner && owner.role !== "admin";
  return (
    <>
      <div className="space-y-4 rounded-3xl bg-white p-6 ring-1 ring-line">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold md:text-3xl">{data.title}</h1>
          <StatusBadge status={data.status} />
          <span className="text-sm text-muted">Réf. {data.ref}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
          Propriétaire :{" "}
          {ownerIsClient ? (
            <>
              <Link href={`/admin/utilisateurs/${owner.id}`} className="font-semibold text-ink hover:underline">{owner.full_name || owner.email}</Link>
              · {owner.email} {owner.phone && <>· {owner.phone}</>}
              <VerificationBadge status={owner.verification_status} />
            </>
          ) : (
            <strong className="text-ink">Agence</strong>
          )}
        </div>
        <ModerationActions id={data.id} status={data.status} slug={data.slug} title={data.title} publishBlockers={blockers} />
      </div>

      {ownerIsClient && (
        <section id="documents" aria-labelledby="docs-title" className="scroll-mt-28 space-y-4 rounded-3xl bg-white p-6 ring-1 ring-line">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="docs-title" className="text-xl font-bold">Justificatifs de propriété</h2>
            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs font-bold",
                proof === "approved" && "bg-success/10 text-success",
                proof === "pending" && "bg-amber-100 text-amber-900",
                (proof === "missing" || proof === "rejected") && "bg-danger/10 text-danger",
              )}
            >
              {ownershipLabels[proof]}
            </span>
          </div>
          <p className="text-sm text-muted">
            Vérifiez que le nom sur le document correspond à la pièce d&apos;identité du propriétaire (ou qu&apos;une procuration est jointe),
            et que la localisation correspond à l&apos;annonce.
          </p>
          <DocumentReview docs={docs} empty="Le propriétaire n'a encore envoyé aucun justificatif pour ce bien." />
        </section>
      )}
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
