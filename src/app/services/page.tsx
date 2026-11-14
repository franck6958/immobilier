import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHero, SectionHeading } from "@/components/ui/PageHero";
import { ButtonLink } from "@/components/ui/Button";
import { Faq } from "@/components/ui/Faq";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { generalFaq, services } from "@/lib/content";

export const metadata: Metadata = {
  title: "Services — Achat, vente, location, gestion locative, estimation",
  description:
    "Achat, vente, location, gestion locative, estimation gratuite et accompagnement de la diaspora à Douala, Yaoundé et Kribi. Biens vérifiés, honoraires transparents.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Nos services"
        title="Acheter, vendre, louer, faire gérer."
        intro="Six services complémentaires pour mener votre projet immobilier de bout en bout, avec un conseiller dédié."
        crumbs={[{ label: "Services" }]}
        image="/images/quartier-affaires.webp"
        imageAlt="Immeubles du quartier des affaires"
      />

      <section className="py-24 md:py-32" aria-label="Liste des services">
        <Stagger className="container-x grid gap-6 md:grid-cols-2" stagger={0.1}>
          {services.map((s, i) => (
            <StaggerItem key={s.slug}>
              <Link
                href={`/services/${s.slug}`}
                className="group relative flex h-full flex-col overflow-hidden rounded-[2rem] bg-white p-3 ring-1 ring-line transition-shadow duration-500 hover:shadow-[0_40px_80px_-40px_rgb(20_17_15/0.4)]"
              >
                <div className="relative aspect-[16/10] overflow-hidden rounded-[1.5rem]">
                  <Image
                    src={s.image}
                    alt={s.imageAlt}
                    fill
                    sizes="(min-width: 768px) 45vw, 100vw"
                    className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-105"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-paper/90 px-3 py-1.5 text-xs font-semibold backdrop-blur">
                    0{i + 1} · {s.kicker}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5 md:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-2xl font-bold md:text-3xl">{s.title}</h2>
                    <span className="grid size-12 shrink-0 place-items-center rounded-full bg-sand transition-all duration-500 group-hover:rotate-45 group-hover:bg-accent">
                      <ArrowUpRight className="size-5" aria-hidden />
                    </span>
                  </div>
                  <p className="mt-3 text-muted">{s.short}</p>
                  <p className="mt-auto pt-6 text-sm font-semibold text-accent-strong">{s.price}</p>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="bg-sand py-24 md:py-32" aria-labelledby="faq-services">
        <div className="container-x grid gap-14 lg:grid-cols-[1fr_1.4fr] lg:gap-24">
          <div>
            <SectionHeading id="faq-services" eyebrow="FAQ" title="Questions" accent="fréquentes." />
            <Reveal delay={0.2} className="mt-10">
              <ButtonLink href="/demande">Confier mon projet</ButtonLink>
            </Reveal>
          </div>
          <Faq items={generalFaq} />
        </div>
      </section>
    </>
  );
}
