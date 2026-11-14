import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowUpRight, Building2, Clock, Inbox, Users } from "lucide-react";
import { DashboardSkeleton } from "@/components/account/DashboardShell";
import { StatusBadge } from "@/components/account/StatusBadge";
import { ButtonLink } from "@/components/ui/Button";
import { createClient, requireAdmin } from "@/lib/supabase/server";
import { toProperty } from "@/lib/data/property-model";
import { formatPrice } from "@/lib/utils";

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 3600) return `il y a ${Math.max(1, Math.round(diff / 60))} min`;
  if (diff < 86400) return `il y a ${Math.round(diff / 3600)} h`;
  return `il y a ${Math.round(diff / 86400)} j`;
}

async function Overview() {
  await requireAdmin();
  const supabase = await createClient();
  const count = (q: PromiseLike<{ count: number | null }>) => q.then((r) => r.count ?? 0);
  const [published, pending, newLeads, owners, pendingList, leads] = await Promise.all([
    count(supabase.from("properties").select("id", { count: "exact", head: true }).eq("status", "published")),
    count(supabase.from("properties").select("id", { count: "exact", head: true }).eq("status", "pending")),
    count(supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "nouveau")),
    count(supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "owner")),
    supabase.from("properties").select("*").eq("status", "pending").order("updated_at", { ascending: false }).limit(5),
    supabase.from("leads").select("id, name, subject, kind, status, created_at").order("created_at", { ascending: false }).limit(6),
  ]);

  const cards = [
    { label: "Biens publiés", value: published, Icon: Building2, href: "/admin/biens?statut=published" },
    { label: "À valider", value: pending, Icon: Clock, href: "/admin/biens?statut=pending", highlight: pending > 0 },
    { label: "Nouvelles demandes", value: newLeads, Icon: Inbox, href: "/admin/demandes?statut=nouveau", highlight: newLeads > 0 },
    { label: "Propriétaires inscrits", value: owners, Icon: Users, href: "/admin/utilisateurs" },
  ];
  const toValidate = (pendingList.data ?? []).map(toProperty);

  return (
    <div className="space-y-10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <ButtonLink href="/admin/biens/nouveau">Ajouter un bien</ButtonLink>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, Icon, href, highlight }) => (
          <li key={label}>
            <Link
              href={href}
              className={`group flex h-full flex-col rounded-3xl p-6 transition-shadow hover:shadow-lg ${highlight ? "bg-ink text-paper" : "bg-white ring-1 ring-line"}`}
            >
              <span className="flex items-center justify-between">
                <span className={`grid size-11 place-items-center rounded-2xl ${highlight ? "bg-accent text-ink" : "bg-accent-soft text-accent-strong"}`}>
                  <Icon className="size-5" aria-hidden />
                </span>
                <ArrowUpRight className="size-5 opacity-50 transition-transform group-hover:rotate-45" aria-hidden />
              </span>
              <span className="mt-6 text-4xl font-bold tabular-nums">{value}</span>
              <span className={`mt-1 text-sm ${highlight ? "text-muted-dark" : "text-muted"}`}>{label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <section aria-labelledby="a-valider" className="rounded-3xl bg-white p-6 ring-1 ring-line">
          <div className="mb-5 flex items-center justify-between">
            <h2 id="a-valider" className="text-xl font-bold">Annonces à valider</h2>
            <Link href="/admin/biens?statut=pending" className="text-sm font-semibold text-accent-strong hover:underline">Tout voir</Link>
          </div>
          {toValidate.length === 0 ? (
            <p className="rounded-2xl bg-sand p-6 text-center text-muted">Aucune annonce en attente. Tout est à jour.</p>
          ) : (
            <ul className="divide-y divide-line">
              {toValidate.map((p) => (
                <li key={p.id}>
                  <Link href={`/admin/biens/${p.id}`} className="flex items-center gap-4 py-3 hover:bg-sand/60">
                    <span className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-sand">
                      <Image src={p.images[0]} alt="" fill sizes="64px" className="object-cover" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{p.title}</span>
                      <span className="block text-sm text-muted">{p.city} · {formatPrice(p.price)} · {timeAgo(p.updatedAt)}</span>
                    </span>
                    <StatusBadge status={p.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="dernieres-demandes" className="rounded-3xl bg-white p-6 ring-1 ring-line">
          <div className="mb-5 flex items-center justify-between">
            <h2 id="dernieres-demandes" className="text-xl font-bold">Dernières demandes</h2>
            <Link href="/admin/demandes" className="text-sm font-semibold text-accent-strong hover:underline">Tout voir</Link>
          </div>
          {(leads.data ?? []).length === 0 ? (
            <p className="rounded-2xl bg-sand p-6 text-center text-muted">Aucune demande pour l&apos;instant.</p>
          ) : (
            <ul className="divide-y divide-line">
              {(leads.data ?? []).map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-4 py-3">
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{l.name}</span>
                    <span className="block truncate text-sm text-muted">{l.subject || (l.kind === "contact" ? "Message" : "Projet")}</span>
                  </span>
                  <span className="shrink-0 text-right text-xs text-muted">
                    {l.status === "nouveau" && <span className="mb-1 block font-bold text-accent-strong">Nouveau</span>}
                    {timeAgo(l.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Overview />
    </Suspense>
  );
}
