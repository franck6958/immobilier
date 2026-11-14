"use client";

import { resetConsent } from "@/lib/consent";

export function ResetConsentButton() {
  return (
    <button
      type="button"
      onClick={resetConsent}
      className="min-h-12 rounded-full bg-ink px-6 font-semibold text-paper transition-colors hover:bg-ink-3"
    >
      Modifier mes préférences cookies
    </button>
  );
}
