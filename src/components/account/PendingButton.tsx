"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

/** Bouton d'envoi qui affiche un indicateur pendant l'exécution de l'action. */
export function PendingButton({ children, className }: { children: ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-busy={pending} className={`${className ?? ""} disabled:opacity-60`}>
      {pending && <Loader2 className="mr-1.5 size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}
