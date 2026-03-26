/**
 * Auth Service — all authentication-related API calls.
 *
 * Called by Redux thunks or directly from components.
 * Keeps API contract details out of UI code.
 */
import { apiClient } from './apiClient';

const AuthService = {
  /**
   * Authenticate an existing user.
   * @param {{ email: string, password: string }} credentials
   * @returns {Promise<{ token: string, user: object }>}
   */
  login: (credentials) => apiClient.post('/auth/login', credentials),

  /**
   * Create a new user account and trigger OTP email.
   * @param {{ name: string, email: string, password: string }} payload
   * @returns {Promise<{ message: string }>}
   */
  register: (payload) => apiClient.post('/auth/register', payload),

  /**
   * Verify the 6-digit OTP sent to the user's email.
   * @param {{ email: string, otp: string }} payload
   * @returns {Promise<{ token: string, user: object }>}
   */
  verifyOtp: (payload) => apiClient.post('/auth/verify-otp', payload),

  /**
   * Resend the OTP to the registered email.
   * @param {{ email: string }} payload
   * @returns {Promise<{ message: string }>}
   */
  resendOtp: (payload) => apiClient.post('/auth/resend-otp', payload),

  /**
   * Invalidate the current session server-side.
   * @returns {Promise<{ message: string }>}
   */
  logout: () => apiClient.post('/auth/logout'),

  /**
   * Fetch the currently authenticated user's profile.
   * @returns {Promise<{ user: object }>}
   */
  me: () => apiClient.get('/auth/me'),
};

export default AuthService;
