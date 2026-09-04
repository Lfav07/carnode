import { Car, Fuel, Calendar } from "lucide-react";
import type { CarUserResponse } from "../types";
import { cn } from "@/lib/utils";

interface CarCardProps {
  car: CarUserResponse;
  index: number;
  visible: boolean;
}

const brandLogos: Record<string, string> = {
  TOYOTA: "T",
  HONDA: "H",
  HYUNDAI: "H",
  CHEVROLET: "C",
  VOLKSWAGEN: "V",
  FORD: "F",
  NISSAN: "N",
  RENAULT: "R",
  FIAT: "F",
  JEEP: "J",
  PEUGEOT: "P",
  CITROEN: "C",
  MITSUBISHI: "M",
  SUBARU: "S",
  KIA: "K",
  SUZUKI: "S",
  MAZDA: "M",
  BMW: "B",
  MERCEDES_BENZ: "MB",
  AUDI: "A",
  VOLVO: "V",
  LEXUS: "L",
  LAND_ROVER: "LR",
  PORSCHE: "P",
  TESLA: "T",
};

export function CarCard({ car, index, visible }: CarCardProps) {
  const isAvailable = car.availability === "available";
  const logo = brandLogos[car.brand] ?? car.brand[0];

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
      <div className="relative flex h-44 items-center justify-center bg-gradient-to-br from-white/[0.02] to-white/[0.005]">
        {/* Decorative geometric shapes */}
        <div className="absolute top-4 right-4 h-14 w-14 rounded-full border border-white/[0.04]" />
        <div className="absolute top-7 right-7 h-7 w-7 rounded-full border border-white/[0.03]" />

        {/* Brand logo placeholder */}
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] font-heading text-2xl font-bold text-white/20 transition-all duration-300 group-hover:from-[#f79d00]/10 group-hover:to-[#64f38c]/5 group-hover:text-[#f79d00]/40">
          {logo}
        </div>

        {/* Availability badge */}
        <span
          className={cn(
            "absolute top-4 left-4 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm",
            isAvailable
              ? "bg-emerald-500/15 text-emerald-400"
              : "bg-red-500/15 text-red-400",
          )}
        >
          {car.availability}
        </span>
      </div>

      {/* Card content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/50">
              {car.brand.replace("_", " ")}
            </p>
            <h3 className="font-heading text-lg font-semibold leading-tight">
              {car.model}
            </h3>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {car.year}
          </span>
          <span className="flex items-center gap-1.5">
            <Fuel className="h-3.5 w-3.5" />
            {car.category}
          </span>
        </div>

        <div className="mt-auto flex items-end justify-between pt-5">
          <div>
            <span className="text-[11px] text-muted-foreground/40">from</span>
            <p className="font-heading text-2xl font-bold">
              ${car.dailyRate}
              <span className="text-xs font-normal text-muted-foreground/50">
                {" "}
                /day
              </span>
            </p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-muted-foreground transition-all duration-300 group-hover:border-[#f79d00]/40 group-hover:bg-[#f79d00]/5 group-hover:text-[#f79d00]">
            <Car className="h-4 w-4" />
          </span>
        </div>
      </div>
    </div>
  );
}
