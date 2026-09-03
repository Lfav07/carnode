import { createApiClient } from "@/shared/api";
import type { StoreQueryParams } from "../schemas/storesSchema";
import type { StoreResponse } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = createApiClient({
  baseUrl: `${API_BASE_URL}/stores`,
});

export async function getStores(params?: StoreQueryParams) {
  return api.get<StoreResponse[]>("", { params });
}
