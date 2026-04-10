"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import type { LoginInput } from "@/lib/api/types";

export function useLoginMutation() {
  return useMutation({
    mutationFn: (payload: LoginInput) => authService.login(payload),
  });
}

export function useCurrentUserQuery() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: authService.me,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogoutMutation() {
  return useMutation({
    mutationFn: authService.logout,
  });
}
