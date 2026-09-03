import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CarQueryParams } from "../schemas/carsSchema";
import {
  getCarById,
  getCars,
  registerCar,
  updateCar,
  updateCarStatus,
  deleteCar,
} from "../api/carsAdminApi";
import type { CarCreateRequest, CarStatusUpdateRequest, CarUpdateRequest } from "../types";

export function useAdminCars(params?: CarQueryParams) {
  return useQuery({
    queryKey: ["cars", "admin", params],
    queryFn: () => getCars(params),
  });
}

export function useAdminCar(id: string) {
  return useQuery({
    queryKey: ["cars", "admin", id],
    queryFn: () => getCarById(id),
    enabled: !!id,
  });
}

export function useCreateCar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CarCreateRequest) => registerCar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cars", "admin"] });
    },
  });
}

export function useUpdateCar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CarUpdateRequest }) =>
      updateCar(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["cars", "admin"] });
      queryClient.invalidateQueries({ queryKey: ["cars", "admin", variables.id] });
    },
  });
}

export function useUpdateCarStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CarStatusUpdateRequest }) =>
      updateCarStatus(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["cars", "admin"] });
      queryClient.invalidateQueries({ queryKey: ["cars", "admin", variables.id] });
    },
  });
}

export function useDeleteCar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cars", "admin"] });
    },
  });
}
