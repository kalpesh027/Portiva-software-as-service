/**
 * Barrel export for the auth feature.
 * Consumers import from this file — not directly from authSlice.js —
 * so the internal file structure can change without touching every page.
 *
 * Usage:
 *   import { loginUser as login, logout } from '@/features/auth';
 */
export { loginUser as login, logout, finishOnboarding } from './authSlice';
export { default } from './authSlice';
