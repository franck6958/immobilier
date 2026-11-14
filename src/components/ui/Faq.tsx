"use client";

import { AnimatePresence, motion } from "motion/react";
import { useId, useState } from "react";
import { Plus } from "lucide-react";
import type { Faq as FaqItem } from "@/lib/content";
import { EASE_OUT } from "@/components/motion";

/** Accordéon FAQ accessible (boutons + régions, une question ouverte à la fois). */
export function Faq({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const base = useId();

  return (
    <ul className="border-t border-line">
      {items.map((f, i) => {
        const isOpen = open === i;
        const btn = `${base}-b${i}`;
        const panel = `${base}-p${i}`;
        return (
          <li key={f.q} className="border-b border-line">
            <h3>
              <button
                id={btn}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panel}
                onClick={() => setOpen(isOpen ? null : i)}
                className="group flex w-full items-center justify-between gap-6 py-6 text-left text-lg font-semibold md:text-xl"
              >
                <span className="transition-colors group-hover:text-accent-strong">{f.q}</span>
                <span
                  className={`grid size-11 shrink-0 place-items-center rounded-full border-[1.5px] transition-all duration-500 ${
                    isOpen ? "rotate-45 border-accent bg-accent text-ink" : "border-line"
                  }`}
                >
                  <Plus className="size-5" aria-hidden />
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panel}
                  role="region"
                  aria-labelledby={btn}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.5, ease: EASE_OUT }}
                  className="overflow-hidden"
                >
                  <p className="max-w-3xl pb-7 pr-14 text-muted">{f.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
