import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { PostCard } from "@/components/ui/PostCard";
import { ImageReveal, Reveal, Stagger, StaggerItem } from "@/components/motion";
import { posts } from "@/lib/content";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blog — Conseils immobiliers au Cameroun",
  description:
    "Titre foncier, achat depuis la diaspora, investissement locatif : nos conseils d'experts pour réussir votre projet immobilier au Cameroun.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  const [featured, ...rest] = [...posts].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <PageHero
        eyebrow="Blog & actualités"
        title="Acheter, louer, investir : nos conseils."
        intro="Guides pratiques, analyses du marché et conseils juridiques pour réussir votre projet immobilier."
        crumbs={[{ label: "Blog" }]}
      />

      <section className="py-20 md:py-28" aria-label="Article à la une">
        <div className="container-x">
          <article className="group relative grid items-center gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
            <ImageReveal className="aspect-[16/10] rounded-[2rem]">
              <Image src={featured.image} alt={featured.imageAlt} fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover transition-transform duration-[1.2s] group-hover:scale-105" />
            </ImageReveal>
            <Reveal delay={0.2}>
              <p className="eyebrow mb-5">À la une · {featured.category}</p>
              <h2 className="text-3xl font-bold md:text-5xl">
                <Link href={`/blog/${featured.slug}`} className="after:absolute after:inset-0 group-hover:text-accent-strong">
                  {featured.title}
                </Link>
              </h2>
              <p className="mt-5 text-lg text-muted">{featured.excerpt}</p>
              <p className="mt-6 flex items-center gap-3 text-sm text-muted">
                <time dateTime={featured.date}>{formatDate(featured.date)}</time> · {featured.readingTime}
                <span className="ml-auto grid size-12 place-items-center rounded-full bg-accent text-ink transition-transform duration-500 group-hover:rotate-45">
                  <ArrowUpRight className="size-5" aria-hidden />
                </span>
              </p>
            </Reveal>
          </article>
        </div>
      </section>

      <section className="border-t border-line py-20 md:py-28" aria-label="Tous les articles">
        <Stagger className="container-x grid gap-12 sm:grid-cols-2 lg:grid-cols-3" stagger={0.12}>
          {rest.map((p) => (
            <StaggerItem key={p.slug}>
              <PostCard post={p} />
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    </>
  );
}
