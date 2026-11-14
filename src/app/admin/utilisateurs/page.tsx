import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { VerificationBadge } from "@/components/account/VerificationBadge";
import { DashboardSkeleton } from "@/components/account/DashboardShell";
import { ConfirmSubmit } from "@/components/account/ConfirmSubmit";
import { createClient, requireAdmin } from "@/lib/supabase/server";
import { setUserRole } from "@/lib/admin-actions";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Utilisateurs" };

async function Users() {
  const me = await requireAdmin();
  const supabase = await createClient();
  const [{ data: profiles }, { data: props }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("properties").select("owner_id, status"),
  ]);
  const stats = (id: string) => {
    const mine = (props ?? []).filter((p) => p.owner_id === id);
    return { total: mine.length, published: mine.filter((p) => p.status === "published").length };
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Utilisateurs</h1>
      <p className="text-muted">
        Les propriétaires s&apos;inscrivent depuis le site. Vous pouvez donner les droits d&apos;administration à un membre de l&apos;agence.
      </p>
      {(profiles ?? []).length === 0 ? (
        <p className="rounded-3xl bg-white p-10 text-center text-muted ring-1 ring-line">Aucun utilisateur inscrit pour l&apos;instant.</p>
      ) : (
        <div className="overflow-x-auto rounded-3xl bg-white ring-1 ring-line">
          <table className="w-full min-w-[54rem] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wider text-muted">
              <tr>
                <th scope="col" className="px-5 py-4 font-semibold">Nom</th>
                <th scope="col" className="px-5 py-4 font-semibold">Contact</th>
                <th scope="col" className="px-5 py-4 font-semibold">Identité</th>
                <th scope="col" className="px-5 py-4 font-semibold">Biens</th>
                <th scope="col" className="px-5 py-4 font-semibold">Inscrit le</th>
                <th scope="col" className="px-5 py-4 font-semibold">Rôle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {(profiles ?? []).map((u) => {
                const s = stats(u.id);
                const isAdmin = u.role === "admin";
                return (
                  <tr key={u.id}>
                    <td className="px-5 py-4 font-semibold">
                      <Link href={`/admin/utilisateurs/${u.id}`} className="hover:underline">{u.full_name || "—"}</Link>
                      {u.id === me.id && <span className="ml-2 text-xs font-normal text-muted">(vous)</span>}
                    </td>
                    <td className="px-5 py-4">
                      <a href={`mailto:${u.email}`} className="block text-accent-strong hover:underline">{u.email}</a>
                      <span className="text-muted">{u.phone}</span>
                    </td>
                    <td className="px-5 py-4">{isAdmin ? <span className="text-muted">—</span> : <VerificationBadge status={u.verification_status} />}</td>
                    <td className="px-5 py-4 tabular-nums">{s.total} <span className="text-muted">({s.published} publié{s.published > 1 ? "s" : ""})</span></td>
                    <td className="px-5 py-4 text-muted">{formatDate(u.created_at.slice(0, 10))}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 text-xs font-bold text-paper">
                            <ShieldCheck className="size-3.5 text-accent" aria-hidden /> Admin
                          </span>
                        ) : (
                          <span className="rounded-full bg-sand px-3 py-1 text-xs font-semibold">Propriétaire</span>
                        )}
                        {u.id !== me.id && (
                          <form action={setUserRole}>
                            <input type="hidden" name="id" value={u.id} />
                            <input type="hidden" name="role" value={isAdmin ? "owner" : "admin"} />
                            <ConfirmSubmit
                              tone="default"
                              title={isAdmin ? "Retirer les droits d'administration ?" : "Donner les droits d'administration ?"}
                              confirmLabel={isAdmin ? "Retirer les droits" : "Rendre admin"}
                              message={isAdmin ? `${u.full_name || u.email} n'aura plus accès au tableau de bord de l'agence.` : `${u.full_name || u.email} pourra gérer tout le site : biens, demandes, utilisateurs et vérifications.`}
                              className="text-xs font-semibold text-accent-strong underline-offset-2 hover:underline"
                            >
                              {isAdmin ? "Retirer admin" : "Rendre admin"}
                            </ConfirmSubmit>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Users />
    </Suspense>
  );
}
