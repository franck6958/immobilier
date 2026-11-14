import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";
import { services } from "@/lib/content";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Providers } from "@/components/layout/Providers";
import { FloatingActions } from "@/components/layout/FloatingActions";
import { CookieBanner } from "@/components/layout/CookieBanner";
import { JsonLd } from "@/components/seo/JsonLd";
import { PublicOnly } from "@/components/layout/PublicOnly";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["italic"],
  weight: ["400", "500"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Agence immobilière à Douala`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "agence immobilière Douala",
    "villa à vendre Douala",
    "appartement à louer Douala",
    "terrain titré Cameroun",
    "gestion locative Douala",
    "acheter au Cameroun diaspora",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: site.locale,
    siteName: site.name,
    title: `${site.name} — Agence immobilière à Douala`,
    description: site.description,
    url: "/",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  formatDetection: { telephone: true, address: true, email: true },
};

export const viewport: Viewport = {
  themeColor: "#14110f",
  width: "device-width",
  initialScale: 1,
};

const localBusiness = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  "@id": `${site.url}/#entreprise`,
  name: site.name,
  legalName: site.legalName,
  description: site.description,
  url: site.url,
  telephone: site.contact.phone,
  email: site.contact.email,
  foundingDate: String(site.foundingYear),
  image: `${site.url}/images/hero-villa-nuit.webp`,
  logo: `${site.url}/icon.svg`,
  priceRange: "$$",
  address: {
    "@type": "PostalAddress",
    streetAddress: site.address.street,
    addressLocality: site.address.city,
    addressRegion: site.address.region,
    addressCountry: site.address.countryCode,
  },
  geo: { "@type": "GeoCoordinates", latitude: site.address.geo.lat, longitude: site.address.geo.lng },
  areaServed: site.areaServed.map((c) => ({ "@type": "City", name: c })),
  openingHours: site.hours.map((h) => h.schema).filter(Boolean),
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: site.rating.value,
    reviewCount: site.rating.count,
    bestRating: 5,
  },
  sameAs: Object.values(site.social),
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Services",
    itemListElement: services.map((s) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: s.title, url: `${site.url}/services/${s.slug}` },
    })),
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${inter.variable} ${playfair.variable}`} data-scroll-behavior="smooth">
      <body className="min-h-dvh bg-paper">
        <a
          href="#contenu"
          className="fixed left-3 top-3 z-[100] -translate-y-24 rounded-full bg-accent px-5 py-3 font-semibold text-ink transition-transform focus:translate-y-0"
        >
          Aller au contenu
        </a>
        <JsonLd data={localBusiness} />
        <Providers>
          <Header />
          <main id="contenu" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <PublicOnly>
            <Footer />
            <FloatingActions />
          </PublicOnly>
          <CookieBanner />
        </Providers>
      </body>
    </html>
  );
}
