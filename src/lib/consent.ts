"use client";

import { useSyncExternalStore } from "react";

/** Consentement cookies : "all" | "essential" | null (pas encore choisi) */
export type Consent = "all" | "essential" | null;

const KEY = "ebene-consent-v1";
const listeners = new Set<() => void>();

function read(): Consent {
  try {
    const v = localStorage.getItem(KEY);
    return v === "all" || v === "essential" ? v : null;
  } catch {
    return null;
  }
}

export function setConsent(v: Exclude<Consent, null>) {
  try {
    localStorage.setItem(KEY, v);
  } catch {
    /* stockage indisponible : le choix vaut pour la session */
  }
  memory = v;
  listeners.forEach((l) => l());
}

export function resetConsent() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
  memory = null;
  listeners.forEach((l) => l());
}

let memory: Consent | undefined;

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** Retourne undefined côté serveur / avant hydratation */
export function useConsent(): Consent | undefined {
  return useSyncExternalStore(
    subscribe,
    () => (memory !== undefined ? memory : read()),
    () => undefined,
  );
}
