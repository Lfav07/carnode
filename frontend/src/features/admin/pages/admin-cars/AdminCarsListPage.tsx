import { useState, useMemo } from "react";
import { useNavigate, useSearchParams, Link } from "react-router";
import { Plus, Eye, Trash2, Car } from "lucide-react";
import {
  useAdminCars,
  useDeleteCar,
} from "@/features/cars/hooks/carsAdminHooks";
import { CAR_BRANDS, CAR_CATEGORIES, CAR_STATUSES } from "@/features/cars/schemas/carsSchema";
import { AdminPageHeader } from "../../components/AdminPageHeader";
import { DataTable } from "../../components/DataTable";
import { DataTablePagination } from "../../components/DataTablePagination";
import { FilterPanel } from "../../components/FilterPanel";
import { StatusBadge } from "../../components/StatusBadge";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { getCarStatusVariant } from "../../utils/adminStatusUtils";
import type { CarBrand, CarCategory, CarStatus, CarResponse } from "@/features/cars/types";

const filterFields = [
  {
    key: "id",
    label: "Car ID",
    type: "text" as const,
    placeholder: "Search by ID (24 chars)",
  },
  {
    key: "brand",
    label: "Brand",
    type: "select" as const,
    options: CAR_BRANDS.map((b) => ({ label: b, value: b })),
    placeholder: "All Brands",
  },
  {
    key: "category",
    label: "Category",
    type: "select" as const,
    options: CAR_CATEGORIES.map((c) => ({ label: c, value: c })),
    placeholder: "All Categories",
  },
  {
    key: "status",
    label: "Status",
    type: "select" as const,
    options: CAR_STATUSES.map((s) => ({ label: s, value: s })),
    placeholder: "All Statuses",
  },
];

export function AdminCarsListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [deleteTarget, setDeleteTarget] = useState<CarResponse | null>(null);
  const deleteCar = useDeleteCar();

  const currentPage = Number(searchParams.get("page")) || 1;
  const idRaw = searchParams.get("id") ?? undefined;
  const brandRaw = searchParams.get("brand") ?? undefined;
  const categoryRaw = searchParams.get("category") ?? undefined;
  const statusRaw = searchParams.get("status") ?? undefined;
  const pageSize = 20;

  const brand = useMemo(
    () => (brandRaw && CAR_BRANDS.includes(brandRaw as CarBrand) ? (brandRaw as CarBrand) : undefined),
    [brandRaw],
  );
  const category = useMemo(
    () => (categoryRaw && CAR_CATEGORIES.includes(categoryRaw as CarCategory) ? (categoryRaw as CarCategory) : undefined),
    [categoryRaw],
  );
  const status = useMemo(
    () => (statusRaw && CAR_STATUSES.includes(statusRaw as CarStatus) ? (statusRaw as CarStatus) : undefined),
    [statusRaw],
  );

  const carsQuery = useAdminCars({
    page: currentPage,
    limit: pageSize,
    sortBy: "createdAt",
    sortOrder: "desc",
    id: idRaw,
    brand,
    category,
    status,
  });

  const cars = carsQuery.data?.data ?? [];
  const meta = carsQuery.data?.meta;

  function handleFilterChange(key: string, value: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      next.set("page", "1");
      return next;
    });
  }

  function handleResetFilters() {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("id");
      next.delete("brand");
      next.delete("category");
      next.delete("status");
      next.set("page", "1");
      return next;
    });
  }

  function handlePageChange(page: number) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", String(page));
      return next;
    });
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteCar.mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
      },
    });
  }

  const filterValues = {
    id: idRaw ?? "",
    brand: brandRaw ?? "",
    category: categoryRaw ?? "",
    status: statusRaw ?? "",
  };

  const columns = [
    {
      key: "brand",
      header: "Brand",
      render: (car: CarResponse) => (
        <span className="font-medium">{car.brand}</span>
      ),
    },
    {
      key: "model",
      header: "Model",
      render: (car: CarResponse) => <span>{car.model}</span>,
    },
    {
      key: "year",
      header: "Year",
      render: (car: CarResponse) => <span>{car.year}</span>,
    },
    {
      key: "category",
      header: "Category",
      render: (car: CarResponse) => (
        <span className="text-muted-foreground">{car.category}</span>
      ),
    },
    {
      key: "plate",
      header: "Plate",
      render: (car: CarResponse) => (
        <span className="font-mono text-xs">{car.plate}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (car: CarResponse) => (
        <StatusBadge variant={getCarStatusVariant(car.status)} label={car.status} />
      ),
    },
    {
      key: "dailyRate",
      header: "Daily Rate",
      render: (car: CarResponse) => (
        <span className="text-muted-foreground">${car.dailyRate}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (car: CarResponse) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/cars/${car.id}`);
            }}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(car);
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
        title="Cars Management"
        subtitle="Manage your fleet inventory"
        action={
          <Link
            to="/admin/cars/new"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#f79d00] to-[#64f38c] px-6 py-3 font-heading text-sm font-semibold text-[#0c0c14] shadow-lg shadow-[#f79d00]/20 transition-all hover:shadow-xl hover:shadow-[#f79d00]/30 hover:brightness-110"
          >
            <Plus className="h-4 w-4" />
            Register Car
          </Link>
        }
      />

      <div className="mb-6">
        <FilterPanel
          fields={filterFields}
          values={filterValues}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
        />
      </div>

      <DataTable
        columns={columns}
        data={cars}
        isLoading={carsQuery.isLoading}
        onRowClick={(car) => navigate(`/admin/cars/${car.id}`)}
        emptyMessage="No cars found"
        emptyIcon={Car}
      />

      {meta && (
        <DataTablePagination
          currentPage={currentPage}
          totalPages={meta.totalPages}
          totalCount={meta.totalCount}
          pageSize={pageSize}
          onPageChange={handlePageChange}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Car"
        description={`Are you sure you want to delete the ${deleteTarget?.brand} ${deleteTarget?.model} (${deleteTarget?.plate})? This will soft-delete the car.`}
        onConfirm={handleDelete}
        isLoading={deleteCar.isPending}
      />
    </div>
  );
}
