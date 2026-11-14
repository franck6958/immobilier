"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Phone, X } from "lucide-react";
import { site, whatsappLink } from "@/lib/site";
import { WhatsAppIcon } from "@/components/icons";
import { useConsent } from "@/lib/consent";

/** Bouton WhatsApp flottant + bulle d'invitation + appel rapide mobile */
export function FloatingActions() {
  const [bubble, setBubble] = useState(false);
  const consent = useConsent();

  // La bulle n'apparaît qu'une fois le bandeau cookies traité, pour ne pas empiler les fenêtres
  useEffect(() => {
    if (consent === null || consent === undefined) return;
    let dismissed = false;
    try {
      dismissed = sessionStorage.getItem("wa-bubble") === "0";
    } catch {}
    if (dismissed) return;
    const t = setTimeout(() => setBubble(true), 9000);
    return () => clearTimeout(t);
  }, [consent]);

  const close = () => {
    setBubble(false);
    try {
      sessionStorage.setItem("wa-bubble", "0");
    } catch {}
  };

  return (
    <div className="fixed bottom-4 right-4 z-30 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {bubble && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="relative max-w-[16rem] origin-bottom-right rounded-2xl rounded-br-sm bg-white p-4 pr-10 text-sm text-ink shadow-[0_20px_50px_-12px_rgb(20_17_15/0.35)]"
            role="status"
          >
            <p className="font-semibold">Une question sur votre projet ?</p>
            <p className="mt-1 text-muted">Notre équipe répond sur WhatsApp en moins d&apos;une heure.</p>
            <button
              type="button"
              onClick={close}
              aria-label="Fermer le message"
              className="absolute right-1.5 top-1.5 grid size-9 place-items-center rounded-full text-muted hover:bg-sand"
            >
              <X className="size-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-3">
        <motion.a
          href={site.contact.phoneHref}
          aria-label={`Appeler le ${site.contact.phone}`}
          className="grid size-14 place-items-center rounded-full bg-ink text-paper shadow-lg sm:hidden"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.1, type: "spring", stiffness: 260, damping: 18 }}
        >
          <Phone className="size-5" />
        </motion.a>
        <motion.a
          href={whatsappLink()}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Discuter avec nous sur WhatsApp"
          onClick={close}
          className="group relative grid size-14 place-items-center rounded-full bg-[#25D366] text-[#0b3d1f] shadow-[0_12px_30px_-6px_rgb(37_211_102/0.6)] sm:size-16"
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          transition={{ delay: 1, type: "spring", stiffness: 260, damping: 18 }}
        >
          <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-30 [animation-duration:2.4s] motion-reduce:hidden" />
          <WhatsAppIcon className="relative size-7 sm:size-8" />
        </motion.a>
      </div>
    </div>
  );
}
