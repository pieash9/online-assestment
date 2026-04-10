"use client";

import axios, { AxiosError } from "axios";
import type { ApiErrorResponse, ApiResponse } from "@/lib/api/types";
import { store } from "@/store";
import { clearAuthUser } from "@/store/slices/authSlice";

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_BASE_URL;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error instanceof AxiosError && error.response?.status === 401) {
      store.dispatch(clearAuthUser());
    }

    return Promise.reject(error);
  }
);

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
