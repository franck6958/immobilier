"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ArrowRight, ShieldCheck, Star } from "lucide-react";
import { site } from "@/lib/site";
import { SplitWords, EASE_OUT } from "@/components/motion";
import { HeroSearch } from "@/components/property/HeroSearch";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["0%", "25%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1, 1.12]);
  const contentY = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["0%", "-20%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <section
      ref={ref}
      className="dark-section grain relative isolate flex min-h-[100svh] items-end overflow-hidden bg-ink text-paper"
    >
      {/* Image de fond : zoom d'entrée + parallaxe au scroll */}
      <motion.div style={{ y: imgY, scale: imgScale }} className="absolute inset-0 -z-20">
        <motion.div
          className="absolute inset-0"
          initial={reduce ? false : { scale: 1.18 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.2, ease: EASE_OUT }}
        >
          <Image
            src="/images/hero-villa-nuit.webp"
            alt="Villa contemporaine en bois et verre éclairée à la tombée de la nuit"
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
      </motion.div>
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/55 to-ink/20" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/70 via-transparent to-transparent" />

      {/* Lignes de grille architecturales */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 hidden md:block">
        <div className="container-x relative h-full">
          {[0, 1, 2, 3].map((i) => (
            <motion.span
              key={i}
              className="absolute top-0 h-full w-px origin-top bg-white/[0.07]"
              style={{ left: `${(i + 1) * 20}%` }}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 1.6, delay: 0.2 + i * 0.1, ease: EASE_OUT }}
            />
          ))}
        </div>
      </div>

      <motion.div style={{ y: contentY, opacity: contentOpacity }} className="container-x w-full pb-12 pt-32 md:pb-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: EASE_OUT }}
          className="mb-7 flex flex-wrap items-center gap-3"
        >
          <span className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 py-2 pl-2 pr-4 text-sm backdrop-blur-md">
            <span className="flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 font-semibold text-ink">
              <Star className="size-3.5 fill-current" aria-hidden />
              {site.rating.value.toLocaleString("fr-FR")}
            </span>
            <span className="text-paper/85">{site.rating.count} avis Google</span>
          </span>
          <span className="hidden items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-paper/85 backdrop-blur-md sm:inline-flex">
            <ShieldCheck className="size-4 text-accent" aria-hidden /> Titres fonciers vérifiés
          </span>
        </motion.div>

        <h1 className="max-w-6xl text-[2.875rem] font-bold leading-[1.02] sm:text-7xl lg:text-[7rem]">
          <SplitWords text="Le bon bien." onMount delay={0.35} />
          <br />
          <SplitWords
            text="Au juste prix."
            onMount
            delay={0.55}
            wordClassName={(w) => (w.startsWith("prix") ? "serif-accent text-accent" : undefined)}
          />
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.85, ease: EASE_OUT }}
          className="mt-7 max-w-2xl text-lg text-paper/85 md:text-xl"
        >
          Achat, vente, location et gestion locative à Douala, Yaoundé et Kribi.
          Des biens visités et vérifiés, un conseiller dédié jusqu&apos;à la remise des clés.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1, ease: EASE_OUT }}
          className="mt-10"
        >
          <HeroSearch />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="mt-6 text-sm text-paper/80"
        >
          Vous êtes propriétaire ?{" "}
          <Link href="/demande?projet=Vendre" className="group inline-flex items-center gap-1 font-semibold text-accent underline-offset-4 hover:underline">
            Faites estimer votre bien gratuitement
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
          </Link>
        </motion.p>
      </motion.div>
    </section>
  );
}
