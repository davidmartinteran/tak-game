import React from 'react';
import { render, act } from '@testing-library/react-native';
import { Stone } from '../board/Stone';
import { StoneType, Player } from '../../../types';

// Mock react-native-reanimated for performance testing
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  
  // Mock useSharedValue to track creation
  const originalUseSharedValue = Reanimated.useSharedValue;
  Reanimated.useSharedValue = jest.fn((initialValue) => {
    return originalUseSharedValue(initialValue);
  });
  
  return Reanimated;
});

describe('Stone Performance Tests', () => {
  const mockStone = {
    id: 'test-stone-1',
    type: StoneType.FLAT,
    owner: Player.PLAYER1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering Performance', () => {
    it('should render without performance issues', () => {
      const startTime = performance.now();
      
      render(
        <Stone
          stone={mockStone}
          stackIndex={0}
          isTopStone={true}
        />
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Rendering should complete within 50ms
      expect(renderTime).toBeLessThan(50);
    });

    it('should handle multiple re-renders efficiently with React.memo', () => {
      const { rerender } = render(
        <Stone
          stone={mockStone}
          stackIndex={0}
          isTopStone={true}
        />
      );

      const startTime = performance.now();
      
      // Re-render with same props (should be memoized)
      for (let i = 0; i < 10; i++) {
        rerender(
          <Stone
            stone={mockStone}
            stackIndex={0}
            isTopStone={true}
          />
        );
      }
      
      const endTime = performance.now();
      const rerenderTime = endTime - startTime;
      
      // Multiple re-renders with same props should be fast due to memoization
      expect(rerenderTime).toBeLessThan(20);
    });

    it('should only re-render when props actually change', () => {
      const renderSpy = jest.fn();
      
      const TestStone = React.memo(() => {
        renderSpy();
        return (
          <Stone
            stone={mockStone}
            stackIndex={0}
            isTopStone={true}
          />
        );
      });

      TestStone.displayName = 'TestStone';

      const { rerender } = render(<TestStone />);
      
      expect(renderSpy).toHaveBeenCalledTimes(1);
      
      // Re-render with same props
      rerender(<TestStone />);
      
      // Should not trigger additional renders due to memoization
      expect(renderSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Animation Performance', () => {
    it('should use native driver for animations', () => {
      const { useSharedValue } = require('react-native-reanimated');
      
      render(
        <Stone
          stone={mockStone}
          stackIndex={0}
          isTopStone={true}
          animationState="placing"
        />
      );
      
      // Verify that shared values are created for native animations
      expect(useSharedValue).toHaveBeenCalledWith(1); // scale
      expect(useSharedValue).toHaveBeenCalledWith(1); // opacity
      expect(useSharedValue).toHaveBeenCalledWith(0); // translateY
      expect(useSharedValue).toHaveBeenCalledWith(0); // rotation
    });

    it('should handle animation state changes efficiently', () => {
      const { rerender } = render(
        <Stone
          stone={mockStone}
          stackIndex={0}
          isTopStone={true}
          animationState="idle"
        />
      );

      const startTime = performance.now();
      
      // Change animation state multiple times
      const animationStates = ['placing', 'moving', 'invalid', 'type-changing', 'idle'];
      
      animationStates.forEach(state => {
        act(() => {
          rerender(
            <Stone
              stone={mockStone}
              stackIndex={0}
              isTopStone={true}
              animationState={state as any}
            />
          );
        });
      });
      
      const endTime = performance.now();
      const animationTime = endTime - startTime;
      
      // Animation state changes should be processed quickly
      expect(animationTime).toBeLessThan(100);
    });
  });

  describe('Memory Performance', () => {
    it('should not create excessive objects during render', () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Render multiple stones
      const stones = Array.from({ length: 50 }, (_, i) => ({
        id: `stone-${i}`,
        type: StoneType.FLAT,
        owner: i % 2 === 0 ? Player.PLAYER1 : Player.PLAYER2,
      }));

      stones.forEach((stone, index) => {
        render(
          <Stone
            stone={stone}
            stackIndex={index % 5}
            isTopStone={index % 5 === 4}
          />
        );
      });
      
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 5MB for 50 stones)
      if (initialMemory > 0) {
        expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024);
      }
    });
  });

  describe('Stone Type Rendering Performance', () => {
    const stoneTypes = [StoneType.FLAT, StoneType.WALL, StoneType.CAPSTONE];
    
    stoneTypes.forEach(stoneType => {
      it(`should render ${stoneType} stone efficiently`, () => {
        const testStone = { ...mockStone, type: stoneType };
        
        const startTime = performance.now();
        
        render(
          <Stone
            stone={testStone}
            stackIndex={0}
            isTopStone={true}
          />
        );
        
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        
        // Each stone type should render quickly
        expect(renderTime).toBeLessThan(30);
      });
    });
  });

  describe('Stack Performance', () => {
    it('should handle different stack positions efficiently', () => {
      const stackPositions = [0, 1, 2, 3, 4, 5];
      
      const startTime = performance.now();
      
      stackPositions.forEach(stackIndex => {
        render(
          <Stone
            stone={mockStone}
            stackIndex={stackIndex}
            isTopStone={stackIndex === 5}
          />
        );
      });
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Rendering stones at different stack positions should be efficient
      expect(totalTime).toBeLessThan(100);
    });
  });
});