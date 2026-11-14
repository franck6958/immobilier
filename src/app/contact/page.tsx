import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { ContactForm } from "@/components/forms/ContactForm";
import { MapEmbed } from "@/components/MapEmbed";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { WhatsAppIcon } from "@/components/icons";
import { mapsDirectionsLink, site, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact — Appel, WhatsApp, e-mail, adresse à Douala",
  description: `Contactez ${site.name} : ${site.contact.phone}, WhatsApp, ${site.contact.email}. Bureaux à ${site.address.street}, ${site.address.city}. Réponse sous 24 h.`,
  alternates: { canonical: "/contact" },
};

const channels = [
  { Icon: WhatsAppIcon, label: "WhatsApp", value: "Réponse en moins d'1 h", href: whatsappLink(), external: true, highlight: true },
  { Icon: Phone, label: "Téléphone", value: site.contact.phone, href: site.contact.phoneHref },
  { Icon: Mail, label: "E-mail", value: site.contact.email, href: `mailto:${site.contact.email}` },
  { Icon: MapPin, label: "Bureaux", value: `${site.address.street}, ${site.address.city}`, href: mapsDirectionsLink, external: true },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Parlons de votre projet."
        intro="Une question, un bien à visiter, un projet à confier ? Choisissez le canal qui vous convient : nous répondons vite."
        crumbs={[{ label: "Contact" }]}
      />

      <section className="py-16 md:py-24" aria-label="Moyens de contact">
        <Stagger className="container-x grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {channels.map(({ Icon, label, value, href, external, highlight }) => (
            <StaggerItem key={label}>
              <a
                href={href}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className={`group flex h-full flex-col rounded-3xl p-6 transition-all duration-500 hover:-translate-y-1 ${
                  highlight ? "bg-[#25D366] text-[#0b3d1f]" : "border border-line bg-white hover:shadow-xl"
                }`}
              >
                <span className={`grid size-12 place-items-center rounded-2xl ${highlight ? "bg-white/30" : "bg-accent-soft text-accent-strong"}`}>
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="mt-8 text-sm font-semibold uppercase tracking-wider opacity-75">{label}</span>
                <span className="mt-1 break-words text-lg font-semibold">{value}</span>
              </a>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="pb-24 md:pb-32" aria-labelledby="ecrire">
        <div className="container-x grid gap-14 lg:grid-cols-[1.3fr_1fr] lg:gap-20">
          <Reveal className="rounded-[2rem] bg-sand p-6 sm:p-10">
            <h2 id="ecrire" className="mb-2 text-3xl font-bold">Écrivez-nous</h2>
            <p className="mb-8 text-muted">
              Les champs marqués d&apos;un <span className="text-accent-strong">*</span> sont obligatoires.
            </p>
            <ContactForm />
          </Reveal>
          <div className="space-y-8">
            <Reveal delay={0.1}>
              <MapEmbed />
            </Reveal>
            <Reveal delay={0.2} className="rounded-[2rem] border border-line p-8">
              <h2 className="mb-5 flex items-center gap-3 text-xl font-bold">
                <Clock className="size-5 text-accent-strong" aria-hidden /> Horaires d&apos;ouverture
              </h2>
              <dl className="divide-y divide-line">
                {site.hours.map((h) => (
                  <div key={h.days} className="flex justify-between gap-4 py-3">
                    <dt className="text-muted">{h.days}</dt>
                    <dd className="font-semibold">{h.time}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-5 text-sm text-muted">
                Zones d&apos;intervention : {site.areaServed.join(", ")}.
              </p>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
