"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CircleCheck,
  Home,
  KeyRound,
  Loader2,
  Scale,
  Send,
  Tag,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { sendRequest, type FormState } from "@/app/actions";
import { Recaptcha, RECAPTCHA_REQUIRED_MESSAGE, RECAPTCHA_SITE_KEY } from "@/lib/recaptcha";
import { Button, ButtonLink } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/icons";
import { propertyTypes } from "@/lib/content";
import { whatsappLink } from "@/lib/site";
import { cn } from "@/lib/utils";
import { ConsentCheckbox, Field, SpamGuard } from "./Field";

const projects: { value: string; Icon: LucideIcon; hint: string }[] = [
  { value: "Acheter", Icon: Home, hint: "Villa, appartement, terrain" },
  { value: "Louer", Icon: KeyRound, hint: "Logement ou local pro" },
  { value: "Vendre", Icon: Tag, hint: "Estimation gratuite incluse" },
  { value: "Mettre en location", Icon: Building2, hint: "Trouver un locataire" },
  { value: "Gestion locative", Icon: Scale, hint: "Confier la gestion" },
  { value: "Investir", Icon: TrendingUp, hint: "Rendement, diaspora" },
];

const budgetsBuy = ["< 30 M FCFA", "30 – 80 M FCFA", "80 – 150 M FCFA", "150 – 300 M FCFA", "> 300 M FCFA"];
const budgetsRent = ["< 200 000 / mois", "200 – 500 000 / mois", "500 000 – 1 M / mois", "1 – 2,5 M / mois", "> 2,5 M / mois"];
const bedroomsOpts = ["Studio", "1", "2", "3", "4", "5 et +"];
const timelines = ["Dès que possible", "Dans 1 à 3 mois", "Dans 3 à 6 mois", "Je me renseigne"];
const contactPrefs = ["WhatsApp", "Appel", "E-mail"];
const steps = ["Votre projet", "Vos critères", "Vos coordonnées"];

type Data = Record<
  "project" | "propertyType" | "city" | "district" | "budget" | "bedrooms" | "timeline" | "details" | "name" | "email" | "phone" | "contactPref" | "propertyRef",
  string
>;

function Chips({ name, legend, options, value, onChange }: { name: string; legend: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-semibold">
        {legend} <span className="font-normal text-muted">(facultatif)</span>
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label key={o} className="cursor-pointer">
            <input type="radio" name={name} value={o} checked={value === o} onChange={() => onChange(o)} className="peer sr-only" />
            <span className="inline-flex min-h-11 items-center rounded-full border-[1.5px] border-line bg-white px-4 text-sm font-medium transition-all hover:border-ink/40 peer-checked:border-ink peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:ring-4 peer-focus-visible:ring-accent/30">
              {o}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function ProjectForm() {
  const search = useSearchParams();
  const initialProject = projects.some((p) => p.value === search.get("projet")) ? search.get("projet")! : "";
  const captcha = useRef("");
  const [state, action, pending] = useActionState<FormState, FormData>(async (prev, fd) => {
    if (RECAPTCHA_SITE_KEY && !captcha.current) {
      return { status: "error", message: RECAPTCHA_REQUIRED_MESSAGE, errors: { recaptcha: RECAPTCHA_REQUIRED_MESSAGE } };
    }
    fd.set("recaptcha", captcha.current);
    return sendRequest(prev, fd);
  }, { status: "idle" });
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [d, setD] = useState<Data>({
    project: initialProject,
    propertyType: "",
    city: "",
    district: "",
    budget: "",
    bedrooms: "",
    timeline: "",
    details: "",
    name: "",
    email: "",
    phone: "",
    contactPref: "WhatsApp",
    propertyRef: search.get("bien")?.slice(0, 30) ?? "",
  });
  const headingRef = useRef<HTMLHeadingElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const set = (k: keyof Data) => (v: string) => setD((p) => ({ ...p, [k]: v }));

  const seller = ["Vendre", "Mettre en location", "Gestion locative"].includes(d.project);
  const renting = d.project === "Louer";

  // Erreurs serveur : revenir à l'étape concernée
  const [seen, setSeen] = useState(state);
  if (seen !== state) {
    setSeen(state);
    if (state.status === "error" && state.errors) {
      setErrors(state.errors);
      setStep(state.errors.project || state.errors.city ? 0 : 2);
    }
  }

  useEffect(() => {
    if (state.status === "success") statusRef.current?.focus();
  }, [state.status]);

  const validate = (s: number) => {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (!d.project) e.project = "Choisissez votre projet.";
      if (!d.city.trim()) e.city = "Indiquez la ville concernée.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goTo = (s: number) => {
    if (s > step && !validate(step)) return;
    setDir(s > step ? 1 : -1);
    setStep(s);
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  if (state.status === "success") {
    return (
      <motion.div
        ref={statusRef}
        tabIndex={-1}
        role="status"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center rounded-[2rem] bg-white p-10 text-center outline-none md:p-16"
      >
        <motion.span
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.15 }}
          className="mb-6 grid size-24 place-items-center rounded-full bg-success/10 text-success"
        >
          <CircleCheck className="size-12" aria-hidden />
        </motion.span>
        <h2 className="text-3xl font-bold">Demande envoyée !</h2>
        <p className="mt-4 max-w-md text-lg text-muted">{state.message}</p>
        <div className="mt-8">
          <ButtonLink href={whatsappLink("Bonjour, je viens d'envoyer une demande sur votre site.")} icon={<WhatsAppIcon className="size-4" />}>
            Échanger sur WhatsApp
          </ButtonLink>
        </div>
      </motion.div>
    );
  }

  return (
    <form
      action={action}
      noValidate
      onSubmit={(ev) => {
        if (step < steps.length - 1) {
          ev.preventDefault();
          goTo(step + 1);
        }
      }}
      className="relative overflow-hidden rounded-[2rem] bg-white p-6 shadow-[0_30px_80px_-40px_rgb(20_17_15/0.35)] sm:p-10"
    >
      <SpamGuard />
      {Object.entries(d).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}

      {d.propertyRef && (
        <p className="mb-6 rounded-2xl bg-accent-soft px-4 py-3 text-sm font-medium text-ink">
          Demande concernant le bien réf. <strong>{d.propertyRef}</strong>
        </p>
      )}

      <ol className="mb-10 grid grid-cols-3 gap-2" aria-label="Étapes du formulaire">
        {steps.map((label, i) => (
          <li key={label}>
            <button type="button" onClick={() => i < step && goTo(i)} disabled={i > step} aria-current={i === step ? "step" : undefined} className="w-full text-left disabled:cursor-default">
              <span className="block h-1.5 overflow-hidden rounded-full bg-line">
                <motion.span
                  className="block h-full origin-left rounded-full bg-accent"
                  initial={false}
                  animate={{ scaleX: i <= step ? 1 : 0 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                />
              </span>
              <span className={cn("mt-3 hidden text-sm font-medium sm:block", i <= step ? "text-ink" : "text-muted")}>
                {i + 1}. {label}
              </span>
            </button>
          </li>
        ))}
      </ol>
      <p className="mb-2 text-sm font-medium text-muted sm:hidden">Étape {step + 1} sur {steps.length}</p>

      <AnimatePresence mode="wait" custom={dir} initial={false}>
        <motion.div
          key={step}
          custom={dir}
          variants={{
            enter: (x: number) => ({ opacity: 0, x: x * 40 }),
            center: { opacity: 1, x: 0 },
            exit: (x: number) => ({ opacity: 0, x: x * -40 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-8"
        >
          <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-bold outline-none md:text-3xl">
            {steps[step]}
          </h2>

          {step === 0 && (
            <>
              <fieldset aria-describedby={errors.project ? "pj-err" : undefined}>
                <legend className="mb-3 text-sm font-semibold">
                  Vous souhaitez… <span className="text-accent-strong" aria-hidden>*</span>
                </legend>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {projects.map(({ value, Icon, hint }) => (
                    <label key={value} className="cursor-pointer">
                      <input type="radio" name="_project" value={value} checked={d.project === value} onChange={() => set("project")(value)} className="peer sr-only" />
                      <span className="flex h-full items-center gap-4 rounded-2xl border-[1.5px] border-line p-4 transition-all hover:border-ink/40 peer-checked:border-ink peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:ring-4 peer-focus-visible:ring-accent/30">
                        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-strong">
                          <Icon className="size-5" aria-hidden />
                        </span>
                        <span>
                          <span className="block font-semibold">{value}</span>
                          <span className="block text-sm opacity-70">{hint}</span>
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
                {errors.project && (
                  <p id="pj-err" role="alert" className="mt-2 text-sm font-medium text-danger">{errors.project}</p>
                )}
              </fieldset>
              <Chips name="_propertyType" legend="Type de bien" options={propertyTypes} value={d.propertyType} onChange={set("propertyType")} />
              <div className="grid gap-6 sm:grid-cols-2">
                <Field id="p-city" label="Ville" required error={errors.city}>
                  {(p) => <input {...p} value={d.city} onChange={(e) => set("city")(e.target.value)} autoComplete="address-level2" placeholder="Douala, Yaoundé, Kribi…" className="field" />}
                </Field>
                <Field id="p-district" label="Quartier(s)">
                  {(p) => <input {...p} value={d.district} onChange={(e) => set("district")(e.target.value)} placeholder="ex. Bonapriso, Bonamoussadi" className="field" />}
                </Field>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              {seller ? (
                <Field id="p-budget" label={d.project === "Vendre" ? "Prix souhaité" : "Loyer souhaité"} hint="Laissez vide si vous souhaitez notre estimation.">
                  {(p) => <input {...p} value={d.budget} onChange={(e) => set("budget")(e.target.value)} placeholder="ex. 90 000 000 FCFA" className="field" />}
                </Field>
              ) : (
                <Chips name="_budget" legend={renting ? "Loyer mensuel maximum" : "Budget"} options={renting ? budgetsRent : budgetsBuy} value={d.budget} onChange={set("budget")} />
              )}
              <Chips name="_bedrooms" legend="Nombre de chambres" options={bedroomsOpts} value={d.bedrooms} onChange={set("bedrooms")} />
              <Chips name="_timeline" legend="Échéance" options={timelines} value={d.timeline} onChange={set("timeline")} />
              <Field id="p-details" label={seller ? "Décrivez votre bien" : "Précisez votre recherche"} hint={seller ? "Surface, terrain, état, titre foncier, disponibilité…" : "Meublé ou non, parking, proximité écoles, usage professionnel…"}>
                {(p) => <textarea {...p} rows={5} value={d.details} onChange={(e) => set("details")(e.target.value)} className="field resize-y" />}
              </Field>
            </>
          )}

          {step === 2 && (
            <>
              <Field id="p-name" label="Nom complet" required error={errors.name}>
                {(p) => <input {...p} value={d.name} onChange={(e) => set("name")(e.target.value)} autoComplete="name" className="field" />}
              </Field>
              <div className="grid gap-6 sm:grid-cols-2">
                <Field id="p-phone" label="Téléphone / WhatsApp" required error={errors.phone}>
                  {(p) => <input {...p} type="tel" inputMode="tel" autoComplete="tel" value={d.phone} onChange={(e) => set("phone")(e.target.value)} placeholder="+237 6XX XX XX XX" className="field" />}
                </Field>
                <Field id="p-email" label="Adresse e-mail" required error={errors.email}>
                  {(p) => <input {...p} type="email" inputMode="email" autoComplete="email" value={d.email} onChange={(e) => set("email")(e.target.value)} placeholder="nom@exemple.com" className="field" />}
                </Field>
              </div>
              <Chips name="_contactPref" legend="Comment préférez-vous être recontacté ?" options={contactPrefs} value={d.contactPref} onChange={set("contactPref")} />
              <ConsentCheckbox error={errors.consent} />
              <Recaptcha onToken={(t) => (captcha.current = t)} error={errors.recaptcha} resetKey={state} />
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {state.status === "error" && state.message && !state.errors && (
        <p role="alert" className="mt-6 rounded-2xl bg-danger/5 p-4 text-sm font-medium text-danger">{state.message}</p>
      )}

      <div className="mt-10 flex flex-col-reverse gap-3 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
        {step > 0 ? (
          <button type="button" onClick={() => goTo(step - 1)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 font-semibold text-muted transition-colors hover:bg-sand hover:text-ink">
            <ArrowLeft className="size-4" aria-hidden /> Retour
          </button>
        ) : (
          <span className="text-sm text-muted">Gratuit et sans engagement · 2 minutes</span>
        )}
        {step < steps.length - 1 ? (
          <Button type="submit" variant="dark" icon={<ArrowRight className="size-4" />}>Continuer</Button>
        ) : (
          <Button type="submit" disabled={pending} icon={pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}>
            {pending ? "Envoi en cours…" : "Envoyer ma demande"}
          </Button>
        )}
      </div>
    </form>
  );
}
