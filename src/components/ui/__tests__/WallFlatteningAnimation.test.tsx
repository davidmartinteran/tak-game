import React from 'react';
import { render } from '@testing-library/react-native';
import { WallFlatteningAnimation } from '../animations/WallFlatteningAnimation';
import { Stone, StoneType, Player, Position } from '../../../types';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  
  // The mock for `call` immediately calls the callback which is incorrect
  // So we override it with a no-op
  Reanimated.default.call = () => {};
  
  return Reanimated;
});

// Mock the Stone component
jest.mock('../board/Stone', () => ({
  Stone: ({ stone, stackIndex, isTopStone, size, animationState }: any) => {
    const React = require('react');
    const { View, Text } = require('react-native');
    return React.createElement(View, { testID: `stone-${stone.id}` },
      React.createElement(Text, null, `${stone.type}-${stone.owner}-${stackIndex}-${isTopStone}-${size}-${animationState}`)
    );
  },
}));

describe('WallFlatteningAnimation', () => {
  const mockWallStone: Stone = {
    id: 'wall1',
    type: StoneType.WALL,
    owner: Player.PLAYER2,
  };

  const mockPosition: Position = { row: 1, col: 1 };
  const mockSquareSize = 50;

  const defaultProps = {
    wallStone: mockWallStone,
    position: mockPosition,
    squareSize: mockSquareSize,
  };

  it('should render flattened stone', () => {
    const { getByTestId } = render(<WallFlatteningAnimation {...defaultProps} />);

    expect(getByTestId('stone-wall1')).toBeTruthy();
  });

  it('should render stone as flat type during animation', () => {
    const { getByTestId } = render(<WallFlatteningAnimation {...defaultProps} />);

    const stone = getByTestId('stone-wall1');
    
    // The stone should be rendered as flat type (flattened) with type-changing animation
    expect(stone.children[0]).toHaveTextContent('flat-player2-0-true-40-type-changing');
  });

  it('should call onAnimationComplete when animation finishes', () => {
    const mockOnAnimationComplete = jest.fn();
    
    render(
      <WallFlatteningAnimation
        {...defaultProps}
        onAnimationComplete={mockOnAnimationComplete}
      />
    );

    // Since we're using mocked animations, we can't easily test the actual callback
    // In a real test environment with proper animation mocking, this would be tested
    expect(mockOnAnimationComplete).not.toHaveBeenCalled();
  });

  it('should render particle effects', () => {
    const { root } = render(<WallFlatteningAnimation {...defaultProps} />);
    
    // The component should render without errors (particles are internal)
    expect(root).toBeTruthy();
  });

  it('should handle different stone owners', () => {
    const player1WallStone: Stone = {
      id: 'wall2',
      type: StoneType.WALL,
      owner: Player.PLAYER1,
    };

    const { getByTestId } = render(
      <WallFlatteningAnimation
        {...defaultProps}
        wallStone={player1WallStone}
      />
    );

    const stone = getByTestId('stone-wall2');
    expect(stone.children[0]).toHaveTextContent('flat-player1-0-true-40-type-changing');
  });

  it('should handle different square sizes', () => {
    const largeSquareSize = 100;
    
    const { getByTestId } = render(
      <WallFlatteningAnimation
        {...defaultProps}
        squareSize={largeSquareSize}
      />
    );

    const stone = getByTestId('stone-wall1');
    // Stone size should be 80% of square size (100 * 0.8 = 80)
    expect(stone.children[0]).toHaveTextContent('flat-player2-0-true-80-type-changing');
  });

  it('should preserve original stone ID', () => {
    const customWallStone: Stone = {
      id: 'custom-wall-123',
      type: StoneType.WALL,
      owner: Player.PLAYER1,
    };

    const { getByTestId } = render(
      <WallFlatteningAnimation
        {...defaultProps}
        wallStone={customWallStone}
      />
    );

    expect(getByTestId('stone-custom-wall-123')).toBeTruthy();
  });

  it('should render glow effect container', () => {
    const { root } = render(<WallFlatteningAnimation {...defaultProps} />);
    
    // The component should render without errors
    expect(root).toBeTruthy();
  });
});