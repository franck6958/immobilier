import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Bath, BedDouble, Building2, CalendarCheck, Check, ChevronRight, LandPlot, MapPin, Maximize, Phone, Sofa } from "lucide-react";
import { PropertyGallery } from "@/components/property/PropertyGallery";
import { PropertyCard } from "@/components/property/PropertyCard";
import { ButtonLink } from "@/components/ui/Button";
import { ShareButtons } from "@/components/ui/ShareButtons";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { JsonLd } from "@/components/seo/JsonLd";
import { WhatsAppIcon } from "@/components/icons";
import { team } from "@/lib/content";
import { getPublishedProperties } from "@/lib/data/properties";
import { site, whatsappLink } from "@/lib/site";
import { formatNumber, formatPrice } from "@/lib/utils";

export async function generateStaticParams() {
  const properties = await getPublishedProperties();
  return properties.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/biens/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = (await getPublishedProperties()).find((x) => x.slug === slug);
  if (!p) return {};
  const verb = p.transaction === "Vente" ? "à vendre" : "à louer";
  return {
    title: `${p.title} ${verb} — ${p.district}, ${p.city}`,
    description: `${p.type} ${verb} à ${p.district} (${p.city}) : ${p.surface} m²${p.bedrooms ? `, ${p.bedrooms} chambres` : ""}. ${formatPrice(p.price)}${p.transaction === "Location" ? " / mois" : ""}. ${p.summary}`,
    alternates: { canonical: `/biens/${p.slug}` },
    openGraph: { images: [{ url: p.images[0], alt: p.imageAlt }] },
  };
}

export default async function PropertyPage({ params }: PageProps<"/biens/[slug]">) {
  const { slug } = await params;
  const properties = await getPublishedProperties();
  const p = properties.find((x) => x.slug === slug);
  if (!p) notFound();

  const agent = team[p.agent] ?? team[0];
  const isSale = p.transaction === "Vente";
  const priceText = `${formatPrice(p.price)}${isSale ? "" : " / mois"}`;
  const url = `${site.url}/biens/${p.slug}`;
  const similar = properties
    .filter((x) => x.slug !== p.slug && (x.type === p.type || x.transaction === p.transaction))
    .slice(0, 3);
  const waMsg = `Bonjour, je suis intéressé(e) par le bien réf. ${p.ref} (${p.title}, ${p.district}). Est-il toujours disponible ?`;

  const facts = [
    { Icon: Maximize, label: p.type === "Terrain" ? "Superficie" : "Surface habitable", value: `${formatNumber(p.surface)} m²` },
    p.land ? { Icon: LandPlot, label: "Terrain", value: `${formatNumber(p.land)} m²` } : null,
    p.bedrooms !== undefined ? { Icon: BedDouble, label: "Chambres", value: String(p.bedrooms) } : null,
    p.bathrooms !== undefined ? { Icon: Bath, label: "Salles de bain", value: String(p.bathrooms) } : null,
    { Icon: Building2, label: "Type", value: p.type },
    p.furnished ? { Icon: Sofa, label: "Ameublement", value: "Meublé" } : null,
  ].filter(Boolean) as { Icon: typeof Maximize; label: string; value: string }[];

  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "RealEstateListing",
      name: p.title,
      description: p.summary,
      url,
      image: p.images.map((i) => `${site.url}${i}`),
      offers: {
        "@type": "Offer",
        price: p.price,
        priceCurrency: "XAF",
        businessFunction: isSale ? "http://purl.org/goodrelations/v1#Sell" : "http://purl.org/goodrelations/v1#LeaseOut",
        availability: p.badge === "Sous compromis" ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
        seller: { "@id": `${site.url}/#entreprise` },
      },
      about: {
        "@type": p.type === "Appartement" ? "Apartment" : p.type === "Terrain" ? "Place" : p.type === "Bureau" ? "Place" : "SingleFamilyResidence",
        floorSize: { "@type": "QuantitativeValue", value: p.surface, unitCode: "MTK" },
        ...(p.bedrooms !== undefined ? { numberOfRooms: p.bedrooms } : {}),
        address: { "@type": "PostalAddress", addressLocality: p.city, addressRegion: p.district, addressCountry: "CM" },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Accueil", item: site.url },
        { "@type": "ListItem", position: 2, name: "Nos biens", item: `${site.url}/biens` },
        { "@type": "ListItem", position: 3, name: p.title },
      ],
    },
  ];

  return (
    <>
      <JsonLd data={ld} />
      {/* Bandeau sombre sous l'en-tête */}
      <div className="dark-section bg-ink pb-10 pt-28 text-paper md:pt-36">
        <div className="container-x">
          <Reveal y={12}>
            <nav aria-label="Fil d'Ariane" className="mb-8">
              <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-dark">
                <li className="flex items-center gap-1.5"><Link href="/" className="hover:text-paper">Accueil</Link><ChevronRight className="size-3.5" aria-hidden /></li>
                <li className="flex items-center gap-1.5"><Link href="/biens" className="hover:text-paper">Nos biens</Link><ChevronRight className="size-3.5" aria-hidden /></li>
                <li><span aria-current="page" className="text-paper">{p.title}</span></li>
              </ol>
            </nav>
          </Reveal>
          <Reveal className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <div className="mb-4 flex flex-wrap gap-2">
                <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${isSale ? "bg-accent text-ink" : "bg-paper text-ink"}`}>
                  {isSale ? "À vendre" : "À louer"}
                </span>
                {p.badge && <span className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold">{p.badge}</span>}
                <span className="rounded-full border border-white/20 px-3 py-1.5 text-xs text-muted-dark">Réf. {p.ref}</span>
              </div>
              <h1 className="max-w-3xl text-4xl font-bold md:text-6xl">{p.title}</h1>
              <p className="mt-4 flex items-center gap-2 text-lg text-paper/80">
                <MapPin className="size-5 text-accent" aria-hidden /> {p.district}, {p.city}
              </p>
            </div>
            <p className="text-3xl font-bold tracking-tight text-accent md:text-5xl">
              {formatPrice(p.price)}
              {!isSale && <span className="text-lg font-medium text-paper/70"> / mois</span>}
            </p>
          </Reveal>
        </div>
      </div>

      <section className="py-12 md:py-16">
        <div className="container-x grid gap-12 lg:grid-cols-[1.7fr_1fr] lg:gap-16">
          <div className="min-w-0">
            <Reveal>
              <PropertyGallery images={p.images} alt={p.imageAlt} />
            </Reveal>

            <Stagger as="ul" className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3" stagger={0.06}>
              {facts.map(({ Icon, label, value }) => (
                <StaggerItem as="li" key={label} className="rounded-2xl border border-line bg-white p-5">
                  <Icon className="size-5 text-accent-strong" aria-hidden />
                  <p className="mt-3 text-sm text-muted">{label}</p>
                  <p className="text-lg font-bold">{value}</p>
                </StaggerItem>
              ))}
            </Stagger>

            <Reveal className="mt-14">
              <h2 className="text-2xl font-bold md:text-3xl">Description</h2>
              <div className="mt-5 space-y-4 text-lg leading-relaxed text-ink/80">
                {p.description.map((d, i) => (
                  <p key={i}>{d}</p>
                ))}
              </div>
            </Reveal>

            <Reveal className="mt-14">
              <h2 className="text-2xl font-bold md:text-3xl">Prestations</h2>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-3">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent text-ink">
                      <Check className="size-3.5" strokeWidth={3} aria-hidden />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal className="mt-14 rounded-3xl bg-sand p-6 text-sm text-muted md:p-8">
              <p>
                <strong className="text-ink">Bon à savoir :</strong>{" "}
                {isSale
                  ? "le titre foncier et l'identité du vendeur ont été vérifiés par notre service juridique. Le paiement s'effectue exclusivement chez le notaire."
                  : "le bien a été visité par notre équipe. Le bail et l'état des lieux sont établis par l'agence. Les conditions de caution sont précisées lors de la visite."}
              </p>
            </Reveal>
          </div>

          {/* Encadré contact */}
          <aside className="lg:sticky lg:top-28 lg:self-start" aria-label="Contacter l'agence pour ce bien">
            <Reveal delay={0.1} className="rounded-[2rem] bg-white p-6 shadow-[0_30px_80px_-40px_rgb(20_17_15/0.35)] ring-1 ring-line md:p-8">
              <p className="text-sm text-muted">{isSale ? "Prix de vente" : "Loyer mensuel"}</p>
              <p className="text-3xl font-bold tracking-tight">{priceText}</p>
              {isSale && <p className="mt-1 text-sm text-muted">Honoraires à la charge du vendeur</p>}

              <div className="my-6 h-px bg-line" />

              <div className="flex items-center gap-4">
                <span className="relative size-16 shrink-0 overflow-hidden rounded-full bg-sand">
                  <Image src={agent.image} alt={`Portrait de ${agent.name}`} fill sizes="64px" className="object-cover object-top" />
                </span>
                <div>
                  <p className="font-bold">{agent.name}</p>
                  <p className="text-sm text-muted">{agent.role}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                <ButtonLink href={whatsappLink(waMsg)} icon={<WhatsAppIcon className="size-4" />} className="w-full">
                  Je suis intéressé(e)
                </ButtonLink>
                <ButtonLink
                  href={`/demande?projet=${isSale ? "Acheter" : "Louer"}&bien=${encodeURIComponent(p.ref)}`}
                  variant="dark"
                  icon={<CalendarCheck className="size-4" />}
                  className="w-full"
                >
                  Demander une visite
                </ButtonLink>
                <ButtonLink href={site.contact.phoneHref} variant="outline" icon={<Phone className="size-4" />} className="w-full">
                  {site.contact.phone}
                </ButtonLink>
              </div>
              <div className="mt-8 border-t border-line pt-6">
                <ShareButtons url={url} title={`${p.title} — ${p.district}, ${p.city}`} />
              </div>
            </Reveal>
          </aside>
        </div>
      </section>

      {similar.length > 0 && (
        <section className="bg-sand py-20 md:py-28" aria-labelledby="similaires">
          <div className="container-x">
            <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <h2 id="similaires" className="text-3xl font-bold md:text-4xl">Biens similaires</h2>
              <ButtonLink href="/biens" variant="outline">Tous nos biens</ButtonLink>
            </div>
            <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={0.1}>
              {similar.map((s) => (
                <StaggerItem key={s.slug}>
                  <PropertyCard p={s} />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      )}
    </>
  );
}
