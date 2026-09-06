import { createApiClient } from "@/shared/api";
import { keycloak } from "@/features/auth/keycloak";
import type { CarUserResponse } from "../types";
import type { CarQueryParams } from "../schemas/carsSchema";

const API_BASE_URL = import.meta.env.VITE_API_URL;
console.log(`[CarsAPI] Base URL: ${API_BASE_URL}`);

const api = createApiClient({
  baseUrl: `${API_BASE_URL}/cars`,
  getToken: () => keycloak.token,
});
export async function getCars(params?: CarQueryParams) {
  console.log(`[CarsAPI] getCars called with params:`, params);
  return api.paginated<CarUserResponse>("", {
    params,
  });
}
export async function getCarById(id: string){
  return api.get<CarUserResponse>(`/${id}`)
}