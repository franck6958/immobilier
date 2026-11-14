import { statusLabels, type PropertyStatus } from "@/lib/data/property-model";
import { cn } from "@/lib/utils";

const styles: Record<PropertyStatus, string> = {
  pending: "bg-amber-100 text-amber-900",
  published: "bg-success/10 text-success",
  rejected: "bg-danger/10 text-danger",
  archived: "bg-line text-muted",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const s = (status in styles ? status : "pending") as PropertyStatus;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold", styles[s], className)}>
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {statusLabels[s]}
    </span>
  );
}
