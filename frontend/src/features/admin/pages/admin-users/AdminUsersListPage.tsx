import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Eye, Trash2, Users } from "lucide-react";
import {
  useAdminUsers,
  useAdminSearchUser,
  useAdminDeleteUser,
} from "@/features/users/hooks/usersAdminHooks";
import { AdminPageHeader } from "../../components/AdminPageHeader";
import { DataTable } from "../../components/DataTable";
import { DataTablePagination } from "../../components/DataTablePagination";
import { SearchBar } from "../../components/SearchBar";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import type { UserResponse } from "@/features/users/types";

export function AdminUsersListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const currentPage = Number(searchParams.get("page")) || 1;
  const searchQuery = searchParams.get("search") ?? "";
  const pageSize = 20;

  const [deleteTarget, setDeleteTarget] = useState<UserResponse | null>(null);
  const deleteUser = useAdminDeleteUser();

  const isSearchMode = searchQuery.length > 0;
  const isEmail = searchQuery.includes("@");

  const usersQuery = useAdminUsers({
    page: currentPage,
    limit: pageSize,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const searchQueryHook = useAdminSearchUser(
    isEmail ? { email: searchQuery } : { keycloakId: searchQuery },
  );

  const activeQuery = isSearchMode ? searchQueryHook : usersQuery;
  const users = activeQuery.data?.data ?? [];
  const meta = activeQuery.data?.meta;

  function handleSearch(value: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) {
        next.set("search", value);
      } else {
        next.delete("search");
      }
      next.delete("page");
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
    deleteUser.mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
      },
    });
  }

  const columns = [
    {
      key: "email",
      header: "Email",
      render: (user: UserResponse) => (
        <span className="font-medium">{user.email}</span>
      ),
    },
    {
      key: "keycloakId",
      header: "Keycloak ID",
      render: (user: UserResponse) => (
        <span className="font-mono text-xs text-muted-foreground">
          {user.keycloakId.slice(0, 12)}...
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Created At",
      render: (user: UserResponse) => (
        <span className="text-muted-foreground">
          {new Date(user.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (user: UserResponse) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/users/${user.id}`);
            }}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(user);
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
      <AdminPageHeader title="Users" subtitle="User Management" />

      <div className="mb-6">
        <SearchBar
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search by email or Keycloak ID..."
        />
      </div>

      <DataTable
        columns={columns}
        data={users}
        isLoading={activeQuery.isLoading}
        onRowClick={(user) => navigate(`/admin/users/${user.id}`)}
        emptyMessage="No users found"
        emptyIcon={Users}
      />

      {!isSearchMode && meta && (
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
        title="Delete User"
        description={`Are you sure you want to delete the user "${deleteTarget?.email}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        isLoading={deleteUser.isPending}
      />
    </div>
  );
}
