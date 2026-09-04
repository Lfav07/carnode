import { createApiClient } from "@/shared/api";
import { keycloak } from "@/features/auth/keycloak";
import type { PaginationQueryParams, SearchParams } from "../schemas/usersSchema";
import type {
  ChangePasswordRequest,
  UpdateUserEmailRequest,
  UserResponse,
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = createApiClient({
  baseUrl: `${API_BASE_URL}/users`,
  getToken: () => keycloak.token,
});

export async function getUsers(params?: PaginationQueryParams) {
  return api.paginated<UserResponse>("", { params });
}

export async function searchUser(params: SearchParams) {
  return api.get<UserResponse>("/search", { params });
}

export async function getUserById(id: string) {
  return api.get<UserResponse>(`/${id}`);
}

export async function updateEmail(id: string, data: UpdateUserEmailRequest) {
  return api.patch<void>(`/${id}/email`, data);
}

export async function changePassword(id: string, data: ChangePasswordRequest) {
  return api.patch<void>(`/${id}/password`, data);
}

export async function deleteUser(id: string) {
  return api.del<void>(`/${id}`);
}
