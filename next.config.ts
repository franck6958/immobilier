import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Photos envoyées par les propriétaires (stockage Supabase)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "nivwnfuwjwmljbbszocr.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
  // Redirections 301 des anciennes adresses (cahier des charges §7.1)
  async redirects() {
    return [
      { source: "/realisations", destination: "/biens", permanent: true },
      { source: "/devis", destination: "/demande", permanent: true },
    ];
  },
};

export default nextConfig;
