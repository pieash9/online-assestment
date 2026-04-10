"use client";

import { useEffect } from "react";
import { useCurrentUserQuery } from "@/hooks/api/useAuth";
import { useAppDispatch } from "@/hooks/useRedux";
import {
  clearAuthUser,
  markAuthHydrated,
  setAuthUser,
} from "@/store/slices/authSlice";

export default function AuthBootstrap() {
  const dispatch = useAppDispatch();
  const { data, isSuccess, isError } = useCurrentUserQuery();

  useEffect(() => {
    if (isSuccess && data?.user) {
      dispatch(setAuthUser(data.user));
    }
  }, [data, dispatch, isSuccess]);

  useEffect(() => {
    if (isError) {
      dispatch(clearAuthUser());
    }
  }, [dispatch, isError]);

  useEffect(() => {
    if (!isSuccess && !isError) {
      return;
    }

    dispatch(markAuthHydrated());
  }, [dispatch, isError, isSuccess]);

  return null;
}
