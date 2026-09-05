import { useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router";
import { Loader2, Car, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAvailableCars } from "@/features/reserves/hooks/reservesHooks";
import { CAR_CATEGORIES } from "@/features/cars/schemas/carsSchema";
import { CarCard } from "@/features/cars/components/CarCard";
import { BookingConfirmationModal } from "@/features/reserves/components/BookingConfirmationModal";
import type { CarUserResponse } from "@/features/cars/types";

const categoryConfig: Record<
  string,
  { tagline: string; accent: string; badge: string }
> = {
  ECONOMY: {
    tagline: "Smart & efficient",
    accent: "from-emerald-500/40 to-teal-600/40",
    badge: "bg-emerald-500/15 text-emerald-400",
  },
  COMPACT: {
    tagline: "City explorer",
    accent: "from-sky-500/40 to-blue-600/40",
    badge: "bg-sky-500/15 text-sky-400",
  },
  SUV: {
    tagline: "Adventure ready",
    accent: "from-amber-500/40 to-orange-600/40",
    badge: "bg-amber-500/15 text-amber-400",
  },
  LUXURY: {
    tagline: "Travel in style",
    accent: "from-purple-500/40 to-fuchsia-600/40",
    badge: "bg-purple-500/15 text-purple-400",
  },
  PICKUP: {
    tagline: "Built for work",
    accent: "from-rose-500/40 to-red-600/40",
    badge: "bg-rose-500/15 text-rose-400",
  },
  VAN: {
    tagline: "Space for everyone",
    accent: "from-cyan-500/40 to-teal-600/40",
    badge: "bg-cyan-500/15 text-cyan-400",
  },
};

export function AvailableCarsPage() {
  const [searchParams] = useSearchParams();
  const storeId = searchParams.get("storeId");
  const pickup = searchParams.get("pickup");
  const returnDate = searchParams.get("return");

  const [selectedCar, setSelectedCar] = useState<CarUserResponse | null>(null);

  const params =
    pickup && returnDate
      ? { pickupDate: pickup, returnDate: returnDate }
      : null;

  const { data: cars, isLoading, error } = useAvailableCars(params);

  const groupedCars = useMemo(() => {
    if (!cars) return {};
    const groups: Record<string, CarUserResponse[]> = {};
    for (const category of CAR_CATEGORIES) {
      groups[category] = [];
    }
    for (const car of cars) {
      const category = car.category.toUpperCase();
      if (groups[category]) {
        groups[category].push(car);
      }
    }
    return groups;
  }, [cars]);

  const hasCars = cars && cars.length > 0;

  const pickupDate = pickup ? new Date(pickup) : null;
  const returnDateObj = returnDate ? new Date(returnDate) : null;

  return (
    <div className="app-page grain relative">
      {/* Decorative orbs */}
      <div className="pointer-events-none absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-[#f79d00]/5 blur-[120px]" />
      <div className="pointer-events-none absolute right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full bg-[#64f38c]/4 blur-[100px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-28 pb-24">
        {/* Back link */}
        <Link
          to="/"
          className="reveal mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground/60 transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to search
        </Link>

        {/* Page header */}
        <div className="reveal mb-12">
          <p className="font-heading mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-[#f79d00]/70">
            Available Cars
          </p>
          <h1 className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">
            Find your <span className="text-gradient">perfect ride.</span>
          </h1>

          {/* Search summary */}
          {pickupDate && returnDateObj && (
            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground/60">
              <span>
                {pickupDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}{" "}
                –{" "}
                {returnDateObj.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
              {cars && (
                <span className="text-[#64f38c]/70">
                  {cars.length} {cars.length === 1 ? "car" : "cars"} available
                </span>
              )}
            </div>
          )}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="mb-4 h-8 w-8 animate-spin text-[#f79d00]" />
            <p className="text-sm text-muted-foreground/60">
              Finding available cars...
            </p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10">
              <Car className="h-6 w-6 text-red-400" />
            </div>
            <h3 className="font-heading text-lg font-semibold">
              Something went wrong
            </h3>
            <p className="mt-2 text-sm text-muted-foreground/60">
              Unable to load available cars. Please try again.
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white/[0.05] px-5 py-2.5 text-sm font-medium transition-colors hover:bg-white/[0.08]"
            >
              <ArrowLeft className="h-4 w-4" />
              Go back
            </Link>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && !hasCars && (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f79d00]/10">
              <Car className="h-6 w-6 text-[#f79d00]" />
            </div>
            <h3 className="font-heading text-lg font-semibold">
              No cars available
            </h3>
            <p className="mt-2 text-sm text-muted-foreground/60">
              No cars are available for the selected dates. Try different dates.
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white/[0.05] px-5 py-2.5 text-sm font-medium transition-colors hover:bg-white/[0.08]"
            >
              <ArrowLeft className="h-4 w-4" />
              Modify search
            </Link>
          </div>
        )}

        {/* Category sections */}
        {!isLoading && !error && hasCars && (
          <div className="space-y-20">
            {CAR_CATEGORIES.map((category) => {
              const categoryCars = groupedCars[category] ?? [];
              const config = categoryConfig[category];
              if (categoryCars.length === 0) return null;
              return (
                <section key={category} className="relative">
                  <div className="mb-8 flex items-end justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "rounded-full px-3 py-1 text-xs font-semibold",
                            config.badge,
                          )}
                        >
                          {category.charAt(0) + category.slice(1).toLowerCase()}
                        </span>
                        <span className="text-xs text-muted-foreground/40">
                          {categoryCars.length}{" "}
                          {categoryCars.length === 1 ? "car" : "cars"}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground/60">
                        {config.tagline}
                      </p>
                    </div>
                  </div>

                  <div
                    className={cn(
                      "mb-8 h-px bg-gradient-to-r to-transparent",
                      config.accent,
                      "opacity-30",
                    )}
                  />

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {categoryCars.map((car, i) => (
                      <div key={car.id} onClick={() => setSelectedCar(car)}>
                        <CarCard car={car} index={i} visible={true} />
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {selectedCar && storeId && pickup && returnDate && (
        <BookingConfirmationModal
          car={selectedCar}
          storeId={storeId}
          pickupDate={pickup}
          returnDate={returnDate}
          onClose={() => setSelectedCar(null)}
        />
      )}
    </div>
  );
}
