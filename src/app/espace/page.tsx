import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { CircleCheck, Eye, FileCheck2, Pencil, PlusCircle, ShieldAlert, Trash2 } from "lucide-react";
import { DashboardSkeleton } from "@/components/account/DashboardShell";
import { StatusBadge } from "@/components/account/StatusBadge";
import { ConfirmSubmit } from "@/components/account/ConfirmSubmit";
import { ButtonLink } from "@/components/ui/Button";
import { createClient, requireUser } from "@/lib/supabase/server";
import { deleteProperty } from "@/lib/property-actions";
import { toProperty } from "@/lib/data/property-model";
import { ownershipLabels, ownershipState, type DocKind, type DocStatus } from "@/lib/data/document-model";
import { cn, formatDate, formatPrice } from "@/lib/utils";

const notices: Record<string, string> = {
  envoye: "Votre annonce a bien été envoyée. L'agence la vérifie et la publie sous 48 h ouvrées.",
  supprime: "L'annonce a été supprimée.",
};

async function MyProperties({ searchParams }: { searchParams: PageProps<"/espace">["searchParams"] }) {
  const user = await requireUser("/espace");
  const sp = await searchParams;
  const ok = typeof sp.ok === "string" ? notices[sp.ok] : undefined;
  const welcome = sp.bienvenue === "1";
  const refused = sp.refus === "admin";
  const supabase = await createClient();
  const [{ data }, { data: profile }, { data: docRows }] = await Promise.all([
    supabase.from("properties").select("*").eq("owner_id", user.id).order("created_at", { ascending: false }),
    supabase.from("profiles").select("verification_status, verification_note").eq("id", user.id).single(),
    supabase.from("documents").select("property_id, kind, status").eq("owner_id", user.id).not("property_id", "is", null),
  ]);
  const list = (data ?? []).map(toProperty);
  const verif = profile?.verification_status ?? "unverified";
  const proofOf = (id: string) =>
    ownershipState((docRows ?? []).filter((d) => d.property_id === id).map((d) => ({ kind: d.kind as DocKind, status: d.status as DocStatus })));

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-3xl font-bold">Mes biens</h1>
        <ButtonLink href="/espace/biens/nouveau" icon={<PlusCircle className="size-4" />}>Déposer un bien</ButtonLink>
      </div>

      {(ok || welcome) && (
        <p role="status" className="flex items-start gap-3 rounded-2xl bg-success/10 p-4 text-sm font-medium text-success">
          <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
          {ok ?? "Bienvenue ! Votre compte est actif. Déposez votre premier bien en quelques minutes."}
        </p>
      )}
      {verif !== "verified" && user.role !== "admin" && (
        <div className={cn("flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between", verif === "pending" ? "bg-amber-50 text-amber-900" : "bg-ink text-paper")}>
          <p className="flex items-start gap-3 text-sm">
            <ShieldAlert className={cn("mt-0.5 size-5 shrink-0", verif !== "pending" && "text-accent")} aria-hidden />
            <span>
              {verif === "pending" && <><strong>Vérification en cours.</strong> L&apos;agence examine votre pièce d&apos;identité.</>}
              {verif === "unverified" && <><strong>Vérifiez votre identité</strong> : sans cela, vos annonces ne peuvent pas être publiées.</>}
              {verif === "rejected" && <><strong>Vérification refusée.</strong> {profile?.verification_note}</>}
            </span>
          </p>
          {verif !== "pending" && (
            <Link href="/espace/verification" className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-accent px-5 text-sm font-semibold text-ink hover:bg-accent-strong">
              {verif === "rejected" ? "Corriger mes pièces" : "Vérifier mon compte"}
            </Link>
          )}
        </div>
      )}

      {refused && (
        <p role="alert" className="rounded-2xl bg-danger/5 p-4 text-sm font-medium text-danger">
          L&apos;administration est réservée aux comptes de l&apos;agence.
        </p>
      )}

      {list.length === 0 ? (
        <div className="flex flex-col items-center rounded-3xl bg-white px-6 py-16 text-center ring-1 ring-line">
          <h2 className="text-2xl font-bold">Aucun bien pour l&apos;instant</h2>
          <p className="mt-3 max-w-md text-muted">
            Ajoutez votre villa, appartement, terrain ou local : photos, prix et description. Notre équipe vérifie
            l&apos;annonce puis la publie.
          </p>
          <div className="mt-8">
            <ButtonLink href="/espace/biens/nouveau">Déposer mon premier bien</ButtonLink>
          </div>
        </div>
      ) : (
        <ul className="space-y-4">
          {list.map((p) => (
            <li key={p.id} className="flex flex-col gap-5 rounded-3xl bg-white p-4 ring-1 ring-line sm:flex-row sm:items-center md:p-5">
              <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-2xl bg-sand sm:w-44">
                <Image src={p.images[0]} alt="" fill sizes="(min-width: 640px) 176px, 100vw" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={p.status} />
                  <span className="text-xs text-muted">Réf. {p.ref} · modifié le {formatDate(p.updatedAt.slice(0, 10))}</span>
                </div>
                <h2 className="mt-2 truncate text-lg font-bold">{p.title}</h2>
                <p className="text-sm text-muted">
                  {p.type} · {p.district ? `${p.district}, ` : ""}
                  {p.city} · {formatPrice(p.price)}
                  {p.transaction === "Location" ? " / mois" : ""}
                </p>
                {(() => {
                  const proof = proofOf(p.id);
                  return (
                    <Link
                      href={`/espace/biens/${p.id}#documents`}
                      className={cn(
                        "mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold hover:underline",
                        proof === "approved" && "bg-success/10 text-success",
                        proof === "pending" && "bg-amber-100 text-amber-900",
                        (proof === "missing" || proof === "rejected") && "bg-danger/10 text-danger",
                      )}
                    >
                      <FileCheck2 className="size-3.5" aria-hidden /> {ownershipLabels[proof]}
                    </Link>
                  );
                })()}
                {p.status === "rejected" && p.adminNote && (
                  <p className="mt-3 rounded-xl bg-danger/5 p-3 text-sm text-danger">
                    <strong>Motif de l&apos;agence :</strong> {p.adminNote}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2 sm:flex-col">
                {p.status === "published" && (
                  <Link href={`/biens/${p.slug}`} className="inline-flex min-h-11 items-center gap-2 rounded-full border-[1.5px] border-line px-4 text-sm font-semibold hover:border-ink">
                    <Eye className="size-4" aria-hidden /> Voir l&apos;annonce
                  </Link>
                )}
                {p.status !== "archived" && (
                  <Link href={`/espace/biens/${p.id}`} className="inline-flex min-h-11 items-center gap-2 rounded-full border-[1.5px] border-line px-4 text-sm font-semibold hover:border-ink">
                    <Pencil className="size-4" aria-hidden /> Modifier
                  </Link>
                )}
                {(p.status === "pending" || p.status === "rejected") && (
                  <form action={deleteProperty}>
                    <input type="hidden" name="id" value={p.id} />
                    <ConfirmSubmit
                      message={`Supprimer définitivement l'annonce « ${p.title} » ?`}
                      className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold text-danger hover:bg-danger/5"
                    >
                      <Trash2 className="size-4" aria-hidden /> Supprimer
                    </ConfirmSubmit>
                  </form>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function EspacePage(props: PageProps<"/espace">) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <MyProperties searchParams={props.searchParams} />
    </Suspense>
  );
}
