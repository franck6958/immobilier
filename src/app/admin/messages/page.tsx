import type { Metadata } from "next";
import { Suspense } from "react";
import { DashboardSkeleton } from "@/components/account/DashboardShell";
import { LeadsBoard } from "@/components/admin/LeadsBoard";

export const metadata: Metadata = { title: "Messages" };

async function Board({ searchParams }: { searchParams: PageProps<"/admin/messages">["searchParams"] }) {
  const sp = await searchParams;
  return (
    <LeadsBoard
      kind="contact"
      basePath="/admin/messages"
      title="Messages"
      intro="Messages envoyés depuis la page Contact. Chaque nouveau message est aussi signalé sur WhatsApp."
      statut={sp.statut}
    />
  );
}

export default function AdminMessagesPage(props: PageProps<"/admin/messages">) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Board searchParams={props.searchParams} />
    </Suspense>
  );
}
