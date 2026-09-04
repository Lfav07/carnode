import {
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserReserveResponse, ReserveStatus } from "../types";

interface ReservationCardProps {
  reservation: UserReserveResponse;
  index: number;
  visible: boolean;
  onCancel?: (id: string) => void;
  isCancelling?: boolean;
}

const statusConfig: Record<
  ReserveStatus,
  { label: string; badge: string; dot: string }
> = {
  PENDING: {
    label: "Pending",
    badge: "bg-amber-500/15 text-amber-400",
    dot: "bg-amber-400",
  },
  CONFIRMED: {
    label: "Confirmed",
    badge: "bg-sky-500/15 text-sky-400",
    dot: "bg-sky-400",
  },
  ACTIVE: {
    label: "Active",
    badge: "bg-emerald-500/15 text-emerald-400",
    dot: "bg-emerald-400",
  },
  COMPLETED: {
    label: "Completed",
    badge: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground",
  },
  CANCELLED: {
    label: "Cancelled",
    badge: "bg-red-500/15 text-red-400",
    dot: "bg-red-400",
  },
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ReservationCard({
  reservation,
  index,
  visible,
  onCancel,
  isCancelling,
}: ReservationCardProps) {
  const status = statusConfig[reservation.status];
  const canCancel =
    reservation.status === "PENDING" || reservation.status === "CONFIRMED";

  return (
    <div
      className={cn(
        "group glass-light hover-glow relative flex flex-col overflow-hidden rounded-2xl transition-all duration-500 hover:-translate-y-1 hover:border-white/10 hover:shadow-2xl hover:shadow-black/30",
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-8 opacity-0",
      )}
      style={{
        transitionDelay: visible ? `${80 + index * 60}ms` : "0ms",
      }}
    >
      {/* Status bar */}
      <div className="flex items-center justify-between border-b border-white/[0.04] px-5 py-3">
        <div className="flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full", status.dot)} />
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
              status.badge,
            )}
          >
            {status.label}
          </span>
        </div>
        <span className="font-mono text-[11px] text-muted-foreground/40">
          #{reservation.id.slice(-8).toUpperCase()}
        </span>
      </div>

      {/* Card content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Car reference */}
        <div className="mb-4">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/50">
            Vehicle
          </p>
          <p className="font-heading text-sm font-semibold">
            Car #{reservation.carId.slice(-6).toUpperCase()}
          </p>
        </div>

        {/* Trip details */}
        <div className="space-y-3">
          {/* Pickup */}
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
              <Calendar className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/50">
                Pickup
              </p>
              <p className="text-sm font-medium">
                {formatDate(reservation.pickup.date)}
              </p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatTime(reservation.pickup.date)}
                <MapPin className="ml-1 h-3 w-3" />
                Store #{reservation.pickup.storeId.slice(-4).toUpperCase()}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="ml-3.5 h-px w-px bg-gradient-to-b from-white/10 to-transparent" />

          {/* Return */}
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-500/10">
              <Calendar className="h-3.5 w-3.5 text-rose-400" />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/50">
                Return
              </p>
              <p className="text-sm font-medium">
                {formatDate(reservation.returnInfo.date)}
              </p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatTime(reservation.returnInfo.date)}
                <MapPin className="ml-1 h-3 w-3" />
                Store #{reservation.returnInfo.storeId.slice(-4).toUpperCase()}
              </p>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="mt-5 flex items-center justify-between rounded-xl bg-white/[0.02] px-4 py-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-[#f79d00]" />
            <div>
              <p className="text-[11px] text-muted-foreground/50">
                {reservation.pricing.days}{" "}
                {reservation.pricing.days === 1 ? "day" : "days"}
              </p>
              <p className="font-heading text-lg font-bold">
                ${reservation.pricing.subtotal}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-muted-foreground/50">Daily rate</p>
            <p className="text-sm font-medium">
              ${reservation.pricing.dailyRate}
            </p>
          </div>
        </div>

        {/* Cancel action */}
        {canCancel && onCancel && (
          <div className="mt-4">
            <button
              onClick={() => onCancel(reservation.id)}
              disabled={isCancelling}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2.5 text-sm font-medium transition-all duration-300",
                isCancelling
                  ? "cursor-not-allowed opacity-50"
                  : "hover:border-red-500/30 hover:bg-red-500/5 hover:text-red-400",
              )}
            >
              <XCircle className="h-4 w-4" />
              {isCancelling ? "Cancelling..." : "Cancel Reservation"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
