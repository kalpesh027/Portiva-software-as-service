/**
 * Application route paths — single source of truth for all route strings.
 *
 * Usage:
 *   import { ROUTES } from '@/constants/routes';
 *   navigate(ROUTES.DASHBOARD);
 */
export const ROUTES = {
  HOME:               '/',
  LOGIN:              '/login',
  REGISTER:           '/register',
  VERIFY_OTP:         '/verify-otp',
  CREATE_PORTFOLIO:   '/create',
  AI_PROCESSING:      '/ai-processing',
  PORTFOLIO_SUCCESS:  '/portfolio-success',
  PORTFOLIO_PREVIEW:  '/portfolio-dummy',
  DASHBOARD:          '/dashboard',
};

/** Routes that should hide the main Navbar or auth controls. */
export const AUTH_ROUTES = [
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.VERIFY_OTP,
  ROUTES.CREATE_PORTFOLIO,
];
