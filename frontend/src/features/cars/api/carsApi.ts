import { createApiClient } from "@/shared/api";
import { keycloak } from "@/features/auth/keycloak";
import type { CarUserResponse } from "../types";
import type { CarQueryParams } from "../schemas/carsSchema";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = createApiClient({
  baseUrl: `${API_BASE_URL}/cars`,
  getToken: () => keycloak.token,
});
export async function getCars(params?: CarQueryParams) {
  return api.paginated<CarUserResponse>("", {
    params,
  });
}
export async function getCarById(id: string){
  return api.get<CarUserResponse>(`/${id}`)
}