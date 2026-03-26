/**
 * Application-level configuration.
 * Change values here — never scatter magic strings throughout components.
 */
const appConfig = {
  /** Brand name displayed in the UI. */
  appName: 'Portiva',

  /** localStorage key for persisting theme preference. */
  themeStorageKey: 'portiva-theme',

  /** Base URL for the backend API.
   *  Override with VITE_API_URL in .env files for different environments. */
  apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',

  /** Default locale / currency for billing display. */
  locale: 'en-US',
  currency: 'USD',
};

export default appConfig;
