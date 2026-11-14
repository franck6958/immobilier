import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CircleCheck, Lock, ShieldAlert } from "lucide-react";
import { DashboardSkeleton } from "@/components/account/DashboardShell";
import { DocumentUploader } from "@/components/account/DocumentUploader";
import { PropertyEditor } from "@/components/account/PropertyEditor";
import { StatusBadge } from "@/components/account/StatusBadge";
import { createClient, requireUser } from "@/lib/supabase/server";
import { getPropertyDocuments } from "@/lib/data/documents";
import { ownershipLabels, ownershipState, propertySlots } from "@/lib/data/document-model";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Modifier un bien" };

/** Page privée à identifiant dynamique : rendue à la demande (pas de pré-génération). */
export const instant = false;

async function EditProperty({
  params,
  searchParams,
}: {
  params: PageProps<"/espace/biens/[id]">["params"];
  searchParams: PageProps<"/espace/biens/[id]">["searchParams"];
}) {
  const { id } = await params;
  const sp = await searchParams;
  const user = await requireUser(`/espace/biens/${id}`);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const supabase = await createClient();
  const [{ data }, { data: profile }, docs] = await Promise.all([
    supabase.from("properties").select("*").eq("id", id).eq("owner_id", user.id).maybeSingle(),
    supabase.from("profiles").select("verification_status").eq("id", user.id).single(),
    getPropertyDocuments(supabase, id),
  ]);
  if (!data || data.status === "archived") notFound();
  const proof = ownershipState(docs);
  const verified = profile?.verification_status === "verified";

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold">{data.title}</h1>
        <StatusBadge status={data.status} />
      </div>

      {sp.ok === "cree" && (
        <p role="status" className="flex items-start gap-3 rounded-2xl bg-success/10 p-4 text-sm font-medium text-success">
          <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
          Annonce envoyée ! Dernière étape : ajoutez ci-dessous un justificatif de propriété pour que l&apos;agence puisse la publier.
        </p>
      )}

      <section id="documents" aria-labelledby="docs-title" className="scroll-mt-28 space-y-4 rounded-3xl bg-white p-5 ring-1 ring-line md:p-6">
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
          Fournissez <strong className="text-ink">au moins un</strong> de ces documents : titre foncier, acte de vente notarié ou certificat
          de propriété. Si vous agissez pour le compte du propriétaire, ajoutez aussi sa procuration.
        </p>
        {!verified && (
          <p className="flex items-start gap-2 rounded-2xl bg-amber-50 p-3 text-sm text-amber-900">
            <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>
              Votre identité doit aussi être vérifiée avant toute publication.{" "}
              <Link href="/espace/verification" className="font-semibold underline underline-offset-2">Vérifier mon compte</Link>
            </span>
          </p>
        )}
        <DocumentUploader userId={user.id} propertyId={data.id} slots={propertySlots} docs={docs} />
        <p className="flex items-start gap-2 text-sm text-muted">
          <Lock className="mt-0.5 size-4 shrink-0" aria-hidden />
          Ces documents restent privés : ils ne sont jamais affichés sur l&apos;annonce publique.
        </p>
      </section>

      <h2 className="pt-2 text-xl font-bold">Contenu de l&apos;annonce</h2>
      <PropertyEditor userId={user.id} area="owner" initial={data} />
    </>
  );
}

export default function EditPropertyPage(props: PageProps<"/espace/biens/[id]">) {
  return (
    <div className="space-y-6">
      <Suspense fallback={<DashboardSkeleton />}>
        <EditProperty params={props.params} searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}
