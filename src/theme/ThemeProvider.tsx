import { createContext, useContext, useMemo, type PropsWithChildren } from 'react';
import { useColorScheme } from 'react-native';

import { darkPalette, lightPalette, type Palette } from './colors';

export interface AppTheme {
  dark: boolean;
  colors: Palette;
}

const ThemeContext = createContext<AppTheme>({ dark: false, colors: lightPalette });

export function ThemeProvider({ children }: PropsWithChildren) {
  const scheme = useColorScheme();
  const value = useMemo<AppTheme>(() => {
    const dark = scheme === 'dark';
    return { dark, colors: dark ? darkPalette : lightPalette };
  }, [scheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): AppTheme {
  return useContext(ThemeContext);
}
