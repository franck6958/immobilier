"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, RotateCcw, ShieldCheck, X } from "lucide-react";
import { setAccountVerification, type VerificationFormState } from "@/lib/document-actions";

function Btn({ children, className, disabled }: { children: React.ReactNode; className: string; disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending || disabled} className={`inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${className}`}>
      {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

/** Décision finale sur le compte : valider, refuser (avec motif) ou remettre à zéro. */
export function AccountVerificationActions({ userId, status, canVerify }: { userId: string; status: string; canVerify: boolean }) {
  const [state, action] = useActionState<VerificationFormState, FormData>(setAccountVerification, { status: "idle" });
  const [rejecting, setRejecting] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {status !== "verified" && (
          <form action={action}>
            <input type="hidden" name="id" value={userId} />
            <input type="hidden" name="status" value="verified" />
            <Btn disabled={!canVerify} className="bg-success text-white hover:bg-success/90">
              <ShieldCheck className="size-4" aria-hidden /> Valider le compte
            </Btn>
          </form>
        )}
        {status !== "rejected" && (
          <button
            type="button"
            onClick={() => setRejecting((r) => !r)}
            aria-expanded={rejecting}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border-[1.5px] border-danger/40 px-5 text-sm font-semibold text-danger hover:bg-danger/5"
          >
            <X className="size-4" aria-hidden /> Refuser le compte
          </button>
        )}
        {status !== "unverified" && (
          <form action={action}>
            <input type="hidden" name="id" value={userId} />
            <input type="hidden" name="status" value="unverified" />
            <Btn className="text-muted hover:bg-sand hover:text-ink">
              <RotateCcw className="size-4" aria-hidden /> Retirer la vérification
            </Btn>
          </form>
        )}
      </div>
      {!canVerify && status !== "verified" && (
        <p className="text-sm text-muted">Validez d&apos;abord le recto et le verso de la pièce d&apos;identité pour pouvoir valider le compte.</p>
      )}
      {rejecting && (
        <form action={action} onSubmit={() => setRejecting(false)} className="space-y-2 rounded-2xl bg-danger/5 p-4">
          <input type="hidden" name="id" value={userId} />
          <input type="hidden" name="status" value="rejected" />
          <label htmlFor={`vn-${userId}`} className="block text-sm font-semibold">Motif du refus (visible par le propriétaire)</label>
          <textarea id={`vn-${userId}`} name="note" rows={2} required autoFocus placeholder="Ex. : CNI expirée, nom différent de celui du titre foncier…" className="field resize-y" />
          <Btn className="bg-danger text-white hover:bg-danger/90">Confirmer le refus</Btn>
        </form>
      )}
      {state.status === "error" && <p role="alert" className="text-sm font-medium text-danger">{state.message}</p>}
    </div>
  );
}
