import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, ArrowLeft, Calendar, Clock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StoreResponse } from "@/features/stores/types";
import { StoreAutocomplete } from "./StoreAutocomplete";

const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00",
];

const bookingFormSchema = z
  .object({
    store: z
      .object({
        id: z.string().min(1),
        location: z.object({ name: z.string(), city: z.string() }),
      })
      .nullable()
      .refine((val) => val !== null, "Please select a store"),
    pickupDate: z.string().min(1, "Pickup date is required"),
    pickupTime: z.string().min(1, "Pickup time is required"),
    returnDate: z.string().min(1, "Return date is required"),
    returnTime: z.string().min(1, "Return time is required"),
  })
  .refine(
    (data) => {
      if (!data.pickupDate || !data.pickupTime || !data.returnDate || !data.returnTime) return true;
      const pickup = new Date(`${data.pickupDate}T${data.pickupTime}`);
      const ret = new Date(`${data.returnDate}T${data.returnTime}`);
      return ret > pickup;
    },
    {
      message: "Return date/time must be after pickup date/time",
      path: ["returnDate"],
    },
  );

type BookingFormInput = z.input<typeof bookingFormSchema>;
type BookingFormValues = z.output<typeof bookingFormSchema>;

export function SearchBookingForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);

  const form = useForm<BookingFormInput, unknown, BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      store: undefined,
      pickupDate: "",
      pickupTime: "",
      returnDate: "",
      returnTime: "",
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const selectedStore = watch("store");

  function onSubmit(data: BookingFormValues) {
    const store = data.store!;
    const pickupISO = `${data.pickupDate}T${data.pickupTime}:00`;
    const returnISO = `${data.returnDate}T${data.returnTime}:00`;

    navigate(
      `/available-cars?storeId=${encodeURIComponent(store.id)}&pickup=${encodeURIComponent(pickupISO)}&return=${encodeURIComponent(returnISO)}`,
    );
  }

  function handleNext() {
    if (!selectedStore) {
      setValue("store", null, { shouldValidate: true });
      return;
    }
    setStep(2);
  }

  return (
    <div className="glass hover-glow rounded-2xl p-2 shadow-2xl shadow-black/20">
      {/* Step indicator */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-1">
        <div
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-colors",
            step === 1
              ? "bg-[#f79d00] text-[#0c0c14]"
              : "bg-white/[0.06] text-muted-foreground/60",
          )}
        >
          1
        </div>
        <div
          className={cn(
            "h-px flex-1 transition-colors",
            step === 2 ? "bg-[#f79d00]/40" : "bg-white/[0.06]",
          )}
        />
        <div
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-colors",
            step === 2
              ? "bg-[#f79d00] text-[#0c0c14]"
              : "bg-white/[0.06] text-muted-foreground/60",
          )}
        >
          2
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {step === 1 && (
          <div className="space-y-2 p-2">
            <div className="rounded-xl bg-white/[0.02] px-4 py-2">
              <p className="text-xs font-medium text-muted-foreground/60">
                Pickup Location
              </p>
            </div>
            <StoreAutocomplete
              value={selectedStore}
              onChange={(store) =>
                setValue("store", store as StoreResponse | null, {
                  shouldValidate: true,
                })
              }
              error={errors.store?.message}
            />
            <button
              type="button"
              onClick={handleNext}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#f79d00] to-[#64f38c] px-6 py-3.5 font-heading text-sm font-semibold text-[#0c0c14] shadow-lg shadow-[#f79d00]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#f79d00]/30 hover:brightness-110"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-2 p-2">
            {/* Selected store summary */}
            {selectedStore && (
              <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-4 py-3">
                <MapPin className="h-4 w-4 shrink-0 text-[#f79d00]" />
                <div>
                  <p className="text-sm font-medium">
                    {selectedStore.location.name}
                  </p>
                  <p className="text-xs text-muted-foreground/60">
                    {selectedStore.location.city}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {/* Pickup date + time */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 rounded-xl bg-white/[0.03] px-4 py-2">
                  <Calendar className="h-3.5 w-3.5 text-[#64f38c]" />
                  <p className="text-xs font-medium text-muted-foreground/60">
                    Pickup
                  </p>
                </div>
                <div className="flex gap-2">
                  <div className="flex flex-1 items-center gap-2 rounded-xl bg-white/[0.03] px-3 py-3 transition-colors focus-within:bg-white/[0.06] focus-within:ring-1 focus-within:ring-[#f79d00]/30">
                    <input
                      type="date"
                      {...register("pickupDate")}
                      className="w-full bg-transparent text-sm text-foreground focus:outline-none [&::-webkit-calendar-picker-indicator]:invert"
                    />
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-white/[0.03] px-3 py-3 transition-colors focus-within:bg-white/[0.06] focus-within:ring-1 focus-within:ring-[#f79d00]/30">
                    <Clock className="h-3.5 w-3.5 shrink-0 text-[#64f38c]" />
                    <select
                      {...register("pickupTime")}
                      className="w-full appearance-none bg-transparent text-sm text-foreground focus:outline-none"
                    >
                      <option value="" className="bg-[#14141f]">
                        Time
                      </option>
                      {TIME_SLOTS.map((t) => (
                        <option key={t} value={t} className="bg-[#14141f]">
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {(errors.pickupDate || errors.pickupTime) && (
                  <p className="text-xs text-red-400">
                    {errors.pickupDate?.message || errors.pickupTime?.message}
                  </p>
                )}
              </div>

              {/* Return date + time */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 rounded-xl bg-white/[0.03] px-4 py-2">
                  <Calendar className="h-3.5 w-3.5 text-[#f79d00]" />
                  <p className="text-xs font-medium text-muted-foreground/60">
                    Return
                  </p>
                </div>
                <div className="flex gap-2">
                  <div className="flex flex-1 items-center gap-2 rounded-xl bg-white/[0.03] px-3 py-3 transition-colors focus-within:bg-white/[0.06] focus-within:ring-1 focus-within:ring-[#f79d00]/30">
                    <input
                      type="date"
                      {...register("returnDate")}
                      className="w-full bg-transparent text-sm text-foreground focus:outline-none [&::-webkit-calendar-picker-indicator]:invert"
                    />
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-white/[0.03] px-3 py-3 transition-colors focus-within:bg-white/[0.06] focus-within:ring-1 focus-within:ring-[#f79d00]/30">
                    <Clock className="h-3.5 w-3.5 shrink-0 text-[#f79d00]" />
                    <select
                      {...register("returnTime")}
                      className="w-full appearance-none bg-transparent text-sm text-foreground focus:outline-none"
                    >
                      <option value="" className="bg-[#14141f]">
                        Time
                      </option>
                      {TIME_SLOTS.map((t) => (
                        <option key={t} value={t} className="bg-[#14141f]">
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {(errors.returnDate || errors.returnTime) && (
                  <p className="text-xs text-red-400">
                    {errors.returnDate?.message || errors.returnTime?.message}
                  </p>
                )}
              </div>
            </div>

            {errors.root && (
              <p className="text-center text-xs text-red-400">
                {errors.root.message}
              </p>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3.5 font-heading text-sm font-semibold transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                type="submit"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#f79d00] to-[#64f38c] px-6 py-3.5 font-heading text-sm font-semibold text-[#0c0c14] shadow-lg shadow-[#f79d00]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#f79d00]/30 hover:brightness-110"
              >
                Search Cars
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
