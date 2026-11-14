"use server";

import { refresh } from "next/cache";
import { createClient, requireAdmin } from "@/lib/supabase/server";

function str(fd: FormData, key: string, max = 60) {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

const LEAD_STATUSES = ["nouveau", "en_cours", "traite"];

/** Change le statut d'une demande (nouveau → en cours → traité). */
export async function setLeadStatus(fd: FormData) {
  await requireAdmin();
  const status = str(fd, "status");
  if (!LEAD_STATUSES.includes(status)) return;
  const supabase = await createClient();
  const { error } = await supabase.from("leads").update({ status }).eq("id", str(fd, "id"));
  if (error) console.error("[admin] statut demande", error.message);
  refresh();
}

export async function deleteLead(fd: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("leads").delete().eq("id", str(fd, "id"));
  if (error) console.error("[admin] suppression demande", error.message);
  refresh();
}

/** Promouvoir un propriétaire en administrateur, ou l'inverse (jamais soi-même). */
export async function setUserRole(fd: FormData) {
  const me = await requireAdmin();
  const id = str(fd, "id");
  const role = str(fd, "role");
  if (id === me.id || !["owner", "admin"].includes(role)) return;
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
  if (error) console.error("[admin] rôle", error.message);
  refresh();
}
