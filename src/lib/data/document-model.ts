/** Pièces justificatives : définitions partagées (serveur et navigateur). */

export type DocKind =
  | "cni_recto"
  | "cni_verso"
  | "selfie_cni"
  | "justificatif_domicile"
  | "titre_foncier"
  | "acte_vente"
  | "certificat_propriete"
  | "plan_cadastral"
  | "procuration"
  | "autre";

export type DocStatus = "pending" | "approved" | "rejected";
export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

export type DocSlot = { kind: DocKind; label: string; hint: string; required?: boolean; multiple?: boolean };

/** Pièces d'identité demandées pour vérifier le compte. */
export const accountSlots: DocSlot[] = [
  { kind: "cni_recto", label: "CNI — recto", hint: "Photo nette de la face avant de votre carte nationale d'identité (ou passeport).", required: true },
  { kind: "cni_verso", label: "CNI — verso", hint: "Photo nette de la face arrière de la carte.", required: true },
  { kind: "selfie_cni", label: "Photo de vous tenant votre CNI", hint: "Facultatif, mais accélère la vérification." },
  { kind: "justificatif_domicile", label: "Justificatif de domicile", hint: "Facultatif : facture ENEO / CAMWATER de moins de 3 mois." },
];

/** Preuves de propriété demandées pour chaque bien. Au moins une des trois premières doit être validée. */
export const propertySlots: DocSlot[] = [
  { kind: "titre_foncier", label: "Titre foncier", hint: "Copie du titre foncier au nom du propriétaire." },
  { kind: "acte_vente", label: "Acte de vente notarié", hint: "Si le titre foncier est en cours de mutation." },
  { kind: "certificat_propriete", label: "Certificat de propriété", hint: "Délivré par la conservation foncière." },
  { kind: "plan_cadastral", label: "Plan de situation / cadastral", hint: "Facultatif : situe précisément la parcelle." },
  { kind: "procuration", label: "Procuration du propriétaire", hint: "Obligatoire si vous n'êtes pas vous-même le propriétaire." },
  { kind: "autre", label: "Autre document", hint: "Permis de bâtir, quitus, attestation… (facultatif)", multiple: true },
];

export const OWNERSHIP_KINDS: DocKind[] = ["titre_foncier", "acte_vente", "certificat_propriete"];
export const ACCOUNT_KINDS: DocKind[] = ["cni_recto", "cni_verso", "selfie_cni", "justificatif_domicile"];
export const REQUIRED_ACCOUNT_KINDS: DocKind[] = ["cni_recto", "cni_verso"];
export const ALL_KINDS: DocKind[] = [...ACCOUNT_KINDS, ...propertySlots.map((s) => s.kind)];

export const docKindLabels: Record<string, string> = Object.fromEntries(
  [...accountSlots, ...propertySlots].map((s) => [s.kind, s.label]),
);

export const docStatusLabels: Record<DocStatus, string> = {
  pending: "En attente",
  approved: "Validé",
  rejected: "Refusé",
};

export const verificationLabels: Record<VerificationStatus, string> = {
  unverified: "Compte non vérifié",
  pending: "Vérification en cours",
  verified: "Compte vérifié",
  rejected: "Vérification refusée",
};

export const MAX_DOC_BYTES = 10 * 1024 * 1024;
export const DOC_MIME = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

/** Document tel qu'affiché (avec lien signé temporaire). */
export type DocItem = {
  id: string;
  kind: DocKind;
  propertyId: string | null;
  fileName: string;
  mime: string;
  size: number;
  status: DocStatus;
  adminNote: string | null;
  createdAt: string;
  url: string | null;
};

/** État des preuves de propriété d'un bien. */
export type OwnershipState = "approved" | "pending" | "rejected" | "missing";

export function ownershipState(docs: Pick<DocItem, "kind" | "status">[]): OwnershipState {
  const proofs = docs.filter((d) => OWNERSHIP_KINDS.includes(d.kind));
  if (proofs.some((d) => d.status === "approved")) return "approved";
  if (proofs.some((d) => d.status === "pending")) return "pending";
  if (proofs.length) return "rejected";
  return "missing";
}

export const ownershipLabels: Record<OwnershipState, string> = {
  approved: "Propriété vérifiée",
  pending: "Justificatif en cours d'examen",
  rejected: "Justificatif refusé",
  missing: "Justificatif de propriété manquant",
};

/** Les pièces obligatoires du compte sont-elles fournies (non refusées) ? */
export function accountDocsReady(docs: Pick<DocItem, "kind" | "status">[]) {
  return REQUIRED_ACCOUNT_KINDS.every((k) => docs.some((d) => d.kind === k && d.status !== "rejected"));
}

/** Les pièces obligatoires du compte sont-elles toutes validées ? */
export function accountDocsApproved(docs: Pick<DocItem, "kind" | "status">[]) {
  return REQUIRED_ACCOUNT_KINDS.every((k) => docs.some((d) => d.kind === k && d.status === "approved"));
}

export function formatBytes(n: number) {
  if (n < 1024 * 1024) return `${Math.max(1, Math.round(n / 1024))} Ko`;
  return `${(n / 1024 / 1024).toFixed(1).replace(".", ",")} Mo`;
}

/** Raisons qui empêchent de publier un bien (mêmes règles que la base de données). */
export function publishBlockers(
  owner: { role: string; verification_status: string } | null,
  docs: Pick<DocItem, "kind" | "status">[],
): string[] {
  if (!owner || owner.role === "admin") return [];
  const out: string[] = [];
  if (owner.verification_status !== "verified") out.push("Le compte du propriétaire n'est pas encore vérifié (pièce d'identité).");
  if (ownershipState(docs) !== "approved") out.push("Aucun justificatif de propriété validé pour ce bien.");
  return out;
}
