import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { nav, site, whatsappLink } from "@/lib/site";
import { services } from "@/lib/content";
import { FacebookIcon, InstagramIcon, LinkedinIcon, LogoMark, WhatsAppIcon, YoutubeIcon } from "@/components/icons";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/motion";

async function CurrentYear() {
  "use cache";
  return <>{new Date().getFullYear()}</>;
}

const socials = [
  { href: site.social.facebook, label: "Facebook", Icon: FacebookIcon },
  { href: site.social.instagram, label: "Instagram", Icon: InstagramIcon },
  { href: site.social.linkedin, label: "LinkedIn", Icon: LinkedinIcon },
  { href: site.social.youtube, label: "YouTube", Icon: YoutubeIcon },
];

export function Footer() {
  return (
    <footer className="dark-section relative overflow-hidden bg-ink text-paper">
      {/* Bandeau d'appel à l'action */}
      <div className="container-x border-b border-white/10 py-20 md:py-28">
        <Reveal className="grid items-end gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="eyebrow mb-6">Votre projet commence ici</p>
            <h2 className="text-4xl font-bold sm:text-5xl lg:text-7xl">
              Trouvons votre <span className="serif-accent text-accent">prochain</span> chez-vous.
            </h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <ButtonLink href="/demande">Confier mon projet</ButtonLink>
            <ButtonLink href={whatsappLink()} variant="outline-light" icon={<WhatsAppIcon className="size-4" />}>
              Écrire sur WhatsApp
            </ButtonLink>
          </div>
        </Reveal>
      </div>

      <div className="container-x grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
        <div className="space-y-5">
          <Link href="/" className="inline-flex items-center gap-3" aria-label={`${site.name} — accueil`}>
            <LogoMark className="size-11 text-white/10" />
            <span className="text-xl font-bold tracking-tight">{site.name}</span>
          </Link>
          <p className="max-w-xs text-muted-dark">{site.description}</p>
          <ul className="flex gap-2" aria-label="Réseaux sociaux">
            {socials.map(({ href, label, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${site.name} sur ${label}`}
                  className="grid size-11 place-items-center rounded-full border border-white/15 text-paper transition-colors hover:border-accent hover:bg-accent hover:text-ink"
                >
                  <Icon className="size-[1.125rem]" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav aria-label="Plan du site">
          <h3 className="mb-5 text-sm font-semibold uppercase tracking-[0.16em] text-muted-dark">Navigation</h3>
          <ul className="space-y-1">
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="inline-block py-1.5 text-paper/90 transition-colors hover:text-accent">
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/espace" className="inline-block py-1.5 font-semibold text-accent transition-colors hover:text-paper">
                Espace propriétaire
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Nos services">
          <h3 className="mb-5 text-sm font-semibold uppercase tracking-[0.16em] text-muted-dark">Services</h3>
          <ul className="space-y-1">
            {services.map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`} className="inline-block py-1.5 text-paper/90 transition-colors hover:text-accent">
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <address className="space-y-4 not-italic">
          <h3 className="mb-5 text-sm font-semibold uppercase tracking-[0.16em] text-muted-dark">Contact</h3>
          <p className="flex gap-3">
            <MapPin className="mt-1 size-4 shrink-0 text-accent" aria-hidden />
            <span>
              {site.address.street}
              <br />
              {site.address.city}, {site.address.country}
            </span>
          </p>
          <a href={site.contact.phoneHref} className="flex gap-3 hover:text-accent">
            <Phone className="mt-1 size-4 shrink-0 text-accent" aria-hidden />
            {site.contact.phone}
          </a>
          <a href={`mailto:${site.contact.email}`} className="flex gap-3 break-all hover:text-accent">
            <Mail className="mt-1 size-4 shrink-0 text-accent" aria-hidden />
            {site.contact.email}
          </a>
          <div className="flex gap-3">
            <Clock className="mt-1 size-4 shrink-0 text-accent" aria-hidden />
            <ul>
              {site.hours.map((h) => (
                <li key={h.days}>
                  <span className="text-muted-dark">{h.days} :</span> {h.time}
                </li>
              ))}
            </ul>
          </div>
        </address>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x flex flex-col gap-3 pb-28 pt-6 text-sm text-muted-dark sm:flex-row sm:items-center sm:justify-between sm:py-6 sm:pr-28 xl:pr-32">
          <p>
            © <CurrentYear /> {site.legalName}. Tous droits réservés.
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            <li><Link href="/mentions-legales" className="hover:text-paper">Mentions légales</Link></li>
            <li><Link href="/confidentialite" className="hover:text-paper">Confidentialité & cookies</Link></li>
            <li><Link href="/sitemap.xml" className="hover:text-paper">Plan du site</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
