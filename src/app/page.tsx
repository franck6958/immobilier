import Image from "next/image";
import { FileCheck2, KeyRound, ShieldCheck, Video } from "lucide-react";
import { Hero } from "@/components/home/Hero";
import { Marquee } from "@/components/home/Marquee";
import { ServicesList } from "@/components/home/ServicesList";
import { Process } from "@/components/home/Process";
import { Testimonials } from "@/components/home/Testimonials";
import { FeaturedProperties } from "@/components/property/FeaturedProperties";
import { ButtonLink } from "@/components/ui/Button";
import { Faq } from "@/components/ui/Faq";
import { PostCard } from "@/components/ui/PostCard";
import { SectionHeading } from "@/components/ui/PageHero";
import { Counter, ImageReveal, Parallax, Reveal, Stagger, StaggerItem } from "@/components/motion";
import { JsonLd } from "@/components/seo/JsonLd";
import { districts, generalFaq, posts, services, stats } from "@/lib/content";
import { getPublishedProperties } from "@/lib/data/properties";
import { site, whatsappLink } from "@/lib/site";
import { WhatsAppIcon } from "@/components/icons";

const guarantees = [
  { Icon: ShieldCheck, title: "Biens vérifiés", text: "Titre foncier et propriétaire contrôlés." },
  { Icon: Video, title: "Visites vidéo", text: "Visitez en direct, même depuis l'étranger." },
  { Icon: FileCheck2, title: "Jusqu'au notaire", text: "Paiement sécurisé, acte authentique." },
  { Icon: KeyRound, title: "Gestion locative", text: "Loyers encaissés, bien entretenu." },
];

export default async function HomePage() {
  const properties = await getPublishedProperties();
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: generalFaq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <JsonLd data={faqLd} />
      <Hero />

      {/* Bandeau défilant */}
      <div className="bg-accent py-5 text-xl font-bold tracking-tight text-ink md:py-7 md:text-3xl">
        <Marquee items={services.map((s) => s.title).concat(["Visites vidéo", "Titres vérifiés"])} />
      </div>

      {/* Garanties */}
      <section aria-labelledby="garanties" className="border-b border-line bg-paper">
        <h2 id="garanties" className="sr-only">Nos engagements</h2>
        <Stagger className="container-x grid divide-line sm:grid-cols-2 sm:divide-x lg:grid-cols-4" stagger={0.1}>
          {guarantees.map(({ Icon, title, text }) => (
            <StaggerItem key={title} className="flex gap-4 border-b border-line py-8 sm:px-6 lg:border-b-0 lg:py-10 first:sm:pl-0">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-accent-soft text-accent-strong">
                <Icon className="size-5" aria-hidden />
              </span>
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted">{text}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* Biens à la une (scroll horizontal épinglé) */}
      <FeaturedProperties properties={properties} />

      {/* L'agence + chiffres */}
      <section className="py-24 md:py-36" aria-labelledby="agence-titre">
        <div className="container-x grid items-center gap-14 lg:grid-cols-2 lg:gap-24">
          <div className="relative">
            <ImageReveal className="aspect-[4/5] rounded-[2rem]">
              <Image
                src="/images/accord-clients.webp"
                alt="Conseillers de l'agence célébrant la signature d'un client"
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
            </ImageReveal>
            <Reveal
              delay={0.4}
              className="absolute -bottom-8 right-4 w-56 rounded-3xl bg-ink p-6 text-paper shadow-2xl sm:-right-6 md:w-64"
            >
              <p className="text-5xl font-bold text-accent">
                <Counter value={100} suffix=" %" />
              </p>
              <p className="mt-2 text-sm text-muted-dark">des biens proposés contrôlés par notre service juridique.</p>
            </Reveal>
          </div>

          <div>
            <SectionHeading id="agence-titre" eyebrow="L'agence" title="Une agence immobilière" accent="qui vérifie tout." />
            <Reveal delay={0.2} className="mt-8 space-y-5 text-lg text-muted">
              <p>
                Fondée à Douala en {site.foundingYear}, {site.name} accompagne particuliers, familles de la diaspora,
                investisseurs et entreprises dans tous leurs projets immobiliers.
              </p>
              <p>
                Notre différence : aucun bien n&apos;est proposé sans vérification de sa situation foncière, et chaque
                client a un conseiller dédié, joignable sur WhatsApp, du premier échange à la remise des clés.
              </p>
            </Reveal>
            <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 border-t border-line pt-10">
              {stats.map((s) => (
                <Reveal key={s.label}>
                  <dt className="sr-only">{s.label}</dt>
                  <dd>
                    <Counter value={s.value} decimals={s.decimals} suffix={s.suffix} className="block text-4xl font-bold tracking-tight md:text-5xl" />
                    <span className="mt-2 block text-sm text-muted">{s.label}</span>
                  </dd>
                </Reveal>
              ))}
            </dl>
            <Reveal delay={0.1} className="mt-12">
              <ButtonLink href="/a-propos" variant="dark">Découvrir l&apos;agence</ButtonLink>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="bg-sand py-24 md:py-36" aria-labelledby="services-titre">
        <div className="container-x">
          <div className="mb-14 flex flex-col justify-between gap-8 md:mb-20 lg:flex-row lg:items-end">
            <SectionHeading id="services-titre" eyebrow="Nos services" title="Acheter, vendre, louer," accent="faire gérer." />
            <Reveal delay={0.2}>
              <ButtonLink href="/services" variant="outline">Tous les services</ButtonLink>
            </Reveal>
          </div>
          <ServicesList />
        </div>
      </section>

      {/* Méthode */}
      <section className="py-24 md:py-36" aria-labelledby="methode-titre">
        <div className="container-x grid gap-14 lg:grid-cols-[1fr_1.2fr] lg:gap-24">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <SectionHeading
              id="methode-titre"
              eyebrow="Acheter avec nous"
              title="Quatre étapes,"
              accent="zéro risque."
              intro="Une méthode pensée pour que vous achetiez en toute sécurité — même à des milliers de kilomètres."
            />
            <Reveal delay={0.3} className="mt-10">
              <ButtonLink href="/demande?projet=Acheter">Confier ma recherche</ButtonLink>
            </Reveal>
          </div>
          <Process />
        </div>
      </section>

      {/* Estimation propriétaires */}
      <section className="px-3 pb-24 md:px-6 md:pb-36" aria-labelledby="estimation-titre">
        <div className="dark-section grain relative isolate overflow-hidden rounded-[2.5rem] bg-ink text-paper">
          <div className="grid items-center lg:grid-cols-2">
            <div className="p-8 sm:p-12 lg:p-20">
              <SectionHeading
                id="estimation-titre"
                eyebrow="Propriétaires"
                title="Combien vaut"
                accent="votre bien ?"
                intro="Visite sous 72 h, avis de valeur écrit sous 48 h, basé sur les ventes réelles de votre quartier. Gratuit et sans engagement."
              />
              <Reveal delay={0.25} className="mt-10 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/demande?projet=Vendre">Estimer mon bien</ButtonLink>
                <ButtonLink href={whatsappLink("Bonjour, je souhaite faire estimer mon bien.")} variant="outline-light" icon={<WhatsAppIcon className="size-4" />}>
                  Par WhatsApp
                </ButtonLink>
              </Reveal>
            </div>
            <ImageReveal className="aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[34rem]">
              <Image src="/images/cles-maison.webp" alt="Maquette de maison et trousseau de clés" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            </ImageReveal>
          </div>
        </div>
      </section>

      {/* Avis */}
      <section className="dark-section relative overflow-hidden bg-ink py-24 text-paper md:py-36" aria-labelledby="avis-titre">
        <div className="container-x grid gap-14 lg:grid-cols-[0.8fr_1.4fr] lg:gap-24">
          <div>
            <p className="eyebrow mb-5">Ils nous ont fait confiance</p>
            <h2 id="avis-titre" className="text-[2rem] font-bold sm:text-5xl">
              <span className="text-accent">{site.rating.value.toLocaleString("fr-FR")}</span>/5 sur Google
            </h2>
            <p className="mt-5 text-lg text-muted-dark">
              {site.rating.count} avis vérifiés d&apos;acheteurs, vendeurs, locataires et propriétaires.
            </p>
            <div className="mt-10">
              <ButtonLink href="/temoignages" variant="outline-light">Lire tous les avis</ButtonLink>
            </div>
          </div>
          <Testimonials />
        </div>
      </section>

      {/* Quartiers */}
      <section aria-label="Quartiers où nous intervenons" className="border-b border-line py-10 md:py-14">
        <p className="container-x mb-8 text-center text-sm font-medium uppercase tracking-[0.16em] text-muted">
          Nous connaissons chaque quartier
        </p>
        <Marquee items={districts} separator="—" className="text-3xl font-black tracking-tight text-ink/25 md:text-5xl" reverse />
      </section>

      {/* Bande image parallaxe */}
      <Parallax className="h-[55vh] md:h-[75vh]" offset={120}>
        <Image src="/images/villa-bassin.webp" alt="Villa moderne avec piscine à Kribi" fill sizes="100vw" className="object-cover" />
      </Parallax>

      {/* Blog */}
      <section className="py-24 md:py-36" aria-labelledby="blog-titre">
        <div className="container-x">
          <div className="mb-14 flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <SectionHeading id="blog-titre" eyebrow="Conseils & marché" title="Investir" accent="en connaissance de cause." />
            <Reveal delay={0.2}>
              <ButtonLink href="/blog" variant="outline">Tous les articles</ButtonLink>
            </Reveal>
          </div>
          <Stagger className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3" stagger={0.12}>
            {posts.map((p) => (
              <StaggerItem key={p.slug}>
                <PostCard post={p} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-sand py-24 md:py-36" aria-labelledby="faq-titre">
        <div className="container-x grid gap-14 lg:grid-cols-[1fr_1.4fr] lg:gap-24">
          <SectionHeading
            id="faq-titre"
            eyebrow="Questions fréquentes"
            title="Vous vous posez"
            accent="la question ?"
            intro="Vous ne trouvez pas votre réponse ? Écrivez-nous sur WhatsApp, nous répondons en moins d'une heure."
          />
          <Reveal delay={0.15}>
            <Faq items={generalFaq} />
          </Reveal>
        </div>
      </section>
    </>
  );
}
