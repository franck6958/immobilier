import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { DashboardSkeleton } from "@/components/account/DashboardShell";
import { StatusBadge } from "@/components/account/StatusBadge";
import { VerificationBadge } from "@/components/account/VerificationBadge";
import { AccountVerificationActions } from "@/components/admin/AccountVerificationActions";
import { DocumentReview } from "@/components/admin/DocumentReview";
import { createClient, requireAdmin } from "@/lib/supabase/server";
import { getAccountDocuments } from "@/lib/data/documents";
import {
  accountDocsApproved,
  ownershipLabels,
  ownershipState,
  REQUIRED_ACCOUNT_KINDS,
  docKindLabels,
  type DocKind,
  type DocStatus,
} from "@/lib/data/document-model";
import { cn, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Fiche utilisateur" };

/** Page privée à identifiant dynamique : rendue à la demande. */
export const instant = false;

async function UserDetail({ params }: { params: PageProps<"/admin/utilisateurs/[id]">["params"] }) {
  await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const supabase = await createClient();
  const [{ data: u }, docs, { data: props }, { data: propDocs }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", id).maybeSingle(),
    getAccountDocuments(supabase, id),
    supabase.from("properties").select("id, title, ref, status, city").eq("owner_id", id).order("created_at", { ascending: false }),
    supabase.from("documents").select("property_id, kind, status").eq("owner_id", id).not("property_id", "is", null),
  ]);
  if (!u) notFound();
  const missing = REQUIRED_ACCOUNT_KINDS.filter((k) => !docs.some((d) => d.kind === k));

  return (
    <div className="space-y-6">
      <Link href="/admin/verifications" className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden /> Vérifications
      </Link>

      <section className="space-y-4 rounded-3xl bg-white p-6 ring-1 ring-line">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold md:text-3xl">{u.full_name || u.email}</h1>
          <VerificationBadge status={u.verification_status} />
          {u.role === "admin" && <span className="rounded-full bg-ink px-3 py-1 text-xs font-bold text-paper">Admin</span>}
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <a href={`mailto:${u.email}`} className="inline-flex items-center gap-2 text-accent-strong hover:underline"><Mail className="size-4" aria-hidden /> {u.email}</a>
          {u.phone && <a href={`tel:${u.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 text-accent-strong hover:underline"><Phone className="size-4" aria-hidden /> {u.phone}</a>}
          <span className="text-muted">Inscrit le {formatDate(u.created_at.slice(0, 10))}</span>
          {u.verification_submitted_at && <span className="text-muted">Demande envoyée le {formatDate(u.verification_submitted_at.slice(0, 10))}</span>}
        </div>
        {u.verification_status === "rejected" && u.verification_note && (
          <p className="rounded-2xl bg-danger/5 p-3 text-sm text-danger"><strong>Motif du refus :</strong> {u.verification_note}</p>
        )}
        <AccountVerificationActions userId={u.id} status={u.verification_status} canVerify={accountDocsApproved(docs)} />
      </section>

      <section aria-labelledby="pieces-id" className="space-y-4">
        <h2 id="pieces-id" className="text-xl font-bold">Pièces d&apos;identité</h2>
        {missing.length > 0 && (
          <p className="rounded-2xl bg-amber-50 p-3 text-sm text-amber-900">
            Pièces obligatoires manquantes : {missing.map((k) => docKindLabels[k]).join(", ")}.
          </p>
        )}
        <DocumentReview docs={docs} empty="Aucune pièce d'identité envoyée pour l'instant." />
      </section>

      <section aria-labelledby="ses-biens" className="space-y-4">
        <h2 id="ses-biens" className="text-xl font-bold">Ses biens</h2>
        {(props ?? []).length === 0 ? (
          <p className="rounded-2xl bg-sand p-6 text-center text-sm text-muted">Aucun bien déposé.</p>
        ) : (
          <ul className="divide-y divide-line rounded-3xl bg-white ring-1 ring-line">
            {(props ?? []).map((p) => {
              const proof = ownershipState(
                (propDocs ?? []).filter((d) => d.property_id === p.id).map((d) => ({ kind: d.kind as DocKind, status: d.status as DocStatus })),
              );
              return (
                <li key={p.id}>
                  <Link href={`/admin/biens/${p.id}#documents`} className="flex flex-wrap items-center gap-3 px-5 py-4 hover:bg-sand/60">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{p.title}</span>
                      <span className="text-sm text-muted">Réf. {p.ref} · {p.city}</span>
                    </span>
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
                    <StatusBadge status={p.status} />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

export default function AdminUserPage(props: PageProps<"/admin/utilisateurs/[id]">) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <UserDetail params={props.params} />
    </Suspense>
  );
}
