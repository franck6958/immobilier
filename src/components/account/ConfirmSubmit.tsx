"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

/** Bouton d'envoi qui demande confirmation avant une action irréversible. */
export function ConfirmSubmit({
  message,
  children,
  className,
  name,
  value,
}: {
  message: string;
  children: ReactNode;
  className?: string;
  name?: string;
  value?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name={name}
      value={value}
      disabled={pending}
      className={className}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
