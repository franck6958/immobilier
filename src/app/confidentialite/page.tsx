import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { ResetConsentButton } from "@/components/ui/ResetConsentButton";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Politique de confidentialité et cookies",
  description: `Comment ${site.name} collecte, utilise et protège vos données personnelles.`,
  alternates: { canonical: "/confidentialite" },
};

export default function PrivacyPage() {
  return (
    <>
      <PageHero eyebrow="Vie privée" title="Confidentialité & cookies" crumbs={[{ label: "Confidentialité" }]} />
      <section className="py-16 md:py-24">
        <div className="container-x prose-article max-w-3xl">
          <h2>Responsable du traitement</h2>
          <p>
            {site.legalName}, {site.address.street}, {site.address.city}, {site.address.country} — {site.contact.email}.
          </p>
          <h2>Données collectées</h2>
          <ul>
            <li>Formulaires de contact et de projet : nom, e-mail, téléphone, informations sur votre projet immobilier.</li>
            <li>Mesure d&apos;audience (uniquement avec votre accord) : pages vues, appareil, provenance anonymisée.</li>
          </ul>
          <h2>Finalités et base légale</h2>
          <p>
            Vos données servent exclusivement à répondre à vos demandes et à vous proposer des biens ou une estimation (mesures
            précontractuelles), ainsi qu&apos;à améliorer le site (consentement). Elles ne sont jamais vendues.
          </p>
          <p>
            Pour vous répondre rapidement, chaque message envoyé depuis le site est enregistré dans notre espace de gestion
            sécurisé et signalé à notre équipe par une notification WhatsApp (nom, coordonnées et contenu du message),
            transmise via le service d&apos;alerte CallMeBot.
          </p>
          <h2>Durée de conservation</h2>
          <p>
            Les demandes sans suite sont conservées 3 ans à compter du dernier contact ; les données clients pendant la
            durée de la relation contractuelle et des garanties légales.
          </p>
          <h2>Vos droits</h2>
          <p>
            Conformément à la législation camerounaise applicable et, pour les visiteurs européens, au RGPD, vous
            disposez d&apos;un droit d&apos;accès, de rectification, d&apos;opposition et de suppression. Écrivez-nous à{" "}
            {site.contact.email}.
          </p>
          <h2>Cookies</h2>
          <p>
            Aucun cookie non essentiel n&apos;est déposé sans votre accord. La carte Google Maps n&apos;est chargée que si
            vous cliquez sur « Afficher la carte ». Les formulaires sont protégés contre les robots par Google reCAPTCHA, qui
            analyse votre interaction avec la page au moment de l&apos;envoi ; ce service, nécessaire à la sécurité du site,
            est soumis aux règles de confidentialité de Google. Vous pouvez modifier votre choix à tout moment :
          </p>
          <ResetConsentButton />
        </div>
      </section>
    </>
  );
}
