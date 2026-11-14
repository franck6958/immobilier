"use client";

import { useId, useRef, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, ShieldAlert, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Bouton d'envoi qui demande confirmation dans une fenêtre aux couleurs du site
 * (remplace la boîte grise `window.confirm` du navigateur).
 * Fenêtre native <dialog> : focus piégé, touche Échap, clic à l'extérieur pour annuler.
 */
export function ConfirmSubmit({
  message,
  title = "Confirmer la suppression ?",
  confirmLabel = "Supprimer",
  tone = "danger",
  children,
  className,
  ariaLabel,
  name,
  value,
}: {
  message: string;
  title?: string;
  confirmLabel?: string;
  tone?: "danger" | "default";
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
  name?: string;
  value?: string;
}) {
  const { pending } = useFormStatus();
  const dialog = useRef<HTMLDialogElement>(null);
  const submitter = useRef<HTMLButtonElement>(null);
  const id = useId();
  const danger = tone === "danger";
  const Icon = danger ? Trash2 : ShieldAlert;

  const confirm = () => {
    dialog.current?.close();
    const btn = submitter.current;
    btn?.form?.requestSubmit(btn);
  };

  return (
    <>
      <button
        type="button"
        disabled={pending}
        aria-busy={pending}
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        className={className}
        onClick={() => dialog.current?.showModal()}
      >
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
        {pending && ariaLabel ? null : children}
      </button>
      {/* Bouton réel d'envoi (porte name/value), déclenché après confirmation */}
      <button ref={submitter} type="submit" name={name} value={value} hidden tabIndex={-1} aria-hidden />

      <dialog
        ref={dialog}
        aria-labelledby={`${id}-t`}
        aria-describedby={`${id}-d`}
        className="confirm-dialog m-auto w-[calc(100%-2rem)] max-w-md overflow-hidden rounded-[2rem] bg-paper p-0 text-ink shadow-[0_40px_120px_-30px_rgb(20_17_15/0.6)]"
        onClick={(e) => {
          // Clic sur le fond (en dehors du contenu) : on annule
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
      >
        <div className="relative p-6 sm:p-8">
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute -right-10 -top-10 size-40 rounded-full blur-2xl",
              danger ? "bg-danger/10" : "bg-accent/20",
            )}
          />
          <span
            className={cn(
              "relative grid size-14 place-items-center rounded-2xl",
              danger ? "bg-danger/10 text-danger" : "bg-accent-soft text-accent-strong",
            )}
          >
            <Icon className="size-6" aria-hidden />
          </span>
          <h2 id={`${id}-t`} className="relative mt-5 text-2xl font-bold leading-tight">
            {title}
          </h2>
          <p id={`${id}-d`} className="relative mt-2 text-muted">
            {message}
          </p>
          {danger && (
            <p className="relative mt-4 rounded-2xl bg-sand px-4 py-3 text-sm font-medium text-ink/80">
              Cette action est définitive : elle ne pourra pas être annulée.
            </p>
          )}
          <div className="relative mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              autoFocus
              onClick={() => dialog.current?.close()}
              className="inline-flex min-h-12 items-center justify-center rounded-full border-[1.5px] border-line bg-white px-6 font-semibold transition-colors hover:border-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/30"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={confirm}
              className={cn(
                "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4",
                danger
                  ? "bg-danger text-white hover:bg-danger/90 focus-visible:ring-danger/30"
                  : "bg-ink text-paper hover:bg-ink/90 focus-visible:ring-accent/40",
              )}
            >
              <Icon className="size-4" aria-hidden />
              {confirmLabel}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
