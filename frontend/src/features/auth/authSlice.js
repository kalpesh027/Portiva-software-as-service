import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AuthService from '../../services/authService';

export const loginUser = createAsyncThunk('auth/loginUser', async (credentials) => {
  const data = await AuthService.login(credentials);
  localStorage.setItem('portify-token', data.token);
  return data.user;
});

export const verifyOtpCode = createAsyncThunk('auth/verifyOtp', async (payload) => {
  const data = await AuthService.verifyOtp(payload);
  localStorage.setItem('portify-token', data.token);
  return data.user;
});

export const fetchUserThunk = createAsyncThunk('auth/fetchUser', async (_, { rejectWithValue }) => {
  try {
    const data = await AuthService.me();
    return data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const initialState = {
  user: null,
  isAuthenticated: !!localStorage.getItem('portify-token'),
  isNewUser: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('portify-token');
      state.user = null;
      state.isAuthenticated = false;
      state.isNewUser = false;
    },
    finishOnboarding: (state) => {
      state.isNewUser = false;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isNewUser = false;
      })
      .addCase(verifyOtpCode.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isNewUser = action.payload.isNewUser !== undefined ? action.payload.isNewUser : true;
      })
      .addCase(fetchUserThunk.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchUserThunk.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        localStorage.removeItem('portify-token');
      });
  }
});

export const { logout, finishOnboarding, setUser } = authSlice.actions;

export default authSlice.reducer;
