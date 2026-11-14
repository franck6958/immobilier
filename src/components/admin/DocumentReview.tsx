"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Check, ExternalLink, FileText, Loader2, RotateCcw, X } from "lucide-react";
import { reviewDocument } from "@/lib/document-actions";
import { DocStatusBadge } from "@/components/account/DocumentUploader";
import { docKindLabels, formatBytes, type DocItem } from "@/lib/data/document-model";

function Btn({ children, className }: { children: React.ReactNode; className: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-busy={pending} className={`inline-flex min-h-10 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold transition-colors disabled:opacity-50 ${className}`}>
      {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

function DocCard({ doc }: { doc: DocItem }) {
  const [rejecting, setRejecting] = useState(false);
  const isImage = doc.mime.startsWith("image/");
  const date = new Date(doc.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

  return (
    <li className="overflow-hidden rounded-2xl border border-line bg-white">
      {doc.url ? (
        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="group relative block aspect-[16/10] bg-sand" aria-label={`Ouvrir ${docKindLabels[doc.kind]} en grand`}>
          {isImage ? (
            // eslint-disable-next-line @next/next/no-img-element -- lien signé temporaire, non optimisable
            <img src={doc.url} alt={docKindLabels[doc.kind]} className="size-full object-contain" />
          ) : (
            <span className="grid size-full place-items-center text-muted">
              <span className="flex flex-col items-center gap-2">
                <FileText className="size-10" aria-hidden />
                <span className="text-sm font-semibold">Document PDF</span>
              </span>
            </span>
          )}
          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-ink/80 px-2.5 py-1 text-xs font-semibold text-paper opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            <ExternalLink className="size-3.5" aria-hidden /> Agrandir
          </span>
        </a>
      ) : (
        <div className="grid aspect-[16/10] place-items-center bg-sand text-sm text-muted">Aperçu indisponible</div>
      )}

      <div className="space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-semibold">{docKindLabels[doc.kind]}</p>
          <DocStatusBadge status={doc.status} />
        </div>
        <p className="truncate text-xs text-muted">
          {doc.fileName} · {formatBytes(doc.size)} · envoyé le {date}
        </p>
        {doc.status === "rejected" && doc.adminNote && <p className="text-sm text-danger"><strong>Motif :</strong> {doc.adminNote}</p>}

        <div className="flex flex-wrap gap-2">
          {doc.status !== "approved" && (
            <form action={reviewDocument}>
              <input type="hidden" name="id" value={doc.id} />
              <input type="hidden" name="status" value="approved" />
              <Btn className="bg-success text-white hover:bg-success/90"><Check className="size-4" aria-hidden /> Valider</Btn>
            </form>
          )}
          {doc.status !== "rejected" && (
            <button
              type="button"
              onClick={() => setRejecting((r) => !r)}
              aria-expanded={rejecting}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-full border-[1.5px] border-danger/40 px-3.5 text-sm font-semibold text-danger hover:bg-danger/5"
            >
              <X className="size-4" aria-hidden /> Refuser
            </button>
          )}
          {doc.status !== "pending" && (
            <form action={reviewDocument}>
              <input type="hidden" name="id" value={doc.id} />
              <input type="hidden" name="status" value="pending" />
              <Btn className="text-muted hover:bg-sand hover:text-ink"><RotateCcw className="size-4" aria-hidden /> Remettre en attente</Btn>
            </form>
          )}
        </div>

        {rejecting && (
          <form action={reviewDocument} onSubmit={() => setRejecting(false)} className="space-y-2 rounded-xl bg-danger/5 p-3">
            <input type="hidden" name="id" value={doc.id} />
            <input type="hidden" name="status" value="rejected" />
            <label htmlFor={`dn-${doc.id}`} className="block text-sm font-semibold">Motif (visible par le propriétaire)</label>
            <textarea id={`dn-${doc.id}`} name="admin_note" rows={2} required autoFocus placeholder="Ex. : photo floue, document expiré, nom différent…" className="field resize-y" />
            <Btn className="bg-danger text-white hover:bg-danger/90">Confirmer le refus</Btn>
          </form>
        )}
      </div>
    </li>
  );
}

export function DocumentReview({ docs, empty }: { docs: DocItem[]; empty: string }) {
  if (!docs.length) return <p className="rounded-2xl bg-sand p-6 text-center text-sm text-muted">{empty}</p>;
  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {docs.map((d) => (
        <DocCard key={d.id} doc={d} />
      ))}
    </ul>
  );
}
