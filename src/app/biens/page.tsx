import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/ui/PageHero";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/motion";
import { PropertiesExplorer, PropertiesGridStatic } from "@/components/property/PropertiesExplorer";
import { JsonLd } from "@/components/seo/JsonLd";
import { getPublishedProperties } from "@/lib/data/properties";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Nos biens — Villas, appartements, terrains à vendre et à louer",
  description: `Biens vérifiés à vendre et à louer à Douala, Yaoundé et Kribi : villas, appartements, maisons, terrains titrés et bureaux.`,
  alternates: { canonical: "/biens" },
};

export default async function BiensPage() {
  const properties = await getPublishedProperties();
  const ld = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: properties.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${site.url}/biens/${p.slug}`,
      name: p.title,
    })),
  };

  return (
    <>
      <JsonLd data={ld} />
      <PageHero
        eyebrow="Nos biens"
        title="Des biens visités, vérifiés, prêts à vivre."
        intro="Villas, appartements, terrains titrés et bureaux à vendre ou à louer à Douala, Yaoundé et Kribi."
        crumbs={[{ label: "Nos biens" }]}
        image="/images/villa-blanche.webp"
        imageAlt="Villa blanche avec piscine"
      />

      <section className="py-16 md:py-24" aria-label="Catalogue des biens">
        <div className="container-x">
          <Suspense fallback={<PropertiesGridStatic properties={properties} />}>
            <PropertiesExplorer properties={properties} />
          </Suspense>
        </div>
      </section>

      <section className="bg-sand py-20 text-center" aria-labelledby="off-market">
        <Reveal className="container-x">
          <p className="eyebrow mb-5">Biens hors marché</p>
          <h2 id="off-market" className="mx-auto max-w-3xl text-3xl font-bold md:text-5xl">
            Vous ne trouvez pas votre bonheur ?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted">
            Près d&apos;un tiers de nos biens sont vendus avant d&apos;être publiés. Confiez-nous votre recherche, nous vous
            alertons en priorité.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/demande?projet=Acheter">Confier ma recherche</ButtonLink>
            <ButtonLink href="/inscription" variant="outline">Déposer mon bien en ligne</ButtonLink>
          </div>
        </Reveal>
      </section>
    </>
  );
}
