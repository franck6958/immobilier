import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { site } from "@/lib/site";
import { JsonLd } from "@/components/seo/JsonLd";
import { Reveal, SplitWords } from "@/components/motion";

type Crumb = { label: string; href?: string };

/** En-tête des pages internes : fil d'Ariane, titre animé, image de fond optionnelle. */
export function PageHero({
  eyebrow,
  title,
  intro,
  crumbs,
  image,
  imageAlt = "",
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  crumbs: Crumb[];
  image?: string;
  imageAlt?: string;
  children?: ReactNode;
}) {
  const all: Crumb[] = [{ label: "Accueil", href: "/" }, ...crumbs];
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: `${site.url}${c.href === "/" ? "" : c.href}` } : {}),
    })),
  };

  return (
    <section className="dark-section grain relative isolate overflow-hidden bg-ink pb-16 pt-32 text-paper md:pb-24 md:pt-44">
      <JsonLd data={breadcrumbLd} />
      {image && (
        <>
          <Image src={image} alt={imageAlt} fill priority sizes="100vw" className="-z-20 object-cover opacity-40" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/70 to-ink/30" />
        </>
      )}
      <div className="container-x">
        <Reveal y={12}>
          <nav aria-label="Fil d'Ariane" className="mb-10">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-dark">
              {all.map((c, i) => (
                <li key={c.label} className="flex items-center gap-1.5">
                  {c.href && i < all.length - 1 ? (
                    <Link href={c.href} className="rounded transition-colors hover:text-paper">
                      {c.label}
                    </Link>
                  ) : (
                    <span aria-current="page" className="text-paper">
                      {c.label}
                    </span>
                  )}
                  {i < all.length - 1 && <ChevronRight className="size-3.5" aria-hidden />}
                </li>
              ))}
            </ol>
          </nav>
        </Reveal>
        <Reveal y={12} delay={0.05}>
          <p className="eyebrow mb-6">{eyebrow}</p>
        </Reveal>
        <h1 className="max-w-5xl text-[2.5rem] font-bold sm:text-6xl lg:text-[5.25rem]">
          <SplitWords text={title} onMount delay={0.1} />
        </h1>
        {intro && (
          <Reveal delay={0.35} className="mt-8 max-w-2xl">
            <p className="text-lg text-paper/80 md:text-xl">{intro}</p>
          </Reveal>
        )}
        {children && (
          <Reveal delay={0.45} className="mt-10">
            {children}
          </Reveal>
        )}
      </div>
    </section>
  );
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  accent,
  intro,
  align = "left",
  className,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  accent?: string;
  intro?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={`${align === "center" ? "mx-auto text-center" : ""} max-w-3xl ${className ?? ""}`}>
      <Reveal y={12}>
        <p className="eyebrow mb-5">{eyebrow}</p>
      </Reveal>
      <h2 id={id} className="text-[2rem] font-bold sm:text-5xl lg:text-6xl">
        <SplitWords text={title} />
        {accent && (
          <>
            {" "}
            <SplitWords text={accent} delay={0.15} wordsClass="serif-accent text-accent-strong [.dark-section_&]:text-accent" />
          </>
        )}
      </h2>
      {intro && (
        <Reveal delay={0.15} className="mt-6">
          <p className="text-lg text-muted [.dark-section_&]:text-muted-dark">{intro}</p>
        </Reveal>
      )}
    </div>
  );
}
