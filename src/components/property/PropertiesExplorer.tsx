"use client";

import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { SearchX, SlidersHorizontal } from "lucide-react";
import { propertyTypes, type Property } from "@/lib/data/property-model";
import { cn } from "@/lib/utils";
import { EASE_OUT } from "@/components/motion";
import { ButtonLink } from "@/components/ui/Button";
import { PropertyCard } from "./PropertyCard";

const sorts = [
  { value: "", label: "Plus récents" },
  { value: "prix-asc", label: "Prix croissant" },
  { value: "prix-desc", label: "Prix décroissant" },
  { value: "surface", label: "Plus grande surface" },
];

/** Catalogue filtrable : les filtres sont synchronisés avec l'URL (liens partageables). */
export function PropertiesExplorer({ properties }: { properties: Property[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const tx = params.get("transaction") ?? "";
  const type = params.get("type") ?? "";
  const city = params.get("ville") ?? "";
  const sort = params.get("tri") ?? "";

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const propertyCities = useMemo(() => Array.from(new Set(properties.map((p) => p.city))).sort(), [properties]);

  const list = useMemo(() => {
    const r: Property[] = properties.filter(
      (p) => (!tx || p.transaction === tx) && (!type || p.type === type) && (!city || p.city === city),
    );
    if (sort === "prix-asc") r.sort((a, b) => a.price - b.price);
    if (sort === "prix-desc") r.sort((a, b) => b.price - a.price);
    if (sort === "surface") r.sort((a, b) => b.surface - a.surface);
    return r;
  }, [properties, tx, type, city, sort]);

  const pill = (active: boolean) =>
    cn(
      "relative inline-flex min-h-11 shrink-0 items-center rounded-full px-5 text-sm font-semibold transition-colors",
      active ? "text-paper" : "text-ink hover:bg-sand",
    );

  return (
    <LayoutGroup>
      <div className="mb-10 space-y-4 rounded-[2rem] border border-line bg-white p-4 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div role="group" aria-label="Transaction" className="flex gap-1 rounded-full bg-sand p-1">
            {[
              { v: "", l: "Tout" },
              { v: "Vente", l: "À vendre" },
              { v: "Location", l: "À louer" },
            ].map(({ v, l }) => (
              <button key={l} type="button" aria-pressed={tx === v} onClick={() => set("transaction", v)} className={pill(tx === v)}>
                {tx === v && <motion.span layoutId="tx-filter" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
                <span className="relative">{l}</span>
              </button>
            ))}
          </div>
          <div className="grid gap-3 sm:flex">
            <label className="sr-only" htmlFor="f-city">Ville</label>
            <select id="f-city" value={city} onChange={(e) => set("ville", e.target.value)} className="field field-select sm:w-48">
              <option value="">Toutes les villes</option>
              {propertyCities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <label className="sr-only" htmlFor="f-sort">Trier par</label>
            <select id="f-sort" value={sort} onChange={(e) => set("tri", e.target.value)} className="field field-select sm:w-52">
              {sorts.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div role="group" aria-label="Type de bien" className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1">
          <SlidersHorizontal className="mr-2 mt-3 size-4 shrink-0 text-muted" aria-hidden />
          {["", ...propertyTypes].map((t) => (
            <button key={t || "all"} type="button" aria-pressed={type === t} onClick={() => set("type", t)} className={pill(type === t)}>
              {type === t && <motion.span layoutId="type-filter" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
              <span className="relative">{t || "Tous les types"}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="mb-6 text-sm font-medium text-muted" aria-live="polite">
        {list.length} bien{list.length > 1 ? "s" : ""} correspond{list.length > 1 ? "ent" : ""} à votre recherche
      </p>

      {list.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center rounded-[2rem] bg-sand px-6 py-16 text-center">
          <span className="mb-5 grid size-16 place-items-center rounded-full bg-white text-accent-strong">
            <SearchX className="size-7" aria-hidden />
          </span>
          <h2 className="text-2xl font-bold">Aucun bien ne correspond… pour l&apos;instant</h2>
          <p className="mt-3 max-w-md text-muted">
            Une partie de nos biens n&apos;est jamais publiée. Confiez-nous votre recherche : nous vous alertons dès qu&apos;un bien correspond.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/demande">Confier ma recherche</ButtonLink>
            <button type="button" onClick={() => router.replace(pathname, { scroll: false })} className="min-h-12 rounded-full border-[1.5px] border-ink/80 px-6 font-semibold transition-colors hover:bg-ink hover:text-paper">
              Réinitialiser les filtres
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.ul layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {list.map((p, i) => (
              <motion.li
                key={p.slug}
                layout
                initial={{ opacity: 0, scale: 0.94, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.55, ease: EASE_OUT, delay: Math.min(i, 6) * 0.04 }}
              >
                <PropertyCard p={p} priority={i < 3} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </LayoutGroup>
  );
}

/** Version statique (sans filtres) affichée avant hydratation — utile au référencement. */
export function PropertiesGridStatic({ properties }: { properties: Property[] }) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((p, i) => (
        <li key={p.slug}>
          <PropertyCard p={p} priority={i < 3} />
        </li>
      ))}
    </ul>
  );
}
