import { createApiClient } from "@/shared/api";
import type { StoreQueryParams } from "../schemas/storesSchema";
import type { StoreCreateRequest, StoreResponse, StoreUpdateLocationRequest } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = createApiClient({
  baseUrl: `${API_BASE_URL}/stores`,
});

export async function getStores(params?: StoreQueryParams) {
  return api.get<StoreResponse[]>("", { params });
}

export async function getStoreById(id: string) {
  return api.get<StoreResponse>(`/${id}`);
}

export async function createStore(data: StoreCreateRequest) {
  return api.post<StoreResponse>("", data);
}

export async function updateStoreLocation(id: string, data: StoreUpdateLocationRequest) {
  return api.patch<StoreResponse>(`/${id}`, data);
}

export async function deleteStore(id: string) {
  return api.del<void>(`/${id}`);
}
