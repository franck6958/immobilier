import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Mail, Phone, Trash2 } from "lucide-react";
import { DashboardSkeleton } from "@/components/account/DashboardShell";
import { ConfirmSubmit } from "@/components/account/ConfirmSubmit";
import { PendingButton } from "@/components/account/PendingButton";
import { WhatsAppIcon } from "@/components/icons";
import { createClient, requireAdmin } from "@/lib/supabase/server";
import { deleteLead, setLeadStatus } from "@/lib/admin-actions";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Demandes" };

const statuses = [
  { value: "nouveau", label: "Nouveau", style: "bg-accent text-ink" },
  { value: "en_cours", label: "En cours", style: "bg-amber-100 text-amber-900" },
  { value: "traite", label: "Traité", style: "bg-success/10 text-success" },
];

const dataLabels: Record<string, string> = {
  propertyType: "Type de bien",
  city: "Ville",
  district: "Quartier",
  budget: "Budget / prix",
  bedrooms: "Chambres",
  timeline: "Échéance",
  contactPref: "Contact préféré",
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Douala" });
}

async function Leads({ searchParams }: { searchParams: PageProps<"/admin/demandes">["searchParams"] }) {
  await requireAdmin();
  const sp = await searchParams;
  const statut = typeof sp.statut === "string" && statuses.some((s) => s.value === sp.statut) ? sp.statut : "";
  const supabase = await createClient();
  let q = supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(200);
  if (statut) q = q.eq("status", statut);
  const { data } = await q;
  const leads = data ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Demandes</h1>
      <nav aria-label="Filtrer par statut" className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1">
        {[{ value: "", label: "Toutes" }, ...statuses].map((s) => {
          const active = statut === s.value;
          return (
            <Link
              key={s.label}
              href={s.value ? `/admin/demandes?statut=${s.value}` : "/admin/demandes"}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex min-h-11 shrink-0 items-center rounded-full px-4 text-sm font-semibold",
                active ? "bg-ink text-paper" : "bg-white ring-1 ring-line hover:ring-ink",
              )}
            >
              {s.label}
            </Link>
          );
        })}
      </nav>

      {leads.length === 0 ? (
        <p className="rounded-3xl bg-white p-10 text-center text-muted ring-1 ring-line">Aucune demande dans cette catégorie.</p>
      ) : (
        <ul className="space-y-4">
          {leads.map((l) => {
            const st = statuses.find((s) => s.value === l.status) ?? statuses[0];
            const data = (l.data ?? {}) as Record<string, string>;
            const phone = l.phone.replace(/[^\d+]/g, "");
            const wa = phone.replace(/^\+/, "");
            return (
              <li key={l.id} className={cn("rounded-3xl bg-white p-5 ring-1 md:p-6", l.status === "nouveau" ? "ring-accent" : "ring-line")}>
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cn("rounded-full px-3 py-1 text-xs font-bold", st.style)}>{st.label}</span>
                      <span className="rounded-full bg-sand px-3 py-1 text-xs font-semibold">{l.kind === "contact" ? "Contact" : "Projet"}</span>
                      {l.property_ref && <span className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-paper">Bien {l.property_ref}</span>}
                      <span className="text-xs text-muted">{formatDateTime(l.created_at)}</span>
                    </div>
                    <h2 className="mt-2 text-lg font-bold">{l.name}</h2>
                    <p className="text-sm font-medium text-muted">{l.subject}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a href={`mailto:${l.email}`} aria-label={`Écrire à ${l.name}`} className="grid size-11 place-items-center rounded-full border-[1.5px] border-line hover:border-ink"><Mail className="size-4" /></a>
                    {phone && <a href={`tel:${phone}`} aria-label={`Appeler ${l.name}`} className="grid size-11 place-items-center rounded-full border-[1.5px] border-line hover:border-ink"><Phone className="size-4" /></a>}
                    {wa.length >= 8 && (
                      <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp ${l.name}`} className="grid size-11 place-items-center rounded-full bg-[#25D366] text-[#0b3d1f]"><WhatsAppIcon className="size-5" /></a>
                    )}
                  </div>
                </div>

                <dl className="mt-4 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
                  <div className="flex gap-2"><dt className="text-muted">E-mail :</dt><dd className="break-all">{l.email}</dd></div>
                  {l.phone && <div className="flex gap-2"><dt className="text-muted">Téléphone :</dt><dd>{l.phone}</dd></div>}
                  {Object.entries(dataLabels).map(([k, label]) =>
                    data[k] ? (
                      <div key={k} className="flex gap-2"><dt className="text-muted">{label} :</dt><dd>{data[k]}</dd></div>
                    ) : null,
                  )}
                </dl>
                {l.message && <p className="mt-4 whitespace-pre-wrap rounded-2xl bg-sand p-4 text-sm">{l.message}</p>}

                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
                  <span className="text-sm text-muted">Marquer comme :</span>
                  {statuses
                    .filter((s) => s.value !== l.status)
                    .map((s) => (
                      <form key={s.value} action={setLeadStatus}>
                        <input type="hidden" name="id" value={l.id} />
                        <input type="hidden" name="status" value={s.value} />
                        <PendingButton className="inline-flex min-h-10 items-center rounded-full border-[1.5px] border-line px-3.5 text-sm font-semibold hover:border-ink">
                          {s.label}
                        </PendingButton>
                      </form>
                    ))}
                  <form action={deleteLead} className="ml-auto">
                    <input type="hidden" name="id" value={l.id} />
                    <ConfirmSubmit message={`Supprimer la demande de ${l.name} ?`} className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold text-danger hover:bg-danger/5">
                      <Trash2 className="size-4" aria-hidden /> Supprimer
                    </ConfirmSubmit>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function AdminDemandesPage(props: PageProps<"/admin/demandes">) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Leads searchParams={props.searchParams} />
    </Suspense>
  );
}
