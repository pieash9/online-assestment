import { apiClient, unwrapResponse } from "@/lib/api/client";
import type {
  CurrentUserResponse,
  LoginInput,
  LoginResponse,
} from "@/lib/api/types";

export const authService = {
  async login(payload: LoginInput) {
    const data = await unwrapResponse<LoginResponse>(apiClient.post("/auth/login", payload));
    return data;
  },
  me() {
    return unwrapResponse<CurrentUserResponse>(apiClient.get("/auth/me"));
  },
  logout() {
    return unwrapResponse<null>(apiClient.post("/auth/logout"));
  },
};
