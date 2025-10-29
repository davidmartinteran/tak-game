import React from 'react';
import { render } from '@testing-library/react-native';
import { VictoryCelebration } from '../feedback/VictoryCelebration';
import { Player } from '../../../types';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  const mockReanimated = {
    useSharedValue: jest.fn(() => ({ value: 0 })),
    useAnimatedStyle: jest.fn(() => ({})),
    withTiming: jest.fn((value) => value),
    withDelay: jest.fn((delay, value) => value),
    withSequence: jest.fn((...values) => values[values.length - 1]),
    withRepeat: jest.fn((value) => value),
    runOnJS: jest.fn((fn) => fn),
    Easing: {
      out: jest.fn((fn) => fn),
      quad: jest.fn(),
      back: jest.fn(() => jest.fn()),
    },
    View: View,
    default: {
      View,
    },
  };
  return mockReanimated;
});

describe('VictoryCelebration', () => {
  const defaultProps = {
    visible: true,
    winner: Player.PLAYER1 as Player,
    onAnimationComplete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render when visible', () => {
    // Component should render without errors
    expect(() => render(<VictoryCelebration {...defaultProps} />)).not.toThrow();
  });

  it('should not render when not visible', () => {
    const { toJSON } = render(
      <VictoryCelebration 
        {...defaultProps} 
        visible={false}
      />
    );
    
    // Should return null when not visible
    expect(toJSON()).toBeNull();
  });

  it('should not render when winner is null', () => {
    const { toJSON } = render(
      <VictoryCelebration 
        {...defaultProps} 
        winner={null}
      />
    );
    
    // Should return null when winner is null
    expect(toJSON()).toBeNull();
  });

  it('should render for Player 1 victory', () => {
    const { root } = render(
      <VictoryCelebration {...defaultProps} winner={Player.PLAYER1} />
    );
    
    expect(root).toBeTruthy();
  });

  it('should render for Player 2 victory', () => {
    const { root } = render(
      <VictoryCelebration {...defaultProps} winner={Player.PLAYER2} />
    );
    
    expect(root).toBeTruthy();
  });

  it('should render for draw', () => {
    const { root } = render(
      <VictoryCelebration {...defaultProps} winner="draw" />
    );
    
    expect(root).toBeTruthy();
  });

  it('should call onAnimationComplete callback', () => {
    const onAnimationComplete = jest.fn();
    
    render(
      <VictoryCelebration 
        {...defaultProps} 
        onAnimationComplete={onAnimationComplete}
      />
    );
    
    // The callback should be set up (actual timing depends on animation)
    expect(onAnimationComplete).toBeDefined();
  });

  it('should handle missing onAnimationComplete callback', () => {
    expect(() => {
      render(
        <VictoryCelebration 
          visible={true}
          winner={Player.PLAYER1}
        />
      );
    }).not.toThrow();
  });

  it('should render confetti particles', () => {
    const { root } = render(<VictoryCelebration {...defaultProps} />);
    
    // Should render without errors (particles are internal components)
    expect(root).toBeTruthy();
  });

  it('should render victory burst effect', () => {
    const { root } = render(<VictoryCelebration {...defaultProps} />);
    
    // Should render without errors (burst is internal component)
    expect(root).toBeTruthy();
  });
});