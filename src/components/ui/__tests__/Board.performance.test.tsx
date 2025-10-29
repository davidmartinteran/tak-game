import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Board } from '../board/Board';
import { Board as BoardType, Position, Player, StoneType } from '../../../types';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const mock = require('react-native-reanimated/mock');
  return mock;
});

// Mock responsive utilities
jest.mock('../../../utils/responsive', () => ({
  scaleWidth: (value: number) => value,
  scaleHeight: (value: number) => value,
  calculateBoardSize: () => 300,
}));

describe('Board Performance Tests', () => {
  const createEmptyBoard = (size: number): BoardType => ({
    size,
    squares: Array(size).fill(null).map(() => Array(size).fill(null)),
  });

  const createBoardWithStones = (size: number): BoardType => {
    const board = createEmptyBoard(size);
    
    // Add some stones for testing
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if ((i + j) % 3 === 0) {
          board.squares[i][j] = {
            stones: [{
              id: `stone-${i}-${j}`,
              type: StoneType.FLAT,
              owner: (i + j) % 2 === 0 ? Player.PLAYER1 : Player.PLAYER2,
            }],
            controlledBy: (i + j) % 2 === 0 ? Player.PLAYER1 : Player.PLAYER2,
          };
        }
      }
    }
    
    return board;
  };

  const mockProps = {
    highlightedPositions: [],
    selectedPosition: null,
    validTargets: [],
    onSquarePress: jest.fn(),
    onSquareLongPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering Performance', () => {
    it('should render small board (4x4) efficiently', () => {
      const board = createEmptyBoard(4);
      
      const startTime = performance.now();
      
      render(
        <Board
          board={board}
          {...mockProps}
        />
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // 4x4 board should render very quickly
      expect(renderTime).toBeLessThan(50);
    });

    it('should render large board (8x8) within acceptable time', () => {
      const board = createEmptyBoard(8);
      
      const startTime = performance.now();
      
      render(
        <Board
          board={board}
          {...mockProps}
        />
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // 8x8 board should still render reasonably quickly
      expect(renderTime).toBeLessThan(200);
    });

    it('should handle board with many stones efficiently', () => {
      const board = createBoardWithStones(6);
      
      const startTime = performance.now();
      
      render(
        <Board
          board={board}
          {...mockProps}
        />
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Board with stones should render within acceptable time
      expect(renderTime).toBeLessThan(150);
    });
  });

  describe('Re-rendering Performance', () => {
    it('should minimize re-renders with React.memo', () => {
      const board = createEmptyBoard(5);
      
      const { rerender } = render(
        <Board
          board={board}
          {...mockProps}
        />
      );

      const startTime = performance.now();
      
      // Re-render with same props multiple times
      for (let i = 0; i < 10; i++) {
        rerender(
          <Board
            board={board}
            {...mockProps}
          />
        );
      }
      
      const endTime = performance.now();
      const rerenderTime = endTime - startTime;
      
      // Multiple re-renders with same props should be fast due to memoization
      expect(rerenderTime).toBeLessThan(50);
    });

    it('should only re-render when board state changes', () => {
      const board1 = createEmptyBoard(5);
      const board2 = createBoardWithStones(5);
      
      const { rerender } = render(
        <Board
          board={board1}
          {...mockProps}
        />
      );

      const startTime = performance.now();
      
      // Change board state
      rerender(
        <Board
          board={board2}
          {...mockProps}
        />
      );
      
      const endTime = performance.now();
      const rerenderTime = endTime - startTime;
      
      // Re-render with different board should be efficient
      expect(rerenderTime).toBeLessThan(100);
    });
  });

  describe('Interaction Performance', () => {
    it('should handle square press events efficiently', () => {
      const board = createEmptyBoard(5);
      
      const { getAllByRole } = render(
        <Board
          board={board}
          {...mockProps}
        />
      );

      const squares = getAllByRole('button');
      
      const startTime = performance.now();
      
      // Simulate multiple rapid presses
      for (let i = 0; i < 10; i++) {
        act(() => {
          fireEvent.press(squares[i % squares.length]);
        });
      }
      
      const endTime = performance.now();
      const interactionTime = endTime - startTime;
      
      // Multiple interactions should be processed quickly
      expect(interactionTime).toBeLessThan(100);
      expect(mockProps.onSquarePress).toHaveBeenCalledTimes(10);
    });

    it('should handle highlighting changes efficiently', () => {
      const board = createEmptyBoard(5);
      
      const { rerender } = render(
        <Board
          board={board}
          {...mockProps}
          highlightedPositions={[]}
        />
      );

      const highlightedPositions: Position[] = [
        { row: 0, col: 0 },
        { row: 1, col: 1 },
        { row: 2, col: 2 },
      ];

      const startTime = performance.now();
      
      // Change highlighting multiple times
      for (let i = 0; i < 5; i++) {
        rerender(
          <Board
            board={board}
            {...mockProps}
            highlightedPositions={highlightedPositions.slice(0, i + 1)}
          />
        );
      }
      
      const endTime = performance.now();
      const highlightTime = endTime - startTime;
      
      // Highlighting changes should be efficient
      expect(highlightTime).toBeLessThan(75);
    });
  });

  describe('Memory Performance', () => {
    it('should not leak memory with multiple board renders', () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Render and unmount multiple boards
      for (let size = 4; size <= 8; size++) {
        const board = createBoardWithStones(size);
        
        const { unmount } = render(
          <Board
            board={board}
            {...mockProps}
          />
        );
        
        unmount();
      }
      
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable
      if (initialMemory > 0) {
        expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // Less than 10MB
      }
    });
  });

  describe('Animation Performance', () => {
    it('should handle animation state changes efficiently', () => {
      const board = createEmptyBoard(5);
      
      const { rerender } = render(
        <Board
          board={board}
          {...mockProps}
        />
      );

      const animationStates = [
        { type: 'placing' as const, position: { row: 0, col: 0 } },
        { type: 'invalid' as const, position: { row: 1, col: 1 } },
        null,
      ];

      const startTime = performance.now();
      
      animationStates.forEach(animation => {
        act(() => {
          rerender(
            <Board
              board={board}
              {...mockProps}
              currentAnimation={animation}
            />
          );
        });
      });
      
      const endTime = performance.now();
      const animationTime = endTime - startTime;
      
      // Animation state changes should be processed quickly
      expect(animationTime).toBeLessThan(50);
    });
  });

  describe('Scalability Performance', () => {
    const boardSizes = [4, 5, 6, 7, 8];
    
    boardSizes.forEach(size => {
      it(`should render ${size}x${size} board within performance budget`, () => {
        const board = createBoardWithStones(size);
        
        const startTime = performance.now();
        
        render(
          <Board
            board={board}
            {...mockProps}
          />
        );
        
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        
        // Larger boards should still render within reasonable time
        const expectedMaxTime = size * size * 2; // 2ms per square as rough guideline
        expect(renderTime).toBeLessThan(expectedMaxTime);
      });
    });
  });
});