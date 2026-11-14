"use client";

import Link from "next/link";
import Script from "next/script";
import { AnimatePresence, motion } from "motion/react";
import { Cookie } from "lucide-react";
import { setConsent, useConsent } from "@/lib/consent";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

/** Bandeau cookies : aucun cookie non essentiel avant consentement explicite. */
export function CookieBanner() {
  const consent = useConsent();

  return (
    <>
      {consent === "all" && GA_ID && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}',{anonymize_ip:true});`}
          </Script>
        </>
      )}

      <AnimatePresence>
        {consent === null && (
          <motion.section
            aria-label="Gestion des cookies"
            initial={{ y: "120%" }}
            animate={{ y: 0 }}
            exit={{ y: "120%" }}
            transition={{ delay: 1.5, type: "spring", stiffness: 200, damping: 26 }}
            className="fixed inset-x-3 bottom-3 z-[45] mx-auto max-w-xl rounded-2xl border border-line bg-white p-5 shadow-[0_24px_60px_-12px_rgb(20_17_15/0.35)] sm:bottom-6 sm:left-6 sm:right-auto"
          >
            <div className="flex gap-4">
              <span className="hidden size-11 shrink-0 place-items-center rounded-full bg-accent-soft text-accent-strong sm:grid">
                <Cookie className="size-5" aria-hidden />
              </span>
              <div className="space-y-4">
                <div>
                  <h2 className="text-base font-semibold">Votre vie privée compte</h2>
                  <p className="mt-1 text-sm text-muted">
                    Nous utilisons des cookies de mesure d&apos;audience pour améliorer le site, uniquement avec votre accord.{" "}
                    <Link href="/confidentialite" className="font-medium text-accent-strong underline underline-offset-2">
                      En savoir plus
                    </Link>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setConsent("all")}
                    className="min-h-11 rounded-full bg-ink px-5 text-sm font-semibold text-paper transition-colors hover:bg-ink-3"
                  >
                    Tout accepter
                  </button>
                  <button
                    type="button"
                    onClick={() => setConsent("essential")}
                    className="min-h-11 rounded-full border-[1.5px] border-line px-5 text-sm font-semibold transition-colors hover:border-ink"
                  >
                    Essentiels uniquement
                  </button>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}
