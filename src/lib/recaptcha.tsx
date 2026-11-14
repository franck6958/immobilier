"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Google reCAPTCHA v2 — case à cocher « Je ne suis pas un robot ».
 * Le script n'est chargé que sur les pages qui affichent un formulaire.
 * Sans NEXT_PUBLIC_RECAPTCHA_SITE_KEY, la case n'est pas affichée (mode démo).
 */
export const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
export const RECAPTCHA_REQUIRED_MESSAGE = "Cochez la case « Je ne suis pas un robot ».";

type WidgetOptions = {
  sitekey: string;
  size?: "normal" | "compact";
  callback?: (token: string) => void;
  "expired-callback"?: () => void;
  "error-callback"?: () => void;
};

declare global {
  interface Window {
    grecaptcha?: {
      render: (el: HTMLElement, opts: WidgetOptions) => number;
      reset: (id?: number) => void;
    };
    __ebeneRecaptchaReady?: () => void;
  }
}

let loading: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (loading) return loading;
  loading = new Promise<void>((resolve, reject) => {
    window.__ebeneRecaptchaReady = () => resolve();
    const s = document.createElement("script");
    s.src = "https://www.google.com/recaptcha/api.js?render=explicit&hl=fr&onload=__ebeneRecaptchaReady";
    s.async = true;
    s.defer = true;
    s.onerror = () => {
      loading = null; // nouvel essai possible au prochain affichage
      s.remove();
      reject(new Error("reCAPTCHA indisponible"));
    };
    document.head.appendChild(s);
  });
  return loading;
}

/**
 * Affiche la case reCAPTCHA et transmet le jeton au formulaire.
 * `resetKey` : à chaque changement (ex. réponse du serveur), la case est réinitialisée,
 * car un jeton ne peut être vérifié qu'une seule fois.
 */
export function Recaptcha({
  onToken,
  error,
  resetKey,
}: {
  onToken: (token: string) => void;
  error?: string;
  resetKey?: unknown;
}) {
  const box = useRef<HTMLDivElement>(null);
  const widget = useRef<number | null>(null);
  const cb = useRef(onToken);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    cb.current = onToken;
  });

  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY) return;
    let cancelled = false;
    loadScript()
      .then(() => {
        const el = box.current;
        if (cancelled || !el || !window.grecaptcha || widget.current !== null) return;
        widget.current = window.grecaptcha.render(el, {
          sitekey: RECAPTCHA_SITE_KEY!,
          size: el.parentElement && el.parentElement.clientWidth < 304 ? "compact" : "normal",
          callback: (t) => cb.current(t),
          "expired-callback": () => cb.current(""),
          "error-callback": () => cb.current(""),
        });
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
      widget.current = null;
      cb.current("");
    };
  }, []);

  useEffect(() => {
    if (resetKey === undefined || widget.current === null) return;
    window.grecaptcha?.reset(widget.current);
    cb.current("");
  }, [resetKey]);

  if (!RECAPTCHA_SITE_KEY) return null;

  return (
    <div>
      <div ref={box} className="min-h-[78px]" aria-describedby={error ? "recaptcha-err" : undefined} />
      {failed && (
        <p className="mt-2 text-sm text-danger">
          La vérification anti-robot n&apos;a pas pu se charger. Vérifiez votre connexion puis rechargez la page.
        </p>
      )}
      {error && (
        <p id="recaptcha-err" role="alert" className="mt-2 text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
