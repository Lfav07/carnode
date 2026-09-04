import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router";
import { Plus, Eye, Trash2, MapPin } from "lucide-react";
import {
  useAdminStores,
  useAdminDeleteStore,
} from "@/features/stores/hooks/storesAdminHooks";
import { AdminPageHeader } from "../../components/AdminPageHeader";
import { DataTable } from "../../components/DataTable";
import { SearchBar } from "../../components/SearchBar";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import type { StoreResponse } from "@/features/stores/types";

export function AdminStoresListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [deleteTarget, setDeleteTarget] = useState<StoreResponse | null>(null);
  const deleteStore = useAdminDeleteStore();

  const searchQuery = searchParams.get("search") ?? "";

  const storesQuery = useAdminStores();
  const allStores = Array.isArray(storesQuery.data) ? storesQuery.data : [];

  const filteredStores = searchQuery
    ? allStores.filter(
        (s) =>
          s.location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.location.city.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : allStores;

  function handleSearch(value: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) {
        next.set("search", value);
      } else {
        next.delete("search");
      }
      return next;
    });
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteStore.mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
      },
    });
  }

  const columns = [
    {
      key: "name",
      header: "Name",
      render: (store: StoreResponse) => (
        <span className="font-medium">{store.location.name}</span>
      ),
    },
    {
      key: "city",
      header: "City",
      render: (store: StoreResponse) => (
        <span className="text-muted-foreground">{store.location.city}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (store: StoreResponse) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/stores/${store.id}`);
            }}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(store);
            }}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Stores Management"
        subtitle="Manage store locations"
        action={
          <Link
            to="/admin/stores/new"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#f79d00] to-[#64f38c] px-6 py-3 font-heading text-sm font-semibold text-[#0c0c14] shadow-lg shadow-[#f79d00]/20 transition-all hover:shadow-xl hover:shadow-[#f79d00]/30 hover:brightness-110"
          >
            <Plus className="h-4 w-4" />
            Add Store
          </Link>
        }
      />

      <div className="mb-6">
        <SearchBar
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search by name or city..."
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredStores}
        isLoading={storesQuery.isLoading}
        onRowClick={(store) => navigate(`/admin/stores/${store.id}`)}
        emptyMessage="No stores found"
        emptyIcon={MapPin}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Store"
        description={`Are you sure you want to delete "${deleteTarget?.location.name}" in ${deleteTarget?.location.city}? This action cannot be undone.`}
        onConfirm={handleDelete}
        isLoading={deleteStore.isPending}
      />
    </div>
  );
}
