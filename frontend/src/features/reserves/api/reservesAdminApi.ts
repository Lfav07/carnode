import { createApiClient } from "@/shared/api";
import { keycloak } from "@/features/auth/keycloak";
import type { ReserveQueryParams } from "../schemas/reservesSchema";
import type {
  ReserveCreateRequest,
  ReserveResponse,
  ReserveStatusUpdateRequest,
  ReserveUpdateRequest,
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = createApiClient({
  baseUrl: `${API_BASE_URL}/reserves`,
  getToken: () => keycloak.token,
});

export async function getReserves(params?: ReserveQueryParams) {
  return api.paginated<ReserveResponse>("", { params });
}

export async function getReserveById(id: string) {
  return api.get<ReserveResponse>(`/${id}`);
}

export async function createReserve(data: ReserveCreateRequest) {
  return api.post<ReserveResponse>("", data);
}

export async function updateReserveStatus(id: string, data: ReserveStatusUpdateRequest) {
  return api.patch<ReserveResponse>(`/${id}/status`, data);
}

export async function updateReserve(id: string, data: ReserveUpdateRequest) {
  return api.patch<ReserveResponse>(`/${id}`, data);
}
