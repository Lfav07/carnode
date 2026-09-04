import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { CarUserResponse } from "../types";
import { CarCard } from "./CarCard";

interface CategorySectionProps {
  name: string;
  tagline: string;
  cars: CarUserResponse[];
  accent: string;
  badge: string;
}

export function CategorySection({
  name,
  tagline,
  cars,
  accent,
  badge,
}: CategorySectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  if (cars.length === 0) return null;

  return (
    <section ref={ref} className="relative">
      {/* Section header */}
      <div
        className={cn(
          "mb-8 flex items-end justify-between transition-all duration-700",
          visible
            ? "translate-y-0 opacity-100"
            : "translate-y-6 opacity-0",
        )}
      >
        <div>
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold",
                badge,
              )}
            >
              {name}
            </span>
            <span className="text-xs text-muted-foreground/40">
              {cars.length} {cars.length === 1 ? "car" : "cars"}
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground/60">{tagline}</p>
        </div>
      </div>

      {/* Accent line under header */}
      <div
        className={cn(
          "mb-8 h-px bg-gradient-to-r from-transparent to-transparent transition-all duration-700",
          accent,
          visible ? "opacity-30" : "opacity-0",
        )}
      />

      {/* Car grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cars.map((car, i) => (
          <CarCard key={car.id} car={car} index={i} visible={visible} />
        ))}
      </div>
    </section>
  );
}
