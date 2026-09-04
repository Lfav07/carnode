import { useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { Plus, CalendarDays } from "lucide-react";
import { useAdminReserves } from "@/features/reserves/hooks/reservesAdminHooks";
import { RESERVE_STATUSES } from "@/features/reserves/schemas/reservesSchema";
import type { ReserveStatus } from "@/features/reserves/types";
import { AdminPageHeader } from "../../components/AdminPageHeader";
import { DataTable } from "../../components/DataTable";
import { DataTablePagination } from "../../components/DataTablePagination";
import { FilterPanel } from "../../components/FilterPanel";
import { StatusBadge } from "../../components/StatusBadge";
import { getReserveStatusVariant } from "../../utils/adminStatusUtils";
import { Link } from "react-router";
import type { ReserveResponse } from "@/features/reserves/types";

const filterFields = [
  {
    key: "status",
    label: "Status",
    type: "select" as const,
    options: RESERVE_STATUSES.map((s) => ({ label: s, value: s })),
    placeholder: "All Statuses",
  },
  {
    key: "userId",
    label: "User ID",
    type: "text" as const,
    placeholder: "Filter by user ID",
  },
  {
    key: "carId",
    label: "Car ID",
    type: "text" as const,
    placeholder: "Filter by car ID",
  },
];

export function AdminReservesListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const currentPage = Number(searchParams.get("page")) || 1;
  const statusRaw = searchParams.get("status") ?? undefined;
  const userId = searchParams.get("userId") ?? undefined;
  const carId = searchParams.get("carId") ?? undefined;
  const pageSize = 20;

  const status = useMemo(
    () => (statusRaw && RESERVE_STATUSES.includes(statusRaw as ReserveStatus) ? (statusRaw as ReserveStatus) : undefined),
    [statusRaw],
  );

  const reservesQuery = useAdminReserves({
    page: currentPage,
    limit: pageSize,
    sortBy: "createdAt",
    sortOrder: "desc",
    status,
    userId,
    carId,
  });

  const reserves = reservesQuery.data?.data ?? [];
  const meta = reservesQuery.data?.meta;

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
      next.delete("status");
      next.delete("userId");
      next.delete("carId");
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

  const filterValues = {
    status: statusRaw ?? "",
    userId: userId ?? "",
    carId: carId ?? "",
  };

  const columns = [
    {
      key: "id",
      header: "ID",
      render: (res: ReserveResponse) => (
        <span className="font-mono text-xs text-muted-foreground">
          {res.id.slice(0, 8)}...
        </span>
      ),
    },
    {
      key: "userId",
      header: "User",
      render: (res: ReserveResponse) => (
        <span className="font-mono text-xs text-muted-foreground">
          {res.userId.slice(0, 8)}...
        </span>
      ),
    },
    {
      key: "carId",
      header: "Car",
      render: (res: ReserveResponse) => (
        <span className="font-mono text-xs text-muted-foreground">
          {res.carId.slice(0, 8)}...
        </span>
      ),
    },
    {
      key: "pickupDate",
      header: "Pickup Date",
      render: (res: ReserveResponse) => (
        <span className="text-muted-foreground">
          {new Date(res.pickup.date).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "returnDate",
      header: "Return Date",
      render: (res: ReserveResponse) => (
        <span className="text-muted-foreground">
          {new Date(res.returnInfo.date).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (res: ReserveResponse) => (
        <StatusBadge variant={getReserveStatusVariant(res.status)} label={res.status} />
      ),
    },
    {
      key: "total",
      header: "Total",
      render: (res: ReserveResponse) => (
        <span className="text-muted-foreground">${res.pricing.subtotal}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (res: ReserveResponse) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/admin/reserves/${res.id}`);
          }}
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
        >
          View
        </button>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Reservations"
        subtitle="Manage all reservations"
        action={
          <Link
            to="/admin/reserves/new"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#f79d00] to-[#64f38c] px-6 py-3 font-heading text-sm font-semibold text-[#0c0c14] shadow-lg shadow-[#f79d00]/20 transition-all hover:shadow-xl hover:shadow-[#f79d00]/30 hover:brightness-110"
          >
            <Plus className="h-4 w-4" />
            Create Reservation
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
        data={reserves}
        isLoading={reservesQuery.isLoading}
        onRowClick={(res) => navigate(`/admin/reserves/${res.id}`)}
        emptyMessage="No reservations found"
        emptyIcon={CalendarDays}
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
    </div>
  );
}
