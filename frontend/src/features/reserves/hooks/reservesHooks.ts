import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCurrentUserReserves,
  createUserReserve,
  getReserveById,
  cancelReserve,
} from "../api/reservesApi";
import type { UserReserveCreateRequest } from "../types";

export function useReserves() {
  return useQuery({
    queryKey: ["reserves", "user", "me"],
    queryFn: getCurrentUserReserves,
  });
}

export function useCreateReserve() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UserReserveCreateRequest) => createUserReserve(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reserves", "user"] });
    },
  });
}

export function useReserve(id: string) {
  return useQuery({
    queryKey: ["reserves", "user", id],
    queryFn: () => getReserveById(id),
    enabled: !!id,
  });
}

export function useCancelReserve() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cancelReserve(id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reserves", "user"] });
      queryClient.invalidateQueries({ queryKey: ["reserves", "user", variables] });
    },
  });
}
