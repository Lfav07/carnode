import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAdminCreateReserve } from "@/features/reserves/hooks/reservesAdminHooks";
import { AdminPageHeader } from "../../components/AdminPageHeader";
import {
  adminReserveFormSchema,
  type AdminReserveFormValues,
} from "../../schemas/adminReserveFormSchema";

export function AdminReserveFormPage() {
  const navigate = useNavigate();
  const createReserve = useAdminCreateReserve();

  const form = useForm<AdminReserveFormValues>({
    resolver: zodResolver(adminReserveFormSchema),
    defaultValues: {
      userId: "",
      carId: "",
      pickupDate: "",
      pickupStoreId: "",
      returnDate: "",
      returnStoreId: "",
    },
  });

  function onSubmit(values: AdminReserveFormValues) {
    createReserve.mutate(
      {
        userId: values.userId,
        carId: values.carId,
        pickup: {
          date: new Date(values.pickupDate).toISOString(),
          storeId: values.pickupStoreId,
        },
        returnInfo: {
          date: new Date(values.returnDate).toISOString(),
          storeId: values.returnStoreId,
        },
      },
      {
        onSuccess: (data) => {
          navigate(data ? `/admin/reserves/${data.id}` : "/admin/reserves");
        },
      },
    );
  }

  return (
    <div>
      <Link
        to="/admin/reserves"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Reservations
      </Link>

      <AdminPageHeader
        title="Create Reservation"
        subtitle="Book a car for a user"
      />

      <div className="glass-light max-w-2xl rounded-2xl p-8">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* User ID */}
          <div>
            <label className="text-xs font-medium text-muted-foreground/70">
              User ID
            </label>
            <input
              type="text"
              {...form.register("userId")}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#f79d00]/30 focus:border-[#f79d00]/50 transition-colors"
              placeholder="Enter user ID"
            />
            {form.formState.errors.userId && (
              <p className="mt-1 text-xs text-red-400">
                {form.formState.errors.userId.message}
              </p>
            )}
          </div>

          {/* Car ID */}
          <div>
            <label className="text-xs font-medium text-muted-foreground/70">
              Car ID
            </label>
            <input
              type="text"
              {...form.register("carId")}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#f79d00]/30 focus:border-[#f79d00]/50 transition-colors"
              placeholder="Enter car ID"
            />
            {form.formState.errors.carId && (
              <p className="mt-1 text-xs text-red-400">
                {form.formState.errors.carId.message}
              </p>
            )}
          </div>

          {/* Pickup Date */}
          <div>
            <label className="text-xs font-medium text-muted-foreground/70">
              Pickup Date
            </label>
            <input
              type="datetime-local"
              {...form.register("pickupDate")}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#f79d00]/30 focus:border-[#f79d00]/50 transition-colors"
            />
            {form.formState.errors.pickupDate && (
              <p className="mt-1 text-xs text-red-400">
                {form.formState.errors.pickupDate.message}
              </p>
            )}
          </div>

          {/* Pickup Store ID */}
          <div>
            <label className="text-xs font-medium text-muted-foreground/70">
              Pickup Store ID
            </label>
            <input
              type="text"
              {...form.register("pickupStoreId")}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#f79d00]/30 focus:border-[#f79d00]/50 transition-colors"
              placeholder="Enter pickup store ID"
            />
            {form.formState.errors.pickupStoreId && (
              <p className="mt-1 text-xs text-red-400">
                {form.formState.errors.pickupStoreId.message}
              </p>
            )}
          </div>

          {/* Return Date */}
          <div>
            <label className="text-xs font-medium text-muted-foreground/70">
              Return Date
            </label>
            <input
              type="datetime-local"
              {...form.register("returnDate")}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#f79d00]/30 focus:border-[#f79d00]/50 transition-colors"
            />
            {form.formState.errors.returnDate && (
              <p className="mt-1 text-xs text-red-400">
                {form.formState.errors.returnDate.message}
              </p>
            )}
          </div>

          {/* Return Store ID */}
          <div>
            <label className="text-xs font-medium text-muted-foreground/70">
              Return Store ID
            </label>
            <input
              type="text"
              {...form.register("returnStoreId")}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#f79d00]/30 focus:border-[#f79d00]/50 transition-colors"
              placeholder="Enter return store ID"
            />
            {form.formState.errors.returnStoreId && (
              <p className="mt-1 text-xs text-red-400">
                {form.formState.errors.returnStoreId.message}
              </p>
            )}
          </div>

          {/* Error message */}
          {createReserve.isError && (
            <p className="text-sm text-red-400">
              Failed to create reservation. Please try again.
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={createReserve.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#f79d00] to-[#64f38c] px-6 py-3.5 font-heading text-sm font-semibold text-[#0c0c14] shadow-lg shadow-[#f79d00]/20 transition-all hover:shadow-xl hover:shadow-[#f79d00]/30 hover:brightness-110 disabled:opacity-50"
          >
            {createReserve.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Create Reservation
          </button>
        </form>
      </div>
    </div>
  );
}
