import { createApiClient } from "@/shared/api";
import { keycloak } from "@/features/auth/keycloak";
import type { CarQueryParams } from "../schemas/carsSchema";
import type {
  CarCreateRequest,
  CarResponse,
  CarStatusUpdateRequest,
  CarUpdateRequest,
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = createApiClient({
  baseUrl: `${API_BASE_URL}/cars`,
  getToken: () => keycloak.token,
});

export async function getCars(params?: CarQueryParams) {
  return api.paginated<CarResponse>("/admin", { params });
}

export async function getCarById(id: string) {
  return api.get<CarResponse>(`/${id}`);
}

export async function registerCar(data: CarCreateRequest) {
  return api.post<CarResponse>("", data);
}

export async function updateCar(id: string, data: CarUpdateRequest) {
  return api.patch<CarResponse>(`/${id}`, data);
}

export async function updateCarStatus(id: string, data: CarStatusUpdateRequest) {
  return api.patch<CarResponse>(`/${id}/status`, data);
}

export async function deleteCar(id: string) {
  return api.del<void>(`/${id}`);
}
