import { createContext, useContext, useState, type ReactNode } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';

type Scheme = 'light' | 'dark';

type ThemePreference = {
  scheme: Scheme;
  toggleScheme: () => void;
};

const ThemePreferenceContext = createContext<ThemePreference | null>(null);

/**
 * Follows the system color scheme until the user picks one with `toggleScheme`.
 */
export function ThemePreferenceProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreference] = useState<Scheme | null>(null);
  const scheme: Scheme = preference ?? (systemScheme === 'dark' ? 'dark' : 'light');

  const toggleScheme = () => setPreference(scheme === 'dark' ? 'light' : 'dark');

  return (
    <ThemePreferenceContext.Provider value={{ scheme, toggleScheme }}>
      {children}
    </ThemePreferenceContext.Provider>
  );
}

export function useThemePreference() {
  const context = useContext(ThemePreferenceContext);
  if (!context) {
    throw new Error('useThemePreference must be used within a ThemePreferenceProvider');
  }
  return context;
}
