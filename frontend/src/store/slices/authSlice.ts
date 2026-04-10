import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthUser } from "@/lib/api/types";

type AuthState = {
  user: AuthUser | null;
  hydrated: boolean;
};

const initialState: AuthState = {
  user: null,
  hydrated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
      state.hydrated = true;
    },
    clearAuthUser: (state) => {
      state.user = null;
      state.hydrated = true;
    },
    markAuthHydrated: (state) => {
      state.hydrated = true;
    },
  },
});

export const { setAuthUser, clearAuthUser, markAuthHydrated } = authSlice.actions;
export const authReducer = authSlice.reducer;
