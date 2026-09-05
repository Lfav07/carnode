import { createApiClient } from "@/shared/api";
import { keycloak } from "@/features/auth/keycloak";
import type {
  ReserveStatusUpdateRequest,
  UserReserveCreateRequest,
  UserReserveResponse,
} from "../types";
import type { CarUserResponse } from "@/features/cars/types";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = createApiClient({
  baseUrl: `${API_BASE_URL}/reserves`,
  getToken: () => keycloak.token,
});

export async function getCurrentUserReserves() {
  return api.get<UserReserveResponse[]>("/me");
}

export async function createUserReserve(data: UserReserveCreateRequest) {
  return api.post<UserReserveResponse>("/me", data);
}

export async function getReserveById(id: string) {
  return api.get<UserReserveResponse>(`/${id}`);
}

export async function cancelReserve(id: string) {
  return api.patch<UserReserveResponse>(`/${id}/status`, {
    status: "CANCELLED",
  } satisfies ReserveStatusUpdateRequest);
}

export async function getAvailableCars(params: {
  pickupDate: string;
  returnDate: string;
}) {
  return api.get<CarUserResponse[]>("/available-cars", { params });
}
