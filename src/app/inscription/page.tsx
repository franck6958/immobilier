import type { Metadata } from "next";
import { AuthShell } from "@/components/account/AuthShell";
import { SignUpForm } from "@/components/account/AuthForms";

export const metadata: Metadata = {
  title: "Créer un compte propriétaire",
  description: "Créez votre compte gratuit pour proposer votre bien à la vente ou à la location.",
  alternates: { canonical: "/inscription" },
};

export default function InscriptionPage() {
  return (
    <AuthShell title="Créer un compte propriétaire" intro="Gratuit et sans engagement. Vous pourrez déposer votre bien juste après.">
      <SignUpForm />
    </AuthShell>
  );
}
