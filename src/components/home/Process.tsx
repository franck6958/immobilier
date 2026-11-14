"use client";

import { motion, useScroll, useSpring } from "motion/react";
import { useRef } from "react";
import { processSteps } from "@/lib/content";
import { EASE_OUT } from "@/components/motion";

/** Méthode en 4 étapes : la ligne de progression se remplit au rythme du scroll. */
export function Process() {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <ol ref={ref} className="relative space-y-4 md:space-y-6">
      <span aria-hidden className="absolute bottom-6 left-[1.6875rem] top-6 w-px bg-line md:left-[2.1875rem]" />
      <motion.span
        aria-hidden
        style={{ scaleY }}
        className="absolute bottom-6 left-[1.6875rem] top-6 w-px origin-top bg-accent md:left-[2.1875rem]"
      />
      {processSteps.map((s, i) => (
        <motion.li
          key={s.n}
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "0px 0px -20% 0px" }}
          transition={{ duration: 0.9, ease: EASE_OUT, delay: i * 0.05 }}
          className="relative grid grid-cols-[3.5rem_1fr] gap-5 md:grid-cols-[4.5rem_1fr] md:gap-8"
        >
          <span className="relative z-10 grid size-14 place-items-center rounded-full border-[1.5px] border-line bg-paper text-sm font-bold tabular-nums md:size-[4.5rem] md:text-base">
            {s.n}
          </span>
          <div className="rounded-3xl border border-line bg-white p-6 transition-shadow duration-500 hover:shadow-[0_24px_50px_-24px_rgb(20_17_15/0.25)] md:p-8">
            <h3 className="text-xl font-bold md:text-2xl">{s.title}</h3>
            <p className="mt-2 text-muted">{s.text}</p>
          </div>
        </motion.li>
      ))}
    </ol>
  );
}
