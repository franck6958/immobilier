"use client";

import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import type { Property } from "@/lib/data/property-model";
import { ButtonLink } from "@/components/ui/Button";
import { PropertyCard } from "./PropertyCard";

/** « Biens à la une » — Desktop : section épinglée à défilement horizontal. Mobile : rail à glisser. */
export function FeaturedProperties({ properties }: { properties: Property[] }) {
  const featured = properties.filter((p) => p.badge !== "Sous compromis").slice(0, 7);
  const target = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [distance, setDistance] = useState(0);
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => setDesktop(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const pinned = desktop && !reduce;

  // Mesure la distance de défilement une fois la piste épinglée rendue
  useEffect(() => {
    if (!pinned || !track.current) return;
    const el = track.current;
    const measure = () => setDistance(Math.max(0, el.scrollWidth - window.innerWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [pinned]);

  const { scrollYProgress } = useScroll({ target, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);

  const header = (
    <div className="container-x mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end lg:mb-12">
      <div>
        <p className="eyebrow mb-5">Biens à la une</p>
        <h2 className="text-[2rem] font-bold sm:text-5xl lg:text-6xl">
          Votre prochain <span className="serif-accent text-accent">chez-vous</span>.
        </h2>
      </div>
      <ButtonLink href="/biens" variant="outline-light">
        Voir tous les biens
      </ButtonLink>
    </div>
  );

  if (!pinned) {
    return (
      <section className="dark-section bg-ink py-20 text-paper md:py-28" aria-label="Biens à la une">
        {header}
        <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 md:px-8">
          {featured.map((p) => (
            <div key={p.slug} className="w-[82vw] max-w-sm shrink-0 snap-start md:w-[45vw]">
              <PropertyCard p={p} variant="dark" sizes="85vw" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      ref={target}
      className="dark-section relative bg-ink text-paper"
      style={{ height: `calc(100vh + ${distance}px)` }}
      aria-label="Biens à la une"
    >
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        {header}
        <motion.div ref={track} style={{ x }} className="flex items-stretch gap-6 px-12">
          {featured.map((p) => (
            <div key={p.slug} className="w-[30vw] min-w-[22rem] max-w-[30rem] shrink-0">
              <PropertyCard p={p} variant="dark" sizes="30vw" />
            </div>
          ))}
          <div className="flex w-[22vw] shrink-0 items-center justify-center">
            <Link
              href="/biens"
              className="group flex size-56 flex-col items-center justify-center gap-3 rounded-full border-[1.5px] border-white/20 text-center text-lg font-semibold transition-colors hover:border-accent hover:bg-accent hover:text-ink"
            >
              <ArrowUpRight className="size-8 transition-transform duration-500 group-hover:rotate-45" aria-hidden />
              Tous nos biens
            </Link>
          </div>
        </motion.div>
        <div className="container-x mt-10">
          <div className="h-px w-full bg-white/15">
            <motion.div style={{ scaleX: scrollYProgress }} className="h-px origin-left bg-accent" />
          </div>
        </div>
      </div>
    </section>
  );
}
