import { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import {
  useAdminCar,
  useCreateCar,
  useUpdateCar,
} from "@/features/cars/hooks/carsAdminHooks";
import { CAR_BRANDS, CAR_CATEGORIES } from "@/features/cars/schemas/carsSchema";
import type { CarBrand, CarCategory } from "@/features/cars/types";
import { AdminPageHeader } from "../../components/AdminPageHeader";
import {
  adminCarFormSchema,
  type AdminCarFormValues,
} from "../../schemas/adminCarFormSchema";

export function AdminCarFormPage() {
  const { carId } = useParams<{ carId: string }>();
  const navigate = useNavigate();
  const isEditMode = !!carId;

  const carQuery = useAdminCar(carId ?? "");
  const createCar = useCreateCar();
  const updateCar = useUpdateCar();

  const form = useForm<AdminCarFormValues>({
    resolver: zodResolver(adminCarFormSchema),
    defaultValues: {
      brand: undefined,
      model: "",
      year: new Date().getFullYear(),
      category: undefined,
      plate: "",
      dailyRate: "",
    },
  });

  useEffect(() => {
    if (isEditMode && carQuery.data) {
      const car = carQuery.data;
      form.reset({
        brand: car.brand as CarBrand,
        model: car.model,
        year: car.year,
        category: car.category as CarCategory,
        plate: car.plate,
        dailyRate: car.dailyRate,
      });
    }
  }, [isEditMode, carQuery.data, form]);

  function onSubmit(values: AdminCarFormValues) {
    if (isEditMode && carId) {
      updateCar.mutate(
        { id: carId, data: values },
        {
          onSuccess: () => {
            navigate(`/admin/cars/${carId}`);
          },
        },
      );
    } else {
      createCar.mutate(values, {
        onSuccess: (data) => {
          navigate(data ? `/admin/cars/${data.id}` : "/admin/cars");
        },
      });
    }
  }

  const isSubmitting = createCar.isPending || updateCar.isPending;

  return (
    <div>
      <Link
        to="/admin/cars"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Cars
      </Link>

      <AdminPageHeader
        title={isEditMode ? "Edit Car" : "Register Car"}
        subtitle={isEditMode ? "Update car details" : "Add a new car to the fleet"}
      />

      <div className="glass-light max-w-2xl rounded-2xl p-8">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Brand */}
          <div>
            <label className="text-xs font-medium text-muted-foreground/70">
              Brand
            </label>
            <select
              {...form.register("brand")}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#f79d00]/30 focus:border-[#f79d00]/50 transition-colors"
            >
              <option value="">Select brand</option>
              {CAR_BRANDS.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
            {form.formState.errors.brand && (
              <p className="mt-1 text-xs text-red-400">
                {form.formState.errors.brand.message}
              </p>
            )}
          </div>

          {/* Model */}
          <div>
            <label className="text-xs font-medium text-muted-foreground/70">
              Model
            </label>
            <input
              type="text"
              {...form.register("model")}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#f79d00]/30 focus:border-[#f79d00]/50 transition-colors"
              placeholder="e.g. Corolla"
            />
            {form.formState.errors.model && (
              <p className="mt-1 text-xs text-red-400">
                {form.formState.errors.model.message}
              </p>
            )}
          </div>

          {/* Year */}
          <div>
            <label className="text-xs font-medium text-muted-foreground/70">
              Year
            </label>
            <input
              type="number"
              {...form.register("year")}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#f79d00]/30 focus:border-[#f79d00]/50 transition-colors"
              placeholder="e.g. 2024"
            />
            {form.formState.errors.year && (
              <p className="mt-1 text-xs text-red-400">
                {form.formState.errors.year.message}
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-medium text-muted-foreground/70">
              Category
            </label>
            <select
              {...form.register("category")}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#f79d00]/30 focus:border-[#f79d00]/50 transition-colors"
            >
              <option value="">Select category</option>
              {CAR_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {form.formState.errors.category && (
              <p className="mt-1 text-xs text-red-400">
                {form.formState.errors.category.message}
              </p>
            )}
          </div>

          {/* Plate */}
          <div>
            <label className="text-xs font-medium text-muted-foreground/70">
              Plate
            </label>
            <input
              type="text"
              {...form.register("plate")}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 font-mono text-sm text-foreground uppercase focus:outline-none focus:ring-2 focus:ring-[#f79d00]/30 focus:border-[#f79d00]/50 transition-colors"
              placeholder="e.g. ABC1234"
              maxLength={8}
            />
            {form.formState.errors.plate && (
              <p className="mt-1 text-xs text-red-400">
                {form.formState.errors.plate.message}
              </p>
            )}
          </div>

          {/* Daily Rate */}
          <div>
            <label className="text-xs font-medium text-muted-foreground/70">
              Daily Rate
            </label>
            <input
              type="text"
              {...form.register("dailyRate")}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#f79d00]/30 focus:border-[#f79d00]/50 transition-colors"
              placeholder="e.g. 45.00"
            />
            {form.formState.errors.dailyRate && (
              <p className="mt-1 text-xs text-red-400">
                {form.formState.errors.dailyRate.message}
              </p>
            )}
          </div>

          {/* Error message */}
          {(createCar.isError || updateCar.isError) && (
            <p className="text-sm text-red-400">
              Failed to {isEditMode ? "update" : "create"} car. Please try again.
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#f79d00] to-[#64f38c] px-6 py-3.5 font-heading text-sm font-semibold text-[#0c0c14] shadow-lg shadow-[#f79d00]/20 transition-all hover:shadow-xl hover:shadow-[#f79d00]/30 hover:brightness-110 disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEditMode ? "Update Car" : "Register Car"}
          </button>
        </form>
      </div>
    </div>
  );
}
