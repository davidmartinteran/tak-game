/**
 * Color palette for the Tak mobile game
 * Following the design system specifications
 */

export const Colors = {
  // Player colors
  player1: '#2E86AB',      // Blue
  player2: '#A23B72',      // Magenta
  
  // Board colors
  boardLight: '#F18F01',   // Light wood
  boardDark: '#C73E1D',    // Dark wood
  
  // UI colors
  background: '#1A1A1A',   // Dark background
  surface: '#2D2D2D',      // Card surfaces
  accent: '#FFD23F',       // Gold accent
  text: '#FFFFFF',         // White text
  textSecondary: '#B0B0B0', // Gray text
  
  // State colors
  highlight: '#4ECDC4',    // Teal for highlights
  warning: '#FF6B6B',      // Red for warnings
  success: '#51CF66',      // Green for success
  
  // Additional UI colors
  border: '#404040',       // Border color
  disabled: '#666666',     // Disabled state
  overlay: 'rgba(0, 0, 0, 0.5)', // Modal overlay
} as const;

export type ColorKey = keyof typeof Colors;