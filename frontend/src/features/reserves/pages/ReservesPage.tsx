import { useState } from "react";
import { Loader2, CalendarDays, AlertTriangle } from "lucide-react";
import { useReserves, useCancelReserve } from "../hooks/reservesHooks";
import { ReservationCard } from "../components/ReservationCard";

export function ReservesPage() {
  const { data, isLoading, error } = useReserves();
  const cancelReserve = useCancelReserve();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const reservations = data ?? [];
  const hasReservations = reservations.length > 0;

  function handleCancel(id: string) {
    setCancellingId(id);
    cancelReserve.mutate(id, {
      onSettled: () => {
        setCancellingId(null);
      },
    });
  }

  return (
    <div className="app-page grain relative">
      {/* Decorative orbs */}
      <div className="pointer-events-none absolute top-20 left-1/3 h-[400px] w-[400px] rounded-full bg-[#f79d00]/4 blur-[120px]" />
      <div className="pointer-events-none absolute right-1/4 bottom-40 h-[300px] w-[300px] rounded-full bg-[#64f38c]/3 blur-[100px]" />

      {/* Diagonal accent line */}
      <div className="pointer-events-none absolute top-0 right-0 h-full w-px rotate-12 bg-gradient-to-b from-transparent via-[#f79d00]/8 to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-28 pb-24">
        {/* Page header */}
        <div className="reveal mb-16">
          <p className="font-heading mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-[#f79d00]/70">
            Your Bookings
          </p>
          <h1 className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">
            My{" "}
            <span className="text-gradient">reservations.</span>
          </h1>
          <p className="mt-5 max-w-lg text-muted-foreground">
            View and manage all your car reservations in one place. Track
            upcoming trips and review past bookings.
          </p>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative">
              <Loader2 className="h-10 w-10 animate-spin text-[#f79d00]" />
              <div className="absolute inset-0 animate-ping rounded-full bg-[#f79d00]/10" />
            </div>
            <p className="mt-6 font-heading text-sm font-medium text-muted-foreground">
              Loading your reservations...
            </p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="glass mx-auto max-w-md rounded-2xl p-10 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <h3 className="font-heading text-lg font-semibold">
              Unable to load reservations
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Something went wrong while fetching your bookings. Please try
              again later.
            </p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && !hasReservations && (
          <div className="glass mx-auto max-w-md rounded-2xl p-10 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f79d00]/10">
              <CalendarDays className="h-6 w-6 text-[#f79d00]" />
            </div>
            <h3 className="font-heading text-lg font-semibold">
              No reservations yet
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              You haven&apos;t made any reservations. Browse our fleet and book
              your first ride!
            </p>
          </div>
        )}

        {/* Reservations grid */}
        {!isLoading && !error && hasReservations && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {reservations.map((reservation, i) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                index={i}
                visible
                onCancel={handleCancel}
                isCancelling={cancellingId === reservation.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
