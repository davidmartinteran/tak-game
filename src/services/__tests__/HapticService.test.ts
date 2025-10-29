import { HapticService } from '../HapticService';
import * as Haptics from 'expo-haptics';

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  selectionAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

describe('HapticService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    HapticService.setEnabled(true);
  });

  describe('Basic Functionality', () => {
    it('should provide stone placement haptic feedback', async () => {
      await HapticService.stonePlacement();
      expect(Haptics.impactAsync).toHaveBeenCalledWith('medium');
    });

    it('should provide stone selection haptic feedback', async () => {
      await HapticService.stoneSelection();
      expect(Haptics.selectionAsync).toHaveBeenCalled();
    });

    it('should provide stack movement haptic feedback', async () => {
      await HapticService.stackMovement();
      expect(Haptics.impactAsync).toHaveBeenCalledWith('heavy');
    });

    it('should provide invalid move haptic feedback', async () => {
      await HapticService.invalidMove();
      expect(Haptics.notificationAsync).toHaveBeenCalledWith('error');
    });

    it('should provide victory haptic feedback', async () => {
      await HapticService.victory();
      expect(Haptics.notificationAsync).toHaveBeenCalledWith('success');
    });

    it('should provide button press haptic feedback', async () => {
      await HapticService.buttonPress();
      expect(Haptics.impactAsync).toHaveBeenCalledWith('light');
    });

    it('should provide long press haptic feedback', async () => {
      await HapticService.longPress();
      expect(Haptics.impactAsync).toHaveBeenCalledWith('heavy');
    });
  });

  describe('Settings Control', () => {
    it('should respect enabled/disabled state', async () => {
      // Disable haptic feedback
      HapticService.setEnabled(false);
      
      await HapticService.stonePlacement();
      expect(Haptics.impactAsync).not.toHaveBeenCalled();

      // Re-enable haptic feedback
      HapticService.setEnabled(true);
      
      await HapticService.stonePlacement();
      expect(Haptics.impactAsync).toHaveBeenCalledWith('medium');
    });

    it('should check enabled state correctly', () => {
      expect(HapticService.isEnabled()).toBe(true);
      
      HapticService.setEnabled(false);
      expect(HapticService.isEnabled()).toBe(false);
      
      HapticService.setEnabled(true);
      expect(HapticService.isEnabled()).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle haptic feedback errors gracefully', async () => {
      // Mock haptic failure
      (Haptics.impactAsync as jest.Mock).mockRejectedValueOnce(new Error('Haptic failed'));
      
      // Should not throw error
      await expect(HapticService.stonePlacement()).resolves.toBeUndefined();
    });

    it('should handle selection feedback errors gracefully', async () => {
      // Mock haptic failure
      (Haptics.selectionAsync as jest.Mock).mockRejectedValueOnce(new Error('Selection failed'));
      
      // Should not throw error
      await expect(HapticService.stoneSelection()).resolves.toBeUndefined();
    });

    it('should handle notification feedback errors gracefully', async () => {
      // Mock haptic failure
      (Haptics.notificationAsync as jest.Mock).mockRejectedValueOnce(new Error('Notification failed'));
      
      // Should not throw error
      await expect(HapticService.victory()).resolves.toBeUndefined();
    });
  });

  describe('Generic Feedback', () => {
    it('should provide generic feedback for different types', async () => {
      await HapticService.feedback('light');
      expect(Haptics.impactAsync).toHaveBeenCalledWith('light');

      await HapticService.feedback('medium');
      expect(Haptics.impactAsync).toHaveBeenCalledWith('medium');

      await HapticService.feedback('heavy');
      expect(Haptics.impactAsync).toHaveBeenCalledWith('heavy');

      await HapticService.feedback('selection');
      expect(Haptics.selectionAsync).toHaveBeenCalled();

      await HapticService.feedback('success');
      expect(Haptics.notificationAsync).toHaveBeenCalledWith('success');

      await HapticService.feedback('warning');
      expect(Haptics.notificationAsync).toHaveBeenCalledWith('warning');

      await HapticService.feedback('error');
      expect(Haptics.notificationAsync).toHaveBeenCalledWith('error');
    });
  });

  describe('Special Patterns', () => {
    it('should provide wall flattening haptic feedback with double tap pattern', async () => {
      jest.clearAllMocks();

      await HapticService.wallFlattening();

      // First impact should be called immediately
      expect(Haptics.impactAsync).toHaveBeenCalledWith('medium');

      // Wait a bit for the delayed second impact
      await new Promise(resolve => setTimeout(resolve, 150));

      // Second impact should be called after delay
      expect(Haptics.impactAsync).toHaveBeenCalledWith('light');

      // Verify both types were called (medium first, then light)
      const calls = (Haptics.impactAsync as jest.Mock).mock.calls;
      expect(calls).toContainEqual(['medium']);
      expect(calls).toContainEqual(['light']);
    });

    it('should provide victory haptic feedback with double impact pattern', async () => {
      await HapticService.victory();

      // First notification should be called immediately
      expect(Haptics.notificationAsync).toHaveBeenCalledWith('success');

      // Wait a bit for the delayed second impact
      await new Promise(resolve => setTimeout(resolve, 250));

      // Second impact should be called after delay
      expect(Haptics.impactAsync).toHaveBeenCalledWith('heavy');
    });
  });
});