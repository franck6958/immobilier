import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { nav } from "@/lib/site";

export default function NotFound() {
  return (
    <section className="dark-section grain relative isolate flex min-h-[100svh] items-center overflow-hidden bg-ink pb-20 pt-32 text-paper">
      <p aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 -translate-y-1/2 select-none text-center text-[45vw] font-black leading-none tracking-[-0.08em] text-white/[0.04]">
        404
      </p>
      <div className="container-x">
        <p className="eyebrow mb-6">Erreur 404</p>
        <h1 className="max-w-3xl text-5xl font-bold md:text-7xl">
          Cette page a <span className="serif-accent text-accent">déménagé</span>.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted-dark">
          L&apos;adresse demandée n&apos;existe pas ou a été déplacée. Voici quelques pistes pour retrouver votre chemin.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/">Retour à l&apos;accueil</ButtonLink>
          <ButtonLink href="/contact" variant="outline-light">Nous contacter</ButtonLink>
        </div>
        <nav aria-label="Pages principales" className="mt-14">
          <ul className="flex flex-wrap gap-2">
            {nav.slice(1).map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="inline-flex min-h-11 items-center rounded-full border border-white/15 px-4 text-sm transition-colors hover:border-accent hover:text-accent">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
