import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/AuthProvider";
import {
  getCurrentUserReserves,
  createUserReserve,
  getReserveById,
  cancelReserve,
  getAvailableCars,
} from "../api/reservesApi";
import type { UserReserveCreateRequest } from "../types";

export function useReserves() {
  const { isAuthenticated, isLoading } = useAuth();

  return useQuery({
    queryKey: ["reserves", "user", "me"],
    queryFn: getCurrentUserReserves,
    enabled: isAuthenticated && !isLoading,
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
  const { isAuthenticated, isLoading } = useAuth();

  return useQuery({
    queryKey: ["reserves", "user", id],
    queryFn: () => getReserveById(id),
    enabled: !!id && isAuthenticated && !isLoading,
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

export function useAvailableCars(params: {
  pickupDate: string;
  returnDate: string;
} | null) {
  return useQuery({
    queryKey: ["reserves", "user", "available-cars", params],
    queryFn: () => getAvailableCars(params!),
    enabled: !!params,
  });
}
