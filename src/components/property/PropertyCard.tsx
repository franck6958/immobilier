import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Bath, BedDouble, MapPin, Maximize } from "lucide-react";
import type { Property } from "@/lib/data/property-model";
import { cn, formatNumber, formatPriceShort } from "@/lib/utils";

/** Carte de bien : photo, badge, prix, localisation et caractéristiques clés. */
export function PropertyCard({
  p,
  variant = "light",
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  priority = false,
}: {
  p: Property;
  variant?: "light" | "dark";
  sizes?: string;
  priority?: boolean;
}) {
  const dark = variant === "dark";
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-3xl transition-shadow duration-500",
        dark ? "bg-ink-2 text-paper" : "bg-white ring-1 ring-line hover:shadow-[0_30px_60px_-30px_rgb(20_17_15/0.35)]",
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={p.images[0]}
          alt={p.imageAlt}
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-110"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span className={cn("rounded-full px-3 py-1.5 text-xs font-bold", p.transaction === "Vente" ? "bg-accent text-ink" : "bg-paper text-ink")}>
            {p.transaction === "Vente" ? "À vendre" : "À louer"}
          </span>
          {p.badge && (
            <span className="rounded-full bg-ink/80 px-3 py-1.5 text-xs font-semibold text-paper backdrop-blur">{p.badge}</span>
          )}
        </div>
        <p className="absolute bottom-4 left-4 text-2xl font-bold tracking-tight text-paper">
          {formatPriceShort(p.price)}
          {p.transaction === "Location" && <span className="text-sm font-medium text-paper/80"> / mois</span>}
        </p>
        <span className="absolute bottom-4 right-4 grid size-11 place-items-center rounded-full bg-paper text-ink transition-transform duration-500 group-hover:rotate-45">
          <ArrowUpRight className="size-5" aria-hidden />
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <p className={cn("flex items-center gap-1.5 text-sm", dark ? "text-muted-dark" : "text-muted")}>
          <MapPin className="size-3.5 shrink-0" aria-hidden />
          {p.district}, {p.city} · {p.type}
        </p>
        <h3 className="mt-2 text-xl font-bold leading-snug">
          <Link href={`/biens/${p.slug}`} className="after:absolute after:inset-0">
            {p.title}
          </Link>
        </h3>
        <ul className={cn("mt-auto flex flex-wrap gap-x-5 gap-y-2 pt-5 text-sm", dark ? "text-paper/85" : "text-ink/80")}>
          <li className="flex items-center gap-1.5">
            <Maximize className="size-4 text-accent-strong" aria-hidden />
            {formatNumber(p.surface)} m²
          </li>
          {p.bedrooms !== undefined && (
            <li className="flex items-center gap-1.5">
              <BedDouble className="size-4 text-accent-strong" aria-hidden />
              {p.bedrooms} ch.
            </li>
          )}
          {p.bathrooms !== undefined && (
            <li className="flex items-center gap-1.5">
              <Bath className="size-4 text-accent-strong" aria-hidden />
              {p.bathrooms} sdb
            </li>
          )}
          <li className={cn("ml-auto text-xs", dark ? "text-muted-dark" : "text-muted")}>Réf. {p.ref}</li>
        </ul>
      </div>
    </article>
  );
}
