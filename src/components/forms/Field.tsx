"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

/** Champ avec libellé visible, aide et erreur reliées par aria-describedby. */
export function Field({
  id,
  label,
  required,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: (props: { id: string; "aria-invalid"?: boolean; "aria-describedby"?: string; required?: boolean }) => ReactNode;
}) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-err`].filter(Boolean).join(" ") || undefined;
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-semibold">
        {label}
        {required ? (
          <span className="text-accent-strong" aria-hidden> *</span>
        ) : (
          <span className="font-normal text-muted"> (facultatif)</span>
        )}
      </label>
      {children({ id, "aria-invalid": error ? true : undefined, "aria-describedby": describedBy, required })}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-sm text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} className="flex items-start gap-1.5 text-sm font-medium text-danger" role="alert">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}

/** Champs anti-spam : piège invisible + horodatage côté client. */
export function SpamGuard() {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const input = ref.current;
    if (!input) return;
    const started = String(Date.now());
    input.value = started;
    // React réinitialise le formulaire après chaque action : on restaure l'horodatage
    const form = input.form;
    const restore = () => setTimeout(() => (input.value = started));
    form?.addEventListener("reset", restore);
    return () => form?.removeEventListener("reset", restore);
  }, []);
  return (
    <>
      <input ref={ref} type="hidden" name="_t" />
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="website">Ne pas remplir</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
    </>
  );
}

export function ConsentCheckbox({ error, defaultChecked }: { error?: string; defaultChecked?: boolean }) {
  return (
    <div className="space-y-2">
      <label className="flex cursor-pointer items-start gap-3 text-sm text-muted">
        <input
          type="checkbox"
          name="consent"
          required
          defaultChecked={defaultChecked}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "consent-err" : undefined}
          className="mt-0.5 size-5 shrink-0 cursor-pointer accent-[var(--color-accent-strong)]"
        />
        <span>
          J&apos;accepte que mes données soient utilisées pour traiter ma demande, conformément à la{" "}
          <Link href="/confidentialite" className="font-medium text-ink underline underline-offset-2">
            politique de confidentialité
          </Link>
          .<span className="text-accent-strong" aria-hidden> *</span>
        </span>
      </label>
      {error && (
        <p id="consent-err" role="alert" className="flex items-start gap-1.5 text-sm font-medium text-danger">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}
