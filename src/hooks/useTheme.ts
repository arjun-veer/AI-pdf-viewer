import { useEffect, useMemo } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';

function getResolvedTheme(theme: 'light' | 'dark' | 'system'): 'light' | 'dark' {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme;
}

export function useTheme() {
  const { theme, setTheme } = useSettingsStore();
  const resolvedTheme = useMemo(() => getResolvedTheme(theme), [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      const root = window.document.documentElement;
      const newTheme = mediaQuery.matches ? 'dark' : 'light';
      root.classList.remove('light', 'dark');
      root.classList.add(newTheme);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme]);

  return {
    theme,
    resolvedTheme,
    setTheme,
    isDark: resolvedTheme === 'dark',
  };
}
