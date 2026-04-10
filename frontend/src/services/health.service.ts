import { apiClient, unwrapResponse } from "@/lib/api/client";
import type { HealthResponse } from "@/lib/api/types";

export const healthService = {
  getHealth: () => unwrapResponse<HealthResponse>(apiClient.get("/health")),
};
