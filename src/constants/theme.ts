/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://unistyl.es/), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#2F3437',
    background: '#FAF8F4',
    surface: '#FFFFFF',
    backgroundElement: '#F2EFE9',
    backgroundSelected: '#E7E3DB',
    textSecondary: '#8A8F94',
    accent: '#5A84A0',
    accentBackground: '#EDF3F7',
    success: '#4E8A69',
    successBackground: '#EEF6F1',
    error: '#B36A62',
    errorBackground: '#FAF0EE',
  },
  dark: {
    text: '#E8E6E1',
    background: '#141517',
    surface: '#1B1C1F',
    backgroundElement: '#222327',
    backgroundSelected: '#2E3034',
    textSecondary: '#9A9EA4',
    accent: '#8FB3CC',
    accentBackground: '#1C252C',
    success: '#7FBF9C',
    successBackground: '#18241D',
    error: '#D9928A',
    errorBackground: '#2A1D1B',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80, web: 96 }) ?? 0;
export const MaxContentWidth = 800;
