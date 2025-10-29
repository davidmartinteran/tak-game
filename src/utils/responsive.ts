import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Responsive utilities for scaling UI elements
 */

// Base dimensions (iPhone 12 Pro as reference)
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

/**
 * Scale a value based on screen width
 */
export const scaleWidth = (size: number): number => {
  return PixelRatio.roundToNearestPixel((SCREEN_WIDTH / BASE_WIDTH) * size);
};

/**
 * Scale a value based on screen height
 */
export const scaleHeight = (size: number): number => {
  return PixelRatio.roundToNearestPixel((SCREEN_HEIGHT / BASE_HEIGHT) * size);
};

/**
 * Scale font size with moderate scaling to maintain readability
 */
export const scaleFontSize = (size: number): number => {
  const scale = Math.min(SCREEN_WIDTH / BASE_WIDTH, 1.2); // Cap at 1.2x
  return Math.round(PixelRatio.roundToNearestPixel(size * scale));
};

/**
 * Get responsive spacing based on screen size
 */
export const getResponsiveSpacing = (baseSpacing: number): number => {
  return scaleWidth(baseSpacing);
};

/**
 * Check if device is tablet (width > 768)
 */
export const isTablet = (): boolean => {
  return SCREEN_WIDTH >= 768;
};

/**
 * Get screen dimensions
 */
export const getScreenDimensions = () => ({
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
});

/**
 * Calculate board size based on screen dimensions
 */
export const calculateBoardSize = (): number => {
  const minDimension = Math.min(SCREEN_WIDTH, SCREEN_HEIGHT);
  const padding = 64; // Increased padding to account for borders and container padding
  return minDimension - padding;
};