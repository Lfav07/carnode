import { Loader2, MapPin } from "lucide-react";
import { useStores } from "../hooks/storesHooks";
import { StoreCard } from "../components/StoreCard";

export function StoresPage() {
  const { data, isLoading, error } = useStores();

  const stores = data ?? [];
  const hasStores = stores.length > 0;

  return (
    <div className="app-page grain relative">
      {/* Decorative orbs */}
      <div className="pointer-events-none absolute top-20 right-1/4 h-[400px] w-[400px] rounded-full bg-[#64f38c]/4 blur-[120px]" />
      <div className="pointer-events-none absolute left-1/3 bottom-40 h-[300px] w-[300px] rounded-full bg-[#f79d00]/3 blur-[100px]" />

      {/* Diagonal accent line */}
      <div className="pointer-events-none absolute top-0 left-0 h-full w-px -rotate-12 bg-gradient-to-b from-transparent via-[#64f38c]/8 to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-28 pb-24">
        {/* Page header */}
        <div className="reveal mb-16">
          <p className="font-heading mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-[#64f38c]/70">
            Our Locations
          </p>
          <h1 className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">
            Find a store{" "}
            <span className="text-gradient">near you.</span>
          </h1>
          <p className="mt-5 max-w-lg text-muted-foreground">
            Pick up your car from any of our convenient locations across the
            city. Find the store closest to you.
          </p>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative">
              <Loader2 className="h-10 w-10 animate-spin text-[#64f38c]" />
              <div className="absolute inset-0 animate-ping rounded-full bg-[#64f38c]/10" />
            </div>
            <p className="mt-6 font-heading text-sm font-medium text-muted-foreground">
              Finding stores...
            </p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="glass mx-auto max-w-md rounded-2xl p-10 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10">
              <MapPin className="h-6 w-6 text-red-400" />
            </div>
            <h3 className="font-heading text-lg font-semibold">
              Unable to load stores
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Something went wrong while fetching our locations. Please try
              again later.
            </p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && !hasStores && (
          <div className="glass mx-auto max-w-md rounded-2xl p-10 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#64f38c]/10">
              <MapPin className="h-6 w-6 text-[#64f38c]" />
            </div>
            <h3 className="font-heading text-lg font-semibold">
              No stores available
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              We don&apos;t have any store locations yet. Check back soon!
            </p>
          </div>
        )}

        {/* Store grid */}
        {!isLoading && !error && hasStores && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {stores.map((store, i) => (
              <StoreCard key={store.id} store={store} index={i} visible />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
