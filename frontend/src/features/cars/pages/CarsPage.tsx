import { useMemo } from "react";
import { Loader2, Car } from "lucide-react";
import { useCars } from "../hooks/carsHooks";
import { CAR_CATEGORIES } from "../schemas/carsSchema";
import { CategorySection } from "../components/CategorySection";

const categoryConfig: Record<
  string,
  { tagline: string; accent: string; badge: string }
> = {
  ECONOMY: {
    tagline: "Smart & efficient",
    accent: "bg-gradient-to-r from-emerald-500/40 to-teal-600/40",
    badge: "bg-emerald-500/15 text-emerald-400",
  },
  COMPACT: {
    tagline: "City explorer",
    accent: "bg-gradient-to-r from-sky-500/40 to-blue-600/40",
    badge: "bg-sky-500/15 text-sky-400",
  },
  SUV: {
    tagline: "Adventure ready",
    accent: "bg-gradient-to-r from-amber-500/40 to-orange-600/40",
    badge: "bg-amber-500/15 text-amber-400",
  },
  LUXURY: {
    tagline: "Travel in style",
    accent: "bg-gradient-to-r from-purple-500/40 to-fuchsia-600/40",
    badge: "bg-purple-500/15 text-purple-400",
  },
  PICKUP: {
    tagline: "Built for work",
    accent: "bg-gradient-to-r from-rose-500/40 to-red-600/40",
    badge: "bg-rose-500/15 text-rose-400",
  },
  VAN: {
    tagline: "Space for everyone",
    accent: "bg-gradient-to-r from-cyan-500/40 to-teal-600/40",
    badge: "bg-cyan-500/15 text-cyan-400",
  },
};

export function CarsPage() {
  const { data, isLoading, error } = useCars({
    page: 1,
    limit: 100,
    sortBy: "createdAt",
    sortOrder: "desc",
    status: "AVAILABLE",
  });

  const groupedCars = useMemo(() => {
    if (!data?.data) return {};

    const groups: Record<string, typeof data.data> = {};

    for (const category of CAR_CATEGORIES) {
      groups[category] = [];
    }

    for (const car of data.data) {
      const category = car.category.toUpperCase();
      if (groups[category]) {
        groups[category].push(car);
      }
    }

    return groups;
  }, [data]);

  const hasCars = Object.values(groupedCars).some((cars) => cars.length > 0);

  return (
    <div className="app-page grain relative">
      {/* Decorative orbs */}
      <div className="pointer-events-none absolute top-20 left-1/4 h-[400px] w-[400px] rounded-full bg-[#f79d00]/4 blur-[120px]" />
      <div className="pointer-events-none absolute right-1/3 bottom-40 h-[300px] w-[300px] rounded-full bg-[#64f38c]/3 blur-[100px]" />

      {/* Diagonal accent line */}
      <div className="pointer-events-none absolute top-0 right-0 h-full w-px rotate-12 bg-gradient-to-b from-transparent via-[#f79d00]/8 to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-28 pb-24">
        {/* Page header */}
        <div className="reveal mb-16">
          <p className="font-heading mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-[#f79d00]/70">
            Our Fleet
          </p>
          <h1 className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">
            Find your{" "}
            <span className="text-gradient">perfect ride.</span>
          </h1>
          <p className="mt-5 max-w-lg text-muted-foreground">
            Browse our complete collection of available vehicles, organized by
            category to help you find exactly what you need.
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
              Loading our fleet...
            </p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="glass mx-auto max-w-md rounded-2xl p-10 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10">
              <Car className="h-6 w-6 text-red-400" />
            </div>
            <h3 className="font-heading text-lg font-semibold">
              Unable to load cars
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Something went wrong while fetching our fleet. Please try again
              later.
            </p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && !hasCars && (
          <div className="glass mx-auto max-w-md rounded-2xl p-10 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f79d00]/10">
              <Car className="h-6 w-6 text-[#f79d00]" />
            </div>
            <h3 className="font-heading text-lg font-semibold">
              No cars available
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              We don&apos;t have any cars available at the moment. Check back
              soon!
            </p>
          </div>
        )}

        {/* Category sections */}
        {!isLoading && !error && hasCars && (
          <div className="space-y-20">
            {CAR_CATEGORIES.map((category) => {
              const cars = groupedCars[category] ?? [];
              const config = categoryConfig[category];

              return (
                <CategorySection
                  key={category}
                  name={category.charAt(0) + category.slice(1).toLowerCase()}
                  tagline={config.tagline}
                  cars={cars}
                  accent={config.accent}
                  badge={config.badge}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
