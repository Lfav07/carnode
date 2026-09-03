import { useQuery } from "@tanstack/react-query";
import type { CarQueryParams } from "../schemas/carsSchema";
import { getCarById, getCars } from "../api/carsApi";

export function useCars(params?: CarQueryParams) {
  return useQuery({
    queryKey: ["cars", "user", params],
    queryFn: () => getCars(params),
  });
}

export function useCar(id: string) {
  return useQuery({
    queryKey: ["cars", "user", id],
    queryFn: () => getCarById(id),
    enabled: !!id,
  });
}
