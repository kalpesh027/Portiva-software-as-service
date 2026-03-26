/**
 * useStoredTheme — reads the persisted dark-mode preference from localStorage
 * and reacts to cross-tab changes.
 *
 * This is the single canonical hook used by all auth pages, form steps,
 * and standalone screens. Components that receive `dark` as a prop
 * (e.g. Landing sections) should continue to use props instead.
 *
 * Usage:
 *   const dark = useStoredTheme();
 */
import { useState, useEffect } from 'react';

export function useStoredTheme() {
  const [dark, setDark] = useState(() => {
    try {
      const stored = localStorage.getItem('portify-theme');
      if (stored === 'dark')  return true;
      if (stored === 'light') return false;
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'portify-theme') {
        setDark(e.newValue === 'dark');
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return dark;
}
