import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { useForm } from "react-hook-form";
import { ArrowLeft, Loader2, CalendarDays } from "lucide-react";
import {
  useAdminReserve,
  useAdminUpdateReserveStatus,
  useAdminUpdateReserve,
} from "@/features/reserves/hooks/reservesAdminHooks";
import { RESERVE_STATUSES } from "@/features/reserves/schemas/reservesSchema";
import { AdminPageHeader } from "../../components/AdminPageHeader";
import { StatusBadge } from "../../components/StatusBadge";
import { getReserveStatusVariant } from "../../utils/adminStatusUtils";
import type { ReserveStatus, ReserveUpdateRequest } from "@/features/reserves/types";

interface StatusFormValues {
  status: ReserveStatus;
}

interface EditFormValues {
  pickupDate: string;
  pickupStoreId: string;
  returnDate: string;
  returnStoreId: string;
}

export function AdminReserveDetailPage() {
  const { reserveId } = useParams<{ reserveId: string }>();
  const [isEditing, setIsEditing] = useState(false);

  const reserveQuery = useAdminReserve(reserveId ?? "");
  const updateStatus = useAdminUpdateReserveStatus();
  const updateReserve = useAdminUpdateReserve();

  const statusForm = useForm<StatusFormValues>({
    defaultValues: { status: "PENDING" },
  });

  const editForm = useForm<EditFormValues>({
    defaultValues: {
      pickupDate: "",
      pickupStoreId: "",
      returnDate: "",
      returnStoreId: "",
    },
  });

  const reserve = reserveQuery.data;

  useEffect(() => {
    if (reserve) {
      statusForm.reset({ status: reserve.status });
      editForm.reset({
        pickupDate: reserve.pickup.date.slice(0, 16),
        pickupStoreId: reserve.pickup.storeId,
        returnDate: reserve.returnInfo.date.slice(0, 16),
        returnStoreId: reserve.returnInfo.storeId,
      });
    }
  }, [reserve, statusForm, editForm]);

  function onUpdateStatus(values: StatusFormValues) {
    if (!reserveId) return;
    updateStatus.mutate(
      { id: reserveId, data: { status: values.status } },
      {
        onSuccess: () => {
          reserveQuery.refetch();
        },
      },
    );
  }

  function onUpdateReserve(values: EditFormValues) {
    if (!reserveId) return;
    const data: ReserveUpdateRequest = {
      pickup: {
        date: new Date(values.pickupDate).toISOString(),
        storeId: values.pickupStoreId,
      },
      returnInfo: {
        date: new Date(values.returnDate).toISOString(),
        storeId: values.returnStoreId,
      },
    };
    updateReserve.mutate(
      { id: reserveId, data },
      {
        onSuccess: () => {
          setIsEditing(false);
          reserveQuery.refetch();
        },
      },
    );
  }

  if (reserveQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-[#f79d00]" />
      </div>
    );
  }

  if (reserveQuery.error || !reserve) {
    return (
      <div className="glass mx-auto max-w-md rounded-2xl p-10 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10">
          <CalendarDays className="h-6 w-6 text-red-400" />
        </div>
        <h3 className="font-heading text-lg font-semibold">Reservation not found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          The requested reservation could not be loaded.
        </p>
        <Link
          to="/admin/reserves"
          className="mt-4 inline-block text-sm text-[#f79d00] hover:underline"
        >
          Back to Reservations
        </Link>
      </div>
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
        title="Reservation Detail"
        subtitle={`ID: ${reserve.id.slice(0, 12)}...`}
      />

      {/* Reservation Info Card */}
      <div className="glass-light mb-8 rounded-2xl p-6">
        <h3 className="font-heading mb-4 text-lg font-semibold">Reservation Information</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground/70">Status</p>
            <div className="mt-1">
              <StatusBadge variant={getReserveStatusVariant(reserve.status)} label={reserve.status} />
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground/70">User ID</p>
            <p className="mt-1 font-mono text-sm text-muted-foreground">{reserve.userId}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground/70">Car ID</p>
            <p className="mt-1 font-mono text-sm text-muted-foreground">{reserve.carId}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground/70">Pickup Date</p>
            <p className="mt-1 text-sm">{new Date(reserve.pickup.date).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground/70">Pickup Store</p>
            <p className="mt-1 font-mono text-sm text-muted-foreground">{reserve.pickup.storeId}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground/70">Return Date</p>
            <p className="mt-1 text-sm">{new Date(reserve.returnInfo.date).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground/70">Return Store</p>
            <p className="mt-1 font-mono text-sm text-muted-foreground">{reserve.returnInfo.storeId}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground/70">Daily Rate</p>
            <p className="mt-1 text-sm">${reserve.pricing.dailyRate}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground/70">Days</p>
            <p className="mt-1 text-sm">{reserve.pricing.days}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground/70">Subtotal</p>
            <p className="mt-1 text-sm font-medium">${reserve.pricing.subtotal}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground/70">Created At</p>
            <p className="mt-1 text-sm">{new Date(reserve.createdAt).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground/70">Updated At</p>
            <p className="mt-1 text-sm">{new Date(reserve.updatedAt).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Status Update Section */}
      <div className="glass-light mb-8 rounded-2xl p-6">
        <h3 className="font-heading mb-4 text-lg font-semibold">Update Status</h3>
        <form onSubmit={statusForm.handleSubmit(onUpdateStatus)} className="flex items-end gap-4">
          <div className="flex-1">
            <label className="text-xs font-medium text-muted-foreground/70">
              New Status
            </label>
            <select
              {...statusForm.register("status")}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#f79d00]/30 focus:border-[#f79d00]/50 transition-colors"
            >
              {RESERVE_STATUSES.map((status) => (
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

      {/* Edit Pickup/Return Section */}
      <div className="glass-light mb-8 rounded-2xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-heading text-lg font-semibold">Edit Pickup / Return</h3>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:border-white/20 hover:bg-white/[0.06] hover:text-foreground"
          >
            {isEditing ? "Cancel" : "Edit"}
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={editForm.handleSubmit(onUpdateReserve)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground/70">
                  Pickup Date
                </label>
                <input
                  type="datetime-local"
                  {...editForm.register("pickupDate")}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#f79d00]/30 focus:border-[#f79d00]/50 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground/70">
                  Pickup Store ID
                </label>
                <input
                  type="text"
                  {...editForm.register("pickupStoreId")}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#f79d00]/30 focus:border-[#f79d00]/50 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground/70">
                  Return Date
                </label>
                <input
                  type="datetime-local"
                  {...editForm.register("returnDate")}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#f79d00]/30 focus:border-[#f79d00]/50 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground/70">
                  Return Store ID
                </label>
                <input
                  type="text"
                  {...editForm.register("returnStoreId")}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#f79d00]/30 focus:border-[#f79d00]/50 transition-colors"
                />
              </div>
            </div>
            {updateReserve.isError && (
              <p className="text-xs text-red-400">
                Failed to update reservation. Please try again.
              </p>
            )}
            <button
              type="submit"
              disabled={updateReserve.isPending}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#f79d00] to-[#64f38c] px-6 py-3 font-heading text-sm font-semibold text-[#0c0c14] shadow-lg shadow-[#f79d00]/20 transition-all hover:shadow-xl hover:shadow-[#f79d00]/30 hover:brightness-110 disabled:opacity-50"
            >
              {updateReserve.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Changes
            </button>
          </form>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground/70">Pickup Date</p>
              <p className="mt-1 text-sm">{new Date(reserve.pickup.date).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground/70">Pickup Store</p>
              <p className="mt-1 font-mono text-sm text-muted-foreground">{reserve.pickup.storeId}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground/70">Return Date</p>
              <p className="mt-1 text-sm">{new Date(reserve.returnInfo.date).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground/70">Return Store</p>
              <p className="mt-1 font-mono text-sm text-muted-foreground">{reserve.returnInfo.storeId}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
