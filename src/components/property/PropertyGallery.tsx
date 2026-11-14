"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { useLenis } from "lenis/react";
import { cn } from "@/lib/utils";
import { EASE_OUT } from "@/components/motion";

/** Galerie de la fiche bien : photo principale en fondu, vignettes, plein écran au clic. */
export function PropertyGallery({ images, alt }: { images: string[]; alt: string }) {
  const [i, setI] = useState(0);
  const [full, setFull] = useState(false);
  const lenis = useLenis();
  const go = useCallback((d: number) => setI((x) => (x + d + images.length) % images.length), [images.length]);

  useEffect(() => {
    if (!full) return;
    lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFull(false);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      lenis?.start();
      document.documentElement.style.overflow = "";
    };
  }, [full, go, lenis]);

  const label = (k: number) => `${alt} — photo ${k + 1} sur ${images.length}`;

  return (
    <div>
      <div className="relative aspect-[16/10] overflow-hidden rounded-[2rem] bg-sand">
        <AnimatePresence initial={false}>
          <motion.div
            key={i}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: EASE_OUT }}
          >
            <Image src={images[i]} alt={label(i)} fill priority={i === 0} sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover" />
          </motion.div>
        </AnimatePresence>
        <button
          type="button"
          onClick={() => setFull(true)}
          className="absolute right-4 top-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-paper/90 px-4 text-sm font-semibold backdrop-blur transition-colors hover:bg-white"
        >
          <Expand className="size-4" aria-hidden /> Plein écran
        </button>
        {images.length > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Photo précédente" className="absolute left-4 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-paper/90 backdrop-blur hover:bg-white">
              <ChevronLeft className="size-5" />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Photo suivante" className="absolute right-4 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-paper/90 backdrop-blur hover:bg-white">
              <ChevronRight className="size-5" />
            </button>
            <span className="absolute bottom-4 left-4 rounded-full bg-ink/80 px-3 py-1.5 text-xs font-semibold tabular-nums text-paper backdrop-blur">
              {i + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {images.length > 1 && (
        <ul className="mt-3 grid grid-cols-4 gap-3" aria-label="Choisir une photo">
          {images.map((src, k) => (
            <li key={src}>
              <button
                type="button"
                onClick={() => setI(k)}
                aria-label={`Afficher la photo ${k + 1}`}
                aria-current={k === i}
                className={cn(
                  "relative block aspect-[4/3] w-full overflow-hidden rounded-xl ring-offset-2 transition-all",
                  k === i ? "ring-2 ring-accent" : "opacity-70 hover:opacity-100",
                )}
              >
                <Image src={src} alt="" fill sizes="15vw" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <AnimatePresence>
        {full && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Photos du bien"
            className="fixed inset-0 z-[80] flex flex-col bg-ink/95 text-paper backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            data-lenis-prevent
          >
            <div className="flex items-center justify-between p-4 md:p-6">
              <p className="text-sm tabular-nums text-muted-dark">{i + 1} / {images.length}</p>
              <button type="button" autoFocus onClick={() => setFull(false)} aria-label="Fermer" className="grid size-12 place-items-center rounded-full bg-white/10 hover:bg-white hover:text-ink">
                <X className="size-5" />
              </button>
            </div>
            <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-8 md:px-20">
              <AnimatePresence mode="wait">
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.35, ease: EASE_OUT }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.25}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -80) go(1);
                    else if (info.offset.x > 80) go(-1);
                  }}
                  className="relative h-full w-full max-w-6xl"
                >
                  <Image src={images[i]} alt={label(i)} fill sizes="100vw" className="object-contain" draggable={false} />
                </motion.div>
              </AnimatePresence>
              <button type="button" onClick={() => go(-1)} aria-label="Photo précédente" className="absolute left-2 grid size-12 place-items-center rounded-full bg-white/10 hover:bg-white hover:text-ink md:left-6">
                <ChevronLeft className="size-6" />
              </button>
              <button type="button" onClick={() => go(1)} aria-label="Photo suivante" className="absolute right-2 grid size-12 place-items-center rounded-full bg-white/10 hover:bg-white hover:text-ink md:right-6">
                <ChevronRight className="size-6" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
