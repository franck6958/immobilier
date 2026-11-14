import Image from "next/image";
import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { Reveal } from "@/components/motion";

const perks = [
  "Déposez vos biens en quelques minutes, photos comprises",
  "Suivez la validation et la publication de chaque annonce",
  "Un conseiller dédié pour vendre ou louer au juste prix",
];

/** Mise en page des écrans de connexion / inscription. */
export function AuthShell({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return (
    <section className="grid min-h-[100svh] bg-paper lg:grid-cols-[1fr_1.1fr]">
      <div className="dark-section grain relative isolate hidden overflow-hidden bg-ink text-paper lg:block">
        <Image src="/images/villa-contemporaine.webp" alt="" fill priority sizes="50vw" className="-z-20 object-cover opacity-45" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/60 to-ink/20" />
        <div className="flex h-full flex-col justify-end p-12 pb-16 xl:p-16">
          <Reveal>
            <p className="eyebrow mb-5">Espace propriétaire</p>
            <h2 className="max-w-md text-4xl font-bold xl:text-5xl">
              Confiez-nous votre bien, <span className="serif-accent text-accent">suivez tout</span> en ligne.
            </h2>
            <ul className="mt-8 space-y-3">
              {perks.map((p) => (
                <li key={p} className="flex items-start gap-3 text-paper/85">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-accent text-ink">
                    <Check className="size-3.5" strokeWidth={3} aria-hidden />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
      <div className="flex items-center justify-center px-5 pb-16 pt-28 sm:px-10 lg:pt-24">
        <Reveal className="w-full max-w-md">
          <h1 className="text-3xl font-bold md:text-4xl">{title}</h1>
          <p className="mt-3 text-muted">{intro}</p>
          <div className="mt-8">{children}</div>
        </Reveal>
      </div>
    </section>
  );
}
