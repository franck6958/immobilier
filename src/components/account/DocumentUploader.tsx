"use client";

import { useRef, useState, useTransition } from "react";
import { CircleAlert, CircleCheck, Clock, FileText, Loader2, Trash2, Upload } from "lucide-react";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { deleteDocument, registerDocument } from "@/lib/document-actions";
import {
  DOC_MIME,
  MAX_DOC_BYTES,
  docStatusLabels,
  formatBytes,
  type DocItem,
  type DocSlot,
} from "@/lib/data/document-model";
import { cn } from "@/lib/utils";

const MAX_SIDE = 2400; // assez grand pour rester lisible (numéros, tampons)

/** Réduit les photos de documents (souvent 5 à 12 Mo depuis un téléphone) tout en gardant le texte lisible. */
async function compressImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("conversion impossible"))), "image/webp", 0.9),
  );
}

export function DocStatusBadge({ status }: { status: DocItem["status"] }) {
  const Icon = status === "approved" ? CircleCheck : status === "rejected" ? CircleAlert : Clock;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold",
        status === "approved" && "bg-success/10 text-success",
        status === "pending" && "bg-amber-100 text-amber-900",
        status === "rejected" && "bg-danger/10 text-danger",
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {docStatusLabels[status]}
    </span>
  );
}

export function DocLink({ doc }: { doc: DocItem }) {
  if (!doc.url) return <span className="text-sm text-muted">{doc.fileName || "Document"}</span>;
  return (
    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-w-0 items-center gap-2 text-sm font-semibold text-accent-strong hover:underline">
      <FileText className="size-4 shrink-0" aria-hidden />
      <span className="truncate">{doc.fileName || "Voir le document"}</span>
      <span className="shrink-0 font-normal text-muted">· {formatBytes(doc.size)}</span>
    </a>
  );
}

function SlotRow({
  slot,
  docs,
  userId,
  propertyId,
}: {
  slot: DocSlot;
  docs: DocItem[];
  userId: string;
  propertyId?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [deleting, startDelete] = useTransition();
  const inputId = `doc-${propertyId ?? "compte"}-${slot.kind}`;

  // Un nouvel envoi n'est utile que si rien n'est validé ou en attente (sauf pour « Autre document »)
  const canUpload = slot.multiple || !docs.some((d) => d.status !== "rejected");

  const upload = async (file: File) => {
    setError("");
    if (!DOC_MIME.includes(file.type)) {
      setError("Format non accepté : envoyez une photo (JPG, PNG, WebP) ou un PDF.");
      return;
    }
    setBusy(true);
    try {
      const isPdf = file.type === "application/pdf";
      const body: Blob = isPdf ? file : await compressImage(file);
      const mime = isPdf ? "application/pdf" : "image/webp";
      if (body.size > MAX_DOC_BYTES) {
        setError("Fichier trop lourd (10 Mo maximum).");
        return;
      }
      const ext = isPdf ? "pdf" : "webp";
      const path = `${userId}/${propertyId ?? "compte"}/${crypto.randomUUID()}.${ext}`;
      const supabase = createBrowserSupabase();
      const { error: upErr } = await supabase.storage.from("owner-documents").upload(path, body, { contentType: mime });
      if (upErr) throw upErr;
      const res = await registerDocument({
        kind: slot.kind,
        path,
        fileName: isPdf ? file.name : file.name.replace(/\.[a-z0-9]+$/i, "") + ".webp",
        mime,
        size: body.size,
        propertyId: propertyId ?? null,
      });
      if (!res.ok) setError(res.error);
    } catch (err) {
      console.error(err);
      setError("L'envoi a échoué. Vérifiez votre connexion et réessayez.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  return (
    <li className="rounded-2xl border border-line bg-white p-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <p className="font-semibold">
            {slot.label}
            {slot.required && <span className="text-accent-strong"> *</span>}
          </p>
          <p id={`${inputId}-hint`} className="text-sm text-muted">{slot.hint}</p>
        </div>
        {canUpload && (
          <div className="shrink-0">
            <input
              ref={input}
              id={inputId}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="sr-only"
              aria-describedby={`${inputId}-hint`}
              disabled={busy}
              onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
            />
            <label
              htmlFor={inputId}
              className={cn(
                "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors",
                "focus-within:ring-4 focus-within:ring-accent/30",
                docs.length ? "border-[1.5px] border-line hover:border-ink" : "bg-ink text-paper hover:bg-ink/90",
                busy && "pointer-events-none opacity-60",
              )}
            >
              {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Upload className="size-4" aria-hidden />}
              {busy ? "Envoi…" : docs.length ? "Envoyer un autre fichier" : "Ajouter le fichier"}
            </label>
          </div>
        )}
      </div>

      {error && <p role="alert" className="mt-3 text-sm font-medium text-danger">{error}</p>}

      {docs.length > 0 && (
        <ul className="mt-3 space-y-2">
          {docs.map((d) => (
            <li key={d.id} className="rounded-xl bg-sand/70 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <DocStatusBadge status={d.status} />
                  <DocLink doc={d} />
                </div>
                {d.status !== "approved" && (
                  <form action={(fd) => startDelete(() => deleteDocument(fd))}>
                    <input type="hidden" name="id" value={d.id} />
                    <button
                      type="submit"
                      disabled={deleting}
                      aria-label={`Supprimer ${d.fileName}`}
                      className="grid size-10 place-items-center rounded-full text-danger hover:bg-danger/10 disabled:opacity-50"
                    >
                      {deleting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Trash2 className="size-4" aria-hidden />}
                    </button>
                  </form>
                )}
              </div>
              {d.status === "rejected" && d.adminNote && (
                <p className="mt-2 text-sm text-danger"><strong>Motif :</strong> {d.adminNote}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

/** Liste des pièces demandées, avec envoi, statut et motif de refus. */
export function DocumentUploader({
  userId,
  propertyId,
  slots,
  docs,
}: {
  userId: string;
  propertyId?: string;
  slots: DocSlot[];
  docs: DocItem[];
}) {
  return (
    <ul className="space-y-3">
      {slots.map((s) => (
        <SlotRow key={s.kind} slot={s} userId={userId} propertyId={propertyId} docs={docs.filter((d) => d.kind === s.kind)} />
      ))}
    </ul>
  );
}
