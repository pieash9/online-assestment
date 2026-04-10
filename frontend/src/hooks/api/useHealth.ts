"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { healthService } from "@/services/health.service";

export function useHealthQuery() {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: healthService.getHealth,
  });
}
