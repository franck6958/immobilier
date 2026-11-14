import type { Metadata } from "next";
import { Suspense } from "react";
import { ProfileForm } from "@/components/account/AuthForms";
import { requireUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Mon profil" };

async function Profile() {
  const user = await requireUser("/espace/profil");
  return <ProfileForm initial={{ full_name: user.full_name, phone: user.phone, email: user.email }} />;
}

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Mon profil</h1>
      <div className="rounded-3xl bg-white p-6 ring-1 ring-line md:p-8">
        <p className="mb-6 text-sm text-muted">Ces coordonnées permettent à l&apos;agence de vous joindre au sujet de vos biens.</p>
        <Suspense fallback={<div className="h-64" />}>
          <Profile />
        </Suspense>
      </div>
    </div>
  );
}
