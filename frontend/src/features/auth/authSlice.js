import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance, { setAccessToken } from "../../config/axiosInstance";
import { getErrorMessage } from "../../utils/getErrorMessage";

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/auth/register", formData);
      return data.user;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Registration failed"));
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/auth/login", { email, password });
      setAccessToken(data.accessToken);
      return { user: data.user, accessToken: data.accessToken };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Login failed"));
    }
  }
);

// Runs once when the app loads: tries to silently restore a session using
// the httpOnly refresh cookie (no error is shown if this fails - it just
// means the visitor is a guest).
export const bootstrapAuth = createAsyncThunk("auth/bootstrapAuth", async (_, { rejectWithValue }) => {
  try {
    const refreshRes = await axiosInstance.post("/auth/refresh-token");
    setAccessToken(refreshRes.data.accessToken);

    const meRes = await axiosInstance.get("/auth/me");
    return { user: meRes.data.user, accessToken: refreshRes.data.accessToken };
  } catch {
    setAccessToken(null);
    return rejectWithValue(null);
  }
});

export const logoutUser = createAsyncThunk("auth/logoutUser", async (_, { rejectWithValue }) => {
  try {
    await axiosInstance.post("/auth/logout");
    setAccessToken(null);
    return true;
  } catch (error) {
    setAccessToken(null);
    return rejectWithValue(getErrorMessage(error, "Logout failed"));
  }
});

const initialState = {
  user: null,
  accessToken: null,
  status: "idle", // idle | loading | succeeded | failed
  error: null,
  initialized: false, // becomes true once bootstrapAuth has settled
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Called by axiosInstance's interceptor (via main.jsx) when it silently
    // refreshes or invalidates the token outside of a normal thunk.
    tokenRefreshed: (state, action) => {
      state.accessToken = action.payload;
      if (!action.payload) {
        state.user = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.initialized = true;
      })
      .addCase(bootstrapAuth.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.initialized = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.status = "idle";
      })
      .addCase(logoutUser.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
      });
  },
});

export const { tokenRefreshed } = authSlice.actions;
export default authSlice.reducer;
