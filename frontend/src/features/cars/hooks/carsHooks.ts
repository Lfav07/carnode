import { useQuery } from "@tanstack/react-query";
import type { CarQueryParams } from "../schemas/carsSchema";
import { getCarById, getCars } from "../api/carsApi";

export function useCars(params?: CarQueryParams) {
  console.log(`[CarsHook] useCars called with params:`, params);
  return useQuery({
    queryKey: ["cars", "user", params],
    queryFn: async () => {
      console.log(`[CarsHook] queryFn executing...`);
      const result = await getCars(params);
      console.log(`[CarsHook] queryFn result:`, result);
      return result;
    },
  });
}

export function useCar(id: string) {
  return useQuery({
    queryKey: ["cars", "user", id],
    queryFn: () => getCarById(id),
    enabled: !!id,
  });
}
