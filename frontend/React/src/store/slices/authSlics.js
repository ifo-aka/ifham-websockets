import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import login , signup , refresh  api from DBUtils
import {
  login as dbLogin,
  signup as dbSignup,
  refreshToken as dbRefreshToken,
} from "../../utils/DBUtils";

// ====================== Async Thunks ======================

export const signupThunk = createAsyncThunk(
  "api/auth/signup",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await dbSignup(userData);
      if (!response.success) {
        return rejectWithValue(response);
      }
      return response;
    } catch (error) {
      return rejectWithValue("Network error or server is unreachable.");
    }
  }
);

export const loginThunk = createAsyncThunk(
  "api/auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const resp = await dbLogin(credentials);
      if (!resp.success) {
        return rejectWithValue(resp);
      }
      return resp;
    } catch (error) {
      return rejectWithValue("Network error or server is unreachable.");
    }
  }
);

export const refreshTokenThunk = createAsyncThunk(
  "api/auth/refresh",
  async (_, { rejectWithValue }) => {
    try {
      const response = await dbRefreshToken();
      if (!response.success) {
        return rejectWithValue(response);
      }
      return response;
    } catch (error) {
      return rejectWithValue("Network error or server is unreachable.");
    }
  }
);

// ====================== Slice ======================

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: localStorage.getItem("token") || null,
    isAuthenticated: !!localStorage.getItem("token"),
    authChecked: !!localStorage.getItem("token"),
    showSpinner: false,
    userObject: {
      id: "",
      username: "",
      email: "",
    },
  },
  reducers: {
    logout: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      state.authChecked = false;
      state.userObject = { id: null, username: null, email: null };
      localStorage.removeItem("token");
    },
    setShowSpinner: (state, action) => {
      state.showSpinner = !!action.payload;
    },
    setAuthentication: (state, action) => {
      state.isAuthenticated = !!action.payload;
    },
    setAuthChecked: (state, action) => {
      state.authChecked = !!action.payload;
    },
    setUserObject: (state, action) => {
      state.userObject = { ...state.userObject, ...action.payload };
    },
    setToken: (state, action) => {
      state.token = action.payload;
      state.isAuthenticated = !!action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(loginThunk.fulfilled, (state, action) => {
        const { id, username, email, token } = action.payload.data;
        state.token = token;
        state.isAuthenticated = true;
        state.authChecked = true;
        state.userObject = { id, username, email };
        localStorage.setItem("token", token);
        state.showSpinner = false;
      })
      .addCase(loginThunk.rejected, (state) => {
        state.token = null;
        state.isAuthenticated = false;
        state.authChecked = false;
        state.userObject = { id: null, username: null, email: null };
        localStorage.removeItem("token");
        state.showSpinner = false;
      })
      .addCase(loginThunk.pending, (state) => {
        state.showSpinner = true;
      })

      // SIGNUP
      .addCase(signupThunk.fulfilled, (state, action) => {
        const { id, username, email, token } = action.payload.data;
        state.token = token;
        state.isAuthenticated = true;
        state.authChecked = true;
        state.userObject = { id, username, email };
        localStorage.setItem("token", token);
        state.showSpinner = false;
      })
      .addCase(signupThunk.rejected, (state) => {
        state.token = null;
        state.isAuthenticated = false;
        state.authChecked = false;
        state.userObject = { id: null, username: null, email: null };
        localStorage.removeItem("token");
        state.showSpinner = false;
      })
      .addCase(signupThunk.pending, (state) => {
        state.showSpinner = true;
      })

      // REFRESH TOKEN
      .addCase(refreshTokenThunk.fulfilled, (state, action) => {
        const { id, username, email, token } = action.payload.data;
        state.token = token;
        state.isAuthenticated = true;
        state.authChecked = true;
        state.userObject = { id, username, email };
        localStorage.setItem("token", token);
        state.showSpinner = false;
      })
      .addCase(refreshTokenThunk.rejected, (state) => {
        state.token = null;
        state.isAuthenticated = false;
        state.authChecked = false;
        state.userObject = { id: null, username: null, email: null };
        localStorage.removeItem("token");
        state.showSpinner = false;
      })
      .addCase(refreshTokenThunk.pending, (state) => {
        state.showSpinner = true;
      });
  },
});

export default authSlice.reducer;
export const {
  logout,
  setShowSpinner,
  setAuthChecked,
  setUserObject,
  setToken,
  setAuthentication,
} = authSlice.actions;
