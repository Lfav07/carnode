import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import {
  useAdminStore,
  useAdminDeleteStore,
  useAdminUpdateStoreLocation,
} from "@/features/stores/hooks/storesAdminHooks";
import { AdminPageHeader } from "../../components/AdminPageHeader";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import {
  adminStoreFormSchema,
  type AdminStoreFormValues,
} from "../../schemas/adminStoreFormSchema";

export function AdminStoreDetailPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const storeQuery = useAdminStore(storeId ?? "");
  const deleteStore = useAdminDeleteStore();
  const updateLocation = useAdminUpdateStoreLocation();

  const form = useForm<AdminStoreFormValues>({
    resolver: zodResolver(adminStoreFormSchema),
    defaultValues: {
      locationName: "",
      locationCity: "",
    },
  });

  const store = storeQuery.data;

  useEffect(() => {
    if (store) {
      form.reset({
        locationName: store.location.name,
        locationCity: store.location.city,
      });
    }
  }, [store, form]);

  function onUpdateLocation(values: AdminStoreFormValues) {
    if (!storeId) return;
    updateLocation.mutate(
      {
        id: storeId,
        data: {
          location: {
            name: values.locationName,
            city: values.locationCity,
          },
        },
      },
      {
        onSuccess: () => {
          storeQuery.refetch();
        },
      },
    );
  }

  function handleDelete() {
    if (!storeId) return;
    deleteStore.mutate(storeId, {
      onSuccess: () => {
        navigate("/admin/stores");
      },
    });
  }

  if (storeQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-[#f79d00]" />
      </div>
    );
  }

  if (storeQuery.error || !store) {
    return (
      <div className="glass mx-auto max-w-md rounded-2xl p-10 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10">
          <MapPinIcon className="h-6 w-6 text-red-400" />
        </div>
        <h3 className="font-heading text-lg font-semibold">Store not found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          The requested store could not be loaded.
        </p>
        <Link
          to="/admin/stores"
          className="mt-4 inline-block text-sm text-[#f79d00] hover:underline"
        >
          Back to Stores
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/admin/stores"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Stores
      </Link>

      <AdminPageHeader
        title={store.location.name}
        subtitle={store.location.city}
      />

      {/* Store Info Card */}
      <div className="glass-light mb-8 rounded-2xl p-6">
        <h3 className="font-heading mb-4 text-lg font-semibold">Store Information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground/70">Name</p>
            <p className="mt-1 text-sm font-medium">{store.location.name}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground/70">City</p>
            <p className="mt-1 text-sm">{store.location.city}</p>
          </div>
        </div>
      </div>

      {/* Edit Location Form */}
      <div className="glass-light mb-8 rounded-2xl p-6">
        <h3 className="font-heading mb-4 text-lg font-semibold">Edit Location</h3>
        <form onSubmit={form.handleSubmit(onUpdateLocation)} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground/70">
              Store Name
            </label>
            <input
              type="text"
              {...form.register("locationName")}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#f79d00]/30 focus:border-[#f79d00]/50 transition-colors"
            />
            {form.formState.errors.locationName && (
              <p className="mt-1 text-xs text-red-400">
                {form.formState.errors.locationName.message}
              </p>
            )}
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground/70">
              City
            </label>
            <input
              type="text"
              {...form.register("locationCity")}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#f79d00]/30 focus:border-[#f79d00]/50 transition-colors"
            />
            {form.formState.errors.locationCity && (
              <p className="mt-1 text-xs text-red-400">
                {form.formState.errors.locationCity.message}
              </p>
            )}
          </div>
          {updateLocation.isError && (
            <p className="text-xs text-red-400">
              Failed to update location. Please try again.
            </p>
          )}
          <button
            type="submit"
            disabled={updateLocation.isPending}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#f79d00] to-[#64f38c] px-6 py-3 font-heading text-sm font-semibold text-[#0c0c14] shadow-lg shadow-[#f79d00]/20 transition-all hover:shadow-xl hover:shadow-[#f79d00]/30 hover:brightness-110 disabled:opacity-50"
          >
            {updateLocation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Update Location
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="glass-light rounded-2xl border border-red-500/20 p-6">
        <h3 className="font-heading mb-2 text-lg font-semibold text-red-400">
          Danger Zone
        </h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Permanently delete this store. This action cannot be undone.
        </p>
        <button
          onClick={() => setShowDeleteDialog(true)}
          className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-6 py-3 font-heading text-sm font-semibold text-red-400 transition-all hover:border-red-500/50 hover:bg-red-500/10"
        >
          <Trash2 className="h-4 w-4" />
          Delete Store
        </button>
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Store"
        description={`Are you sure you want to delete "${store.location.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        isLoading={deleteStore.isPending}
      />
    </div>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
