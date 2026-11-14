"use client";

import Link from "next/link";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Archive, Check, Eye, Loader2, Pencil, RotateCcw, Trash2, X } from "lucide-react";
import { deleteProperty, setPropertyStatus } from "@/lib/property-actions";
import { ConfirmSubmit } from "@/components/account/ConfirmSubmit";

function Btn({ children, className }: { children: React.ReactNode; className: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-busy={pending} className={`inline-flex min-h-10 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold transition-colors disabled:opacity-50 ${className}`}>
      {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

function StatusForm({ id, status, children, className }: { id: string; status: string; children: React.ReactNode; className: string }) {
  return (
    <form action={setPropertyStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <Btn className={className}>{children}</Btn>
    </form>
  );
}

/** Boutons de modération d'une annonce. */
export function ModerationActions({ id, status, slug, title }: { id: string; status: string; slug: string; title: string }) {
  const [rejecting, setRejecting] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {status !== "published" && (
          <StatusForm id={id} status="published" className="bg-success text-white hover:bg-success/90">
            <Check className="size-4" aria-hidden /> Publier
          </StatusForm>
        )}
        {status !== "rejected" && status !== "archived" && (
          <button
            type="button"
            onClick={() => setRejecting((r) => !r)}
            aria-expanded={rejecting}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full border-[1.5px] border-danger/40 px-3.5 text-sm font-semibold text-danger hover:bg-danger/5"
          >
            <X className="size-4" aria-hidden /> Refuser
          </button>
        )}
        {status === "published" && (
          <StatusForm id={id} status="archived" className="border-[1.5px] border-line hover:border-ink">
            <Archive className="size-4" aria-hidden /> Archiver
          </StatusForm>
        )}
        {(status === "archived" || status === "rejected") && (
          <StatusForm id={id} status="pending" className="border-[1.5px] border-line hover:border-ink">
            <RotateCcw className="size-4" aria-hidden /> Remettre en attente
          </StatusForm>
        )}
        <Link href={`/admin/biens/${id}`} className="inline-flex min-h-10 items-center gap-1.5 rounded-full border-[1.5px] border-line px-3.5 text-sm font-semibold hover:border-ink">
          <Pencil className="size-4" aria-hidden /> Modifier
        </Link>
        {status === "published" && (
          <Link href={`/biens/${slug}`} target="_blank" className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold text-muted hover:bg-sand hover:text-ink">
            <Eye className="size-4" aria-hidden /> Voir
          </Link>
        )}
        <form action={deleteProperty}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="area" value="admin" />
          <ConfirmSubmit
            message={`Supprimer définitivement « ${title} » ? Cette action est irréversible.`}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold text-danger hover:bg-danger/5"
          >
            <Trash2 className="size-4" aria-hidden /> Supprimer
          </ConfirmSubmit>
        </form>
      </div>

      {rejecting && (
        <form action={setPropertyStatus} onSubmit={() => setRejecting(false)} className="space-y-3 rounded-2xl bg-danger/5 p-4">
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="status" value="rejected" />
          <label htmlFor={`note-${id}`} className="block text-sm font-semibold">Motif du refus (visible par le propriétaire)</label>
          <textarea
            id={`note-${id}`}
            name="admin_note"
            rows={2}
            required
            autoFocus
            placeholder="Ex. : photos trop sombres, titre foncier à fournir…"
            className="field resize-y"
          />
          <Btn className="bg-danger text-white hover:bg-danger/90">Confirmer le refus</Btn>
        </form>
      )}
    </div>
  );
}
