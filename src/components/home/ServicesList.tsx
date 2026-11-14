"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { services } from "@/lib/content";
import { EASE_OUT } from "@/components/motion";

/**
 * Liste de services éditoriale : au survol (souris), une image flotte et suit le curseur.
 * Sur mobile / clavier, chaque ligne reste un lien simple avec sa vignette.
 */
export function ServicesList() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 180, damping: 22, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 180, damping: 22, mass: 0.5 });

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set(e.clientX - r.left);
    y.set(e.clientY - r.top);
  };

  return (
    <div ref={ref} className="relative" onPointerMove={onMove} onPointerLeave={() => setActive(null)}>
      <ul className="border-t border-line">
        {services.map((s, i) => (
          <motion.li
            key={s.slug}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -8% 0px" }}
            transition={{ duration: 0.8, delay: i * 0.05, ease: EASE_OUT }}
            className="border-b border-line"
            onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
          >
            <Link
              href={`/services/${s.slug}`}
              className="group relative grid grid-cols-[auto_1fr_auto] items-center gap-4 py-6 md:grid-cols-[5rem_1.2fr_1.5fr_auto] md:gap-8 md:py-9"
            >
              <span
                aria-hidden
                className="absolute inset-0 origin-bottom scale-y-0 bg-ink transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-y-100 group-focus-visible:scale-y-100"
              />
              <span className="relative hidden text-sm font-medium tabular-nums text-muted transition-colors group-hover:text-muted-dark md:block md:pl-4">
                0{i + 1}
              </span>
              <span className="relative size-16 overflow-hidden rounded-xl md:hidden">
                <Image src={s.image} alt="" fill sizes="64px" className="object-cover" />
              </span>
              <span className="relative">
                <span className="block text-2xl font-bold tracking-tight transition-colors group-hover:text-paper sm:text-3xl lg:text-[2.75rem]">
                  {s.title}
                </span>
                <span className="mt-1 block text-sm font-medium text-accent-strong transition-colors group-hover:text-accent md:hidden">
                  {s.kicker}
                </span>
              </span>
              <span className="relative hidden text-muted transition-colors group-hover:text-muted-dark md:block">
                {s.short}
              </span>
              <span className="relative grid size-12 place-items-center rounded-full border-[1.5px] border-line transition-all duration-500 group-hover:rotate-45 group-hover:border-accent group-hover:bg-accent group-hover:text-ink md:mr-4 md:size-14">
                <ArrowUpRight className="size-5" aria-hidden />
              </span>
            </Link>
          </motion.li>
        ))}
      </ul>

      {/* Aperçu flottant qui suit le curseur */}
      <motion.div
        aria-hidden
        style={{ x: sx, y: sy }}
        className="pointer-events-none absolute left-0 top-0 z-10 hidden lg:block"
      >
        <AnimatePresence>
          {active !== null && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.6, rotate: -6 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.6, rotate: 6 }}
              transition={{ duration: 0.4, ease: EASE_OUT }}
              className="relative -ml-36 -mt-48 h-64 w-72 overflow-hidden rounded-2xl shadow-2xl"
            >
              {services.map((s, i) => (
                <motion.div
                  key={s.slug}
                  className="absolute inset-0"
                  initial={false}
                  animate={{ y: `${(i - active) * 100}%` }}
                  transition={{ duration: 0.6, ease: EASE_OUT }}
                >
                  <Image src={s.image} alt="" fill sizes="288px" className="object-cover" />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
