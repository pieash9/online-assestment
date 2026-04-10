"use client";

import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import type { LoginInput } from "@/lib/api/types";

export function useLoginMutation() {
  return useMutation({
    mutationFn: (payload: LoginInput) => authService.login(payload),
  });
}
