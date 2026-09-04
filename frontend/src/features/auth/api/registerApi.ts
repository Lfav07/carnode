import { createApiClient } from "@/shared/api";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = createApiClient({
  baseUrl: `${API_BASE_URL}/users`,
});

export interface RegisterRequest {
  email: string;
  password: string;
}

export async function registerUser(data: RegisterRequest) {
  return api.post<void>("", data);
}
