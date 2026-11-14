import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: `Mentions légales du site ${site.name}.`,
  alternates: { canonical: "/mentions-legales" },
  robots: { index: false, follow: true },
};

export default function LegalPage() {
  return (
    <>
      <PageHero eyebrow="Informations légales" title="Mentions légales" crumbs={[{ label: "Mentions légales" }]} />
      <section className="py-16 md:py-24">
        <div className="container-x prose-article max-w-3xl">
          <h2>Éditeur du site</h2>
          <p>
            {site.legalName}, société au capital de {site.legal.capital}, immatriculée au RCCM sous le numéro{" "}
            {site.legal.rccm}, NIU {site.legal.niu}.
            <br />
            {site.legal.license}
            <br />
            Siège : {site.address.street}, {site.address.postalCode} {site.address.city}, {site.address.country}.
            <br />
            Téléphone : {site.contact.phone} — E-mail : {site.contact.email}
          </p>
          <p>{site.legal.director}</p>
          <h2>Hébergement</h2>
          <p>{site.legal.host}</p>
          <h2>Propriété intellectuelle</h2>
          <p>
            L&apos;ensemble des contenus du site (textes, photographies, logos, éléments graphiques) est la propriété de{" "}
            {site.legalName} ou de ses partenaires, sauf mention contraire. Toute reproduction sans autorisation écrite
            est interdite. Certaines photographies proviennent de la banque d&apos;images Unsplash et sont utilisées
            conformément à sa licence.
          </p>
          <h2>Responsabilité</h2>
          <p>
            Les informations publiées, notamment les tarifs indicatifs, sont fournies à titre informatif et ne
            constituent pas une offre contractuelle. Seul le mandat ou le contrat signé engage {site.legalName}.
          </p>
          <h2>Données personnelles</h2>
          <p>
            Le traitement des données collectées via le site est décrit dans notre politique de confidentialité.
          </p>
        </div>
      </section>
    </>
  );
}
