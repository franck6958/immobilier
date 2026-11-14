"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient, requireUser } from "@/lib/supabase/server";

export type AuthState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Record<string, string>;
  values?: Record<string, string>;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+\d][\d\s().-]{7,19}$/;

function str(fd: FormData, key: string, max = 200) {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

/** N'accepte que des chemins internes (évite les redirections ouvertes). */
function safeNext(next: string, fallback: string) {
  return next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : fallback;
}

async function origin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/** Traduit les erreurs Supabase les plus courantes. */
function frError(message: string) {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "E-mail ou mot de passe incorrect.";
  if (m.includes("email not confirmed")) return "Votre adresse e-mail n'est pas encore confirmée. Cliquez sur le lien reçu par e-mail.";
  if (m.includes("already registered") || m.includes("already been registered")) return "Un compte existe déjà avec cette adresse. Connectez-vous ou réinitialisez votre mot de passe.";
  if (m.includes("not authorized")) return "Les inscriptions sont momentanément indisponibles. Contactez l'agence sur WhatsApp.";
  if (m.includes("rate limit") || m.includes("too many")) return "Trop de tentatives. Patientez quelques minutes puis réessayez.";
  if (m.includes("password should be") || m.includes("weak")) return "Mot de passe trop faible : au moins 8 caractères, avec lettres et chiffres.";
  if (m.includes("same password")) return "Le nouveau mot de passe doit être différent de l'ancien.";
  return "Une erreur est survenue. Réessayez dans un instant.";
}

export async function signIn(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const email = str(fd, "email", 160).toLowerCase();
  const password = str(fd, "password", 200);
  const values = { email };
  if (!EMAIL_RE.test(email) || !password) {
    return { status: "error", message: "Indiquez votre e-mail et votre mot de passe.", values };
  }
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { status: "error", message: frError(error?.message ?? ""), values };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
  const fallback = profile?.role === "admin" ? "/admin" : "/espace";
  redirect(safeNext(str(fd, "next", 300), fallback));
}

export async function signUp(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const values = {
    full_name: str(fd, "full_name", 120),
    phone: str(fd, "phone", 30),
    email: str(fd, "email", 160).toLowerCase(),
  };
  const password = str(fd, "password", 200);
  const errors: Record<string, string> = {};
  if (values.full_name.length < 2) errors.full_name = "Indiquez votre nom complet.";
  if (!PHONE_RE.test(values.phone)) errors.phone = "Indiquez un numéro valide, par exemple +237 690 00 00 00.";
  if (!EMAIL_RE.test(values.email)) errors.email = "Indiquez une adresse e-mail valide.";
  if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/\d/.test(password))
    errors.password = "Au moins 8 caractères, dont au moins une lettre et un chiffre.";
  if (str(fd, "consent", 5) !== "on") errors.consent = "Votre accord est nécessaire pour créer un compte.";
  if (Object.keys(errors).length) return { status: "error", message: "Merci de corriger les champs signalés.", errors, values };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: values.email,
    password,
    options: {
      data: { full_name: values.full_name, phone: values.phone },
      emailRedirectTo: `${await origin()}/auth/confirm?next=/espace`,
    },
  });
  if (error) {
    console.error("[inscription]", error.message);
    return { status: "error", message: frError(error.message), values };
  }
  // Confirmation d'e-mail désactivée dans Supabase : l'utilisateur est connecté immédiatement
  if (data.session) redirect("/espace?bienvenue=1");
  return {
    status: "success",
    message: `Presque terminé ! Nous avons envoyé un lien de confirmation à ${values.email}. Cliquez dessus pour activer votre compte.`,
  };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function requestPasswordReset(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const email = str(fd, "email", 160).toLowerCase();
  if (!EMAIL_RE.test(email)) return { status: "error", message: "Indiquez une adresse e-mail valide.", values: { email } };
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await origin()}/auth/confirm?next=/espace/mot-de-passe`,
  });
  if (error) console.error("[mot de passe oublié]", error.message);
  // Même réponse que le compte existe ou non (ne révèle pas les adresses inscrites)
  return {
    status: "success",
    message: "Si un compte existe pour cette adresse, vous allez recevoir un lien pour choisir un nouveau mot de passe.",
  };
}

export async function updatePassword(_prev: AuthState, fd: FormData): Promise<AuthState> {
  await requireUser("/espace/mot-de-passe");
  const password = str(fd, "password", 200);
  const confirm = str(fd, "confirm", 200);
  const errors: Record<string, string> = {};
  if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/\d/.test(password))
    errors.password = "Au moins 8 caractères, dont au moins une lettre et un chiffre.";
  if (password !== confirm) errors.confirm = "Les deux mots de passe ne correspondent pas.";
  if (Object.keys(errors).length) return { status: "error", message: "Merci de corriger les champs signalés.", errors };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { status: "error", message: frError(error.message) };
  return { status: "success", message: "Votre mot de passe a été mis à jour." };
}

export async function updateProfile(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const user = await requireUser("/espace/profil");
  const values = { full_name: str(fd, "full_name", 120), phone: str(fd, "phone", 30) };
  const errors: Record<string, string> = {};
  if (values.full_name.length < 2) errors.full_name = "Indiquez votre nom complet.";
  if (!PHONE_RE.test(values.phone)) errors.phone = "Indiquez un numéro valide, par exemple +237 690 00 00 00.";
  if (Object.keys(errors).length) return { status: "error", message: "Merci de corriger les champs signalés.", errors, values };
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update(values).eq("id", user.id);
  if (error) return { status: "error", message: "Enregistrement impossible. Réessayez.", values };
  return { status: "success", message: "Vos informations ont été enregistrées.", values };
}
