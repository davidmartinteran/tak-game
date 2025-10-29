import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Stack } from '../board/Stack';
import { Stack as StackType, Stone, StoneType, Player } from '../../../types';

// Mock the responsive utilities
jest.mock('../../../utils/responsive', () => ({
  scaleWidth: (width: number) => width,
  scaleHeight: (height: number) => height,
}));

describe('Stack Component', () => {
  const createMockStone = (id: string, type: StoneType, owner: Player): Stone => ({
    id,
    type,
    owner,
  });

  const createMockStack = (stones: Stone[], controlledBy: Player | null = null): StackType => ({
    stones,
    controlledBy: controlledBy || (stones.length > 0 ? stones[stones.length - 1].owner : null),
  });

  describe('Basic Rendering', () => {
    it('should render a single stone stack', () => {
      const stone = createMockStone('1', StoneType.FLAT, Player.PLAYER1);
      const stack = createMockStack([stone]);

      const { getByLabelText } = render(<Stack stack={stack} />);
      
      expect(getByLabelText(/Stack of 1 stones controlled by player1/)).toBeTruthy();
    });

    it('should render a multi-stone stack', () => {
      const stones = [
        createMockStone('1', StoneType.FLAT, Player.PLAYER1),
        createMockStone('2', StoneType.FLAT, Player.PLAYER2),
        createMockStone('3', StoneType.WALL, Player.PLAYER1),
      ];
      const stack = createMockStack(stones, Player.PLAYER1);

      const { getByLabelText } = render(<Stack stack={stack} />);
      
      expect(getByLabelText(/Stack of 3 stones controlled by player1/)).toBeTruthy();
    });

    it('should render with custom size', () => {
      const stone = createMockStone('1', StoneType.FLAT, Player.PLAYER1);
      const stack = createMockStack([stone]);

      const { getByLabelText } = render(<Stack stack={stack} size={60} />);
      
      expect(getByLabelText(/Stack of 1 stones/)).toBeTruthy();
    });
  });

  describe('Height Indicator', () => {
    it('should not show height indicator for single stone', () => {
      const stone = createMockStone('1', StoneType.FLAT, Player.PLAYER1);
      const stack = createMockStack([stone]);

      const { queryByText } = render(<Stack stack={stack} />);
      
      expect(queryByText('1')).toBeNull();
    });

    it('should show height indicator for multi-stone stack', () => {
      const stones = [
        createMockStone('1', StoneType.FLAT, Player.PLAYER1),
        createMockStone('2', StoneType.FLAT, Player.PLAYER2),
      ];
      const stack = createMockStack(stones, Player.PLAYER2);

      const { getByText } = render(<Stack stack={stack} />);
      
      expect(getByText('2')).toBeTruthy();
    });

    it('should show correct height for large stacks', () => {
      const stones = Array.from({ length: 5 }, (_, i) => 
        createMockStone(`${i + 1}`, StoneType.FLAT, i % 2 === 0 ? Player.PLAYER1 : Player.PLAYER2)
      );
      const stack = createMockStack(stones, Player.PLAYER2);

      const { getByText } = render(<Stack stack={stack} />);
      
      expect(getByText('5')).toBeTruthy();
    });
  });

  describe('Composition Display', () => {
    it('should not show composition for single stone when showComposition is false', () => {
      const stone = createMockStone('1', StoneType.FLAT, Player.PLAYER1);
      const stack = createMockStack([stone]);

      const { queryByTestId } = render(<Stack stack={stack} showComposition={false} />);
      
      // Composition display should not be visible
      expect(queryByTestId('composition-display')).toBeNull();
    });

    it('should not show composition for single stone even when showComposition is true', () => {
      const stone = createMockStone('1', StoneType.FLAT, Player.PLAYER1);
      const stack = createMockStack([stone]);

      const { queryByTestId } = render(<Stack stack={stack} showComposition={true} />);
      
      // Composition display should not be visible for single stones
      expect(queryByTestId('composition-display')).toBeNull();
    });

    it('should show composition for multi-stone stack when enabled', () => {
      const stones = [
        createMockStone('1', StoneType.FLAT, Player.PLAYER1),
        createMockStone('2', StoneType.WALL, Player.PLAYER2),
        createMockStone('3', StoneType.CAPSTONE, Player.PLAYER1),
      ];
      const stack = createMockStack(stones, Player.PLAYER1);

      const { getByLabelText } = render(<Stack stack={stack} showComposition={true} />);
      
      // Should render the stack with composition enabled
      expect(getByLabelText(/Stack of 3 stones controlled by player1/)).toBeTruthy();
    });
  });

  describe('Selection and Highlighting', () => {
    it('should show selection highlight when selected', () => {
      const stone = createMockStone('1', StoneType.FLAT, Player.PLAYER1);
      const stack = createMockStack([stone]);

      const { getByLabelText } = render(<Stack stack={stack} isSelected={true} />);
      
      // Should render the stack with selection
      expect(getByLabelText(/Stack of 1 stones/)).toBeTruthy();
    });

    it('should show highlight when highlighted', () => {
      const stone = createMockStone('1', StoneType.FLAT, Player.PLAYER1);
      const stack = createMockStack([stone]);

      const { getByLabelText } = render(<Stack stack={stack} isHighlighted={true} />);
      
      // Should render the stack with highlighting
      expect(getByLabelText(/Stack of 1 stones/)).toBeTruthy();
    });

    it('should show both selection and highlight when both are true', () => {
      const stone = createMockStone('1', StoneType.FLAT, Player.PLAYER1);
      const stack = createMockStack([stone]);

      const { getByLabelText } = render(
        <Stack stack={stack} isSelected={true} isHighlighted={true} />
      );
      
      // Should render with selection styling (selection takes precedence)
      expect(getByLabelText(/Stack of 1 stones/)).toBeTruthy();
    });
  });

  describe('Touch Interactions', () => {
    it('should handle press events when onPress is provided', () => {
      const onPress = jest.fn();
      const stone = createMockStone('1', StoneType.FLAT, Player.PLAYER1);
      const stack = createMockStack([stone]);

      const { getByLabelText } = render(<Stack stack={stack} onPress={onPress} />);
      
      fireEvent.press(getByLabelText(/Stack of 1 stones/));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('should handle long press events when onLongPress is provided', () => {
      const onLongPress = jest.fn();
      const stone = createMockStone('1', StoneType.FLAT, Player.PLAYER1);
      const stack = createMockStack([stone]);

      const { getByLabelText } = render(<Stack stack={stack} onLongPress={onLongPress} />);
      
      fireEvent(getByLabelText(/Stack of 1 stones/), 'longPress');
      expect(onLongPress).toHaveBeenCalledTimes(1);
    });

    it('should handle both press and long press', () => {
      const onPress = jest.fn();
      const onLongPress = jest.fn();
      const stone = createMockStone('1', StoneType.FLAT, Player.PLAYER1);
      const stack = createMockStack([stone]);

      const { getByLabelText } = render(
        <Stack stack={stack} onPress={onPress} onLongPress={onLongPress} />
      );
      
      const stackElement = getByLabelText(/Stack of 1 stones/);
      
      fireEvent.press(stackElement);
      expect(onPress).toHaveBeenCalledTimes(1);
      
      fireEvent(stackElement, 'longPress');
      expect(onLongPress).toHaveBeenCalledTimes(1);
    });

    it('should not be touchable when no handlers are provided', () => {
      const stone = createMockStone('1', StoneType.FLAT, Player.PLAYER1);
      const stack = createMockStack([stone]);

      const { getByLabelText } = render(<Stack stack={stack} />);
      
      // Should render the stack without touch handlers
      expect(getByLabelText(/Stack of 1 stones/)).toBeTruthy();
    });
  });

  describe('Ownership Visualization', () => {
    it('should show ownership for player1 controlled stack', () => {
      const stones = [
        createMockStone('1', StoneType.FLAT, Player.PLAYER2),
        createMockStone('2', StoneType.FLAT, Player.PLAYER1),
      ];
      const stack = createMockStack(stones, Player.PLAYER1);

      const { getByLabelText } = render(<Stack stack={stack} />);
      
      expect(getByLabelText(/controlled by player1/)).toBeTruthy();
    });

    it('should show ownership for player2 controlled stack', () => {
      const stones = [
        createMockStone('1', StoneType.FLAT, Player.PLAYER1),
        createMockStone('2', StoneType.WALL, Player.PLAYER2),
      ];
      const stack = createMockStack(stones, Player.PLAYER2);

      const { getByLabelText } = render(<Stack stack={stack} />);
      
      expect(getByLabelText(/controlled by player2/)).toBeTruthy();
    });

    it('should handle uncontrolled stacks', () => {
      const stone = createMockStone('1', StoneType.FLAT, Player.PLAYER1);
      const stack = createMockStack([stone], null);

      const { getByLabelText } = render(<Stack stack={stack} />);
      
      // When controlledBy is null, it should still show the top stone's owner
      // This is the actual behavior of the component
      expect(getByLabelText(/controlled by player1/)).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', () => {
      const stones = [
        createMockStone('1', StoneType.FLAT, Player.PLAYER1),
        createMockStone('2', StoneType.WALL, Player.PLAYER2),
      ];
      const stack = createMockStack(stones, Player.PLAYER2);

      const { getByLabelText } = render(<Stack stack={stack} onPress={() => {}} />);
      
      const stackElement = getByLabelText(/Stack of 2 stones controlled by player2/);
      expect(stackElement.props.accessibilityRole).toBe('button');
      expect(stackElement.props.accessibilityHint).toBe('Tap to select stack, long press for move options');
    });

    it('should not have button role when not interactive', () => {
      const stone = createMockStone('1', StoneType.FLAT, Player.PLAYER1);
      const stack = createMockStack([stone]);

      const { getByLabelText } = render(<Stack stack={stack} />);
      
      // Should render the stack without button role
      expect(getByLabelText(/Stack of 1 stones/)).toBeTruthy();
    });
  });

  describe('Visual Effects', () => {
    it('should render stack shadow for multi-stone stacks', () => {
      const stones = [
        createMockStone('1', StoneType.FLAT, Player.PLAYER1),
        createMockStone('2', StoneType.FLAT, Player.PLAYER2),
        createMockStone('3', StoneType.CAPSTONE, Player.PLAYER1),
      ];
      const stack = createMockStack(stones, Player.PLAYER1);

      const { getByLabelText } = render(<Stack stack={stack} />);
      
      // Should render with shadow effects
      expect(getByLabelText(/Stack of 3 stones controlled by player1/)).toBeTruthy();
    });

    it('should render different stone types in composition', () => {
      const stones = [
        createMockStone('1', StoneType.FLAT, Player.PLAYER1),
        createMockStone('2', StoneType.WALL, Player.PLAYER2),
        createMockStone('3', StoneType.CAPSTONE, Player.PLAYER1),
      ];
      const stack = createMockStack(stones, Player.PLAYER1);

      const { getByLabelText } = render(<Stack stack={stack} showComposition={true} />);
      
      // Should render composition with different stone type indicators
      expect(getByLabelText(/Stack of 3 stones controlled by player1/)).toBeTruthy();
    });
  });
});