import { useState } from "react";
import { useNavigate } from "react-router";
import { X, Loader2, CheckCircle2, AlertCircle, MapPin, Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/AuthProvider";
import { useCreateReserve } from "@/features/reserves/hooks/reservesHooks";
import { useQuery } from "@tanstack/react-query";
import { getStores } from "@/features/stores/api/storesApi";
import type { CarUserResponse } from "@/features/cars/types";

interface BookingConfirmationModalProps {
  car: CarUserResponse;
  storeId: string;
  pickupDate: string;
  returnDate: string;
  onClose: () => void;
}

export function BookingConfirmationModal({
  car,
  storeId,
  pickupDate,
  returnDate,
  onClose,
}: BookingConfirmationModalProps) {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const createReserve = useCreateReserve();

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const { data: stores } = useQuery({
    queryKey: ["stores", "user", "all"],
    queryFn: () => getStores(),
    staleTime: 60000,
  });

  const store = stores?.find((s) => s.id === storeId);

  const pickup = new Date(pickupDate);
  const ret = new Date(returnDate);

  const days = Math.max(
    1,
    Math.ceil((ret.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24)),
  );
  const dailyRate = parseFloat(car.dailyRate);
  const total = (dailyRate * days).toFixed(2);

  async function handleConfirm() {
    if (!isAuthenticated) {
      login();
      return;
    }

    setStatus("submitting");

    try {
      await createReserve.mutateAsync({
        carId: car.id,
        pickup: { date: pickupDate, storeId },
        returnInfo: { date: returnDate, storeId },
      });
      setStatus("success");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create reservation";
      setErrorMessage(message);
      setStatus("error");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#14141f] shadow-2xl shadow-black/40">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
          <h2 className="font-heading text-lg font-semibold">
            Confirm Reservation
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground/60 transition-colors hover:bg-white/[0.05] hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          {status === "success" ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-[#64f38c]" />
              <h3 className="font-heading text-xl font-semibold">
                Reservation Confirmed!
              </h3>
              <p className="mt-2 text-sm text-muted-foreground/60">
                Your reservation has been created successfully.
              </p>
              <button
                onClick={() => navigate("/reserves")}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#f79d00] to-[#64f38c] px-6 py-3 font-heading text-sm font-semibold text-[#0c0c14] shadow-lg shadow-[#f79d00]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#f79d00]/30 hover:brightness-110"
              >
                View My Reservations
              </button>
            </div>
          ) : status === "error" ? (
            <div className="py-8 text-center">
              <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-400" />
              <h3 className="font-heading text-xl font-semibold">
                Reservation Failed
              </h3>
              <p className="mt-2 text-sm text-red-400/80">{errorMessage}</p>
              <button
                onClick={() => setStatus("idle")}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white/[0.05] px-6 py-3 text-sm font-medium transition-colors hover:bg-white/[0.08]"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              {/* Car details */}
              <div className="mb-5 flex items-center gap-4 rounded-xl bg-white/[0.03] p-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] font-heading text-lg font-bold text-white/20">
                  {car.brand[0]}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground/50">
                    {car.brand.replace("_", " ")}
                  </p>
                  <p className="font-heading text-base font-semibold">
                    {car.model} ({car.year})
                  </p>
                  <p className="text-xs text-muted-foreground/50">
                    {car.category}
                  </p>
                </div>
              </div>

              {/* Reservation details */}
              <div className="space-y-3">
                {/* Store */}
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 shrink-0 text-[#f79d00]" />
                  <div>
                    <p className="text-muted-foreground/60">Pickup & Return</p>
                    <p className="font-medium">
                      {store
                        ? `${store.location.name}, ${store.location.city}`
                        : "Loading..."}
                    </p>
                  </div>
                </div>

                {/* Pickup */}
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 shrink-0 text-[#64f38c]" />
                  <div>
                    <p className="text-muted-foreground/60">Pickup</p>
                    <p className="font-medium">
                      {pickup.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}{" "}
                      at{" "}
                      {pickup.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                {/* Return */}
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-4 w-4 shrink-0 text-[#f79d00]" />
                  <div>
                    <p className="text-muted-foreground/60">Return</p>
                    <p className="font-medium">
                      {ret.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}{" "}
                      at{" "}
                      {ret.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="mt-5 border-t border-white/[0.06] pt-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground/60">
                    ${car.dailyRate}/day × {days} {days === 1 ? "day" : "days"}
                  </span>
                  <span className="font-heading text-xl font-bold">
                    ${total}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {status === "idle" && (
          <div className="flex gap-3 border-t border-white/[0.06] px-6 py-4">
            <button
              onClick={onClose}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 font-heading text-sm font-semibold transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06]"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={createReserve.isPending}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 font-heading text-sm font-semibold text-[#0c0c14] shadow-lg shadow-[#f79d00]/20 transition-all duration-300",
                createReserve.isPending
                  ? "cursor-not-allowed bg-white/[0.05] text-muted-foreground/40"
                  : "bg-gradient-to-r from-[#f79d00] to-[#64f38c] hover:shadow-xl hover:shadow-[#f79d00]/30 hover:brightness-110",
              )}
            >
              {createReserve.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Confirming...
                </>
              ) : (
                "Confirm Reservation"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
