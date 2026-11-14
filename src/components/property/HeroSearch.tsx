"use client";

import Form from "next/form";
import { useState } from "react";
import { motion } from "motion/react";
import { Search } from "lucide-react";
import { propertyCities, propertyTypes, transactions } from "@/lib/content";
import { cn } from "@/lib/utils";

/** Barre de recherche de la page d'accueil → /biens?transaction=…&type=…&ville=… */
export function HeroSearch() {
  const [tx, setTx] = useState<string>("Vente");

  return (
    <Form
      action="/biens"
      className="w-full max-w-4xl rounded-[1.75rem] bg-paper p-2 text-ink shadow-[0_30px_80px_-20px_rgb(0_0_0/0.5)]"
      aria-label="Rechercher un bien"
    >
      <div role="radiogroup" aria-label="Type de transaction" className="flex gap-1 p-1">
        {transactions.map((t) => (
          <label key={t} className="relative cursor-pointer">
            <input
              type="radio"
              name="transaction"
              value={t}
              checked={tx === t}
              onChange={() => setTx(t)}
              className="peer sr-only"
            />
            {tx === t && (
              <motion.span layoutId="tx-pill" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 400, damping: 32 }} />
            )}
            <span
              className={cn(
                "relative inline-flex min-h-10 items-center rounded-full px-5 text-sm font-semibold transition-colors peer-focus-visible:ring-4 peer-focus-visible:ring-accent/40",
                tx === t ? "text-paper" : "text-muted hover:text-ink",
              )}
            >
              {t === "Vente" ? "Acheter" : "Louer"}
            </span>
          </label>
        ))}
      </div>

      <div className="grid gap-2 p-1 sm:grid-cols-[1fr_1fr_auto]">
        <div className="relative">
          <label htmlFor="hs-type" className="absolute left-4 top-2 text-[0.6875rem] font-semibold uppercase tracking-wider text-muted">
            Type de bien
          </label>
          <select id="hs-type" name="type" defaultValue="" className="field field-select h-16 border-transparent bg-sand pt-6">
            <option value="">Tous les types</option>
            {propertyTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="relative">
          <label htmlFor="hs-city" className="absolute left-4 top-2 text-[0.6875rem] font-semibold uppercase tracking-wider text-muted">
            Ville
          </label>
          <select id="hs-city" name="ville" defaultValue="" className="field field-select h-16 border-transparent bg-sand pt-6">
            <option value="">Toutes les villes</option>
            {propertyCities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="inline-flex h-16 items-center justify-center gap-2 rounded-2xl bg-accent px-8 font-semibold text-ink transition-colors hover:bg-[#f06a21]"
        >
          <Search className="size-5" aria-hidden />
          Rechercher
        </button>
      </div>
    </Form>
  );
}
