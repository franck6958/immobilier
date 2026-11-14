"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Menu, Phone, UserRound, X } from "lucide-react";
import { nav, site, whatsappLink } from "@/lib/site";
import { cn } from "@/lib/utils";
import { LogoMark, WhatsAppIcon } from "@/components/icons";
import { ButtonLink } from "@/components/ui/Button";
import { useLenis } from "lenis/react";
import { EASE_OUT } from "@/components/motion";

export function Header() {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const lenis = useLenis();
  const toggleRef = useRef<HTMLButtonElement>(null);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 40);
    setHidden(y > 400 && y > prev && !open);
  });

  // Ferme le menu à chaque navigation (pattern "ajuster l'état pendant le rendu")
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  // Bloque le scroll + touche Échap quand le menu mobile est ouvert
  useEffect(() => {
    if (open) {
      lenis?.stop();
      document.documentElement.style.overflow = "hidden";
    } else {
      lenis?.start();
      document.documentElement.style.overflow = "";
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, lenis]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const solid = scrolled && !open;

  return (
    <>
      <motion.header
        initial={{ y: 0 }}
        animate={{ y: hidden ? "-110%" : "0%" }}
        transition={{ duration: 0.45, ease: EASE_OUT }}
        className="fixed inset-x-0 top-0 z-50"
      >
        <div
          className={cn(
            "transition-[background-color,box-shadow,color] duration-500",
            solid
              ? "bg-paper/85 text-ink shadow-[0_1px_0_var(--color-line)] backdrop-blur-xl"
              : "bg-transparent text-white",
          )}
        >
          <div className="container-x flex h-[4.5rem] items-center justify-between gap-6 lg:h-20">
            <Link href="/" className="flex items-center gap-3" aria-label={`${site.name} — accueil`}>
              <LogoMark className={cn("size-10 transition-colors", solid ? "text-ink" : "text-white/10")} />
              <span className="leading-none">
                <span className="block text-[1.0625rem] font-bold tracking-tight">{site.shortName}</span>
                <span className={cn("block text-[0.6875rem] font-medium uppercase tracking-[0.2em]", solid ? "text-muted" : "text-white/70")}>
                  {site.brandLine}
                </span>
              </span>
            </Link>

            <nav aria-label="Navigation principale" className="hidden lg:block">
              <ul className="flex items-center gap-1">
                {nav.slice(1).map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isActive(item.href) ? "page" : undefined}
                      className={cn(
                        "relative rounded-full px-4 py-2.5 text-[0.9375rem] font-medium transition-colors",
                        solid ? "hover:bg-ink/5" : "hover:bg-white/10",
                      )}
                    >
                      {item.label}
                      {isActive(item.href) && (
                        <motion.span
                          layoutId="nav-dot"
                          className="absolute bottom-1 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-accent"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="flex items-center gap-2">
              <Link
                href="/espace"
                className={cn(
                  "hidden size-12 place-items-center rounded-full border-[1.5px] transition-colors md:grid",
                  solid ? "border-line hover:bg-ink hover:text-paper" : "border-white/30 hover:bg-white hover:text-ink",
                  pathname.startsWith("/espace") && "bg-accent text-ink border-accent",
                )}
                aria-label="Espace propriétaire : connexion ou mon compte"
                title="Espace propriétaire"
              >
                <UserRound className="size-[1.125rem]" />
              </Link>
              <a
                href={site.contact.phoneHref}
                className={cn(
                  "hidden size-12 place-items-center rounded-full border-[1.5px] transition-colors md:grid",
                  solid ? "border-line hover:bg-ink hover:text-paper" : "border-white/30 hover:bg-white hover:text-ink",
                )}
                aria-label={`Appeler le ${site.contact.phone}`}
              >
                <Phone className="size-[1.125rem]" />
              </a>
              <span className="hidden sm:block">
                <ButtonLink href="/demande">Votre projet</ButtonLink>
              </span>
              <button
                ref={toggleRef}
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                aria-controls="mobile-menu"
                aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
                className={cn(
                  "relative z-[60] grid size-12 place-items-center rounded-full transition-colors lg:hidden",
                  open ? "bg-paper text-ink" : solid ? "bg-ink text-paper" : "bg-white/15 text-white backdrop-blur",
                )}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={open ? "x" : "m"}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {open ? <X className="size-5" /> : <Menu className="size-5" />}
                  </motion.span>
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-0 z-40 flex flex-col bg-ink text-paper lg:hidden"
            initial={{ clipPath: "circle(0% at calc(100% - 3rem) 2.25rem)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 3rem) 2.25rem)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 3rem) 2.25rem)" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            <nav aria-label="Navigation mobile" className="container-x flex flex-1 flex-col justify-center pt-20">
              <motion.ul
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: 0.25 } } }}
                className="space-y-1"
              >
                {nav.map((item, i) => (
                  <li key={item.href} className="overflow-hidden">
                    <motion.div
                      variants={{ hidden: { y: "100%" }, show: { y: "0%", transition: { duration: 0.7, ease: EASE_OUT } } }}
                    >
                      <Link
                        href={item.href}
                        autoFocus={i === 0}
                        aria-current={isActive(item.href) ? "page" : undefined}
                        className="group flex items-baseline gap-4 py-1.5 text-[2.5rem] font-bold leading-tight tracking-tight sm:text-5xl"
                      >
                        <span className="text-sm font-medium text-muted-dark tabular-nums">0{i + 1}</span>
                        <span className={cn("transition-colors group-hover:text-accent", isActive(item.href) && "text-accent")}>
                          {item.label}
                        </span>
                      </Link>
                    </motion.div>
                  </li>
                ))}
              </motion.ul>
            </nav>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.6, duration: 0.6 } }}
              className="container-x grid gap-3 pb-10 sm:grid-cols-2"
            >
              <Link
                href="/espace"
                className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-white/10 font-semibold sm:col-span-2"
              >
                <UserRound className="size-4" aria-hidden /> Espace propriétaire
              </Link>
              <ButtonLink href="/demande" className="w-full">Confier mon projet</ButtonLink>
              <ButtonLink href={whatsappLink()} variant="outline-light" className="w-full" icon={<WhatsAppIcon className="size-4" />}>
                WhatsApp
              </ButtonLink>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
