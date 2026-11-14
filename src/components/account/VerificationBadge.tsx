import { CircleAlert, Clock, ShieldCheck, ShieldQuestion } from "lucide-react";
import { verificationLabels, type VerificationStatus } from "@/lib/data/document-model";
import { cn } from "@/lib/utils";

const styles: Record<VerificationStatus, string> = {
  unverified: "bg-line text-muted",
  pending: "bg-amber-100 text-amber-900",
  verified: "bg-success/10 text-success",
  rejected: "bg-danger/10 text-danger",
};
const icons = { unverified: ShieldQuestion, pending: Clock, verified: ShieldCheck, rejected: CircleAlert };

export function VerificationBadge({ status, className }: { status: string; className?: string }) {
  const s = (status in styles ? status : "unverified") as VerificationStatus;
  const Icon = icons[s];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold", styles[s], className)}>
      <Icon className="size-3.5" aria-hidden />
      {verificationLabels[s]}
    </span>
  );
}
