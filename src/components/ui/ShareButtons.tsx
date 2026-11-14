"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";
import { FacebookIcon, LinkedinIcon, WhatsAppIcon } from "@/components/icons";

/** Partage d'article : WhatsApp, Facebook, LinkedIn, copie du lien. */
export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const links = [
    { label: "WhatsApp", href: `https://wa.me/?text=${t}%20${u}`, Icon: WhatsAppIcon },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, Icon: FacebookIcon },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, Icon: LinkedinIcon },
  ];
  const btn = "grid size-11 place-items-center rounded-full border-[1.5px] border-line transition-colors hover:border-ink hover:bg-ink hover:text-paper";

  return (
    <div>
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-muted">Partager</p>
      <ul className="flex gap-2 lg:flex-col">
        {links.map(({ label, href, Icon }) => (
          <li key={label}>
            <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`Partager sur ${label}`} className={btn}>
              <Icon className="size-[1.125rem]" />
            </a>
          </li>
        ))}
        <li>
          <button
            type="button"
            className={btn}
            aria-label={copied ? "Lien copié" : "Copier le lien"}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              } catch {}
            }}
          >
            {copied ? <Check className="size-[1.125rem] text-success" /> : <Link2 className="size-[1.125rem]" />}
          </button>
        </li>
      </ul>
      <p className="sr-only" aria-live="polite">{copied ? "Lien copié dans le presse-papiers" : ""}</p>
    </div>
  );
}
