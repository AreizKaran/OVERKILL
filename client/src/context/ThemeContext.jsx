import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);
const STORAGE_KEY = 'ecampus.theme';

const readStored = () => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

/**
 * First run: follow the theme the host page has stamped on <html>, if any,
 * so an embedded portal opens in the viewer's chosen theme rather than
 * always starting on "system".
 */
const initialTheme = () => {
  const stored = readStored();
  if (stored) return stored;
  const stamped = document.documentElement.dataset.theme;
  return stamped === 'dark' || stamped === 'light' ? stamped : 'system';
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(initialTheme);

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && media.matches);
      root.classList.toggle('dark', dark);
      root.style.colorScheme = dark ? 'dark' : 'light';
    };

    apply();
    media.addEventListener('change', apply);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore unavailable storage */
    }
    return () => media.removeEventListener('change', apply);
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((current) => {
      if (current === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'light' : 'dark';
      }
      return current === 'dark' ? 'light' : 'dark';
    });
  }, []);

  const isDark =
    theme === 'dark' ||
    (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const value = useMemo(() => ({ theme, setTheme, toggle, isDark }), [theme, toggle, isDark]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside <ThemeProvider>');
  return context;
}
