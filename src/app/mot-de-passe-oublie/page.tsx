import type { Metadata } from "next";
import { AuthShell } from "@/components/account/AuthShell";
import { ForgotPasswordForm } from "@/components/account/AuthForms";

export const metadata: Metadata = {
  title: "Mot de passe oublié",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Mot de passe oublié" intro="Indiquez l'e-mail de votre compte : nous vous envoyons un lien pour en choisir un nouveau.">
      <ForgotPasswordForm />
    </AuthShell>
  );
}
