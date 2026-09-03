import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser, registerUser } from "../api/usersApi";
import type { CreateUserRequest } from "../types";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["users", "user", "me"],
    queryFn: getCurrentUser,
  });
}

export function useRegisterUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserRequest) => registerUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
