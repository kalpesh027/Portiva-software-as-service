import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({ dark: false, toggleDark: () => {} });

function getInitialDark() {
  try {
    const s = localStorage.getItem('portify-theme');
    if (s === 'dark') return true;
    if (s === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch {
    return false;
  }
}

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(getInitialDark);

  useEffect(() => {
    try {
      localStorage.setItem('portify-theme', dark ? 'dark' : 'light');
    } catch (e) {
      console.error('Failed to save theme preference:', e);
    }
  }, [dark]);

  const toggleDark = () => setDark((d) => !d);

  return (
    <ThemeContext.Provider value={{ dark, toggleDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
