import { createApiClient } from "@/shared/api";
import { keycloak } from "@/features/auth/keycloak";
import type { CurrentUserResponse, CreateUserRequest } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = createApiClient({
  baseUrl: `${API_BASE_URL}/users`,
  getToken: () => keycloak.token,
});

export async function getCurrentUser() {
  return api.get<CurrentUserResponse>("/me");
}

export async function registerUser(data: CreateUserRequest) {
  return api.post<void>("", data);
}
