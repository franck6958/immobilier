"use client";

import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type HTMLMotionProps,
} from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/* ------------------------------------------------------------------ */
/* Reveal — fondu + translation à l'entrée dans le viewport            */
/* ------------------------------------------------------------------ */
type RevealProps = HTMLMotionProps<"div"> & {
  delay?: number;
  y?: number;
  x?: number;
  once?: boolean;
};

export function Reveal({ delay = 0, y = 32, x = 0, once = true, children, ...rest }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.9, ease: EASE_OUT, delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Stagger — enfants révélés en cascade                                */
/* ------------------------------------------------------------------ */
export function Stagger({
  children,
  className,
  stagger = 0.08,
  delay = 0,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
  as?: "div" | "ul" | "ol";
}) {
  const Comp = as === "ul" ? motion.ul : as === "ol" ? motion.ol : motion.div;
  return (
    <Comp
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
    >
      {children}
    </Comp>
  );
}

export const staggerItem = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE_OUT } },
};

export function StaggerItem({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li";
}) {
  const Comp = as === "li" ? motion.li : motion.div;
  return (
    <Comp className={className} variants={staggerItem}>
      {children}
    </Comp>
  );
}

/* ------------------------------------------------------------------ */
/* SplitWords — titres révélés mot par mot derrière un masque          */
/* ------------------------------------------------------------------ */
export function SplitWords({
  text,
  className,
  wordClassName,
  wordsClass,
  delay = 0,
  stagger = 0.06,
  onMount = false,
}: {
  text: string;
  className?: string;
  /** Classe par mot (uniquement depuis un composant client) */
  wordClassName?: (word: string, i: number) => string | undefined;
  /** Classe appliquée à tous les mots (utilisable depuis un composant serveur) */
  wordsClass?: string;
  delay?: number;
  stagger?: number;
  onMount?: boolean;
}) {
  const words = text.split(" ");
  const trigger = onMount
    ? { animate: "show" as const }
    : { whileInView: "show" as const, viewport: { once: true, margin: "0px 0px -10% 0px" } };
  return (
    <>
    <span className="sr-only">{text}</span>
    <motion.span
      className={cn("inline", className)}
      initial="hidden"
      {...trigger}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
      aria-hidden
    >
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom">
          <motion.span
            className={cn("inline-block will-change-transform", wordsClass, wordClassName?.(w, i))}
            variants={{
              hidden: { y: "110%", rotate: 4 },
              show: { y: "0%", rotate: 0, transition: { duration: 1, ease: EASE_OUT } },
            }}
          >
            {w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </motion.span>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Counter — chiffre animé quand il devient visible                    */
/* ------------------------------------------------------------------ */
export function Counter({
  value,
  decimals = 0,
  suffix = "",
  className,
}: {
  value: number;
  decimals?: number;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const out = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!inView || !out.current) return;
    const fmt = (n: number) =>
      n.toLocaleString("fr-FR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    if (reduce) {
      out.current.textContent = fmt(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 2,
      ease: EASE_OUT,
      onUpdate: (v) => {
        if (out.current) out.current.textContent = fmt(v);
      },
    });
    return () => controls.stop();
  }, [inView, value, reduce, decimals]);

  const final = value.toLocaleString("fr-FR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return (
    <span ref={ref} className={className}>
      <span aria-hidden>
        <span ref={out}>0</span>
        {suffix}
      </span>
      <span className="sr-only">
        {final}
        {suffix}
      </span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Parallax — déplacement vertical lié au scroll                       */
/* ------------------------------------------------------------------ */
export function Parallax({
  children,
  className,
  offset = 80,
}: {
  children: ReactNode;
  className?: string;
  offset?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-offset, offset]);
  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.div style={{ y }} className="absolute inset-[-12%_0]">
        {children}
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ImageReveal — rideau qui se lève sur une image                      */
/* ------------------------------------------------------------------ */
export function ImageReveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={cn("relative overflow-hidden", className)}
      initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 1.2, ease: EASE_OUT, delay }}
    >
      <motion.div
        className="h-full w-full"
        initial={{ scale: 1.25 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
        transition={{ duration: 1.6, ease: EASE_OUT, delay }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Magnetic — l'élément suit légèrement le pointeur (souris uniquement)*/
/* ------------------------------------------------------------------ */
export function Magnetic({ children, strength = 0.35 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  const onMove = (e: React.PointerEvent) => {
    if (reduce || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div ref={ref} style={{ x: sx, y: sy }} onPointerMove={onMove} onPointerLeave={reset} className="inline-block">
      {children}
    </motion.div>
  );
}
