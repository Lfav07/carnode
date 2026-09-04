import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Trash2, Mail, KeyRound } from "lucide-react";
import {
  useAdminUser,
  useAdminUpdateEmail,
  useAdminChangePassword,
  useAdminDeleteUser,
} from "@/features/users/hooks/usersAdminHooks";
import { AdminPageHeader } from "../../components/AdminPageHeader";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import {
  adminUpdateEmailSchema,
  type AdminUpdateEmailValues,
  adminChangePasswordSchema,
  type AdminChangePasswordValues,
} from "../../schemas/adminUserFormSchema";

export function AdminUserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const userQuery = useAdminUser(userId ?? "");
  const updateEmail = useAdminUpdateEmail();
  const changePassword = useAdminChangePassword();
  const deleteUser = useAdminDeleteUser();

  const emailForm = useForm<AdminUpdateEmailValues>({
    resolver: zodResolver(adminUpdateEmailSchema),
    defaultValues: { email: "" },
  });

  const passwordForm = useForm<AdminChangePasswordValues>({
    resolver: zodResolver(adminChangePasswordSchema),
    defaultValues: { password: "" },
  });

  const user = userQuery.data;

  function onUpdateEmail(values: AdminUpdateEmailValues) {
    if (!userId) return;
    updateEmail.mutate(
      { id: userId, data: values },
      {
        onSuccess: () => {
          emailForm.reset();
          userQuery.refetch();
        },
      },
    );
  }

  function onChangePassword(values: AdminChangePasswordValues) {
    if (!userId) return;
    changePassword.mutate(
      { id: userId, data: values },
      {
        onSuccess: () => {
          passwordForm.reset();
        },
      },
    );
  }

  function handleDelete() {
    if (!userId) return;
    deleteUser.mutate(userId, {
      onSuccess: () => {
        navigate("/admin/users");
      },
    });
  }

  if (userQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-[#f79d00]" />
      </div>
    );
  }

  if (userQuery.error || !user) {
    return (
      <div className="glass mx-auto max-w-md rounded-2xl p-10 text-center">
        <h3 className="font-heading text-lg font-semibold">User not found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          The requested user could not be loaded.
        </p>
        <Link
          to="/admin/users"
          className="mt-4 inline-block text-sm text-[#f79d00] hover:underline"
        >
          Back to Users
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/admin/users"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Users
      </Link>

      <AdminPageHeader title="User Detail" subtitle={user.email} />

      {/* User Info Card */}
      <div className="glass-light mb-8 rounded-2xl p-6">
        <h3 className="font-heading mb-4 text-lg font-semibold">User Information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground/70">Email</p>
            <p className="mt-1 text-sm">{user.email}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground/70">Keycloak ID</p>
            <p className="mt-1 font-mono text-sm text-muted-foreground">{user.keycloakId}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground/70">Created At</p>
            <p className="mt-1 text-sm">
              {new Date(user.createdAt).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground/70">Updated At</p>
            <p className="mt-1 text-sm">
              {new Date(user.updatedAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Update Email Form */}
      <div className="glass-light mb-8 rounded-2xl p-6">
        <div className="mb-4 flex items-center gap-2">
          <Mail className="h-4 w-4 text-[#f79d00]" />
          <h3 className="font-heading text-lg font-semibold">Update Email</h3>
        </div>
        <form onSubmit={emailForm.handleSubmit(onUpdateEmail)} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground/70">
              New Email
            </label>
            <input
              type="email"
              {...emailForm.register("email")}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#f79d00]/30 focus:border-[#f79d00]/50 transition-colors"
              placeholder="user@example.com"
            />
            {emailForm.formState.errors.email && (
              <p className="mt-1 text-xs text-red-400">
                {emailForm.formState.errors.email.message}
              </p>
            )}
          </div>
          {updateEmail.isError && (
            <p className="text-xs text-red-400">
              Failed to update email. Please try again.
            </p>
          )}
          <button
            type="submit"
            disabled={updateEmail.isPending}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#f79d00] to-[#64f38c] px-6 py-3 font-heading text-sm font-semibold text-[#0c0c14] shadow-lg shadow-[#f79d00]/20 transition-all hover:shadow-xl hover:shadow-[#f79d00]/30 hover:brightness-110 disabled:opacity-50"
          >
            {updateEmail.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Update Email
          </button>
        </form>
      </div>

      {/* Change Password Form */}
      <div className="glass-light mb-8 rounded-2xl p-6">
        <div className="mb-4 flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-[#f79d00]" />
          <h3 className="font-heading text-lg font-semibold">Change Password</h3>
        </div>
        <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground/70">
              New Password
            </label>
            <input
              type="password"
              {...passwordForm.register("password")}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#f79d00]/30 focus:border-[#f79d00]/50 transition-colors"
              placeholder="Min. 5 characters"
            />
            {passwordForm.formState.errors.password && (
              <p className="mt-1 text-xs text-red-400">
                {passwordForm.formState.errors.password.message}
              </p>
            )}
          </div>
          {changePassword.isError && (
            <p className="text-xs text-red-400">
              Failed to change password. Please try again.
            </p>
          )}
          <button
            type="submit"
            disabled={changePassword.isPending}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#f79d00] to-[#64f38c] px-6 py-3 font-heading text-sm font-semibold text-[#0c0c14] shadow-lg shadow-[#f79d00]/20 transition-all hover:shadow-xl hover:shadow-[#f79d00]/30 hover:brightness-110 disabled:opacity-50"
          >
            {changePassword.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Change Password
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="glass-light rounded-2xl border border-red-500/20 p-6">
        <h3 className="font-heading mb-2 text-lg font-semibold text-red-400">
          Danger Zone
        </h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Permanently delete this user. This action cannot be undone.
        </p>
        <button
          onClick={() => setShowDeleteDialog(true)}
          className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-6 py-3 font-heading text-sm font-semibold text-red-400 transition-all hover:border-red-500/50 hover:bg-red-500/10"
        >
          <Trash2 className="h-4 w-4" />
          Delete User
        </button>
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete User"
        description={`Are you sure you want to delete "${user.email}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        isLoading={deleteUser.isPending}
      />
    </div>
  );
}
