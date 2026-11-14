import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { CircleCheck, Plus } from "lucide-react";
import { DashboardSkeleton } from "@/components/account/DashboardShell";
import { StatusBadge } from "@/components/account/StatusBadge";
import { ModerationActions } from "@/components/admin/ModerationActions";
import { ButtonLink } from "@/components/ui/Button";
import { createClient, requireAdmin } from "@/lib/supabase/server";
import { statusLabels, toProperty, type PropertyStatus } from "@/lib/data/property-model";
import { cn, formatDate, formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Biens" };

const tabs: { value: "" | PropertyStatus; label: string }[] = [
  { value: "", label: "Tous" },
  { value: "pending", label: "À valider" },
  { value: "published", label: "Publiés" },
  { value: "rejected", label: "Refusés" },
  { value: "archived", label: "Archivés" },
];

const notices: Record<string, string> = {
  enregistre: "Le bien a été enregistré.",
  supprime: "Le bien a été supprimé.",
};

async function PropertiesAdmin({ searchParams }: { searchParams: PageProps<"/admin/biens">["searchParams"] }) {
  await requireAdmin();
  const sp = await searchParams;
  const statut = typeof sp.statut === "string" && sp.statut in statusLabels ? (sp.statut as PropertyStatus) : "";
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 60) : "";
  const ok = typeof sp.ok === "string" ? notices[sp.ok] : undefined;

  const supabase = await createClient();
  let query = supabase
    .from("properties")
    .select("*, owner:profiles(full_name, email, phone)")
    .order("updated_at", { ascending: false });
  if (statut) query = query.eq("status", statut);
  if (q) query = query.or(`title.ilike.%${q.replace(/[%,()]/g, "")}%,ref.ilike.%${q.replace(/[%,()]/g, "")}%,city.ilike.%${q.replace(/[%,()]/g, "")}%`);
  const { data } = await query;

  const { data: counts } = await supabase.from("properties").select("status");
  const countOf = (s: string) => (counts ?? []).filter((c) => !s || c.status === s).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-3xl font-bold">Biens</h1>
        <ButtonLink href="/admin/biens/nouveau" icon={<Plus className="size-4" />}>Ajouter un bien</ButtonLink>
      </div>

      {ok && (
        <p role="status" className="flex items-center gap-3 rounded-2xl bg-success/10 p-4 text-sm font-medium text-success">
          <CircleCheck className="size-4" aria-hidden /> {ok}
        </p>
      )}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <nav aria-label="Filtrer par statut" className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1">
          {tabs.map((t) => {
            const active = statut === t.value;
            return (
              <Link
                key={t.label}
                href={t.value ? `/admin/biens?statut=${t.value}` : "/admin/biens"}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors",
                  active ? "bg-ink text-paper" : "bg-white text-ink ring-1 ring-line hover:ring-ink",
                )}
              >
                {t.label}
                <span className={cn("text-xs tabular-nums", active ? "text-accent" : "text-muted")}>{countOf(t.value)}</span>
              </Link>
            );
          })}
        </nav>
        <form role="search" className="flex gap-2" action="/admin/biens">
          {statut && <input type="hidden" name="statut" value={statut} />}
          <label htmlFor="admin-q" className="sr-only">Rechercher un bien</label>
          <input id="admin-q" name="q" defaultValue={q} placeholder="Titre, réf., ville…" className="field min-h-11 lg:w-64" />
          <button type="submit" className="min-h-11 rounded-full bg-ink px-5 text-sm font-semibold text-paper">Chercher</button>
        </form>
      </div>

      {(data ?? []).length === 0 ? (
        <p className="rounded-3xl bg-white p-10 text-center text-muted ring-1 ring-line">Aucun bien dans cette catégorie.</p>
      ) : (
        <ul className="space-y-4">
          {(data ?? []).map((row) => {
            const p = toProperty(row);
            const owner = row.owner as { full_name: string; email: string; phone: string } | null;
            return (
              <li key={p.id} className="rounded-3xl bg-white p-4 ring-1 ring-line md:p-5">
                <div className="flex flex-col gap-5 md:flex-row">
                  <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-2xl bg-sand md:w-48">
                    <Image src={p.images[0]} alt="" fill sizes="(min-width: 768px) 192px, 100vw" className="object-cover" />
                    <span className="absolute bottom-2 left-2 rounded-full bg-ink/80 px-2 py-0.5 text-xs font-semibold text-paper">
                      {p.images.length} photo{p.images.length > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={p.status} />
                      {p.badge && <span className="rounded-full bg-sand px-3 py-1 text-xs font-semibold">{p.badge}</span>}
                      <span className="text-xs text-muted">Réf. {p.ref} · mis à jour le {formatDate(p.updatedAt.slice(0, 10))}</span>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">{p.title}</h2>
                      <p className="text-sm text-muted">
                        {p.transaction} · {p.type} · {p.district ? `${p.district}, ` : ""}{p.city} · <strong className="text-ink">{formatPrice(p.price)}{p.transaction === "Location" ? " / mois" : ""}</strong> · {p.surface} m²
                      </p>
                    </div>
                    <p className="text-sm">
                      <span className="text-muted">Propriétaire : </span>
                      {owner ? (
                        <>
                          <strong>{owner.full_name || "—"}</strong>{" "}
                          <a href={`mailto:${owner.email}`} className="text-accent-strong hover:underline">{owner.email}</a>
                          {owner.phone && <> · <a href={`tel:${owner.phone.replace(/\s/g, "")}`} className="text-accent-strong hover:underline">{owner.phone}</a></>}
                        </>
                      ) : (
                        <strong>Agence</strong>
                      )}
                    </p>
                    {p.adminNote && <p className="rounded-xl bg-sand p-3 text-sm"><strong>Note :</strong> {p.adminNote}</p>}
                    <ModerationActions id={p.id} status={p.status} slug={p.slug} title={p.title} />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function AdminBiensPage(props: PageProps<"/admin/biens">) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <PropertiesAdmin searchParams={props.searchParams} />
    </Suspense>
  );
}
