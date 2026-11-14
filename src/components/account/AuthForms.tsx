"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState, useState } from "react";
import { AlertCircle, CircleCheck, Eye, EyeOff, Loader2, LogIn, Send, UserPlus } from "lucide-react";
import {
  requestPasswordReset,
  signIn,
  signUp,
  updatePassword,
  updateProfile,
  type AuthState,
} from "@/lib/auth-actions";
import { Button } from "@/components/ui/Button";
import { ConsentCheckbox, Field } from "@/components/forms/Field";

const idle: AuthState = { status: "idle" };

function StatusBanner({ state }: { state: AuthState }) {
  if (state.status === "idle" || !state.message) return null;
  const ok = state.status === "success";
  return (
    <div
      role={ok ? "status" : "alert"}
      className={`flex items-start gap-3 rounded-2xl p-4 text-sm font-medium ${ok ? "bg-success/10 text-success" : "border border-danger/30 bg-danger/5 text-danger"}`}
    >
      {ok ? <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden /> : <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />}
      {state.message}
    </div>
  );
}

export function PasswordInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input {...props} type={show ? "text" : "password"} className="field pr-14" />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        aria-pressed={show}
        className="absolute right-1.5 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-sand hover:text-ink"
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

export function SignInForm() {
  const params = useSearchParams();
  const [state, action, pending] = useActionState(signIn, idle);
  const linkError = params.get("erreur") === "lien";
  return (
    <form action={action} noValidate className="space-y-5">
      <input type="hidden" name="next" value={params.get("next") ?? ""} />
      {linkError && state.status === "idle" && (
        <StatusBanner state={{ status: "error", message: "Ce lien n'est plus valide ou a déjà été utilisé. Connectez-vous ou demandez un nouveau lien." }} />
      )}
      <StatusBanner state={state} />
      <Field id="si-email" label="Adresse e-mail" required>
        {(p) => <input {...p} name="email" type="email" inputMode="email" autoComplete="email" defaultValue={state.values?.email} className="field" />}
      </Field>
      <div className="space-y-2">
        <div className="flex items-baseline justify-between gap-4">
          <label htmlFor="si-password" className="text-sm font-semibold">
            Mot de passe<span className="text-accent-strong" aria-hidden> *</span>
          </label>
          <Link href="/mot-de-passe-oublie" className="text-sm font-medium text-accent-strong underline-offset-2 hover:underline">
            Mot de passe oublié ?
          </Link>
        </div>
        <PasswordInput id="si-password" name="password" autoComplete="current-password" required />
      </div>
      <Button type="submit" disabled={pending} className="w-full" icon={pending ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}>
        {pending ? "Connexion…" : "Se connecter"}
      </Button>
      <p className="text-center text-sm text-muted">
        Pas encore de compte ?{" "}
        <Link href="/inscription" className="font-semibold text-ink underline underline-offset-2">Créer un compte propriétaire</Link>
      </p>
    </form>
  );
}

export function SignUpForm() {
  const [state, action, pending] = useActionState(signUp, idle);
  const e = state.errors ?? {};
  const v = state.values ?? {};
  if (state.status === "success") {
    return (
      <div className="space-y-6">
        <StatusBanner state={state} />
        <p className="text-sm text-muted">
          Rien reçu après quelques minutes ? Vérifiez vos courriers indésirables, ou{" "}
          <Link href="/connexion" className="font-semibold text-ink underline underline-offset-2">connectez-vous</Link> si vous avez déjà confirmé.
        </p>
      </div>
    );
  }
  return (
    <form action={action} noValidate className="space-y-5">
      <StatusBanner state={state} />
      <Field id="su-name" label="Nom complet" required error={e.full_name}>
        {(p) => <input {...p} name="full_name" autoComplete="name" defaultValue={v.full_name} className="field" />}
      </Field>
      <Field id="su-phone" label="Téléphone / WhatsApp" required error={e.phone}>
        {(p) => <input {...p} name="phone" type="tel" inputMode="tel" autoComplete="tel" defaultValue={v.phone} placeholder="+237 6XX XX XX XX" className="field" />}
      </Field>
      <Field id="su-email" label="Adresse e-mail" required error={e.email}>
        {(p) => <input {...p} name="email" type="email" inputMode="email" autoComplete="email" defaultValue={v.email} className="field" />}
      </Field>
      <Field id="su-password" label="Mot de passe" required error={e.password} hint="Au moins 8 caractères, avec lettres et chiffres.">
        {(p) => <PasswordInput {...p} name="password" autoComplete="new-password" />}
      </Field>
      <ConsentCheckbox error={e.consent} />
      <Button type="submit" disabled={pending} className="w-full" icon={pending ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}>
        {pending ? "Création du compte…" : "Créer mon compte"}
      </Button>
      <p className="text-center text-sm text-muted">
        Déjà inscrit ?{" "}
        <Link href="/connexion" className="font-semibold text-ink underline underline-offset-2">Se connecter</Link>
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, idle);
  return (
    <form action={action} noValidate className="space-y-5">
      <StatusBanner state={state} />
      {state.status !== "success" && (
        <>
          <Field id="fp-email" label="Adresse e-mail du compte" required>
            {(p) => <input {...p} name="email" type="email" inputMode="email" autoComplete="email" defaultValue={state.values?.email} className="field" />}
          </Field>
          <Button type="submit" disabled={pending} className="w-full" icon={pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}>
            {pending ? "Envoi…" : "Recevoir un lien"}
          </Button>
        </>
      )}
      <p className="text-center text-sm text-muted">
        <Link href="/connexion" className="font-semibold text-ink underline underline-offset-2">Retour à la connexion</Link>
      </p>
    </form>
  );
}

export function NewPasswordForm() {
  const [state, action, pending] = useActionState(updatePassword, idle);
  const e = state.errors ?? {};
  return (
    <form action={action} noValidate className="max-w-md space-y-5">
      <StatusBanner state={state} />
      <Field id="np-password" label="Nouveau mot de passe" required error={e.password} hint="Au moins 8 caractères, avec lettres et chiffres.">
        {(p) => <PasswordInput {...p} name="password" autoComplete="new-password" />}
      </Field>
      <Field id="np-confirm" label="Confirmez le mot de passe" required error={e.confirm}>
        {(p) => <PasswordInput {...p} name="confirm" autoComplete="new-password" />}
      </Field>
      <Button type="submit" disabled={pending} variant="dark" icon={pending ? <Loader2 className="size-4 animate-spin" /> : false}>
        {pending ? "Enregistrement…" : "Enregistrer le mot de passe"}
      </Button>
    </form>
  );
}

export function ProfileForm({ initial }: { initial: { full_name: string; phone: string; email: string } }) {
  const [state, action, pending] = useActionState(updateProfile, idle);
  const e = state.errors ?? {};
  const v = state.values ?? initial;
  return (
    <form action={action} noValidate className="max-w-md space-y-5">
      <StatusBanner state={state} />
      <Field id="pf-email" label="Adresse e-mail" hint="Pour changer d'adresse, contactez l'agence.">
        {(p) => <input {...p} value={initial.email} readOnly disabled className="field cursor-not-allowed bg-sand" />}
      </Field>
      <Field id="pf-name" label="Nom complet" required error={e.full_name}>
        {(p) => <input {...p} name="full_name" autoComplete="name" defaultValue={v.full_name} className="field" />}
      </Field>
      <Field id="pf-phone" label="Téléphone / WhatsApp" required error={e.phone}>
        {(p) => <input {...p} name="phone" type="tel" inputMode="tel" autoComplete="tel" defaultValue={v.phone} className="field" />}
      </Field>
      <Button type="submit" disabled={pending} variant="dark" icon={pending ? <Loader2 className="size-4 animate-spin" /> : false}>
        {pending ? "Enregistrement…" : "Enregistrer"}
      </Button>
    </form>
  );
}
