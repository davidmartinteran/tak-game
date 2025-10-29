import React from 'react';
import { render } from '@testing-library/react-native';
import { Stone } from '../board/Stone';
import { StoneType, Player } from '../../../types';

// Mock the responsive utilities
jest.mock('../../../utils/responsive', () => ({
  scaleWidth: (size: number) => size,
  scaleHeight: (size: number) => size,
}));

describe('Stone Component', () => {
  const mockStone = {
    id: 'test-stone-1',
    type: StoneType.FLAT,
    owner: Player.PLAYER1,
  };

  describe('Flat Stone Rendering', () => {
    it('should render a flat stone with correct accessibility label', () => {
      const { getByLabelText } = render(
        <Stone
          stone={mockStone}
          stackIndex={0}
          isTopStone={true}
        />
      );

      expect(getByLabelText('player1 flat stone')).toBeTruthy();
    });

    it('should render flat stone with player1 color', () => {
      const { getByLabelText } = render(
        <Stone
          stone={mockStone}
          stackIndex={0}
          isTopStone={true}
        />
      );

      const stoneElement = getByLabelText('player1 flat stone');
      expect(stoneElement.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            backgroundColor: '#2E86AB', // Player1 color
          }),
        ])
      );
    });

    it('should render flat stone with player2 color', () => {
      const player2Stone = { ...mockStone, owner: Player.PLAYER2 };
      const { getByLabelText } = render(
        <Stone
          stone={player2Stone}
          stackIndex={0}
          isTopStone={true}
        />
      );

      const stoneElement = getByLabelText('player2 flat stone');
      expect(stoneElement.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            backgroundColor: '#A23B72', // Player2 color
          }),
        ])
      );
    });
  });

  describe('Wall Rendering', () => {
    it('should render a wall with correct accessibility label', () => {
      const wallStone = { ...mockStone, type: StoneType.WALL };
      const { getByLabelText } = render(
        <Stone
          stone={wallStone}
          stackIndex={0}
          isTopStone={true}
        />
      );

      expect(getByLabelText('player1 wall')).toBeTruthy();
    });

    it('should render wall with different dimensions than flat stone', () => {
      const wallStone = { ...mockStone, type: StoneType.WALL };
      const { getByLabelText } = render(
        <Stone
          stone={wallStone}
          stackIndex={0}
          isTopStone={true}
          size={40}
        />
      );

      const wallElement = getByLabelText('player1 wall');
      expect(wallElement.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            width: 34, // 40 * 0.85
            height: 34, // 40 * 0.85
          }),
        ])
      );
    });
  });

  describe('Capstone Rendering', () => {
    it('should render a capstone with correct accessibility label', () => {
      const capstoneStone = { ...mockStone, type: StoneType.CAPSTONE };
      const { getByLabelText } = render(
        <Stone
          stone={capstoneStone}
          stackIndex={0}
          isTopStone={true}
        />
      );

      expect(getByLabelText('player1 capstone')).toBeTruthy();
    });

    it('should render capstone with crown elements', () => {
      const capstoneStone = { ...mockStone, type: StoneType.CAPSTONE };
      const { getByLabelText } = render(
        <Stone
          stone={capstoneStone}
          stackIndex={0}
          isTopStone={true}
        />
      );

      const capstoneElement = getByLabelText('player1 capstone');
      expect(capstoneElement).toBeTruthy();
      
      // Check that capstone has the correct height
      expect(capstoneElement.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            height: 40, // Same as width for circular design
          }),
        ])
      );
    });
  });

  describe('Stacking Behavior', () => {
    it('should apply correct stack offset for stacked stones', () => {
      const { getByLabelText } = render(
        <Stone
          stone={mockStone}
          stackIndex={2}
          isTopStone={false}
        />
      );

      const stoneElement = getByLabelText('player1 flat stone');
      expect(stoneElement.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            bottom: 4, // stackIndex (2) * scaleHeight(2)
          }),
        ])
      );
    });

    it('should handle top stone correctly', () => {
      const { getByLabelText } = render(
        <Stone
          stone={mockStone}
          stackIndex={0}
          isTopStone={true}
        />
      );

      expect(getByLabelText('player1 flat stone')).toBeTruthy();
    });
  });

  describe('Animation States', () => {
    it('should render with placing animation state', () => {
      const { getByLabelText } = render(
        <Stone
          stone={mockStone}
          stackIndex={0}
          isTopStone={true}
          animationState="placing"
        />
      );

      // Component should render successfully with placing state
      expect(getByLabelText('player1 flat stone')).toBeTruthy();
    });

    it('should render with moving animation state', () => {
      const { getByLabelText } = render(
        <Stone
          stone={mockStone}
          stackIndex={0}
          isTopStone={true}
          animationState="moving"
        />
      );

      // Component should render successfully with moving state
      expect(getByLabelText('player1 flat stone')).toBeTruthy();
    });

    it('should render with idle state by default', () => {
      const { getByLabelText } = render(
        <Stone
          stone={mockStone}
          stackIndex={0}
          isTopStone={true}
        />
      );

      // Component should render successfully with default idle state
      expect(getByLabelText('player1 flat stone')).toBeTruthy();
    });
  });

  describe('Custom Size', () => {
    it('should use custom size when provided', () => {
      const customSize = 60;
      const { getByLabelText } = render(
        <Stone
          stone={mockStone}
          stackIndex={0}
          isTopStone={true}
          size={customSize}
        />
      );

      const stoneElement = getByLabelText('player1 flat stone');
      expect(stoneElement.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            width: customSize,
            height: customSize,
          }),
        ])
      );
    });

    it('should use default size when not provided', () => {
      const { getByLabelText } = render(
        <Stone
          stone={mockStone}
          stackIndex={0}
          isTopStone={true}
        />
      );

      const stoneElement = getByLabelText('player1 flat stone');
      expect(stoneElement.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            width: 40, // Default size
            height: 40,
          }),
        ])
      );
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility role', () => {
      const { getByLabelText } = render(
        <Stone
          stone={mockStone}
          stackIndex={0}
          isTopStone={true}
        />
      );

      const stoneElement = getByLabelText('player1 flat stone');
      expect(stoneElement.props.accessibilityRole).toBe('button');
    });

    it('should have different accessibility labels for different stone types', () => {
      const wallStone = { ...mockStone, type: StoneType.WALL };
      const capstoneStone = { ...mockStone, type: StoneType.CAPSTONE };

      const { getByLabelText: getWallLabel } = render(
        <Stone stone={wallStone} stackIndex={0} isTopStone={true} />
      );
      
      const { getByLabelText: getCapstoneLabel } = render(
        <Stone stone={capstoneStone} stackIndex={0} isTopStone={true} />
      );

      expect(getWallLabel('player1 wall')).toBeTruthy();
      expect(getCapstoneLabel('player1 capstone')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid stone type gracefully', () => {
      const invalidStone = { ...mockStone, type: 'invalid' as StoneType };
      
      // Should not throw and should default to flat stone
      expect(() => {
        render(
          <Stone
            stone={invalidStone}
            stackIndex={0}
            isTopStone={true}
          />
        );
      }).not.toThrow();
    });

    it('should handle negative stack index', () => {
      const { getByLabelText } = render(
        <Stone
          stone={mockStone}
          stackIndex={-1}
          isTopStone={true}
        />
      );

      const stoneElement = getByLabelText('player1 flat stone');
      expect(stoneElement.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            bottom: -2, // -1 * 2
          }),
        ])
      );
    });
  });
});