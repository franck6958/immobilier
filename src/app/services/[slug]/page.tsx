import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Check } from "lucide-react";
import { PageHero, SectionHeading } from "@/components/ui/PageHero";
import { ButtonLink } from "@/components/ui/Button";
import { Faq } from "@/components/ui/Faq";
import { ImageReveal, Reveal, Stagger, StaggerItem } from "@/components/motion";
import { JsonLd } from "@/components/seo/JsonLd";
import { WhatsAppIcon } from "@/components/icons";
import { services } from "@/lib/content";
import { site, whatsappLink } from "@/lib/site";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const s = services.find((x) => x.slug === slug);
  if (!s) return {};
  return {
    title: `${s.title} à Douala — ${s.kicker}`,
    description: `${s.short} ${s.price}. Réponse sous 24 h.`,
    alternates: { canonical: `/services/${s.slug}` },
    openGraph: { images: [{ url: s.image, alt: s.imageAlt }] },
  };
}

export default async function ServicePage({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const s = services.find((x) => x.slug === slug);
  if (!s) notFound();
  const others = services.filter((x) => x.slug !== s.slug).slice(0, 3);

  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: s.title,
      description: s.intro,
      serviceType: s.kicker,
      provider: { "@id": `${site.url}/#entreprise` },
      areaServed: site.areaServed.map((c) => ({ "@type": "City", name: c })),
      url: `${site.url}/services/${s.slug}`,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: s.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ];

  return (
    <>
      <JsonLd data={ld} />
      <PageHero
        eyebrow={s.kicker}
        title={s.title}
        intro={s.intro}
        crumbs={[{ label: "Services", href: "/services" }, { label: s.title }]}
        image={s.image}
        imageAlt={s.imageAlt}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/demande">Confier mon projet</ButtonLink>
          <ButtonLink href={whatsappLink(`Bonjour, je souhaite des informations sur votre service : ${s.title}.`)} variant="outline-light" icon={<WhatsAppIcon className="size-4" />}>
            Poser une question
          </ButtonLink>
        </div>
      </PageHero>

      {/* Avantages */}
      <section className="py-24 md:py-32" aria-labelledby="avantages">
        <div className="container-x">
          <SectionHeading id="avantages" eyebrow="Pourquoi nous" title="Les avantages" accent="Ébène." className="mb-14" />
          <Stagger className="grid gap-5 md:grid-cols-3">
            {s.benefits.map((b, i) => (
              <StaggerItem key={b.title} className="rounded-3xl border border-line bg-white p-8">
                <span className="grid size-12 place-items-center rounded-2xl bg-accent text-lg font-bold text-ink">{i + 1}</span>
                <h3 className="mt-8 text-2xl font-bold">{b.title}</h3>
                <p className="mt-3 text-muted">{b.text}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Ce qui est inclus */}
      <section className="dark-section bg-ink py-24 text-paper md:py-32" aria-labelledby="inclus">
        <div className="container-x grid items-center gap-14 lg:grid-cols-2 lg:gap-24">
          <ImageReveal className="aspect-[4/3] rounded-[2rem]">
            <Image src={s.image} alt="" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
          </ImageReveal>
          <div>
            <SectionHeading id="inclus" eyebrow="Prestation" title="Ce qui est" accent="inclus." />
            <Stagger as="ul" className="mt-10 grid gap-4 sm:grid-cols-2" stagger={0.06}>
              {s.includes.map((it) => (
                <StaggerItem as="li" key={it} className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-accent text-ink">
                    <Check className="size-3.5" strokeWidth={3} aria-hidden />
                  </span>
                  <span className="text-paper/90">{it}</span>
                </StaggerItem>
              ))}
            </Stagger>
            <Reveal delay={0.2} className="mt-10 rounded-2xl border border-white/15 p-6">
              <p className="text-sm uppercase tracking-wider text-muted-dark">Tarif indicatif</p>
              <p className="mt-1 text-xl font-semibold text-accent">{s.price}</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 md:py-32" aria-labelledby="faq-service">
        <div className="container-x grid gap-14 lg:grid-cols-[1fr_1.4fr] lg:gap-24">
          <SectionHeading id="faq-service" eyebrow="FAQ" title={`${s.title} :`} accent="vos questions." />
          <Faq items={s.faq} />
        </div>
      </section>

      {/* Autres services (maillage interne) */}
      <section className="bg-sand py-24" aria-labelledby="autres">
        <div className="container-x">
          <h2 id="autres" className="mb-10 text-3xl font-bold md:text-4xl">Autres services</h2>
          <ul className="grid gap-4 md:grid-cols-3">
            {others.map((o) => (
              <li key={o.slug}>
                <Link href={`/services/${o.slug}`} className="group flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-line transition-shadow hover:shadow-lg">
                  <span className="relative size-20 shrink-0 overflow-hidden rounded-xl">
                    <Image src={o.image} alt="" fill sizes="80px" className="object-cover" />
                  </span>
                  <span className="flex-1">
                    <span className="block font-bold">{o.title}</span>
                    <span className="block text-sm text-muted">{o.kicker}</span>
                  </span>
                  <ArrowUpRight className="size-5 transition-transform group-hover:rotate-45" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
