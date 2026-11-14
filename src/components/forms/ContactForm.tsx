"use client";

import { useActionState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CircleCheck, Loader2, Send } from "lucide-react";
import { sendContact, type FormState } from "@/app/actions";
import { Recaptcha, RECAPTCHA_REQUIRED_MESSAGE, RECAPTCHA_SITE_KEY } from "@/lib/recaptcha";
import { Button } from "@/components/ui/Button";
import { ConsentCheckbox, Field, SpamGuard } from "./Field";

const initial: FormState = { status: "idle" };

export function ContactForm() {
  const captcha = useRef("");
  const [state, action, pending] = useActionState<FormState, FormData>(async (prev, fd) => {
    if (RECAPTCHA_SITE_KEY && !captcha.current) {
      const values: Record<string, string> = {};
      fd.forEach((val, k) => typeof val === "string" && (values[k] = val));
      return { status: "error", message: RECAPTCHA_REQUIRED_MESSAGE, errors: { recaptcha: RECAPTCHA_REQUIRED_MESSAGE }, values };
    }
    fd.set("recaptcha", captcha.current);
    return sendContact(prev, fd);
  }, initial);
  const statusRef = useRef<HTMLDivElement>(null);
  const v = state.values ?? {};
  const e = state.errors ?? {};

  // Après envoi, déplace le focus vers le message de statut (lecteurs d'écran)
  useEffect(() => {
    if (state.status !== "idle") statusRef.current?.focus();
  }, [state]);

  return (
    <AnimatePresence mode="wait">
      {state.status === "success" ? (
        <motion.div
          key="ok"
          ref={statusRef}
          tabIndex={-1}
          role="status"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center rounded-3xl bg-white p-10 text-center outline-none"
        >
          <motion.span
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 }}
            className="mb-6 grid size-20 place-items-center rounded-full bg-success/10 text-success"
          >
            <CircleCheck className="size-10" aria-hidden />
          </motion.span>
          <h3 className="text-2xl font-bold">Message envoyé</h3>
          <p className="mt-3 max-w-sm text-muted">{state.message}</p>
        </motion.div>
      ) : (
        <motion.form key="form" action={action} noValidate className="relative space-y-6" exit={{ opacity: 0, y: -10 }}>
          <SpamGuard />
          {state.status === "error" && (
            <div
              ref={statusRef}
              tabIndex={-1}
              role="alert"
              className="rounded-2xl border border-danger/30 bg-danger/5 p-4 text-sm font-medium text-danger outline-none"
            >
              {state.message}
            </div>
          )}
          <div className="grid gap-6 sm:grid-cols-2">
            <Field id="c-name" label="Nom complet" required error={e.name}>
              {(p) => <input {...p} name="name" autoComplete="name" defaultValue={v.name} className="field" />}
            </Field>
            <Field id="c-phone" label="Téléphone / WhatsApp" error={e.phone}>
              {(p) => (
                <input {...p} name="phone" type="tel" inputMode="tel" autoComplete="tel" defaultValue={v.phone} placeholder="+237 6XX XX XX XX" className="field" />
              )}
            </Field>
          </div>
          <Field id="c-email" label="Adresse e-mail" required error={e.email}>
            {(p) => (
              <input {...p} name="email" type="email" inputMode="email" autoComplete="email" defaultValue={v.email} placeholder="nom@exemple.com" className="field" />
            )}
          </Field>
          <Field id="c-subject" label="Objet" error={e.subject}>
            {(p) => (
              <select {...p} name="subject" defaultValue={v.subject ?? ""} className="field field-select">
                <option value="">Choisir…</option>
                <option>Achat d&apos;un bien</option>
                <option>Location</option>
                <option>Vente ou estimation</option>
                <option>Gestion locative</option>
                <option>Partenariat (notaire, promoteur…)</option>
                <option>Recrutement</option>
                <option>Autre demande</option>
              </select>
            )}
          </Field>
          <Field id="c-message" label="Votre message" required error={e.message} hint="Décrivez votre projet en quelques lignes : lieu, surface, délai souhaité.">
            {(p) => <textarea {...p} name="message" rows={5} defaultValue={v.message} className="field resize-y" />}
          </Field>
          <ConsentCheckbox error={e.consent} defaultChecked={v.consent === "on"} />
          <Recaptcha onToken={(t) => (captcha.current = t)} error={e.recaptcha} resetKey={state} />
          <Button type="submit" disabled={pending} className="w-full sm:w-auto" icon={pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}>
            {pending ? "Envoi en cours…" : "Envoyer le message"}
          </Button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
