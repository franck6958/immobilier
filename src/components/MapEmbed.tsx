"use client";

import { useState } from "react";
import { MapPin, Navigation } from "lucide-react";
import { mapsDirectionsLink, mapsEmbedSrc, site } from "@/lib/site";

/**
 * Carte Google Maps chargée à la demande : aucun cookie tiers ni script lourd
 * tant que le visiteur ne clique pas (performance + vie privée).
 */
export function MapEmbed() {
  const [show, setShow] = useState(false);
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-ink-2 md:aspect-[16/9]">
      {show ? (
        <iframe
          title={`Carte : ${site.name}, ${site.address.city}`}
          src={mapsEmbedSrc}
          className="absolute inset-0 size-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      ) : (
        <div className="dark-section absolute inset-0 grid place-items-center p-6 text-center text-paper">
          {/* Plan stylisé */}
          <svg aria-hidden className="absolute inset-0 size-full opacity-[0.15]" preserveAspectRatio="none" viewBox="0 0 400 300">
            <g stroke="currentColor" fill="none" strokeWidth="1">
              <path d="M0 80 C 120 60, 220 140, 400 110" />
              <path d="M0 200 C 140 180, 260 240, 400 210" />
              <path d="M90 0 C 110 120, 70 200, 120 300" />
              <path d="M280 0 C 260 100, 320 200, 290 300" />
              <path d="M0 140 L 400 160" strokeWidth="3" />
            </g>
          </svg>
          <div className="relative">
            <span className="mx-auto mb-5 grid size-16 place-items-center rounded-full bg-accent text-ink shadow-[0_0_0_12px_rgb(234_88_12/0.2)]">
              <MapPin className="size-7" aria-hidden />
            </span>
            <p className="text-lg font-semibold">{site.address.street}, {site.address.city}</p>
            <p className="mt-1 text-sm text-muted-dark">Le chargement de la carte dépose des cookies Google.</p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <button type="button" onClick={() => setShow(true)} className="min-h-12 rounded-full bg-paper px-6 font-semibold text-ink transition-colors hover:bg-white">
                Afficher la carte
              </button>
              <a href={mapsDirectionsLink} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-[1.5px] border-white/30 px-6 font-semibold transition-colors hover:bg-white hover:text-ink">
                <Navigation className="size-4" aria-hidden /> Itinéraire
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
