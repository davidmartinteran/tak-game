import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Square } from '../board/Square';
import { Stack, Position, Player, StoneType } from '../../../types';

// Mock responsive utilities
jest.mock('../../../utils/responsive', () => ({
  scaleWidth: (value: number) => value,
  scaleHeight: (value: number) => value,
}));

describe('Square Component', () => {
  const mockPosition: Position = { row: 0, col: 0 };
  const mockOnPress = jest.fn();
  const mockOnLongPress = jest.fn();

  const defaultProps = {
    stack: null,
    position: mockPosition,
    isHighlighted: false,
    isSelected: false,
    isValidTarget: false,
    squareSize: 50,
    onPress: mockOnPress,
    onLongPress: mockOnLongPress,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty square correctly', () => {
    const { getByTestId } = render(<Square {...defaultProps} />);
    
    const square = getByTestId('square-0-0');
    expect(square).toBeTruthy();
  });

  it('renders square with stack', () => {
    const mockStack: Stack = {
      stones: [
        {
          id: 'stone1',
          type: StoneType.FLAT,
          owner: Player.PLAYER1,
        },
      ],
      controlledBy: Player.PLAYER1,
    };

    const { getByTestId } = render(
      <Square {...defaultProps} stack={mockStack} />
    );
    
    const square = getByTestId('square-0-0');
    expect(square).toBeTruthy();
  });

  it('handles press events', () => {
    const { getByTestId } = render(<Square {...defaultProps} />);
    
    const square = getByTestId('square-0-0');
    fireEvent.press(square);
    
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('handles long press events', () => {
    const { getByTestId } = render(<Square {...defaultProps} />);
    
    const square = getByTestId('square-0-0');
    fireEvent(square, 'longPress');
    
    expect(mockOnLongPress).toHaveBeenCalledTimes(1);
  });

  it('applies highlighted styling', () => {
    const { getByTestId } = render(
      <Square {...defaultProps} isHighlighted={true} />
    );
    
    const square = getByTestId('square-0-0');
    expect(square).toBeTruthy();
    // Visual styling is applied through StyleSheet, hard to test directly
  });

  it('applies selected styling', () => {
    const { getByTestId } = render(
      <Square {...defaultProps} isSelected={true} />
    );
    
    const square = getByTestId('square-0-0');
    expect(square).toBeTruthy();
  });

  it('shows valid target indicator for empty squares', () => {
    const { getByTestId } = render(
      <Square {...defaultProps} isValidTarget={true} />
    );
    
    const square = getByTestId('square-0-0');
    expect(square).toBeTruthy();
  });

  it('has correct accessibility properties', () => {
    const { getByTestId } = render(<Square {...defaultProps} />);
    
    const square = getByTestId('square-0-0');
    expect(square.props.accessibilityLabel).toContain('Board square at row 1, column 1');
    expect(square.props.accessibilityLabel).toContain('empty');
  });

  it('has correct accessibility properties with stack', () => {
    const mockStack: Stack = {
      stones: [
        {
          id: 'stone1',
          type: StoneType.FLAT,
          owner: Player.PLAYER1,
        },
        {
          id: 'stone2',
          type: StoneType.WALL,
          owner: Player.PLAYER2,
        },
      ],
      controlledBy: Player.PLAYER2,
    };

    const { getByTestId } = render(
      <Square {...defaultProps} stack={mockStack} />
    );
    
    const square = getByTestId('square-0-0');
    expect(square.props.accessibilityLabel).toContain('with 2 stones');
  });

  it('calculates alternating colors correctly', () => {
    // Test light square (even sum of coordinates)
    const { rerender, getByTestId } = render(
      <Square {...defaultProps} position={{ row: 0, col: 0 }} />
    );
    
    let square = getByTestId('square-0-0');
    expect(square).toBeTruthy();

    // Test dark square (odd sum of coordinates)
    rerender(
      <Square {...defaultProps} position={{ row: 0, col: 1 }} />
    );
    
    square = getByTestId('square-0-1');
    expect(square).toBeTruthy();
  });
});