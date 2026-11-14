"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, Quote, Star } from "lucide-react";
import { testimonials } from "@/lib/content";
import { EASE_OUT } from "@/components/motion";

/** Carrousel d'avis : défilement auto (pausable), glisser au doigt, flèches clavier. */
export function Testimonials() {
  const [[index, dir], setState] = useState<[number, number]>([0, 1]);
  const [playing, setPlaying] = useState(true);
  const reduce = useReducedMotion();
  const t = testimonials[index];

  const go = useCallback((d: number) => {
    setState(([i]) => [(i + d + testimonials.length) % testimonials.length, d]);
  }, []);

  useEffect(() => {
    if (!playing || reduce) return;
    const id = setInterval(() => go(1), 7000);
    return () => clearInterval(id);
  }, [playing, reduce, go, index]);

  return (
    <div
      className="relative"
      role="region"
      aria-roledescription="carrousel"
      aria-label="Avis clients"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(1);
        if (e.key === "ArrowLeft") go(-1);
      }}
    >
      <Quote className="mb-8 size-14 text-accent" aria-hidden />
      <div className="relative min-h-[22rem] sm:min-h-[17rem] lg:min-h-[15rem]" aria-live={playing ? "off" : "polite"}>
        <AnimatePresence mode="popLayout" initial={false} custom={dir}>
          <motion.figure
            key={index}
            custom={dir}
            variants={{
              enter: (d: number) => ({ opacity: 0, x: d * 80, filter: "blur(6px)" }),
              center: { opacity: 1, x: 0, filter: "blur(0px)" },
              exit: (d: number) => ({ opacity: 0, x: d * -80, filter: "blur(6px)" }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.7, ease: EASE_OUT }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60) go(1);
              else if (info.offset.x > 60) go(-1);
            }}
            className="cursor-grab active:cursor-grabbing"
          >
            <div className="mb-6 flex gap-1" aria-label={`Note : ${t.rating} sur 5`} role="img">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`size-5 ${i < t.rating ? "fill-accent text-accent" : "text-white/25"}`} aria-hidden />
              ))}
            </div>
            <blockquote className="text-2xl font-medium leading-snug tracking-tight sm:text-3xl lg:text-[2.5rem]">
              « {t.text} »
            </blockquote>
            <figcaption className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="font-semibold">{t.name}</span>
              <span className="text-muted-dark">· {t.role}</span>
              <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-muted-dark">{t.project}</span>
            </figcaption>
          </motion.figure>
        </AnimatePresence>
      </div>

      <div className="mt-12 flex items-center justify-between gap-6">
        <div className="flex items-center gap-2" aria-label="Choisir un avis">
          {testimonials.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setState([i, i > index ? 1 : -1])}
              aria-label={`Avis ${i + 1} sur ${testimonials.length}`}
              aria-current={i === index}
              className="group grid h-11 place-items-center px-0.5"
            >
              <span className={`block h-1 rounded-full transition-all duration-500 ${i === index ? "w-10 bg-accent" : "w-4 bg-white/25 group-hover:bg-white/50"}`} />
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? "Mettre en pause le défilement" : "Reprendre le défilement"}
            className="grid size-12 place-items-center rounded-full border-[1.5px] border-white/20 transition-colors hover:bg-white hover:text-ink"
          >
            {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
          </button>
          <button type="button" onClick={() => go(-1)} aria-label="Avis précédent" className="grid size-12 place-items-center rounded-full border-[1.5px] border-white/20 transition-colors hover:bg-white hover:text-ink">
            <ChevronLeft className="size-5" />
          </button>
          <button type="button" onClick={() => go(1)} aria-label="Avis suivant" className="grid size-12 place-items-center rounded-full bg-accent text-ink transition-colors hover:bg-[#f06a21]">
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
