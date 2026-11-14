import type { Metadata } from "next";
import { Suspense } from "react";
import { CalendarCheck, Lock, PhoneCall, Search } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { ProjectForm } from "@/components/forms/ProjectForm";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Votre projet immobilier — Achat, vente, location, estimation",
  description: `Confiez votre projet à ${site.name} en 2 minutes : recherche de bien, estimation gratuite, mise en location ou gestion locative. Réponse sous 24 h.`,
  alternates: { canonical: "/demande" },
};

const next = [
  { Icon: PhoneCall, title: "Appel sous 24 h", text: "Un conseiller vous contacte pour affiner votre projet." },
  { Icon: Search, title: "Sélection ou estimation", text: "Biens correspondant à vos critères, ou avis de valeur de votre bien." },
  { Icon: CalendarCheck, title: "Visites", text: "Sur place ou en vidéo, aux horaires qui vous conviennent." },
];

export default function DemandePage() {
  return (
    <>
      <PageHero
        eyebrow="Votre projet"
        title="Parlez-nous de votre projet immobilier."
        intro="Acheter, louer, vendre ou faire gérer : trois étapes simples, gratuit et sans engagement."
        crumbs={[{ label: "Votre projet" }]}
      />
      <section className="bg-sand py-16 md:py-24" aria-label="Formulaire de demande">
        <div className="container-x grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
          <Reveal>
            <Suspense fallback={<div className="min-h-[36rem] rounded-[2rem] bg-white" />}>
              <ProjectForm />
            </Suspense>
          </Reveal>
          <aside className="space-y-8 lg:sticky lg:top-32 lg:self-start">
            <div>
              <h2 className="mb-6 text-2xl font-bold">Et ensuite ?</h2>
              <Stagger as="ol" className="space-y-5">
                {next.map(({ Icon, title, text }, i) => (
                  <StaggerItem as="li" key={title} className="flex gap-4">
                    <span className="relative grid size-12 shrink-0 place-items-center rounded-2xl bg-ink text-accent">
                      <Icon className="size-5" aria-hidden />
                      <span className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-accent text-[0.6875rem] font-bold text-ink">{i + 1}</span>
                    </span>
                    <div>
                      <p className="font-semibold">{title}</p>
                      <p className="text-sm text-muted">{text}</p>
                    </div>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
            <div className="flex gap-3 rounded-2xl border border-line bg-white p-5 text-sm text-muted">
              <Lock className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
              Vos informations restent confidentielles et ne servent qu&apos;à traiter votre demande.
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
