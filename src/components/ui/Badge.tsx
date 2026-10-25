import type { ClaimStatus, ItemStatus, ItemType } from "@/types/database";
import { cn } from "@/lib/utils";

const base = "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold tracking-wide";

/** LOST (amber) or FOUND (green). */
export function TypeBadge({ type, className }: { type: ItemType; className?: string }) {
  return (
    <span
      className={cn(
        base,
        type === "lost" ? "bg-[#fbe3bf] text-[#7a430a]" : "bg-[#d6edd9] text-brand-800",
        className,
      )}
    >
      {type === "lost" ? "LOST" : "FOUND"}
    </span>
  );
}

const statusStyles: Record<ItemStatus | ClaimStatus, string> = {
  open: "bg-brand-100 text-brand-800",
  claimed: "bg-gold-200 text-brand-900",
  returned: "bg-ink-900 text-white",
  pending: "bg-gold-200 text-brand-900",
  approved: "bg-brand-700 text-white",
  rejected: "bg-[#f3d6d6] text-[#7a1f1f]",
};

export function StatusBadge({ status }: { status: ItemStatus | ClaimStatus }) {
  return <span className={cn(base, statusStyles[status])}>{status.toUpperCase()}</span>;
}
