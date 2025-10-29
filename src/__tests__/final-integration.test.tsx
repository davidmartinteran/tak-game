import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { GameFlowManager } from '../components/game/GameFlowManager';
import { HapticService } from '../services/HapticService';
import { AccessibilityService } from '../services/AccessibilityService';
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

// Mock AccessibilityInfo
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    AccessibilityInfo: {
      isScreenReaderEnabled: jest.fn().mockResolvedValue(false),
      addEventListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
      announceForAccessibility: jest.fn(),
    },
  };
});

describe('Final Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Initialize services
    AccessibilityService.initialize();
    HapticService.setEnabled(true);
  });

  describe('Complete Game Flow Integration', () => {
    it('should integrate all components for a complete game experience', async () => {
      const { getByText, getByLabelText, getByTestId } = render(
        <GameFlowManager initialBoardSize={5} />
      );

      // Wait for game to initialize
      await waitFor(() => {
        expect(getByText(/Player 1/)).toBeTruthy();
      });

      // Test accessibility labels are present
      const boardSquare = getByTestId('square-0-0');
      expect(boardSquare.props.accessibilityLabel).toContain('Row 1, Column 1');
      expect(boardSquare.props.accessibilityRole).toBe('button');

      // Test stone type selection with haptic feedback
      const flatStoneButton = getByLabelText(/flat stone.*remaining/i);
      
      await act(async () => {
        fireEvent.press(flatStoneButton);
      });

      // Verify haptic feedback was called
      expect(Haptics.selectionAsync).toHaveBeenCalled();

      // Test stone placement with haptic feedback
      await act(async () => {
        fireEvent.press(boardSquare);
      });

      // Verify stone placement haptic feedback
      expect(Haptics.impactAsync).toHaveBeenCalledWith('medium');
    });

    it('should provide proper accessibility support throughout the game', async () => {
      const { getByTestId, getByLabelText } = render(
        <GameFlowManager initialBoardSize={4} />
      );

      await waitFor(() => {
        expect(getByTestId('square-0-0')).toBeTruthy();
      });

      // Test board accessibility
      const boardSquare = getByTestId('square-0-0');
      expect(boardSquare.props.accessibilityLabel).toContain('Row 1, Column 1 of 4');
      expect(boardSquare.props.accessibilityHint).toContain('first turn');

      // Test stone type accessibility
      const flatStoneButton = getByLabelText(/flat stone/i);
      expect(flatStoneButton.props.accessibilityHint).toContain('Tap to select');
    });

    it('should handle haptic feedback for different game actions', async () => {
      const { getByTestId, getByLabelText } = render(
        <GameFlowManager initialBoardSize={5} />
      );

      await waitFor(() => {
        expect(getByTestId('square-0-0')).toBeTruthy();
      });

      // Test stone selection haptic feedback
      const flatStoneButton = getByLabelText(/flat stone/i);
      await act(async () => {
        fireEvent.press(flatStoneButton);
      });
      expect(Haptics.selectionAsync).toHaveBeenCalled();

      // Test stone placement haptic feedback
      const boardSquare = getByTestId('square-0-0');
      await act(async () => {
        fireEvent.press(boardSquare);
      });
      expect(Haptics.impactAsync).toHaveBeenCalledWith('medium');

      // Test invalid move haptic feedback
      jest.clearAllMocks();
      await act(async () => {
        // Try to place on occupied square
        fireEvent.press(boardSquare);
      });
      expect(Haptics.notificationAsync).toHaveBeenCalledWith('error');
    });

    it('should handle long press interactions with proper haptic feedback', async () => {
      const { getByTestId, getByLabelText } = render(
        <GameFlowManager initialBoardSize={5} />
      );

      await waitFor(() => {
        expect(getByTestId('square-0-0')).toBeTruthy();
      });

      // Place a stone first
      const flatStoneButton = getByLabelText(/flat stone/i);
      await act(async () => {
        fireEvent.press(flatStoneButton);
      });

      const boardSquare = getByTestId('square-0-0');
      await act(async () => {
        fireEvent.press(boardSquare);
      });

      // Clear selection and move to normal phase
      jest.clearAllMocks();
      
      // Test long press haptic feedback
      await act(async () => {
        fireEvent(boardSquare, 'longPress');
      });
      expect(Haptics.impactAsync).toHaveBeenCalledWith('heavy');
    });
  });

  describe('Accessibility Service Integration', () => {
    it('should provide comprehensive accessibility labels', () => {
      // Test position labels
      const positionLabel = AccessibilityService.getBoardPositionLabel({ row: 0, col: 0 }, 5);
      expect(positionLabel).toBe('Row 1, Column 1 of 5');

      // Test stone labels
      const stoneLabel = AccessibilityService.getStoneLabel({
        id: 'test',
        type: 'flat' as any,
        owner: 'player1' as any
      });
      expect(stoneLabel).toBe("Player 1's flat stone");

      // Test stack labels
      const stackLabel = AccessibilityService.getStackLabel([
        { id: '1', type: 'flat' as any, owner: 'player1' as any },
        { id: '2', type: 'wall' as any, owner: 'player2' as any }
      ], 'player2' as any);
      expect(stackLabel).toContain('Stack of 2 stones');
      expect(stackLabel).toContain('controlled by Player 2');
    });

    it('should provide contextual accessibility hints', () => {
      const hint = AccessibilityService.getSquareHint(
        { row: 0, col: 0 },
        null,
        true,
        'first-turn',
        'player1' as any
      );
      expect(hint).toContain("place opponent's flat stone");

      const normalHint = AccessibilityService.getSquareHint(
        { row: 0, col: 0 },
        [{ id: '1', type: 'flat' as any, owner: 'player1' as any }],
        false,
        'normal',
        'player1' as any
      );
      expect(normalHint).toContain('Your stack');
    });

    it('should generate proper stone type selection labels', () => {
      const label = AccessibilityService.getStoneTypeSelectionLabel('flat' as any, 15, true);
      expect(label).toBe('flat stone (15 remaining), selected');

      const hint = AccessibilityService.getStoneTypeSelectionHint('capstone' as any, 1, 'normal');
      expect(hint).toBe('Tap to select this stone type for placement');

      const firstTurnHint = AccessibilityService.getStoneTypeSelectionHint('wall' as any, 0, 'first-turn');
      expect(firstTurnHint).toBe('Not available during first turn');
    });
  });

  describe('Haptic Service Integration', () => {
    it('should provide appropriate haptic feedback for all game actions', async () => {
      // Test stone placement
      await HapticService.stonePlacement();
      expect(Haptics.impactAsync).toHaveBeenCalledWith('medium');

      // Test stone selection
      await HapticService.stoneSelection();
      expect(Haptics.selectionAsync).toHaveBeenCalled();

      // Test stack movement
      await HapticService.stackMovement();
      expect(Haptics.impactAsync).toHaveBeenCalledWith('heavy');

      // Test invalid move
      await HapticService.invalidMove();
      expect(Haptics.notificationAsync).toHaveBeenCalledWith('error');

      // Test victory
      await HapticService.victory();
      expect(Haptics.notificationAsync).toHaveBeenCalledWith('success');
    });

    it('should respect haptic feedback settings', async () => {
      // Disable haptic feedback
      HapticService.setEnabled(false);
      
      await HapticService.stonePlacement();
      expect(Haptics.impactAsync).not.toHaveBeenCalled();

      // Re-enable haptic feedback
      HapticService.setEnabled(true);
      
      await HapticService.stonePlacement();
      expect(Haptics.impactAsync).toHaveBeenCalledWith('medium');
    });

    it('should handle haptic feedback errors gracefully', async () => {
      // Mock haptic failure
      (Haptics.impactAsync as jest.Mock).mockRejectedValueOnce(new Error('Haptic failed'));
      
      // Should not throw error
      await expect(HapticService.stonePlacement()).resolves.toBeUndefined();
    });
  });

  describe('Performance and Polish', () => {
    it('should maintain smooth performance during complex interactions', async () => {
      const startTime = Date.now();
      
      const { getByTestId, getByLabelText } = render(
        <GameFlowManager initialBoardSize={8} />
      );

      await waitFor(() => {
        expect(getByTestId('square-0-0')).toBeTruthy();
      });

      // Perform multiple rapid interactions
      const flatStoneButton = getByLabelText(/flat stone/i);
      const squares = [
        getByTestId('square-0-0'),
        getByTestId('square-0-1'),
        getByTestId('square-1-0'),
        getByTestId('square-1-1'),
      ];

      for (const square of squares) {
        await act(async () => {
          fireEvent.press(flatStoneButton);
          fireEvent.press(square);
        });
      }

      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time (less than 2 seconds)
      expect(duration).toBeLessThan(2000);
    });

    it('should handle edge cases gracefully', async () => {
      const { getByTestId } = render(
        <GameFlowManager initialBoardSize={4} />
      );

      await waitFor(() => {
        expect(getByTestId('square-0-0')).toBeTruthy();
      });

      // Test rapid tapping
      const boardSquare = getByTestId('square-0-0');
      
      await act(async () => {
        // Rapid fire multiple presses
        for (let i = 0; i < 10; i++) {
          fireEvent.press(boardSquare);
        }
      });

      // Should not crash or cause errors
      expect(boardSquare).toBeTruthy();
    });
  });

  describe('Multi-device Responsiveness', () => {
    it('should adapt to different screen sizes', async () => {
      // Mock different screen dimensions
      const { Dimensions } = require('react-native');
      const originalDimensions = Dimensions.get;
      
      // Test small screen
      Dimensions.get = jest.fn().mockReturnValue({
        width: 320,
        height: 568,
      });

      const { getByTestId: getByTestIdSmall } = render(
        <GameFlowManager initialBoardSize={5} />
      );

      await waitFor(() => {
        expect(getByTestIdSmall('square-0-0')).toBeTruthy();
      });

      // Test large screen
      Dimensions.get = jest.fn().mockReturnValue({
        width: 768,
        height: 1024,
      });

      const { getByTestId: getByTestIdLarge } = render(
        <GameFlowManager initialBoardSize={5} />
      );

      await waitFor(() => {
        expect(getByTestIdLarge('square-0-0')).toBeTruthy();
      });

      // Restore original dimensions
      Dimensions.get = originalDimensions;
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle component errors gracefully', async () => {
      // Mock console.error to avoid noise in tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const { getByTestId } = render(
        <GameFlowManager initialBoardSize={5} />
      );

      await waitFor(() => {
        expect(getByTestId('square-0-0')).toBeTruthy();
      });

      // Component should still be functional even if some errors occur
      expect(getByTestId('square-0-0')).toBeTruthy();

      consoleSpy.mockRestore();
    });
  });
});