"use client";

import axios, { AxiosError } from "axios";
import type { ApiErrorResponse, ApiResponse } from "@/lib/api/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_BASE_URL;

export const AUTH_TOKEN_STORAGE_KEY = "auth_token";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window === "undefined") {
    return config;
  }

  const token = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export function setAuthToken(token: string) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  }
}

export function clearAuthToken() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  }
}

export async function unwrapResponse<T>(
  request: Promise<{ data: ApiResponse<T> }>,
) {
  const response = await request;

  return response.data.data;
}

export function getApiErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    const message = (error.response?.data as ApiErrorResponse | undefined)
      ?.message;

    return message ?? error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
}
