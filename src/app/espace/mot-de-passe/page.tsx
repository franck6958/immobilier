import type { Metadata } from "next";
import { NewPasswordForm } from "@/components/account/AuthForms";

export const metadata: Metadata = { title: "Mot de passe" };

export default function PasswordPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Changer de mot de passe</h1>
      <div className="rounded-3xl bg-white p-6 ring-1 ring-line md:p-8">
        <NewPasswordForm />
      </div>
    </div>
  );
}
