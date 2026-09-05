import { createApiClient } from "@/shared/api";
import { keycloak } from "@/features/auth/keycloak";
import type { StoreQueryParams } from "../schemas/storesSchema";
import type { StoreResponse } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = createApiClient({
  baseUrl: `${API_BASE_URL}/stores`,
  getToken: () => keycloak.token,
});

export async function getStores(params?: StoreQueryParams) {
  return api.get<StoreResponse[]>("", { params });
}

export async function searchStores(term: string) {
  return api.get<StoreResponse[]>("/search", { params: { q: term } });
}
