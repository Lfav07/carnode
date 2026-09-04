import { MapPin, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StoreResponse } from "../types";

interface StoreCardProps {
  store: StoreResponse;
  index: number;
  visible: boolean;
}

export function StoreCard({ store, index, visible }: StoreCardProps) {
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
      {/* Card visual area */}
      <div className="relative flex h-36 items-center justify-center bg-gradient-to-br from-[#f79d00]/8 to-[#64f38c]/4">
        {/* Decorative geometric shapes */}
        <div className="absolute top-4 right-4 h-12 w-12 rounded-full border border-white/[0.04]" />
        <div className="absolute top-6 right-6 h-6 w-6 rounded-full border border-white/[0.03]" />

        {/* Location icon */}
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f79d00]/15 to-[#64f38c]/10 transition-all duration-300 group-hover:from-[#f79d00]/20 group-hover:to-[#64f38c]/15">
          <MapPin className="h-6 w-6 text-[#f79d00]" />
        </div>
      </div>

      {/* Card content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-heading text-lg font-semibold">
          {store.location.name}
        </h3>

        <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-[#64f38c]" />
          <span>{store.location.city}</span>
        </div>

        <div className="mt-auto flex items-center justify-between pt-5">
          <span className="text-xs text-muted-foreground/40">
            Store location
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-muted-foreground transition-all duration-300 group-hover:border-[#f79d00]/40 group-hover:text-[#f79d00]">
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
}
