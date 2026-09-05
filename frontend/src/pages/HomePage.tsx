import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  Shield,
  Zap,
  Globe,
  Wrench,
  Users,
  Settings2,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchBookingForm } from "@/features/home/components/SearchBookingForm";

/* ------------------------------------------------------------------ */
/*  Scroll-reveal hook                                                 */
/* ------------------------------------------------------------------ */
function useReveal(threshold = 0.15) {
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
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */
const benefits = [
  {
    icon: Shield,
    title: "Flexible Rentals",
    description: "Choose the rental period that works for you — hours, days, or weeks.",
  },
  {
    icon: Globe,
    title: "Multiple Locations",
    description: "Pick up your car from convenient Carnode stores across the city.",
  },
  {
    icon: Zap,
    title: "Easy Booking",
    description: "Reserve your car through a seamless, frictionless process.",
  },
  {
    icon: Wrench,
    title: "Reliable Fleet",
    description: "Access a maintained and reliable fleet, always ready for the road.",
  },
] as const;

const carGroups = [
  {
    name: "Economy",
    tagline: "Smart & efficient",
    seats: 5,
    transmission: "Automatic",
    price: "29",
    accent: "from-emerald-500/20 to-teal-600/20",
    badge: "bg-emerald-500/15 text-emerald-400",
  },
  {
    name: "SUV",
    tagline: "Adventure ready",
    seats: 7,
    transmission: "Automatic",
    price: "55",
    accent: "from-amber-500/20 to-orange-600/20",
    badge: "bg-amber-500/15 text-amber-400",
  },
  {
    name: "Luxury",
    tagline: "Travel in style",
    seats: 5,
    transmission: "Automatic",
    price: "89",
    accent: "from-purple-500/20 to-fuchsia-600/20",
    badge: "bg-purple-500/15 text-purple-400",
  },
  {
    name: "Compact",
    tagline: "City explorer",
    seats: 5,
    transmission: "Manual",
    price: "24",
    accent: "from-sky-500/20 to-blue-600/20",
    badge: "bg-sky-500/15 text-sky-400",
  },
] as const;

/* ------------------------------------------------------------------ */
/*  HomePage                                                           */
/* ------------------------------------------------------------------ */
export function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { ref: benefitsRef, visible: benefitsVisible } = useReveal();
  const { ref: carsRef, visible: carsVisible } = useReveal();
  const { ref: ctaRef, visible: ctaVisible } = useReveal();

  /* Track mouse for glow effect */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      document.documentElement.style.setProperty(
        "--mouse-x",
        `${e.clientX}px`,
      );
      document.documentElement.style.setProperty(
        "--mouse-y",
        `${e.clientY}px`,
      );
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return (
    <div className="flex flex-col">
      {/* ============================================================ */}
      {/*  HERO                                                        */}
      {/* ============================================================ */}
      <section
        ref={heroRef}
        className="grain relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-6 pt-24 pb-20"
      >
        {/* Decorative orbs */}
        <div className="pointer-events-none absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-[#f79d00]/5 blur-[120px]" />
        <div className="pointer-events-none absolute right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full bg-[#64f38c]/4 blur-[100px]" />

        {/* Diagonal accent line */}
        <div className="pointer-events-none absolute top-0 right-0 h-full w-px rotate-12 bg-gradient-to-b from-transparent via-[#f79d00]/10 to-transparent" />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <p className="reveal font-heading mb-6 text-sm font-semibold uppercase tracking-[0.3em] text-[#f79d00]/80">
            Premium Car Rental
          </p>

          <h1 className="reveal reveal-delay-1 font-heading text-5xl leading-[1.05] font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
            Drive the
            <br />
            <span className="text-gradient">moment.</span>
          </h1>

          <p className="reveal reveal-delay-2 mx-auto mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Rent the perfect car for any occasion. Choose your location, pick a
            date, and get on the road in minutes.
          </p>
        </div>

        {/* ---- Search Panel ---- */}
        <div className="reveal reveal-delay-3 relative z-10 mt-14 w-full max-w-3xl">
          <SearchBookingForm />
        </div>
      </section>

      {/* ============================================================ */}
      {/*  BENEFITS                                                     */}
      {/* ============================================================ */}
      <section ref={benefitsRef} className="relative px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div
            className={cn(
              "transition-all duration-700",
              benefitsVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0",
            )}
          >
            <p className="font-heading mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-[#f79d00]/70">
              Why Carnode
            </p>
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Built for the road.
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b, i) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.title}
                  className={cn(
                    "glass-light hover-glow group rounded-2xl p-7 transition-all duration-500 hover:border-white/10",
                    benefitsVisible
                      ? "translate-y-0 opacity-100"
                      : "translate-y-8 opacity-0",
                  )}
                  style={{
                    transitionDelay: benefitsVisible ? `${150 + i * 100}ms` : "0ms",
                  }}
                >
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#f79d00]/15 to-[#64f38c]/10">
                    <Icon className="h-5 w-5 text-[#f79d00]" />
                  </div>
                  <h3 className="font-heading text-base font-semibold">
                    {b.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                    {b.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Accent line */}
      <div className="accent-line mx-auto w-full max-w-5xl" />

      {/* ============================================================ */}
      {/*  MEET OUR CARS                                                */}
      {/* ============================================================ */}
      <section ref={carsRef} className="relative px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div
            className={cn(
              "transition-all duration-700",
              carsVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0",
            )}
          >
            <p className="font-heading mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-[#64f38c]/70">
              Our Fleet
            </p>
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Meet our cars.
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {carGroups.map((car, i) => (
              <Link
                key={car.name}
                to="/cars"
                className={cn(
                  "group glass-light hover-glow relative flex flex-col overflow-hidden rounded-2xl transition-all duration-500 hover:-translate-y-1 hover:border-white/10 hover:shadow-2xl hover:shadow-black/30",
                  carsVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-8 opacity-0",
                )}
                style={{
                  transitionDelay: carsVisible ? `${150 + i * 100}ms` : "0ms",
                }}
              >
                {/* Card visual area */}
                <div
                  className={cn(
                    "relative flex h-48 items-end bg-gradient-to-br p-5",
                    car.accent,
                  )}
                >
                  {/* Decorative geometric shapes */}
                  <div className="absolute top-4 right-4 h-16 w-16 rounded-full border border-white/[0.06]" />
                  <div className="absolute top-8 right-8 h-8 w-8 rounded-full border border-white/[0.04]" />

                  {/* Category badge */}
                  <span
                    className={cn(
                      "relative z-10 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm",
                      car.badge,
                    )}
                  >
                    {car.name}
                  </span>
                </div>

                {/* Card content */}
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-xs text-muted-foreground/60">
                    {car.tagline}
                  </p>

                  <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {car.seats}
                    </span>
                    <span className="flex items-center gap-1">
                      <Settings2 className="h-3.5 w-3.5" />
                      {car.transmission}
                    </span>
                  </div>

                  <div className="mt-auto flex items-end justify-between pt-5">
                    <div>
                      <span className="text-xs text-muted-foreground/50">
                        from
                      </span>
                      <p className="font-heading text-2xl font-bold">
                        ${car.price}
                        <span className="text-xs font-normal text-muted-foreground/50">
                          {" "}
                          /day
                        </span>
                      </p>
                    </div>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-muted-foreground transition-all duration-300 group-hover:border-[#f79d00]/40 group-hover:text-[#f79d00]">
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div
            className={cn(
              "mt-12 text-center transition-all duration-700",
              carsVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0",
            )}
            style={{ transitionDelay: carsVisible ? "600ms" : "0ms" }}
          >
            <Link
              to="/cars"
              className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-6 py-3 font-heading text-sm font-semibold transition-all duration-300 hover:border-[#f79d00]/30 hover:bg-[#f79d00]/5 hover:text-[#f79d00]"
            >
              View All Car Groups
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  CTA                                                          */}
      {/* ============================================================ */}
      <section ref={ctaRef} className="relative px-6 py-24">
        <div
          className={cn(
            "glass mx-auto max-w-5xl overflow-hidden rounded-3xl p-12 text-center sm:p-16 transition-all duration-700",
            ctaVisible
              ? "translate-y-0 opacity-100 scale-100"
              : "translate-y-8 opacity-0 scale-95",
          )}
        >
          {/* Background glow */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
            <div className="absolute -top-20 left-1/2 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-[#f79d00]/5 blur-[80px]" />
          </div>

          <div className="relative z-10">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f79d00]/20 to-[#64f38c]/10">
              <Star className="h-6 w-6 text-[#f79d00]" />
            </div>

            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to hit the road?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              Start your journey with Carnode. Find the perfect car for your next
              adventure.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/cars"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#f79d00] to-[#64f38c] px-7 py-3.5 font-heading text-sm font-semibold text-[#0c0c14] shadow-lg shadow-[#f79d00]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#f79d00]/30 hover:brightness-110"
              >
                Browse Cars
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/stores"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-7 py-3.5 font-heading text-sm font-semibold transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06]"
              >
                Find a Store
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
