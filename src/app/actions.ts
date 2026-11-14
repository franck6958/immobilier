"use server";

import { site } from "@/lib/site";
import { createPublicClient } from "@/lib/supabase/clients";
import type { Database, Json } from "@/lib/supabase/database.types";

export type FormState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Record<string, string>;
  values?: Record<string, string>;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+\d][\d\s().-]{7,19}$/;
const MIN_FILL_MS = 3000; // un humain met plus de 3 s à remplir un formulaire

function str(fd: FormData, key: string, max = 2000) {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** Anti-spam : champ piège invisible + délai minimal de remplissage. */
function isSpam(fd: FormData) {
  if (str(fd, "website")) return true;
  const started = Number(str(fd, "_t"));
  return !started || Date.now() - started < MIN_FILL_MS;
}

const CAPTCHA_FAILED: FormState = {
  status: "error",
  message:
    "La vérification anti-robot a échoué. Cochez à nouveau la case « Je ne suis pas un robot », ou contactez-nous directement sur WhatsApp.",
};

/**
 * Vérifie le jeton reCAPTCHA v2 (case à cocher) auprès de Google.
 * Sans RECAPTCHA_SECRET_KEY, la vérification est ignorée (mode démo).
 */
async function verifyRecaptcha(fd: FormData): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return true;
  const token = str(fd, "recaptcha", 4000);
  if (!token) return false;
  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
      cache: "no-store",
    });
    const data = (await res.json()) as { success: boolean; hostname?: string; "error-codes"?: string[] };
    if (!data.success) console.warn("[formulaire] reCAPTCHA refusé", { errors: data["error-codes"] });
    return data.success;
  } catch (err) {
    console.error("[formulaire] reCAPTCHA injoignable", err);
    return false;
  }
}

/**
 * Envoi de l'e-mail à l'entreprise.
 * Si RESEND_API_KEY est défini, l'e-mail part via l'API Resend ; sinon la demande est journalisée (mode démo).
 */
async function deliver(subject: string, fields: Record<string, string>, replyTo?: string) {
  const rows = Object.entries(fields)
    .filter(([, v]) => v)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 12px;background:#f1ece4;font-weight:600;vertical-align:top">${escapeHtml(k)}</td><td style="padding:8px 12px;white-space:pre-wrap">${escapeHtml(v)}</td></tr>`,
    )
    .join("");
  const html = `<h2 style="font-family:sans-serif">${escapeHtml(subject)}</h2><table style="font-family:sans-serif;border-collapse:collapse">${rows}</table>`;

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.info(`[formulaire] ${subject}`, fields);
    return true;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.MAIL_FROM ?? `Site web <noreply@${new URL(site.url).hostname.replace(/^www\./, "")}>`,
      to: [process.env.MAIL_TO ?? site.contact.email],
      reply_to: replyTo,
      subject,
      html,
    }),
  });
  if (!res.ok) console.error("[formulaire] échec Resend", res.status, await res.text());
  return res.ok;
}

/** Enregistre la demande dans la base (visible dans le tableau de bord admin). */
async function saveLead(lead: Database["public"]["Tables"]["leads"]["Insert"]) {
  const { error } = await createPublicClient().from("leads").insert({ ...lead, status: "nouveau" });
  if (error) console.error("[formulaire] enregistrement impossible", error.message);
  return !error;
}

export async function sendContact(_prev: FormState, fd: FormData): Promise<FormState> {
  const values = {
    name: str(fd, "name", 120),
    email: str(fd, "email", 160),
    phone: str(fd, "phone", 30),
    subject: str(fd, "subject", 120),
    message: str(fd, "message", 4000),
    consent: str(fd, "consent", 5),
  };

  if (isSpam(fd)) return { status: "success", message: "Merci, votre message a bien été envoyé." };

  const errors: Record<string, string> = {};
  if (values.name.length < 2) errors.name = "Indiquez votre nom (2 caractères minimum).";
  if (!EMAIL_RE.test(values.email)) errors.email = "Indiquez une adresse e-mail valide, par exemple nom@exemple.com.";
  if (values.phone && !PHONE_RE.test(values.phone)) errors.phone = "Numéro invalide. Exemple : +237 690 00 00 00.";
  if (values.message.length < 10) errors.message = "Votre message doit contenir au moins 10 caractères.";
  if (values.consent !== "on") errors.consent = "Votre accord est nécessaire pour que nous puissions vous répondre.";

  if (Object.keys(errors).length) {
    return { status: "error", message: "Merci de corriger les champs signalés.", errors, values };
  }

  if (!(await verifyRecaptcha(fd))) return { ...CAPTCHA_FAILED, values };

  const saved = await saveLead({
    kind: "contact",
    name: values.name,
    email: values.email,
    phone: values.phone,
    subject: values.subject || "Contact",
    message: values.message,
  });
  const mailed = await deliver(
    `Nouveau message — ${values.subject || "Contact"}`,
    { Nom: values.name, "E-mail": values.email, Téléphone: values.phone, Objet: values.subject, Message: values.message },
    values.email,
  );
  if (!saved && !mailed) {
    return { status: "error", message: "L'envoi a échoué. Réessayez ou contactez-nous sur WhatsApp.", values };
  }
  return { status: "success", message: "Merci ! Votre message a bien été envoyé. Nous vous répondons sous 24 h ouvrées." };
}

export async function sendRequest(_prev: FormState, fd: FormData): Promise<FormState> {
  const values = {
    project: str(fd, "project", 60),
    propertyType: str(fd, "propertyType", 60),
    city: str(fd, "city", 80),
    district: str(fd, "district", 80),
    budget: str(fd, "budget", 60),
    bedrooms: str(fd, "bedrooms", 20),
    timeline: str(fd, "timeline", 60),
    propertyRef: str(fd, "propertyRef", 30),
    details: str(fd, "details", 4000),
    name: str(fd, "name", 120),
    email: str(fd, "email", 160),
    phone: str(fd, "phone", 30),
    contactPref: str(fd, "contactPref", 30),
    consent: str(fd, "consent", 5),
  };

  if (isSpam(fd)) return { status: "success", message: "Merci, votre demande a bien été envoyée." };

  const errors: Record<string, string> = {};
  if (!values.project) errors.project = "Choisissez votre projet.";
  if (!values.city) errors.city = "Indiquez la ville concernée.";
  if (values.name.length < 2) errors.name = "Indiquez votre nom.";
  if (!EMAIL_RE.test(values.email)) errors.email = "Indiquez une adresse e-mail valide.";
  if (!PHONE_RE.test(values.phone)) errors.phone = "Indiquez un numéro valide, par exemple +237 690 00 00 00.";
  if (values.consent !== "on") errors.consent = "Votre accord est nécessaire pour traiter votre demande.";

  if (Object.keys(errors).length) {
    return { status: "error", message: "Merci de compléter les champs signalés.", errors, values };
  }

  if (!(await verifyRecaptcha(fd))) return { ...CAPTCHA_FAILED, values };

  const { name, email, phone, details, consent: _consent, propertyRef, project, ...rest } = values;
  void _consent;
  const saved = await saveLead({
    kind: "projet",
    name,
    email,
    phone,
    subject: `${project}${values.propertyType ? ` · ${values.propertyType}` : ""} — ${values.city}`,
    property_ref: propertyRef || null,
    message: details,
    data: { project, ...rest } as Json,
  });
  const mailed = await deliver(
    `Nouveau projet — ${values.project}${values.propertyType ? ` · ${values.propertyType}` : ""} à ${values.city}${values.propertyRef ? ` (réf. ${values.propertyRef})` : ""}`,
    {
      Projet: values.project,
      "Bien concerné": values.propertyRef,
      "Type de bien": values.propertyType,
      Ville: values.city,
      Quartier: values.district,
      "Budget / prix": values.budget,
      Chambres: values.bedrooms,
      Délai: values.timeline,
      Détails: values.details,
      Nom: values.name,
      "E-mail": values.email,
      Téléphone: values.phone,
      "Contact préféré": values.contactPref,
    },
    values.email,
  );
  if (!saved && !mailed) {
    return { status: "error", message: "L'envoi a échoué. Réessayez ou contactez-nous sur WhatsApp.", values };
  }
  return {
    status: "success",
    message: `Merci ${values.name.split(" ")[0]} ! Votre demande est bien reçue. Un conseiller vous recontacte sous 24 h ouvrées.`,
  };
}
