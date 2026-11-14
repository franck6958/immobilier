"use client";

import { useActionState, useState } from "react";
import { AlertCircle, Info, Loader2, Save } from "lucide-react";
import { saveProperty, type PropertyFormState } from "@/lib/property-actions";
import { badges, cities, propertyTypes, statusLabels, transactions, type PropertyStatus } from "@/lib/data/property-model";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/forms/Field";
import { ImageUploader } from "./ImageUploader";

export type EditableProperty = {
  id?: string;
  title?: string;
  transaction?: string;
  type?: string;
  city?: string;
  district?: string;
  price?: number;
  surface?: number;
  land?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  furnished?: boolean;
  summary?: string;
  description?: string;
  features?: string[];
  images?: string[];
  image_alt?: string;
  status?: string;
  badge?: string | null;
  agent?: number;
  admin_note?: string | null;
};

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-3xl bg-white p-6 ring-1 ring-line md:p-8">
      <legend className="sr-only">{title}</legend>
      <h2 aria-hidden className="text-xl font-bold">{title}</h2>
      {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
      <div className="mt-6 space-y-6">{children}</div>
    </fieldset>
  );
}

export function PropertyEditor({
  initial = {},
  userId,
  area,
  agents = [],
}: {
  initial?: EditableProperty;
  userId: string;
  area: "owner" | "admin";
  agents?: string[];
}) {
  const [state, action, pending] = useActionState<PropertyFormState, FormData>(saveProperty, { status: "idle" });
  const [images, setImages] = useState<string[]>(initial.images ?? []);
  const [tx, setTx] = useState(initial.transaction ?? "Vente");
  const e = state.errors ?? {};
  const isEdit = Boolean(initial.id);
  const num = (n?: number | null) => (n === null || n === undefined ? "" : String(n));
  /** Valeur à afficher : saisie renvoyée par le serveur (après erreur) ou valeur initiale */
  const val = (k: string, fallback?: string | null) => state.values?.[k] ?? fallback ?? "";

  return (
    <form action={action} noValidate className="space-y-6">
      {initial.id && <input type="hidden" name="id" value={initial.id} />}
      <input type="hidden" name="area" value={area} />
      <input type="hidden" name="images" value={JSON.stringify(images)} />

      {area === "owner" && (
        <p className="flex items-start gap-3 rounded-2xl bg-accent-soft p-4 text-sm text-ink">
          <Info className="mt-0.5 size-4 shrink-0 text-accent-strong" aria-hidden />
          {isEdit
            ? "Toute modification repasse l'annonce en validation : elle sera vérifiée par l'agence avant d'être de nouveau visible."
            : "Votre annonce sera vérifiée par l'agence (titre foncier, photos, prix) avant sa publication. Vous serez contacté si nécessaire."}
        </p>
      )}

      {state.status === "error" && state.message && (
        <div role="alert" className="flex items-start gap-3 rounded-2xl border border-danger/30 bg-danger/5 p-4 text-sm font-medium text-danger">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          {state.message}
        </div>
      )}

      <Section title="Le bien" hint="Les informations essentielles affichées sur l'annonce.">
        <Field id="pe-title" label="Titre de l'annonce" required error={e.title} hint="Ex. : Villa familiale avec jardin">
          {(p) => <input {...p} name="title" defaultValue={val("title", initial.title)} maxLength={120} className="field" />}
        </Field>
        <fieldset>
          <legend className="mb-3 text-sm font-semibold">Transaction<span className="text-accent-strong" aria-hidden> *</span></legend>
          <div className="flex gap-2">
            {transactions.map((t) => (
              <label key={t} className="cursor-pointer">
                <input type="radio" name="transaction" value={t} checked={tx === t} onChange={() => setTx(t)} className="peer sr-only" />
                <span className="inline-flex min-h-11 items-center rounded-full border-[1.5px] border-line px-5 text-sm font-semibold transition-colors peer-checked:border-ink peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:ring-4 peer-focus-visible:ring-accent/30">
                  {t === "Vente" ? "À vendre" : "À louer"}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field id="pe-type" label="Type de bien" required error={e.type}>
            {(p) => (
              <select {...p} name="type" defaultValue={val("type", initial.type)} className="field field-select">
                <option value="" disabled>Choisir…</option>
                {propertyTypes.map((t) => <option key={t}>{t}</option>)}
              </select>
            )}
          </Field>
          <Field id="pe-price" label={tx === "Vente" ? "Prix de vente (FCFA)" : "Loyer mensuel (FCFA)"} required error={e.price}>
            {(p) => <input {...p} name="price" inputMode="numeric" defaultValue={val("price", num(initial.price))} placeholder="ex. 95000000" className="field" />}
          </Field>
          <Field id="pe-city" label="Ville" required error={e.city}>
            {(p) => (
              <>
                <input {...p} name="city" list="pe-cities" defaultValue={val("city", initial.city)} autoComplete="address-level2" className="field" />
                <datalist id="pe-cities">{cities.map((c) => <option key={c} value={c} />)}</datalist>
              </>
            )}
          </Field>
          <Field id="pe-district" label="Quartier">
            {(p) => <input {...p} name="district" defaultValue={val("district", initial.district)} placeholder="ex. Bonapriso" className="field" />}
          </Field>
        </div>
      </Section>

      <Section title="Caractéristiques">
        <div className="grid gap-6 sm:grid-cols-2">
          <Field id="pe-surface" label="Surface (m²)" required error={e.surface} hint="Surface habitable, ou superficie pour un terrain.">
            {(p) => <input {...p} name="surface" inputMode="numeric" defaultValue={val("surface", num(initial.surface))} className="field" />}
          </Field>
          <Field id="pe-land" label="Terrain (m²)" error={e.land}>
            {(p) => <input {...p} name="land" inputMode="numeric" defaultValue={val("land", num(initial.land))} className="field" />}
          </Field>
          <Field id="pe-bedrooms" label="Chambres" error={e.bedrooms}>
            {(p) => <input {...p} name="bedrooms" inputMode="numeric" defaultValue={val("bedrooms", num(initial.bedrooms))} className="field" />}
          </Field>
          <Field id="pe-bathrooms" label="Salles de bain" error={e.bathrooms}>
            {(p) => <input {...p} name="bathrooms" inputMode="numeric" defaultValue={val("bathrooms", num(initial.bathrooms))} className="field" />}
          </Field>
        </div>
        <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold">
          <input type="checkbox" name="furnished" defaultChecked={state.values ? state.values.furnished === "on" : initial.furnished} className="size-5 accent-[var(--color-accent-strong)]" />
          Bien meublé
        </label>
        <Field id="pe-features" label="Prestations" hint="Une par ligne ou séparées par des virgules : Titre foncier, Piscine, Forage, Groupe électrogène…">
          {(p) => <textarea {...p} name="features" rows={3} defaultValue={val("features", (initial.features ?? []).join("\n"))} className="field resize-y" />}
        </Field>
      </Section>

      <Section title="Description">
        <Field id="pe-summary" label="Résumé en une phrase" required error={e.summary} hint="Affiché sous le titre (220 caractères maximum).">
          {(p) => <input {...p} name="summary" maxLength={220} defaultValue={val("summary", initial.summary)} className="field" />}
        </Field>
        <Field id="pe-description" label="Description détaillée" hint="Séparez les paragraphes par une ligne vide.">
          {(p) => <textarea {...p} name="description" rows={8} defaultValue={val("description", initial.description)} className="field resize-y" />}
        </Field>
      </Section>

      <Section title="Photos" hint="Des photos lumineuses et nettes multiplient les demandes de visite.">
        <ImageUploader userId={userId} value={images} onChange={setImages} error={e.images} />
        <Field id="pe-alt" label="Description de la photo principale" hint="Pour l'accessibilité et Google. Ex. : Villa blanche avec piscine à Bonapriso">
          {(p) => <input {...p} name="image_alt" maxLength={160} defaultValue={val("image_alt", initial.image_alt)} className="field" />}
        </Field>
      </Section>

      {area === "admin" && (
        <Section title="Publication (admin)">
          <div className="grid gap-6 sm:grid-cols-3">
            <Field id="pe-status" label="Statut">
              {(p) => (
                <select {...p} name="status" defaultValue={val("status", initial.status ?? "published")} className="field field-select">
                  {(Object.keys(statusLabels) as PropertyStatus[]).map((s) => <option key={s} value={s}>{statusLabels[s]}</option>)}
                </select>
              )}
            </Field>
            <Field id="pe-badge" label="Badge">
              {(p) => (
                <select {...p} name="badge" defaultValue={val("badge", initial.badge)} className="field field-select">
                  <option value="">Aucun</option>
                  {badges.map((b) => <option key={b}>{b}</option>)}
                </select>
              )}
            </Field>
            <Field id="pe-agent" label="Conseiller">
              {(p) => (
                <select {...p} name="agent" defaultValue={val("agent", String(initial.agent ?? 0))} className="field field-select">
                  {agents.map((a, i) => <option key={a} value={i}>{a}</option>)}
                </select>
              )}
            </Field>
          </div>
          <Field id="pe-note" label="Note au propriétaire" hint="Visible par le propriétaire (motif de refus, éléments manquants…).">
            {(p) => <textarea {...p} name="admin_note" rows={2} defaultValue={val("admin_note", initial.admin_note)} className="field resize-y" />}
          </Field>
        </Section>
      )}

      <div className="sticky bottom-4 z-10 flex justify-end">
        <Button type="submit" disabled={pending} className="shadow-xl" icon={pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}>
          {pending ? "Enregistrement…" : area === "admin" ? "Enregistrer" : isEdit ? "Enregistrer et renvoyer en validation" : "Envoyer mon annonce"}
        </Button>
      </div>
    </form>
  );
}
