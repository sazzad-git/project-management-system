import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
  status: "idle" | "loading" | "succeeded" | "failed";
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  status: "idle",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    authLoading(state) {
      state.status = "loading";
    },
    loginSuccess(state, action: PayloadAction<{ user: any; token: string }>) {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");

      state.status = "failed";
    },

    setAuthState(state, action: PayloadAction<{ user: any; token: string }>) {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.status = "succeeded";
    },
  },
});

export const { loginSuccess, authLoading, logout, setAuthState } =
  authSlice.actions;
export default authSlice.reducer;
