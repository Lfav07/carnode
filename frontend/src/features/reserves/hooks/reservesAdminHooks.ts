import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ReserveQueryParams } from "../schemas/reservesSchema";
import {
  getReserves,
  getReserveById,
  createReserve,
  updateReserveStatus,
  updateReserve,
} from "../api/reservesAdminApi";
import type {
  ReserveCreateRequest,
  ReserveStatusUpdateRequest,
  ReserveUpdateRequest,
} from "../types";

export function useAdminReserves(params?: ReserveQueryParams) {
  return useQuery({
    queryKey: ["reserves", "admin", params],
    queryFn: () => getReserves(params),
  });
}

export function useAdminReserve(id: string) {
  return useQuery({
    queryKey: ["reserves", "admin", id],
    queryFn: () => getReserveById(id),
    enabled: !!id,
  });
}

export function useAdminCreateReserve() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReserveCreateRequest) => createReserve(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reserves", "admin"] });
    },
  });
}

export function useAdminUpdateReserveStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReserveStatusUpdateRequest }) =>
      updateReserveStatus(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reserves", "admin"] });
      queryClient.invalidateQueries({ queryKey: ["reserves", "admin", variables.id] });
    },
  });
}

export function useAdminUpdateReserve() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReserveUpdateRequest }) =>
      updateReserve(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reserves", "admin"] });
      queryClient.invalidateQueries({ queryKey: ["reserves", "admin", variables.id] });
    },
  });
}
