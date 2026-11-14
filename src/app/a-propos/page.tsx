import type { Metadata } from "next";
import Image from "next/image";
import { Award, BadgeCheck, FileCheck2, Landmark } from "lucide-react";
import { PageHero, SectionHeading } from "@/components/ui/PageHero";
import { ButtonLink } from "@/components/ui/Button";
import { Counter, ImageReveal, Parallax, Reveal, Stagger, StaggerItem } from "@/components/motion";
import { stats, team, values } from "@/lib/content";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "L'agence — Notre histoire, nos valeurs, notre équipe",
  description: `Depuis ${site.foundingYear}, ${site.name} accompagne acheteurs, vendeurs, locataires et propriétaires à Douala, Yaoundé et Kribi. Découvrez notre équipe de conseillers.`,
  alternates: { canonical: "/a-propos" },
};

const timeline = [
  { year: "2013", text: "Création de l'agence à Bonapriso par Samuel Ndjock, avec une conviction : sécuriser chaque transaction." },
  { year: "2016", text: "Lancement du service de gestion locative. 50 premiers biens confiés par des propriétaires." },
  { year: "2019", text: "Visites vidéo en direct et signature par procuration pour les clients de la diaspora." },
  { year: "2022", text: "Ouverture d'une antenne à Yaoundé et d'un service juridique foncier intégré." },
  { year: "2025", text: "Plus de 850 biens vendus et loués, 320 biens en gestion à Douala, Yaoundé et Kribi." },
];

const certifications = [
  { Icon: BadgeCheck, title: "Agence agréée", text: "Agrément, RCCM et NIU à jour" },
  { Icon: FileCheck2, title: "Service juridique", text: "Contrôle foncier systématique" },
  { Icon: Landmark, title: "Notaires partenaires", text: "Fonds sécurisés en séquestre" },
  { Icon: Award, title: "Conseillers formés", text: "Droit immobilier et fiscalité" },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="L'agence"
        title="Votre partenaire immobilier depuis 2013."
        intro="Des conseillers qui connaissent chaque rue de Douala, Yaoundé et Kribi, et une conviction : une transaction réussie, c'est une transaction sans mauvaise surprise."
        crumbs={[{ label: "L'agence" }]}
        image="/images/quartier-affaires.webp"
        imageAlt="Immeubles du quartier des affaires"
      />

      {/* Mission */}
      <section className="py-24 md:py-32" aria-labelledby="mission">
        <div className="container-x grid items-center gap-14 lg:grid-cols-2 lg:gap-24">
          <div>
            <SectionHeading id="mission" eyebrow="Notre mission" title="Rendre l'immobilier" accent="simple et sûr." />
            <Reveal delay={0.2} className="mt-8 space-y-5 text-lg text-muted">
              <p>
                Acheter ou louer est souvent l&apos;engagement d&apos;une vie. Trop de familles ont connu les doubles
                ventes, les terrains litigieux et les annonces qui ne correspondent pas à la réalité.
              </p>
              <p>
                Nous avons créé {site.name} pour offrir l&apos;inverse : des biens visités et vérifiés, des prix
                justes, des honoraires transparents et un conseiller qui vous accompagne jusqu&apos;au notaire.
              </p>
            </Reveal>
          </div>
          <ImageReveal className="aspect-[5/4] rounded-[2rem]">
            <Image src="/images/salon-lumineux.webp" alt="Séjour lumineux d'un appartement proposé par l'agence" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
          </ImageReveal>
        </div>
      </section>

      {/* Chiffres */}
      <section className="dark-section bg-ink py-20 text-paper" aria-label="Chiffres clés">
        <dl className="container-x grid grid-cols-2 gap-10 lg:grid-cols-4">
          {stats.map((s) => (
            <Reveal key={s.label} className="border-l border-white/15 pl-6">
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <Counter value={s.value} decimals={s.decimals} suffix={s.suffix} className="block text-4xl font-bold text-accent md:text-6xl" />
                <span className="mt-2 block text-muted-dark">{s.label}</span>
              </dd>
            </Reveal>
          ))}
        </dl>
      </section>

      {/* Valeurs */}
      <section className="py-24 md:py-32" aria-labelledby="valeurs">
        <div className="container-x">
          <SectionHeading id="valeurs" eyebrow="Nos valeurs" title="Ce qui guide" accent="chaque transaction." className="mb-14" />
          <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => (
              <StaggerItem key={v.title} className="group rounded-3xl border border-line bg-white p-8 transition-colors duration-500 hover:bg-ink hover:text-paper">
                <span className="text-sm font-semibold tabular-nums text-accent-strong group-hover:text-accent">0{i + 1}</span>
                <h3 className="mt-10 text-2xl font-bold">{v.title}</h3>
                <p className="mt-3 text-muted transition-colors group-hover:text-muted-dark">{v.text}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Histoire */}
      <section className="bg-sand py-24 md:py-32" aria-labelledby="histoire">
        <div className="container-x grid gap-14 lg:grid-cols-[1fr_1.4fr] lg:gap-24">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <SectionHeading id="histoire" eyebrow="Notre histoire" title="Douze ans," accent="850 transactions." />
          </div>
          <ol className="relative border-l-2 border-line">
            {timeline.map((t, i) => (
              <li key={t.year} className="relative pb-12 pl-10 last:pb-0">
                <span aria-hidden className="absolute -left-[9px] top-2 size-4 rounded-full border-4 border-sand bg-accent" />
                <Reveal delay={i * 0.05}>
                  <p className="text-4xl font-bold tracking-tight md:text-5xl">{t.year}</p>
                  <p className="mt-3 max-w-lg text-lg text-muted">{t.text}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Équipe */}
      <section className="py-24 md:py-32" aria-labelledby="equipe">
        <div className="container-x">
          <SectionHeading id="equipe" eyebrow="L'équipe" title="Des conseillers," accent="pas un standard." className="mb-14" />
          <Stagger className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3" stagger={0.12}>
            {team.map((m) => (
              <StaggerItem key={m.name}>
                <figure className="group">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-sand">
                    <Image
                      src={m.image}
                      alt={`Portrait de ${m.name}, ${m.role}`}
                      fill
                      sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
                    />
                  </div>
                  <figcaption className="mt-5">
                    <p className="text-xl font-bold">{m.name}</p>
                    <p className="text-muted">{m.role}</p>
                  </figcaption>
                </figure>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Garanties */}
      <section className="border-y border-line py-16" aria-label="Garanties et agréments">
        <Stagger className="container-x grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {certifications.map(({ Icon, title, text }) => (
            <StaggerItem key={title} className="flex items-center gap-4">
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-ink text-accent">
                <Icon className="size-6" aria-hidden />
              </span>
              <div>
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-muted">{text}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <Parallax className="h-[50vh] md:h-[70vh]">
        <Image src="/images/villa-tropicale.webp" alt="Villa à vérandas avec piscine" fill sizes="100vw" className="object-cover" />
      </Parallax>

      <section className="py-20 text-center">
        <Reveal className="container-x">
          <h2 className="mx-auto max-w-3xl text-3xl font-bold md:text-5xl">Un projet immobilier en tête ?</h2>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/demande">Parler à un conseiller</ButtonLink>
            <ButtonLink href="/biens" variant="outline">Voir nos biens</ButtonLink>
          </div>
        </Reveal>
      </section>
    </>
  );
}
