import type { Metadata } from "next";
import { Suspense } from "react";
import { Lock, ShieldCheck } from "lucide-react";
import { DashboardSkeleton } from "@/components/account/DashboardShell";
import { DocumentUploader } from "@/components/account/DocumentUploader";
import { RequestVerificationButton } from "@/components/account/VerificationParts";
import { VerificationBadge } from "@/components/account/VerificationBadge";
import { createClient, requireUser } from "@/lib/supabase/server";
import { getAccountDocuments } from "@/lib/data/documents";
import { accountDocsReady, accountSlots } from "@/lib/data/document-model";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Vérification du compte" };

async function Verification() {
  const user = await requireUser("/espace/verification");
  const supabase = await createClient();
  const [{ data: profile }, docs] = await Promise.all([
    supabase.from("profiles").select("verification_status, verification_note, verification_submitted_at, verified_at").eq("id", user.id).single(),
    getAccountDocuments(supabase, user.id),
  ]);
  const status = profile?.verification_status ?? "unverified";
  const ready = accountDocsReady(docs);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold">Vérification du compte</h1>
        <VerificationBadge status={status} />
      </div>

      <section className="rounded-3xl bg-white p-6 ring-1 ring-line">
        {status === "verified" ? (
          <p className="flex items-start gap-3 text-success">
            <ShieldCheck className="mt-0.5 size-5 shrink-0" aria-hidden />
            <span>
              <strong>Votre identité est vérifiée</strong>
              {profile?.verified_at && <> depuis le {formatDate(profile.verified_at.slice(0, 10))}</>}. Vos annonces pourront être publiées dès
              que le justificatif de propriété de chaque bien aura été validé.
            </span>
          </p>
        ) : status === "pending" ? (
          <p className="text-ink">
            <strong>Vos pièces sont en cours d&apos;examen.</strong> L&apos;agence vous répond sous 48 h ouvrées. Vous pouvez continuer à
            déposer vos biens en attendant.
          </p>
        ) : (
          <div className="space-y-3">
            {status === "rejected" && profile?.verification_note && (
              <p role="alert" className="rounded-2xl bg-danger/5 p-4 text-sm text-danger">
                <strong>Motif du refus :</strong> {profile.verification_note} Remplacez les pièces refusées puis renvoyez la demande.
              </p>
            )}
            <p>
              Pour protéger les acheteurs et les locataires, l&apos;agence vérifie l&apos;identité de chaque propriétaire{" "}
              <strong>avant de publier ses annonces</strong>. Ajoutez votre pièce d&apos;identité ci-dessous, puis envoyez la demande.
            </p>
          </div>
        )}
      </section>

      <section aria-labelledby="pieces" className="space-y-4">
        <h2 id="pieces" className="text-xl font-bold">Vos pièces d&apos;identité</h2>
        <DocumentUploader userId={user.id} slots={accountSlots} docs={docs} />
        <p className="flex items-start gap-2 text-sm text-muted">
          <Lock className="mt-0.5 size-4 shrink-0" aria-hidden />
          Vos documents sont stockés de façon privée : seuls vous et l&apos;équipe de l&apos;agence pouvez les consulter. Formats acceptés :
          photo ou PDF, 10 Mo maximum.
        </p>
      </section>

      {(status === "unverified" || status === "rejected") && (
        <section className="rounded-3xl bg-ink p-6 text-paper">
          <h2 className="text-xl font-bold">Prêt ?</h2>
          <p className="mt-2 text-muted-dark">
            {ready
              ? "Vos pièces obligatoires sont ajoutées. Envoyez la demande : l'agence les examine sous 48 h ouvrées."
              : "Ajoutez au moins le recto et le verso de votre CNI (ou passeport) pour envoyer la demande."}
          </p>
          {ready && (
            <div className="mt-5">
              <RequestVerificationButton label={status === "rejected" ? "Renvoyer la demande" : "Envoyer pour vérification"} />
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default function VerificationPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Verification />
    </Suspense>
  );
}
