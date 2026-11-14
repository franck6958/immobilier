import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/account/AuthShell";
import { SignInForm } from "@/components/account/AuthForms";

export const metadata: Metadata = {
  title: "Connexion — Espace propriétaire",
  description: "Connectez-vous à votre espace propriétaire pour gérer vos biens.",
  robots: { index: false, follow: false },
};

export default function ConnexionPage() {
  return (
    <AuthShell title="Bon retour parmi nous" intro="Connectez-vous pour gérer vos biens et suivre leur publication.">
      <Suspense fallback={<div className="h-80" />}>
        <SignInForm />
      </Suspense>
    </AuthShell>
  );
}
