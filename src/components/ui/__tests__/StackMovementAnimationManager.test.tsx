import React from 'react';
import { render } from '@testing-library/react-native';
import { StackMovementAnimationManager, StackMovementAnimationManagerRef } from '../animations/StackMovementAnimationManager';
import { Stone, StoneType, Player, Position, StackMove } from '../../../types';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');

  // The mock for `call` immediately calls the callback which is incorrect
  // So we override it with a no-op
  Reanimated.default.call = () => { };

  return Reanimated;
});

// Mock the AnimatedStackMovement component
jest.mock('../animations/AnimatedStackMovement', () => ({
  AnimatedStackMovement: ({ movingStones, fromPosition, toPosition, onAnimationComplete }: any) => {
    const React = require('react');
    const { View, Text } = require('react-native');
    React.useEffect(() => {
      // Simulate animation completion after a short delay
      const timer = setTimeout(() => {
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      }, 100);
      return () => clearTimeout(timer);
    }, [onAnimationComplete]);

    return React.createElement(View, { testID: "animated-stack-movement" },
      React.createElement(Text, null, `Moving ${movingStones.length} stones from ${fromPosition.row},${fromPosition.col} to ${toPosition.row},${toPosition.col}`)
    );
  },
}));

// Mock the WallFlatteningAnimation component
jest.mock('../animations/WallFlatteningAnimation', () => ({
  WallFlatteningAnimation: ({ wallStone, position, onAnimationComplete }: any) => {
    const React = require('react');
    const { View, Text } = require('react-native');
    React.useEffect(() => {
      // Simulate animation completion after a short delay
      const timer = setTimeout(() => {
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      }, 100);
      return () => clearTimeout(timer);
    }, [onAnimationComplete]);

    return React.createElement(View, { testID: "wall-flattening-animation" },
      React.createElement(Text, null, `Flattening wall ${wallStone.id} at ${position.row},${position.col}`)
    );
  },
}));

describe('StackMovementAnimationManager', () => {
  const mockStones: Stone[] = [
    {
      id: 'stone1',
      type: StoneType.FLAT,
      owner: Player.PLAYER1,
    },
    {
      id: 'stone2',
      type: StoneType.FLAT,
      owner: Player.PLAYER1,
    },
  ];

  const mockMove: StackMove = {
    type: 'move',
    from: { row: 0, col: 0 },
    to: { row: 0, col: 2 },
    stonesToMove: 2,
    dropPattern: [0, 1, 1],
  };

  const mockPath: Position[] = [
    { row: 0, col: 1 },
    { row: 0, col: 2 },
  ];

  const mockWallStone: Stone = {
    id: 'wall1',
    type: StoneType.WALL,
    owner: Player.PLAYER2,
  };

  const defaultProps = {
    squareSize: 50,
    boardSize: 250,
  };

  it('should render without animations initially', () => {
    const { queryByTestId } = render(<StackMovementAnimationManager {...defaultProps} />);

    expect(queryByTestId('animated-stack-movement')).toBeNull();
    expect(queryByTestId('wall-flattening-animation')).toBeNull();
  });

  it('should start stack movement animation via ref', () => {
    const ref = React.createRef<StackMovementAnimationManagerRef>();
    const { getByTestId } = render(<StackMovementAnimationManager ref={ref} {...defaultProps} />);

    // Start animation via ref
    const animationId = ref.current?.startStackMovementAnimation(mockMove, mockStones, mockPath);

    expect(animationId).toBeDefined();
    expect(getByTestId('animated-stack-movement')).toBeTruthy();
  });

  it('should start wall flattening animation via ref', () => {
    const ref = React.createRef<StackMovementAnimationManagerRef>();
    const { getByTestId } = render(<StackMovementAnimationManager ref={ref} {...defaultProps} />);

    // Start animation via ref
    const animationId = ref.current?.startWallFlatteningAnimation({ row: 1, col: 1 }, mockWallStone);

    expect(animationId).toBeDefined();
    expect(getByTestId('wall-flattening-animation')).toBeTruthy();
  });

  it('should call onAnimationComplete when stack movement completes', (done) => {
    const ref = React.createRef<StackMovementAnimationManagerRef>();
    const mockOnAnimationComplete = jest.fn((animationId: string) => {
      expect(animationId).toBeDefined();
      expect(mockOnAnimationComplete).toHaveBeenCalledTimes(1);
      done();
    });

    render(
      <StackMovementAnimationManager
        ref={ref}
        {...defaultProps}
        onAnimationComplete={mockOnAnimationComplete}
      />
    );

    // Start animation
    ref.current?.startStackMovementAnimation(mockMove, mockStones, mockPath);
  });

  it('should call onAnimationComplete when wall flattening completes', (done) => {
    const ref = React.createRef<StackMovementAnimationManagerRef>();
    const mockOnAnimationComplete = jest.fn((animationId: string) => {
      expect(animationId).toBeDefined();
      expect(mockOnAnimationComplete).toHaveBeenCalledTimes(1);
      done();
    });

    render(
      <StackMovementAnimationManager
        ref={ref}
        {...defaultProps}
        onAnimationComplete={mockOnAnimationComplete}
      />
    );

    // Start animation
    ref.current?.startWallFlatteningAnimation({ row: 1, col: 1 }, mockWallStone);
  });

  it('should handle multiple animations simultaneously', () => {
    const ref = React.createRef<StackMovementAnimationManagerRef>();
    const { getByTestId } = render(<StackMovementAnimationManager ref={ref} {...defaultProps} />);

    // Start multiple animations
    ref.current?.startStackMovementAnimation(mockMove, mockStones, mockPath);
    ref.current?.startWallFlatteningAnimation({ row: 1, col: 1 }, mockWallStone);

    expect(getByTestId('animated-stack-movement')).toBeTruthy();
    expect(getByTestId('wall-flattening-animation')).toBeTruthy();
  });

  it('should clear all animations via ref', () => {
    const ref = React.createRef<StackMovementAnimationManagerRef>();
    render(<StackMovementAnimationManager ref={ref} {...defaultProps} />);

    // Start animations
    ref.current?.startStackMovementAnimation(mockMove, mockStones, mockPath);
    ref.current?.startWallFlatteningAnimation({ row: 1, col: 1 }, mockWallStone);

    // Clear all animations
    ref.current?.clearAllAnimations();

    // Animations should be cleared (though components might still be in DOM briefly)
    expect(ref.current?.getActiveAnimationCount()).toBe(0);
  });

  it('should return correct active animation count', () => {
    const ref = React.createRef<StackMovementAnimationManagerRef>();
    render(<StackMovementAnimationManager ref={ref} {...defaultProps} />);

    expect(ref.current?.getActiveAnimationCount()).toBe(0);

    // Start one animation
    ref.current?.startStackMovementAnimation(mockMove, mockStones, mockPath);
    expect(ref.current?.getActiveAnimationCount()).toBe(1);

    // Start another animation
    ref.current?.startWallFlatteningAnimation({ row: 1, col: 1 }, mockWallStone);
    expect(ref.current?.getActiveAnimationCount()).toBe(2);

    // Clear all
    ref.current?.clearAllAnimations();
    expect(ref.current?.getActiveAnimationCount()).toBe(0);
  });

  it('should handle empty stones array gracefully', () => {
    const ref = React.createRef<StackMovementAnimationManagerRef>();
    const { getByTestId } = render(<StackMovementAnimationManager ref={ref} {...defaultProps} />);

    // Start animation with empty stones
    const animationId = ref.current?.startStackMovementAnimation(mockMove, [], mockPath);

    expect(animationId).toBeDefined();
    expect(getByTestId('animated-stack-movement')).toBeTruthy();
  });

  it('should handle empty path gracefully', () => {
    const ref = React.createRef<StackMovementAnimationManagerRef>();
    const { getByTestId } = render(<StackMovementAnimationManager ref={ref} {...defaultProps} />);

    // Start animation with empty path
    const animationId = ref.current?.startStackMovementAnimation(mockMove, mockStones, []);

    expect(animationId).toBeDefined();
    expect(getByTestId('animated-stack-movement')).toBeTruthy();
  });
});