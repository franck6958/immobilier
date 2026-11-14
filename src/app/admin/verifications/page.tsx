import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, Building2, FileText, UserRound } from "lucide-react";
import { DashboardSkeleton } from "@/components/account/DashboardShell";
import { VerificationBadge } from "@/components/account/VerificationBadge";
import { createClient, requireAdmin } from "@/lib/supabase/server";
import { docKindLabels, verificationLabels, type VerificationStatus } from "@/lib/data/document-model";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Vérifications" };

const tabs: { value: VerificationStatus; label: string }[] = [
  { value: "pending", label: "À examiner" },
  { value: "unverified", label: "Non vérifiés" },
  { value: "rejected", label: "Refusés" },
  { value: "verified", label: "Vérifiés" },
];

function since(iso: string | null) {
  if (!iso) return "";
  const d = Math.round((Date.now() - new Date(iso).getTime()) / 86400000);
  return d <= 0 ? "aujourd'hui" : d === 1 ? "hier" : `il y a ${d} j`;
}

async function Verifications({ searchParams }: { searchParams: PageProps<"/admin/verifications">["searchParams"] }) {
  await requireAdmin();
  const sp = await searchParams;
  const statut = tabs.some((t) => t.value === sp.statut) ? (sp.statut as VerificationStatus) : "pending";
  const supabase = await createClient();

  const [{ data: profiles }, { data: allOwners }, { data: pendingDocs }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, email, phone, verification_status, verification_submitted_at, created_at")
      .eq("role", "owner")
      .eq("verification_status", statut)
      .order(statut === "pending" ? "verification_submitted_at" : "created_at", { ascending: statut === "pending" }),
    supabase.from("profiles").select("verification_status").eq("role", "owner"),
    supabase
      .from("documents")
      .select("id, kind, created_at, property_id, property:properties(id, title, ref, city, status), owner:profiles(full_name, email, verification_status)")
      .eq("status", "pending")
      .not("property_id", "is", null)
      .order("created_at", { ascending: true }),
  ]);

  const ids = (profiles ?? []).map((p) => p.id);
  const { data: accountDocs } = ids.length
    ? await supabase.from("documents").select("owner_id, status").is("property_id", null).in("owner_id", ids)
    : { data: [] as { owner_id: string; status: string }[] };
  const docCount = (id: string) => {
    const mine = (accountDocs ?? []).filter((d) => d.owner_id === id);
    return { total: mine.length, pending: mine.filter((d) => d.status === "pending").length };
  };
  const countOf = (s: string) => (allOwners ?? []).filter((p) => p.verification_status === s).length;

  // Justificatifs de biens en attente, regroupés par bien
  type PropRef = { id: string; title: string; ref: string; city: string; status: string };
  type OwnerRef = { full_name: string; email: string; verification_status: string };
  const byProperty = new Map<string, { property: PropRef; owner: OwnerRef | null; kinds: string[]; oldest: string }>();
  for (const d of pendingDocs ?? []) {
    const property = d.property as PropRef | null;
    if (!property) continue;
    const entry = byProperty.get(property.id) ?? { property, owner: d.owner as OwnerRef | null, kinds: [], oldest: d.created_at };
    entry.kinds.push(docKindLabels[d.kind] ?? d.kind);
    byProperty.set(property.id, entry);
  }
  const propertyQueue = [...byProperty.values()];

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Vérifications</h1>
        <p className="text-muted">
          Un bien ne peut être publié que si son propriétaire a un <strong className="text-ink">compte vérifié</strong> (pièce d&apos;identité) et
          qu&apos;au moins un <strong className="text-ink">justificatif de propriété</strong> a été validé.
        </p>
      </div>

      <section aria-labelledby="comptes" className="space-y-4">
        <h2 id="comptes" className="flex items-center gap-2 text-xl font-bold">
          <UserRound className="size-5 text-accent-strong" aria-hidden /> Comptes propriétaires
        </h2>
        <nav aria-label="Filtrer les comptes" className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1">
          {tabs.map((t) => {
            const active = statut === t.value;
            return (
              <Link
                key={t.value}
                href={t.value === "pending" ? "/admin/verifications" : `/admin/verifications?statut=${t.value}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold",
                  active ? "bg-ink text-paper" : "bg-white ring-1 ring-line hover:ring-ink",
                )}
              >
                {t.label}
                <span className={cn("text-xs tabular-nums", active ? "text-accent" : "text-muted")}>{countOf(t.value)}</span>
              </Link>
            );
          })}
        </nav>

        {(profiles ?? []).length === 0 ? (
          <p className="rounded-3xl bg-white p-8 text-center text-muted ring-1 ring-line">
            Aucun compte « {verificationLabels[statut].toLowerCase()} ».
          </p>
        ) : (
          <ul className="divide-y divide-line rounded-3xl bg-white ring-1 ring-line">
            {(profiles ?? []).map((p) => {
              const c = docCount(p.id);
              return (
                <li key={p.id}>
                  <Link href={`/admin/utilisateurs/${p.id}`} className="flex flex-wrap items-center gap-4 px-5 py-4 hover:bg-sand/60">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{p.full_name || p.email}</span>
                      <span className="block truncate text-sm text-muted">{p.email}{p.phone ? ` · ${p.phone}` : ""}</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-sm text-muted">
                      <FileText className="size-4" aria-hidden /> {c.total} pièce{c.total > 1 ? "s" : ""}
                      {c.pending > 0 && <strong className="text-amber-900">({c.pending} à examiner)</strong>}
                    </span>
                    {statut === "pending" && <span className="text-xs text-muted">Envoyé {since(p.verification_submitted_at)}</span>}
                    <VerificationBadge status={p.verification_status} />
                    <ArrowRight className="size-4 text-muted" aria-hidden />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section aria-labelledby="biens-justif" className="space-y-4">
        <h2 id="biens-justif" className="flex items-center gap-2 text-xl font-bold">
          <Building2 className="size-5 text-accent-strong" aria-hidden /> Justificatifs de biens à examiner
          <span className="rounded-full bg-sand px-2.5 py-0.5 text-sm tabular-nums">{propertyQueue.length}</span>
        </h2>
        {propertyQueue.length === 0 ? (
          <p className="rounded-3xl bg-white p-8 text-center text-muted ring-1 ring-line">Aucun justificatif en attente.</p>
        ) : (
          <ul className="divide-y divide-line rounded-3xl bg-white ring-1 ring-line">
            {propertyQueue.map(({ property, owner, kinds, oldest }) => (
              <li key={property.id}>
                <Link href={`/admin/biens/${property.id}#documents`} className="flex flex-wrap items-center gap-4 px-5 py-4 hover:bg-sand/60">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{property.title}</span>
                    <span className="block truncate text-sm text-muted">
                      Réf. {property.ref} · {property.city} · {owner?.full_name || owner?.email || "—"}
                    </span>
                  </span>
                  <span className="text-sm text-muted">{kinds.join(", ")}</span>
                  <span className="text-xs text-muted">depuis {since(oldest).replace("il y a ", "")}</span>
                  {owner && <VerificationBadge status={owner.verification_status} />}
                  <ArrowRight className="size-4 text-muted" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default function AdminVerificationsPage(props: PageProps<"/admin/verifications">) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Verifications searchParams={props.searchParams} />
    </Suspense>
  );
}
