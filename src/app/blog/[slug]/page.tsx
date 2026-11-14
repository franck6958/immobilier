import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/ui/PageHero";
import { PostCard } from "@/components/ui/PostCard";
import { ButtonLink } from "@/components/ui/Button";
import { ReadingProgress } from "@/components/ui/ReadingProgress";
import { ShareButtons } from "@/components/ui/ShareButtons";
import { ImageReveal, Reveal } from "@/components/motion";
import { JsonLd } from "@/components/seo/JsonLd";
import { posts } from "@/lib/content";
import { site } from "@/lib/site";
import { formatDate } from "@/lib/utils";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = posts.find((x) => x.slug === slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.excerpt,
    alternates: { canonical: `/blog/${p.slug}` },
    openGraph: { type: "article", publishedTime: p.date, images: [{ url: p.image, alt: p.imageAlt }] },
  };
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const p = posts.find((x) => x.slug === slug);
  if (!p) notFound();
  const others = posts.filter((x) => x.slug !== p.slug);
  const url = `${site.url}/blog/${p.slug}`;

  const ld = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: p.title,
    description: p.excerpt,
    image: `${site.url}${p.image}`,
    datePublished: p.date,
    author: { "@type": "Organization", name: site.name },
    publisher: { "@id": `${site.url}/#entreprise` },
    mainEntityOfPage: url,
  };

  return (
    <>
      <JsonLd data={ld} />
      <ReadingProgress />
      <PageHero
        eyebrow={`${p.category} · ${p.readingTime} de lecture`}
        title={p.title}
        crumbs={[{ label: "Blog", href: "/blog" }, { label: p.title }]}
      >
        <p className="text-paper/80">
          Publié le <time dateTime={p.date}>{formatDate(p.date)}</time> par l&apos;équipe {site.name}
        </p>
      </PageHero>

      <article className="py-16 md:py-24">
        <div className="container-x">
          <ImageReveal className="mx-auto mb-16 aspect-[16/8] max-w-6xl rounded-[2rem]">
            <Image src={p.image} alt={p.imageAlt} fill priority sizes="(min-width: 1280px) 72rem, 100vw" className="object-cover" />
          </ImageReveal>
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_3fr]">
            <aside className="lg:sticky lg:top-32 lg:self-start">
              <ShareButtons url={url} title={p.title} />
            </aside>
            <Reveal className="prose-article max-w-2xl">
              <p className="!text-xl !leading-relaxed !text-ink">{p.excerpt}</p>
              {p.body.map((b, i) =>
                b.type === "h2" ? (
                  <h2 key={i}>{b.text}</h2>
                ) : b.type === "list" ? (
                  <ul key={i}>
                    {b.items.map((it) => (
                      <li key={it}>{it}</li>
                    ))}
                  </ul>
                ) : (
                  <p key={i}>{b.text}</p>
                ),
              )}
              <div className="not-prose mt-12 rounded-3xl bg-ink p-8 text-paper">
                <strong className="block text-2xl font-bold">Un projet en tête ?</strong>
                <span className="mt-2 block text-muted-dark">Un conseiller vous recontacte sous 24 h, gratuitement.</span>
                <div className="mt-6">
                  <ButtonLink href="/demande">Confier mon projet</ButtonLink>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </article>

      <section className="bg-sand py-20 md:py-28" aria-labelledby="a-lire">
        <div className="container-x">
          <h2 id="a-lire" className="mb-12 text-3xl font-bold md:text-4xl">À lire aussi</h2>
          <div className="grid gap-10 sm:grid-cols-2">
            {others.map((o) => (
              <PostCard key={o.slug} post={o} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
