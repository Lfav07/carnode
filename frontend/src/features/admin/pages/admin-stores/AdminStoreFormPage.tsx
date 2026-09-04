import { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import {
  useAdminStore,
  useAdminCreateStore,
  useAdminUpdateStoreLocation,
} from "@/features/stores/hooks/storesAdminHooks";
import { AdminPageHeader } from "../../components/AdminPageHeader";
import {
  adminStoreFormSchema,
  type AdminStoreFormValues,
} from "../../schemas/adminStoreFormSchema";

export function AdminStoreFormPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const isEditMode = !!storeId;

  const storeQuery = useAdminStore(storeId ?? "");
  const createStore = useAdminCreateStore();
  const updateStore = useAdminUpdateStoreLocation();

  const form = useForm<AdminStoreFormValues>({
    resolver: zodResolver(adminStoreFormSchema),
    defaultValues: {
      locationName: "",
      locationCity: "",
    },
  });

  useEffect(() => {
    if (isEditMode && storeQuery.data) {
      const store = storeQuery.data;
      form.reset({
        locationName: store.location.name,
        locationCity: store.location.city,
      });
    }
  }, [isEditMode, storeQuery.data, form]);

  function onSubmit(values: AdminStoreFormValues) {
    const requestData = {
      location: {
        name: values.locationName,
        city: values.locationCity,
      },
    };

    if (isEditMode && storeId) {
      updateStore.mutate(
        { id: storeId, data: requestData },
        {
          onSuccess: () => {
            navigate(`/admin/stores/${storeId}`);
          },
        },
      );
    } else {
      createStore.mutate(requestData, {
        onSuccess: (data) => {
          navigate(data ? `/admin/stores/${data.id}` : "/admin/stores");
        },
      });
    }
  }

  const isSubmitting = createStore.isPending || updateStore.isPending;

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
        title={isEditMode ? "Edit Store" : "Add Store"}
        subtitle={isEditMode ? "Update store details" : "Register a new store location"}
      />

      <div className="glass-light max-w-2xl rounded-2xl p-8">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Store Name */}
          <div>
            <label className="text-xs font-medium text-muted-foreground/70">
              Store Name
            </label>
            <input
              type="text"
              {...form.register("locationName")}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#f79d00]/30 focus:border-[#f79d00]/50 transition-colors"
              placeholder="e.g. Downtown Branch"
            />
            {form.formState.errors.locationName && (
              <p className="mt-1 text-xs text-red-400">
                {form.formState.errors.locationName.message}
              </p>
            )}
          </div>

          {/* City */}
          <div>
            <label className="text-xs font-medium text-muted-foreground/70">
              City
            </label>
            <input
              type="text"
              {...form.register("locationCity")}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#f79d00]/30 focus:border-[#f79d00]/50 transition-colors"
              placeholder="e.g. New York"
            />
            {form.formState.errors.locationCity && (
              <p className="mt-1 text-xs text-red-400">
                {form.formState.errors.locationCity.message}
              </p>
            )}
          </div>

          {/* Error message */}
          {(createStore.isError || updateStore.isError) && (
            <p className="text-sm text-red-400">
              Failed to {isEditMode ? "update" : "create"} store. Please try again.
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#f79d00] to-[#64f38c] px-6 py-3.5 font-heading text-sm font-semibold text-[#0c0c14] shadow-lg shadow-[#f79d00]/20 transition-all hover:shadow-xl hover:shadow-[#f79d00]/30 hover:brightness-110 disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEditMode ? "Update Store" : "Add Store"}
          </button>
        </form>
      </div>
    </div>
  );
}
