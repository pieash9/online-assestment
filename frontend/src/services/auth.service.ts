import {
  apiClient,
  setAuthToken,
  clearAuthToken,
  unwrapResponse,
} from "@/lib/api/client";
import type { LoginInput, LoginResponse } from "@/lib/api/types";

export const authService = {
  async login(payload: LoginInput) {
    const data = await unwrapResponse<LoginResponse>(apiClient.post("/auth/login", payload));
    setAuthToken(data.token);

    return data;
  },
  logout() {
    clearAuthToken();
  },
};
