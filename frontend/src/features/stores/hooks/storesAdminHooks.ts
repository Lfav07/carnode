import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { StoreQueryParams } from "../schemas/storesSchema";
import {
  getStores,
  getStoreById,
  createStore,
  updateStoreLocation,
  deleteStore,
} from "../api/storesAdminApi";
import type { StoreCreateRequest, StoreUpdateLocationRequest } from "../types";

export function useAdminStores(params?: StoreQueryParams) {
  return useQuery({
    queryKey: ["stores", "admin", params],
    queryFn: () => getStores(params),
  });
}

export function useAdminStore(id: string) {
  return useQuery({
    queryKey: ["stores", "admin", id],
    queryFn: () => getStoreById(id),
    enabled: !!id,
  });
}

export function useAdminCreateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StoreCreateRequest) => createStore(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores", "admin"] });
    },
  });
}

export function useAdminUpdateStoreLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: StoreUpdateLocationRequest }) =>
      updateStoreLocation(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["stores", "admin"] });
      queryClient.invalidateQueries({ queryKey: ["stores", "admin", variables.id] });
    },
  });
}

export function useAdminDeleteStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteStore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores", "admin"] });
    },
  });
}
