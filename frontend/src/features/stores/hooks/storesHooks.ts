import { useQuery } from "@tanstack/react-query";
import type { StoreQueryParams } from "../schemas/storesSchema";
import { getStores } from "../api/storesApi";

export function useStores(params?: StoreQueryParams) {
  return useQuery({
    queryKey: ["stores", "user", params],
    queryFn: () => getStores(params),
  });
}
