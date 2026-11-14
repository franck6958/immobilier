"use client";

import { useActionState } from "react";
import { Loader2, Send } from "lucide-react";
import { requestVerification, type VerificationFormState } from "@/lib/document-actions";

/** Bouton « Envoyer pour vérification » (le serveur revérifie que les pièces obligatoires sont là). */
export function RequestVerificationButton({ label = "Envoyer pour vérification" }: { label?: string }) {
  const [state, action, pending] = useActionState<VerificationFormState, FormData>(requestVerification, { status: "idle" });
  return (
    <form action={action} className="space-y-3">
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-12 items-center gap-2 rounded-full bg-accent px-6 font-semibold text-ink transition-colors hover:bg-accent-strong disabled:opacity-60"
      >
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Send className="size-4" aria-hidden />}
        {label}
      </button>
      {state.status === "error" && <p role="alert" className="text-sm font-medium text-danger">{state.message}</p>}
    </form>
  );
}
