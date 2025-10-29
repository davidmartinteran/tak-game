import * as Haptics from 'expo-haptics';

export type HapticFeedbackType = 
  | 'light'
  | 'medium' 
  | 'heavy'
  | 'selection'
  | 'success'
  | 'warning'
  | 'error';

/**
 * Service for providing haptic feedback throughout the game
 * Provides consistent haptic patterns for different game actions
 */
export class HapticService {
  private static enabled = true;

  /**
   * Enable or disable haptic feedback globally
   */
  static setEnabled(enabled: boolean): void {
    HapticService.enabled = enabled;
  }

  /**
   * Check if haptic feedback is enabled
   */
  static isEnabled(): boolean {
    // In test environment, just return the enabled state
    if (typeof jest !== 'undefined') {
      return HapticService.enabled;
    }
    
    // In real environment, check platform
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Platform } = require('react-native');
      return HapticService.enabled && Platform.OS !== 'web';
    } catch {
      return HapticService.enabled;
    }
  }

  /**
   * Provide haptic feedback for stone placement
   */
  static async stonePlacement(): Promise<void> {
    if (!HapticService.isEnabled()) return;
    
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  /**
   * Provide haptic feedback for stone selection
   */
  static async stoneSelection(): Promise<void> {
    if (!HapticService.isEnabled()) return;
    
    try {
      await Haptics.selectionAsync();
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  /**
   * Provide haptic feedback for stack movement
   */
  static async stackMovement(): Promise<void> {
    if (!HapticService.isEnabled()) return;
    
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  /**
   * Provide haptic feedback for invalid moves
   */
  static async invalidMove(): Promise<void> {
    if (!HapticService.isEnabled()) return;
    
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  /**
   * Provide haptic feedback for successful moves
   */
  static async successfulMove(): Promise<void> {
    if (!HapticService.isEnabled()) return;
    
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  /**
   * Provide haptic feedback for victory
   */
  static async victory(): Promise<void> {
    if (!HapticService.isEnabled()) return;
    
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Add a second impact for emphasis
      setTimeout(async () => {
        try {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        } catch (error) {
          console.warn('Secondary haptic feedback failed:', error);
        }
      }, 200);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  /**
   * Provide haptic feedback for wall flattening
   */
  static async wallFlattening(): Promise<void> {
    if (!HapticService.isEnabled()) return;
    
    try {
      // Double tap pattern for wall flattening
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setTimeout(async () => {
        try {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (error) {
          console.warn('Secondary haptic feedback failed:', error);
        }
      }, 100);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  /**
   * Provide haptic feedback for button presses
   */
  static async buttonPress(): Promise<void> {
    if (!HapticService.isEnabled()) return;
    
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  /**
   * Provide haptic feedback for long press actions
   */
  static async longPress(): Promise<void> {
    if (!HapticService.isEnabled()) return;
    
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  /**
   * Provide generic haptic feedback
   */
  static async feedback(type: HapticFeedbackType): Promise<void> {
    if (!HapticService.isEnabled()) return;

    try {
      switch (type) {
        case 'light':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'selection':
          await Haptics.selectionAsync();
          break;
        case 'success':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'warning':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'error':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        default:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }
}