import type { Metadata } from "next";
import { Quote, Star } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { ButtonLink } from "@/components/ui/Button";
import { Counter, Reveal, Stagger, StaggerItem } from "@/components/motion";
import { JsonLd } from "@/components/seo/JsonLd";
import { testimonials } from "@/lib/content";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Avis clients — Témoignages et notes Google",
  description: `${site.rating.value}/5 sur ${site.rating.count} avis Google. Découvrez ce que nos clients disent de leur expérience avec ${site.name}.`,
  alternates: { canonical: "/temoignages" },
};

const distribution = [
  { stars: 5, pct: 91 },
  { stars: 4, pct: 7 },
  { stars: 3, pct: 2 },
  { stars: 2, pct: 0 },
  { stars: 1, pct: 0 },
];

export default function TestimonialsPage() {
  const ld = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": `${site.url}/#entreprise`,
    name: site.name,
    review: testimonials.map((t) => ({
      "@type": "Review",
      author: { "@type": "Person", name: t.name },
      reviewRating: { "@type": "Rating", ratingValue: t.rating, bestRating: 5 },
      reviewBody: t.text,
    })),
  };

  return (
    <>
      <JsonLd data={ld} />
      <PageHero
        eyebrow="Avis clients"
        title="Ce sont nos clients qui en parlent le mieux."
        crumbs={[{ label: "Avis" }]}
      />

      <section className="border-b border-line py-16 md:py-20" aria-label="Note globale">
        <div className="container-x grid items-center gap-12 md:grid-cols-[auto_1fr] md:gap-20">
          <Reveal className="text-center md:text-left">
            <p className="text-7xl font-bold tracking-tight md:text-8xl">
              <Counter value={site.rating.value} decimals={1} />
            </p>
            <div className="mt-3 flex justify-center gap-1 md:justify-start" role="img" aria-label="Note de 5 étoiles sur 5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-6 fill-accent text-accent" aria-hidden />
              ))}
            </div>
            <p className="mt-3 text-muted">{site.rating.count} avis Google vérifiés</p>
          </Reveal>
          <Reveal delay={0.15}>
            <ul className="space-y-3" aria-label="Répartition des notes">
              {distribution.map((d) => (
                <li key={d.stars} className="grid grid-cols-[3rem_1fr_3rem] items-center gap-4 text-sm">
                  <span className="font-medium">{d.stars} ★</span>
                  <span className="h-2.5 overflow-hidden rounded-full bg-line">
                    <span className="block h-full rounded-full bg-accent" style={{ width: `${d.pct}%` }} />
                  </span>
                  <span className="text-right tabular-nums text-muted">{d.pct} %</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="py-20 md:py-28" aria-label="Témoignages">
        <Stagger className="container-x columns-1 gap-5 md:columns-2 lg:columns-3 [&>*]:mb-5" stagger={0.08}>
          {testimonials.map((t, i) => (
            <StaggerItem key={t.name} className="break-inside-avoid">
              <figure className={`rounded-3xl p-8 ${i % 3 === 1 ? "dark-section bg-ink text-paper" : "border border-line bg-white"}`}>
                <Quote className="size-9 text-accent" aria-hidden />
                <div className="mt-6 flex gap-0.5" role="img" aria-label={`Note : ${t.rating} sur 5`}>
                  {Array.from({ length: 5 }).map((_, k) => (
                    <Star key={k} className={`size-4 ${k < t.rating ? "fill-accent text-accent" : "text-line"}`} aria-hidden />
                  ))}
                </div>
                <blockquote className="mt-4 text-lg leading-relaxed">« {t.text} »</blockquote>
                <figcaption className="mt-6 border-t border-current/10 pt-5">
                  <p className="font-semibold">{t.name}</p>
                  <p className={`text-sm ${i % 3 === 1 ? "text-muted-dark" : "text-muted"}`}>
                    {t.role} · {t.project}
                  </p>
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="bg-sand py-20 text-center" aria-labelledby="donner-avis">
        <Reveal className="container-x">
          <h2 id="donner-avis" className="text-3xl font-bold md:text-5xl">Vous êtes client ?</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted">
            Votre avis aide d&apos;autres familles à acheter et louer sereinement. Merci de prendre une minute pour le partager.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="https://www.google.com/maps" variant="dark">Laisser un avis Google</ButtonLink>
            <ButtonLink href="/demande" variant="outline">Démarrer un projet</ButtonLink>
          </div>
        </Reveal>
      </section>
    </>
  );
}
