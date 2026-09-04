import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { ArrowLeft, Loader2, Edit, Trash2, Car } from "lucide-react";
import {
  useAdminCar,
  useUpdateCarStatus,
  useDeleteCar,
} from "@/features/cars/hooks/carsAdminHooks";
import { CAR_STATUSES } from "@/features/cars/schemas/carsSchema";
import { AdminPageHeader } from "../../components/AdminPageHeader";
import { StatusBadge } from "../../components/StatusBadge";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { getCarStatusVariant } from "../../utils/adminStatusUtils";
import type { CarStatus } from "@/features/cars/types";

interface StatusFormValues {
  status: Exclude<CarStatus, "DELETED">;
}

export function AdminCarDetailPage() {
  const { carId } = useParams<{ carId: string }>();
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const carQuery = useAdminCar(carId ?? "");
  const updateStatus = useUpdateCarStatus();
  const deleteCar = useDeleteCar();

  const form = useForm<StatusFormValues>({
    defaultValues: { status: "AVAILABLE" },
  });

  const car = carQuery.data;

  function onUpdateStatus(values: StatusFormValues) {
    if (!carId) return;
    updateStatus.mutate(
      { id: carId, data: { status: values.status } },
      {
        onSuccess: () => {
          carQuery.refetch();
        },
      },
    );
  }

  function handleDelete() {
    if (!carId) return;
    deleteCar.mutate(carId, {
      onSuccess: () => {
        navigate("/admin/cars");
      },
    });
  }

  if (carQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-[#f79d00]" />
      </div>
    );
  }

  if (carQuery.error || !car) {
    return (
      <div className="glass mx-auto max-w-md rounded-2xl p-10 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10">
          <Car className="h-6 w-6 text-red-400" />
        </div>
        <h3 className="font-heading text-lg font-semibold">Car not found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          The requested car could not be loaded.
        </p>
        <Link
          to="/admin/cars"
          className="mt-4 inline-block text-sm text-[#f79d00] hover:underline"
        >
          Back to Cars
        </Link>
      </div>
    );
  }

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
        title={`${car.brand} ${car.model}`}
        subtitle={`${car.year} - ${car.plate}`}
      />

      {/* Car Info Card */}
      <div className="glass-light mb-8 rounded-2xl p-6">
        <h3 className="font-heading mb-4 text-lg font-semibold">Car Information</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground/70">Brand</p>
            <p className="mt-1 text-sm font-medium">{car.brand}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground/70">Model</p>
            <p className="mt-1 text-sm">{car.model}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground/70">Year</p>
            <p className="mt-1 text-sm">{car.year}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground/70">Category</p>
            <p className="mt-1 text-sm">{car.category}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground/70">Plate</p>
            <p className="mt-1 font-mono text-sm">{car.plate}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground/70">Daily Rate</p>
            <p className="mt-1 text-sm">${car.dailyRate}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground/70">Status</p>
            <div className="mt-1">
              <StatusBadge variant={getCarStatusVariant(car.status)} label={car.status} />
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground/70">Created At</p>
            <p className="mt-1 text-sm">{new Date(car.createdAt).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground/70">Updated At</p>
            <p className="mt-1 text-sm">{new Date(car.updatedAt).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Status Update Section */}
      {car.status !== "DELETED" && (
        <div className="glass-light mb-8 rounded-2xl p-6">
          <h3 className="font-heading mb-4 text-lg font-semibold">Update Status</h3>
          <form onSubmit={form.handleSubmit(onUpdateStatus)} className="flex items-end gap-4">
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground/70">
                New Status
              </label>
              <select
                {...form.register("status")}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#f79d00]/30 focus:border-[#f79d00]/50 transition-colors"
              >
                {CAR_STATUSES.filter((s) => s !== "DELETED").map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={updateStatus.isPending}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#f79d00] to-[#64f38c] px-6 py-3 font-heading text-sm font-semibold text-[#0c0c14] shadow-lg shadow-[#f79d00]/20 transition-all hover:shadow-xl hover:shadow-[#f79d00]/30 hover:brightness-110 disabled:opacity-50"
            >
              {updateStatus.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Update
            </button>
          </form>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4">
        <Link
          to={`/admin/cars/${carId}/edit`}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3 font-heading text-sm font-semibold transition-all hover:border-white/20 hover:bg-white/[0.06]"
        >
          <Edit className="h-4 w-4" />
          Edit Car
        </Link>
        <button
          onClick={() => setShowDeleteDialog(true)}
          className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-6 py-3 font-heading text-sm font-semibold text-red-400 transition-all hover:border-red-500/50 hover:bg-red-500/10"
        >
          <Trash2 className="h-4 w-4" />
          Delete Car
        </button>
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Car"
        description={`Are you sure you want to delete this ${car.brand} ${car.model}? This will soft-delete the car.`}
        onConfirm={handleDelete}
        isLoading={deleteCar.isPending}
      />
    </div>
  );
}
