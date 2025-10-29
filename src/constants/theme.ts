import { Colors } from './colors';
import { Typography } from './typography';
import { Spacing, Sizing } from './spacing';

/**
 * Complete theme system combining all design tokens
 */
export const Theme = {
  colors: Colors,
  typography: Typography,
  spacing: Spacing,
  sizing: Sizing,
} as const;

export type ThemeType = typeof Theme;