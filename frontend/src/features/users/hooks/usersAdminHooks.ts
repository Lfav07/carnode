import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PaginationQueryParams, SearchParams } from "../schemas/usersSchema";
import {
  getUsers,
  searchUser,
  getUserById,
  updateEmail,
  changePassword,
  deleteUser,
} from "../api/usersAdminApi";
import type { ChangePasswordRequest, UpdateUserEmailRequest } from "../types";

export function useAdminUsers(params?: PaginationQueryParams) {
  return useQuery({
    queryKey: ["users", "admin", params],
    queryFn: () => getUsers(params),
  });
}

export function useAdminSearchUser(params: SearchParams) {
  return useQuery({
    queryKey: ["users", "admin", "search", params],
    queryFn: () => searchUser(params),
    enabled: !!params.email || !!params.keycloakId,
  });
}

export function useAdminUser(id: string) {
  return useQuery({
    queryKey: ["users", "admin", id],
    queryFn: () => getUserById(id),
    enabled: !!id,
  });
}

export function useAdminUpdateEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserEmailRequest }) =>
      updateEmail(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users", "admin"] });
      queryClient.invalidateQueries({ queryKey: ["users", "admin", variables.id] });
    },
  });
}

export function useAdminChangePassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ChangePasswordRequest }) =>
      changePassword(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "admin"] });
    },
  });
}

export function useAdminDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "admin"] });
    },
  });
}
