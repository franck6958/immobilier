import Link from "next/link";
import { Mail, MessageSquareText, Phone, Trash2 } from "lucide-react";
import { ConfirmSubmit } from "@/components/account/ConfirmSubmit";
import { PendingButton } from "@/components/account/PendingButton";
import { WhatsAppIcon } from "@/components/icons";
import { createClient, requireAdmin } from "@/lib/supabase/server";
import { deleteLead, setLeadStatus } from "@/lib/admin-actions";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

type Kind = "contact" | "projet";

/** Libellés adaptés : un message se « lit » et se « répond », une demande se « traite ». */
const statusSets: Record<Kind, { value: string; label: string; style: string }[]> = {
  contact: [
    { value: "nouveau", label: "Non lu", style: "bg-accent text-ink" },
    { value: "en_cours", label: "Lu", style: "bg-amber-100 text-amber-900" },
    { value: "traite", label: "Répondu", style: "bg-success/10 text-success" },
  ],
  projet: [
    { value: "nouveau", label: "Nouveau", style: "bg-accent text-ink" },
    { value: "en_cours", label: "En cours", style: "bg-amber-100 text-amber-900" },
    { value: "traite", label: "Traité", style: "bg-success/10 text-success" },
  ],
};

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

/** Numéro au format WhatsApp : 6XX XX XX XX (Cameroun) devient 2376XXXXXXXX. */
function waNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (/^6\d{8}$/.test(digits)) return `237${digits}`;
  return digits.length >= 8 ? digits : "";
}

export async function LeadsBoard({
  kind,
  basePath,
  title,
  intro,
  statut: rawStatut,
}: {
  kind: Kind;
  basePath: string;
  title: string;
  intro: string;
  statut?: string | string[];
}) {
  await requireAdmin();
  const statuses = statusSets[kind];
  const statut = typeof rawStatut === "string" && statuses.some((s) => s.value === rawStatut) ? rawStatut : "";
  const supabase = await createClient();
  let q = supabase.from("leads").select("*").eq("kind", kind).order("created_at", { ascending: false }).limit(200);
  if (statut) q = q.eq("status", statut);
  const [{ data }, { data: all }] = await Promise.all([q, supabase.from("leads").select("status").eq("kind", kind)]);
  const leads = data ?? [];
  const countOf = (s: string) => (all ?? []).filter((l) => !s || l.status === s).length;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted">{intro}</p>
      </div>
      <nav aria-label="Filtrer par statut" className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1">
        {[{ value: "", label: "Tous" }, ...statuses].map((s) => {
          const active = statut === s.value;
          return (
            <Link
              key={s.label}
              href={s.value ? `${basePath}?statut=${s.value}` : basePath}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold",
                active ? "bg-ink text-paper" : "bg-white ring-1 ring-line hover:ring-ink",
              )}
            >
              {s.label}
              <span className={cn("text-xs tabular-nums", active ? "text-accent" : "text-muted")}>{countOf(s.value)}</span>
            </Link>
          );
        })}
      </nav>

      {leads.length === 0 ? (
        <div className="flex flex-col items-center rounded-3xl bg-white px-6 py-14 text-center ring-1 ring-line">
          <MessageSquareText className="size-10 text-muted" aria-hidden />
          <p className="mt-4 text-muted">Rien dans cette catégorie pour l&apos;instant.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {leads.map((l) => {
            const st = statuses.find((s) => s.value === l.status) ?? statuses[0];
            const data = (l.data ?? {}) as Record<string, string>;
            const tel = l.phone.replace(/[^\d+]/g, "");
            const wa = waNumber(l.phone);
            const first = l.name.split(" ")[0];
            const waText =
              kind === "contact"
                ? `Bonjour ${first}, ici ${site.name}. Merci pour votre message${l.subject && l.subject !== "Contact" ? ` (« ${l.subject} »)` : ""}. `
                : `Bonjour ${first}, ici ${site.name}. Nous avons bien reçu votre demande « ${l.subject} ». `;
            const mailSubject = encodeURIComponent(`Re : ${l.subject || "votre message"} — ${site.name}`);
            return (
              <li key={l.id} className={cn("rounded-3xl bg-white p-5 ring-1 md:p-6", l.status === "nouveau" ? "ring-2 ring-accent" : "ring-line")}>
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cn("rounded-full px-3 py-1 text-xs font-bold", st.style)}>{st.label}</span>
                      {l.property_ref && <span className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-paper">Bien {l.property_ref}</span>}
                      <span className="text-xs text-muted">{formatDateTime(l.created_at)}</span>
                    </div>
                    <h2 className="mt-2 text-lg font-bold">{l.name}</h2>
                    <p className="text-sm font-medium text-muted">{l.subject}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {wa && (
                      <a
                        href={`https://wa.me/${wa}?text=${encodeURIComponent(waText)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#25D366] px-4 text-sm font-semibold text-[#0b3d1f] hover:bg-[#20bd5a]"
                      >
                        <WhatsAppIcon className="size-4" /> Répondre sur WhatsApp
                      </a>
                    )}
                    <a href={`mailto:${l.email}?subject=${mailSubject}`} aria-label={`Répondre par e-mail à ${l.name}`} className="grid size-11 place-items-center rounded-full border-[1.5px] border-line hover:border-ink"><Mail className="size-4" /></a>
                    {tel && <a href={`tel:${tel}`} aria-label={`Appeler ${l.name}`} className="grid size-11 place-items-center rounded-full border-[1.5px] border-line hover:border-ink"><Phone className="size-4" /></a>}
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
                    <ConfirmSubmit
                      title={kind === "contact" ? "Supprimer ce message ?" : "Supprimer cette demande ?"}
                      message={`${kind === "contact" ? "Le message" : "La demande"} de ${l.name}${l.subject ? ` (« ${l.subject} »)` : ""} sera supprimé${kind === "contact" ? "" : "e"} de votre liste.`}
                      className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold text-danger hover:bg-danger/5"
                    >
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
