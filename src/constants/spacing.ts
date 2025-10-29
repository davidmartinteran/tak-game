/**
 * Spacing system for consistent layout
 */

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export type SpacingKey = keyof typeof Spacing;

/**
 * Sizing utilities for responsive design
 */
export const Sizing = {
  // Touch targets
  touchTarget: 44,
  minTouchTarget: 32,
  
  // Common sizes
  iconSmall: 16,
  iconMedium: 24,
  iconLarge: 32,
  
  // Border radius
  radiusSmall: 4,
  radiusMedium: 8,
  radiusLarge: 12,
  radiusRound: 999,
  
  // Border widths
  borderThin: 1,
  borderMedium: 2,
  borderThick: 3,
} as const;

export type SizingKey = keyof typeof Sizing;