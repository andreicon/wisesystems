import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiRequest, ApiError } from "../api/client";
import { clearStoredToken, getStoredToken, storeToken } from "../api/storage";
import type { AuthResponse, User } from "../types";

type AuthState = {
  user: User | null;
  token: string | null;
  status: "idle" | "loading" | "authenticated" | "error";
  error: string | null;
};

type RegisterPayload = {
  email: string;
  fname: string;
  lname: string;
  password: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

const initialState: AuthState = {
  user: null,
  token: getStoredToken(),
  status: "idle",
  error: null,
};

export const registerUser = createAsyncThunk<AuthResponse, RegisterPayload, { rejectValue: string }>(
  "auth/register",
  async (payload, { rejectWithValue }) => {
    try {
      return await apiRequest<AuthResponse>("/api/auth/register", {
        method: "POST",
        body: payload,
      });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Failed to register";
      return rejectWithValue(message);
    }
  },
);

export const loginUser = createAsyncThunk<AuthResponse, LoginPayload, { rejectValue: string }>(
  "auth/login",
  async (payload, { rejectWithValue }) => {
    try {
      return await apiRequest<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: payload,
      });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Failed to login";
      return rejectWithValue(message);
    }
  },
);

export const fetchMe = createAsyncThunk<{ user: User }, void, { state: { auth: AuthState }; rejectValue: string }>(
  "auth/me",
  async (_, { getState, rejectWithValue }) => {
    const token = getState().auth.token;

    if (!token) {
      return rejectWithValue("No auth token");
    }

    try {
      return await apiRequest<{ user: User }>("/api/auth/me", {
        token,
      });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Failed to fetch user";
      return rejectWithValue(message);
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.status = "idle";
      state.error = null;
      clearStoredToken();
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = "authenticated";
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
        storeToken(action.payload.token);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload ?? "Registration failed";
      })
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "authenticated";
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
        storeToken(action.payload.token);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload ?? "Login failed";
      })
      .addCase(fetchMe.pending, (state) => {
        if (state.token) {
          state.status = "loading";
        }
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.status = "authenticated";
        state.error = null;
      })
      .addCase(fetchMe.rejected, (state, action) => {
        state.user = null;
        state.status = state.token ? "error" : "idle";
        state.error = action.payload ?? "Failed to restore session";

        if (state.token) {
          state.token = null;
          clearStoredToken();
        }
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
