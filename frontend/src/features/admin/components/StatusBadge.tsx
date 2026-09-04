import { cn } from "@/lib/utils";

type BadgeVariant =
  | "available"
  | "rented"
  | "maintenance"
  | "deleted"
  | "pending"
  | "confirmed"
  | "active"
  | "completed"
  | "cancelled"
  | "default";

interface StatusBadgeProps {
  variant: BadgeVariant;
  label: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  available: "bg-emerald-500/15 text-emerald-400",
  active: "bg-emerald-500/15 text-emerald-400",
  rented: "bg-sky-500/15 text-sky-400",
  confirmed: "bg-sky-500/15 text-sky-400",
  maintenance: "bg-amber-500/15 text-amber-400",
  pending: "bg-amber-500/15 text-amber-400",
  deleted: "bg-red-500/15 text-red-400",
  cancelled: "bg-red-500/15 text-red-400",
  completed: "bg-muted text-muted-foreground",
  default: "bg-white/10 text-muted-foreground",
};

export function StatusBadge({ variant, label }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        variantClasses[variant],
      )}
    >
      {label}
    </span>
  );
}
