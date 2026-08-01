import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AuthService from '../../services/authService';

const coerceBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }
  if (typeof value === 'number') {
    if (value === 1) return true;
    if (value === 0) return false;
  }
  return null;
};

const deriveProfileComplete = (user) => {
  if (!user) return false;

  const isProfileComplete = coerceBoolean(
    user.isProfileComplete ?? user.profileComplete ?? user.is_profile_complete
  );
  if (isProfileComplete !== null) return isProfileComplete;

  const isNewUser = coerceBoolean(
    user.isNewUser ?? user.is_new_user ?? user.newUser
  );
  if (isNewUser !== null) return !isNewUser;

  // If backend omits explicit flags, default existing users to complete
  // to avoid incorrectly forcing onboarding.
  return true;
};

const deriveEmailVerified = (user) => {
  if (!user) return false;

  const isEmailVerified = coerceBoolean(
    user.isEmailVerified ?? user.emailVerified ?? user.email_verified
  );
  if (isEmailVerified !== null) return isEmailVerified;

  return true;
};

const normalizeAuthError = (err, fallbackMessage) => ({
  message: err?.response?.data?.message || err?.message || fallbackMessage,
  status: err?.response?.status || null,
});

export const loginUser = createAsyncThunk('auth/loginUser', async (credentials, { rejectWithValue }) => {
  try {
    const data = await AuthService.login(credentials);
    localStorage.setItem('portify-token', data.token);
    return data.user;
  } catch (err) {
    return rejectWithValue(normalizeAuthError(err, 'Login failed'));
  }
});

export const verifyOtpCode = createAsyncThunk('auth/verifyOtp', async (payload, { rejectWithValue }) => {
  try {
    const data = await AuthService.verifyOtp(payload);
    localStorage.setItem('portify-token', data.token);
    return data.user;
  } catch (err) {
    return rejectWithValue(normalizeAuthError(err, 'OTP verification failed'));
  }
});

export const registerUser = createAsyncThunk('auth/registerUser', async (payload, { rejectWithValue }) => {
  try {
    const data = await AuthService.register(payload);
    return data;
  } catch (err) {
    return rejectWithValue(normalizeAuthError(err, 'Registration failed'));
  }
});

export const resendOtpCode = createAsyncThunk('auth/resendOtp', async (payload, { rejectWithValue }) => {
  try {
    const data = await AuthService.resendOtp(payload);
    return data;
  } catch (err) {
    return rejectWithValue(normalizeAuthError(err, 'Failed to resend OTP'));
  }
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
  isProfileComplete: false,
  onboardingStep: 1,
  isEmailVerified: true,
  loading: false,
  error: null,
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
      state.isProfileComplete = false;
      state.onboardingStep = 1;
      state.isEmailVerified = true;
    },
    finishOnboarding: (state) => {
      state.isNewUser = false;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isProfileComplete = deriveProfileComplete(action.payload);
      state.isEmailVerified = deriveEmailVerified(action.payload);
      state.isNewUser = !!action.payload?.isNewUser;
    },
    setOnboardingStatus: (state, action) => {
      const { isProfileComplete, onboardingStep } = action.payload || {};
      if (typeof isProfileComplete === 'boolean') {
        state.isProfileComplete = isProfileComplete;
      }
      if (typeof onboardingStep === 'number' && onboardingStep > 0) {
        state.onboardingStep = onboardingStep;
      }
    },
    clearAuthError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // loginUser
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isNewUser = !!action.payload?.isNewUser;
        state.isProfileComplete = deriveProfileComplete(action.payload);
        state.isEmailVerified = deriveEmailVerified(action.payload);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Login failed', status: null };
      })
      // verifyOtpCode
      .addCase(verifyOtpCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtpCode.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isNewUser = action.payload.isNewUser !== undefined ? action.payload.isNewUser : true;
        state.isProfileComplete = deriveProfileComplete(action.payload);
        state.isEmailVerified = true;
      })
      .addCase(verifyOtpCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'OTP verification failed', status: null };
      })
      // fetchUserThunk
      .addCase(fetchUserThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isProfileComplete = deriveProfileComplete(action.payload);
        state.isEmailVerified = deriveEmailVerified(action.payload);
        state.isNewUser = !!action.payload?.isNewUser;
      })
      .addCase(fetchUserThunk.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.isProfileComplete = false;
        state.onboardingStep = 1;
        state.isEmailVerified = true;
        localStorage.removeItem('portify-token');
      })
      // registerUser
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Registration failed', status: null };
      })
      // resendOtpCode
      .addCase(resendOtpCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendOtpCode.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resendOtpCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Failed to resend OTP', status: null };
      });
  }
});

export const { logout, finishOnboarding, setUser, setOnboardingStatus, clearAuthError } = authSlice.actions;

export default authSlice.reducer;
