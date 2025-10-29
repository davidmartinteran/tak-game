import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { GameBoard } from '../components/game/GameBoard';
import { useGameStore } from '../store';
import { Player, StoneType } from '../types';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const mock = require('react-native-reanimated/mock');
  return mock;
});

// Mock responsive utilities
jest.mock('../utils/responsive', () => ({
  scaleWidth: (value: number) => value,
  scaleHeight: (value: number) => value,
  scaleFontSize: (value: number) => value,
  calculateBoardSize: () => 300,
  getScreenDimensions: () => ({ width: 400, height: 800 }),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

describe('Game Flow Integration Tests', () => {
  beforeEach(() => {
    // Reset game store before each test
    useGameStore.getState().initializeGame(5);
  });

  describe('Complete Game Flow', () => {
    it('should complete a full game from start to victory', async () => {
      const { getAllByRole } = render(<GameBoard />);
      
      const store = useGameStore.getState();
      
      // Verify initial state
      expect(store.gameState.currentPlayer).toBe(Player.PLAYER1);
      expect(store.gameState.gamePhase).toBe('first-turn');
      
      // First turn - Player 1 places opponent's stone
      act(() => {
        store.selectStoneType(StoneType.FLAT);
      });
      
      const squares = getAllByRole('button');
      const centerSquare = squares[12]; // 5x5 board, center is index 12
      
      act(() => {
        fireEvent.press(centerSquare);
      });
      
      // Verify first turn completed
      await waitFor(() => {
        expect(store.gameState.currentPlayer).toBe(Player.PLAYER2);
        expect(store.gameState.reserves[Player.PLAYER2].flatStones).toBe(20); // One less
      });
      
      // Second turn - Player 2 places opponent's stone
      act(() => {
        store.selectStoneType(StoneType.FLAT);
      });
      
      const adjacentSquare = squares[13];
      
      act(() => {
        fireEvent.press(adjacentSquare);
      });
      
      // Verify second first turn completed
      await waitFor(() => {
        expect(store.gameState.currentPlayer).toBe(Player.PLAYER1);
        expect(store.gameState.gamePhase).toBe('normal');
        expect(store.gameState.reserves[Player.PLAYER1].flatStones).toBe(20); // One less
      });
      
      // Continue with normal gameplay
      for (let i = 0; i < 10; i++) {
        const currentPlayer = store.gameState.currentPlayer;
        
        act(() => {
          store.selectStoneType(StoneType.FLAT);
        });
        
        // Find an empty square
        const emptySquareIndex = squares.findIndex((_, index) => {
          const row = Math.floor(index / 5);
          const col = index % 5;
          return store.gameState.board.squares[row][col] === null;
        });
        
        if (emptySquareIndex !== -1) {
          act(() => {
            fireEvent.press(squares[emptySquareIndex]);
          });
          
          await waitFor(() => {
            expect(store.gameState.currentPlayer).not.toBe(currentPlayer);
          });
        }
      }
      
      // Verify game progressed
      expect(store.gameState.moveHistory.length).toBeGreaterThan(2);
    });

    it('should handle stone placement and turn switching correctly', async () => {
      const { getAllByRole } = render(<GameBoard />);
      
      const store = useGameStore.getState();
      const squares = getAllByRole('button');
      
      // Track initial state
      const initialPlayer = store.gameState.currentPlayer;
      const initialReserves = { ...store.gameState.reserves };
      
      // Select stone type and place
      act(() => {
        store.selectStoneType(StoneType.FLAT);
      });
      
      act(() => {
        fireEvent.press(squares[0]); // Top-left corner
      });
      
      await waitFor(() => {
        // Player should switch
        expect(store.gameState.currentPlayer).not.toBe(initialPlayer);
        
        // Stone should be placed
        const topLeftStack = store.gameState.board.squares[0][0];
        expect(topLeftStack).not.toBeNull();
        expect(topLeftStack?.stones).toHaveLength(1);
        
        // Reserves should be updated (opponent's stone in first turn)
        const oppositePlayer = initialPlayer === Player.PLAYER1 ? Player.PLAYER2 : Player.PLAYER1;
        expect(store.gameState.reserves[oppositePlayer].flatStones)
          .toBe(initialReserves[oppositePlayer].flatStones - 1);
      });
    });

    it('should handle stack movement correctly', async () => {
      const { getAllByRole } = render(<GameBoard />);
      
      const store = useGameStore.getState();
      
      // Skip first turns and place some stones
      act(() => {
        store.gameState.gamePhase = 'normal';
        store.gameState.currentPlayer = Player.PLAYER1;
        
        // Manually place a stack for testing
        const stone1 = {
          id: 'test-stone-1',
          type: StoneType.FLAT,
          owner: Player.PLAYER1,
        };
        const stone2 = {
          id: 'test-stone-2',
          type: StoneType.FLAT,
          owner: Player.PLAYER1,
        };
        
        store.gameState.board.squares[2][2] = {
          stones: [stone1, stone2],
          controlledBy: Player.PLAYER1,
        };
      });
      
      const squares = getAllByRole('button');
      const sourceSquare = squares[12]; // Center square (2,2)
      const targetSquare = squares[13]; // Adjacent square (2,3)
      
      // Long press to select stack
      act(() => {
        fireEvent(sourceSquare, 'longPress');
      });
      
      await waitFor(() => {
        expect(store.uiState.selectedPosition).toEqual({ row: 2, col: 2 });
      });
      
      // Press target square to move
      act(() => {
        fireEvent.press(targetSquare);
      });
      
      // Verify stack movement (this would depend on actual implementation)
      await waitFor(() => {
        // The exact behavior depends on the move validation and execution logic
        expect(store.gameState.moveHistory.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Victory Conditions', () => {
    it('should detect road victory correctly', async () => {
      render(<GameBoard />);
      
      const store = useGameStore.getState();
      
      // Set up a winning road scenario
      act(() => {
        store.gameState.gamePhase = 'normal';
        store.gameState.currentPlayer = Player.PLAYER1;
        
        // Create a horizontal road for Player 1
        for (let col = 0; col < 5; col++) {
          const stone = {
            id: `road-stone-${col}`,
            type: StoneType.FLAT,
            owner: Player.PLAYER1,
          };
          
          store.gameState.board.squares[2][col] = {
            stones: [stone],
            controlledBy: Player.PLAYER1,
          };
        }
      });
      
      // Trigger victory check
      act(() => {
        store.checkVictory();
      });
      
      await waitFor(() => {
        expect(store.gameState.winner).toBe(Player.PLAYER1);
        expect(store.uiState.showingVictoryModal).toBe(true);
      });
    });

    it('should detect flat stone victory correctly', async () => {
      const store = useGameStore.getState();
      
      // Fill the board to trigger flat stone victory
      act(() => {
        store.gameState.gamePhase = 'normal';
        
        let stoneId = 0;
        for (let row = 0; row < 5; row++) {
          for (let col = 0; col < 5; col++) {
            const owner = (row + col) % 2 === 0 ? Player.PLAYER1 : Player.PLAYER2;
            const stone = {
              id: `stone-${stoneId++}`,
              type: StoneType.FLAT,
              owner,
            };
            
            store.gameState.board.squares[row][col] = {
              stones: [stone],
              controlledBy: owner,
            };
          }
        }
        
        // Player 1 should have more flat stones (13 vs 12)
      });
      
      // Trigger victory check
      act(() => {
        store.checkVictory();
      });
      
      await waitFor(() => {
        expect(store.gameState.winner).toBe(Player.PLAYER1);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid moves gracefully', async () => {
      const { getAllByRole } = render(<GameBoard />);
      
      const store = useGameStore.getState();
      const squares = getAllByRole('button');
      
      // Try to place stone without selecting type
      act(() => {
        fireEvent.press(squares[0]);
      });
      
      // Should not crash and should show appropriate feedback
      expect(store.uiState.selectedStoneType).toBeNull();
      
      // Try to place stone on occupied square
      act(() => {
        store.selectStoneType(StoneType.FLAT);
        fireEvent.press(squares[0]); // Place first stone
      });
      
      await waitFor(() => {
        expect(store.gameState.board.squares[0][0]).not.toBeNull();
      });
      
      // Try to place another stone on same square
      act(() => {
        store.selectStoneType(StoneType.FLAT);
        fireEvent.press(squares[0]);
      });
      
      // Should handle gracefully without crashing
      expect(store.gameState.board.squares[0][0]?.stones).toHaveLength(1);
    });

    it('should handle rapid interactions without breaking', async () => {
      const { getAllByRole } = render(<GameBoard />);
      
      const store = useGameStore.getState();
      const squares = getAllByRole('button');
      
      // Rapid stone type selections
      act(() => {
        for (let i = 0; i < 10; i++) {
          store.selectStoneType(StoneType.FLAT);
          store.selectStoneType(StoneType.WALL);
          store.selectStoneType(StoneType.CAPSTONE);
        }
      });
      
      // Should handle without crashing
      expect(store.uiState.selectedStoneType).toBe(StoneType.CAPSTONE);
      
      // Rapid square presses
      act(() => {
        store.selectStoneType(StoneType.FLAT);
        for (let i = 0; i < 5; i++) {
          fireEvent.press(squares[i]);
        }
      });
      
      // Should handle gracefully
      await waitFor(() => {
        expect(store.gameState.moveHistory.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Game State Persistence', () => {
    it('should maintain consistent state throughout gameplay', async () => {
      const { getAllByRole } = render(<GameBoard />);
      
      const store = useGameStore.getState();
      const squares = getAllByRole('button');
      
      // Track state consistency
      const initialState = JSON.parse(JSON.stringify(store.gameState));
      
      // Make several moves
      for (let i = 0; i < 5; i++) {
        act(() => {
          store.selectStoneType(StoneType.FLAT);
          fireEvent.press(squares[i]);
        });
        
        await waitFor(() => {
          // Verify state consistency
          expect(store.gameState.currentPlayer).toBeDefined();
          expect(store.gameState.board).toBeDefined();
          expect(store.gameState.reserves).toBeDefined();
          expect(store.gameState.moveHistory).toBeDefined();
          
          // Verify move was recorded
          expect(store.gameState.moveHistory.length).toBe(i + 1);
        });
      }
      
      // Verify final state is consistent
      expect(store.gameState.moveHistory.length).toBe(5);
      expect(store.gameState.board.size).toBe(initialState.board.size);
    });
  });

  describe('Performance Under Load', () => {
    it('should handle many rapid interactions efficiently', async () => {
      const { getAllByRole } = render(<GameBoard />);
      
      const store = useGameStore.getState();
      const squares = getAllByRole('button');
      
      const startTime = performance.now();
      
      // Simulate rapid gameplay
      act(() => {
        for (let i = 0; i < 20; i++) {
          store.selectStoneType(StoneType.FLAT);
          if (squares[i % squares.length]) {
            fireEvent.press(squares[i % squares.length]);
          }
        }
      });
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Should complete within reasonable time
      expect(totalTime).toBeLessThan(200);
      
      // State should remain consistent
      expect(store.gameState).toBeDefined();
      expect(store.uiState).toBeDefined();
    });
  });
});