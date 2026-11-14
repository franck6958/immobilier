import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Post } from "@/lib/content";
import { formatDate } from "@/lib/utils";

export function PostCard({ post, priority = false }: { post: Post; priority?: boolean }) {
  return (
    <article className="group relative flex h-full flex-col">
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-sand">
        <Image
          src={post.image}
          alt={post.imageAlt}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-105"
        />
        <span className="absolute left-4 top-4 rounded-full bg-paper px-3 py-1.5 text-xs font-semibold">{post.category}</span>
        <span className="absolute bottom-4 right-4 grid size-12 translate-y-3 place-items-center rounded-full bg-accent text-ink opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight className="size-5" aria-hidden />
        </span>
      </div>
      <div className="flex flex-1 flex-col pt-6">
        <p className="text-sm text-muted">
          <time dateTime={post.date}>{formatDate(post.date)}</time> · {post.readingTime} de lecture
        </p>
        <h3 className="mt-3 text-xl font-bold leading-snug md:text-2xl">
          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 group-hover:text-accent-strong">
            {post.title}
          </Link>
        </h3>
        <p className="mt-3 text-muted">{post.excerpt}</p>
      </div>
    </article>
  );
}
