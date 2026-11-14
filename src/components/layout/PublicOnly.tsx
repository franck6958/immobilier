"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** N'affiche son contenu que sur le site public (pas dans /espace ni /admin). */
export function PublicOnly({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/espace") || pathname.startsWith("/admin")) return null;
  return <>{children}</>;
}
