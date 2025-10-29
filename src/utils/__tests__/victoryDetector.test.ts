import { VictoryDetector } from '../victoryDetector';
import { Board, Player, Position, Stack, Stone, StoneType } from '../../types';

describe('VictoryDetector', () => {
  let victoryDetector: VictoryDetector;

  beforeEach(() => {
    victoryDetector = new VictoryDetector();
  });

  // Helper function to create a stone
  const createStone = (type: StoneType, owner: Player, id: string = 'test'): Stone => ({
    id,
    type,
    owner
  });

  // Helper function to create a stack
  const createStack = (stones: Stone[]): Stack => ({
    stones,
    controlledBy: stones.length > 0 ? stones[stones.length - 1].owner : null
  });

  // Helper function to create an empty board
  const createEmptyBoard = (size: number): Board => ({
    size,
    squares: Array(size).fill(null).map(() => Array(size).fill(null))
  });

  // Helper function to place a stone on the board
  const placeStone = (board: Board, position: Position, stone: Stone): void => {
    const existingStack = board.squares[position.row][position.col];
    if (existingStack) {
      existingStack.stones.push(stone);
      existingStack.controlledBy = stone.owner;
    } else {
      board.squares[position.row][position.col] = createStack([stone]);
    }
  };

  describe('Road Victory Detection', () => {
    test('should detect horizontal road victory', () => {
      const board = createEmptyBoard(5);
      
      // Create a horizontal road for Player 1 from left to right
      for (let col = 0; col < 5; col++) {
        placeStone(board, { row: 2, col }, createStone(StoneType.FLAT, Player.PLAYER1, `h${col}`));
      }

      const result = victoryDetector.checkRoadVictory(board, Player.PLAYER1);
      
      expect(result.winner).toBe(Player.PLAYER1);
      expect(result.type).toBe('road');
      expect(result.winningPath).toHaveLength(5);
      expect(result.winningPath).toContainEqual({ row: 2, col: 0 });
      expect(result.winningPath).toContainEqual({ row: 2, col: 4 });
    });

    test('should detect vertical road victory', () => {
      const board = createEmptyBoard(4);
      
      // Create a vertical road for Player 2 from top to bottom
      for (let row = 0; row < 4; row++) {
        placeStone(board, { row, col: 1 }, createStone(StoneType.FLAT, Player.PLAYER2, `v${row}`));
      }

      const result = victoryDetector.checkRoadVictory(board, Player.PLAYER2);
      
      expect(result.winner).toBe(Player.PLAYER2);
      expect(result.type).toBe('road');
      expect(result.winningPath).toHaveLength(4);
      expect(result.winningPath).toContainEqual({ row: 0, col: 1 });
      expect(result.winningPath).toContainEqual({ row: 3, col: 1 });
    });

    test('should detect L-shaped road victory', () => {
      const board = createEmptyBoard(5);
      
      // Create an L-shaped road connecting left edge to right edge
      // Horizontal part from left
      for (let col = 0; col < 3; col++) {
        placeStone(board, { row: 2, col }, createStone(StoneType.FLAT, Player.PLAYER1, `l${col}`));
      }
      // Vertical part going up
      for (let row = 0; row <= 2; row++) {
        placeStone(board, { row, col: 2 }, createStone(StoneType.FLAT, Player.PLAYER1, `l${row}`));
      }
      // Horizontal part to right edge
      for (let col = 2; col < 5; col++) {
        placeStone(board, { row: 0, col }, createStone(StoneType.FLAT, Player.PLAYER1, `r${col}`));
      }

      const result = victoryDetector.checkRoadVictory(board, Player.PLAYER1);
      
      expect(result.winner).toBe(Player.PLAYER1);
      expect(result.type).toBe('road');
      expect(result.winningPath!.length).toBeGreaterThan(0);
    });

    test('should work with capstones in road', () => {
      const board = createEmptyBoard(4);
      
      // Create a road with mixed flat stones and capstones
      placeStone(board, { row: 1, col: 0 }, createStone(StoneType.FLAT, Player.PLAYER1));
      placeStone(board, { row: 1, col: 1 }, createStone(StoneType.CAPSTONE, Player.PLAYER1));
      placeStone(board, { row: 1, col: 2 }, createStone(StoneType.FLAT, Player.PLAYER1));
      placeStone(board, { row: 1, col: 3 }, createStone(StoneType.FLAT, Player.PLAYER1));

      const result = victoryDetector.checkRoadVictory(board, Player.PLAYER1);
      
      expect(result.winner).toBe(Player.PLAYER1);
      expect(result.type).toBe('road');
    });

    test('should not detect road with walls', () => {
      const board = createEmptyBoard(4);
      
      // Try to create a road with a wall in the middle
      placeStone(board, { row: 1, col: 0 }, createStone(StoneType.FLAT, Player.PLAYER1));
      placeStone(board, { row: 1, col: 1 }, createStone(StoneType.WALL, Player.PLAYER1));
      placeStone(board, { row: 1, col: 2 }, createStone(StoneType.FLAT, Player.PLAYER1));
      placeStone(board, { row: 1, col: 3 }, createStone(StoneType.FLAT, Player.PLAYER1));

      const result = victoryDetector.checkRoadVictory(board, Player.PLAYER1);
      
      expect(result.winner).toBeNull();
    });

    test('should not detect incomplete road', () => {
      const board = createEmptyBoard(5);
      
      // Create a partial road that doesn't reach opposite edges
      for (let col = 1; col < 4; col++) {
        placeStone(board, { row: 2, col }, createStone(StoneType.FLAT, Player.PLAYER1));
      }

      const result = victoryDetector.checkRoadVictory(board, Player.PLAYER1);
      
      expect(result.winner).toBeNull();
    });

    test('should not detect road controlled by opponent', () => {
      const board = createEmptyBoard(4);
      
      // Create stacks where Player 2 controls the top
      for (let col = 0; col < 4; col++) {
        placeStone(board, { row: 1, col }, createStone(StoneType.FLAT, Player.PLAYER1));
        placeStone(board, { row: 1, col }, createStone(StoneType.FLAT, Player.PLAYER2));
      }

      const result = victoryDetector.checkRoadVictory(board, Player.PLAYER1);
      
      expect(result.winner).toBeNull();
    });
  });

  describe('Flat Stone Victory Detection', () => {
    test('should detect Player 1 flat stone victory', () => {
      const board = createEmptyBoard(3);
      
      // Player 1 has more flat stones on top
      placeStone(board, { row: 0, col: 0 }, createStone(StoneType.FLAT, Player.PLAYER1));
      placeStone(board, { row: 0, col: 1 }, createStone(StoneType.FLAT, Player.PLAYER1));
      placeStone(board, { row: 0, col: 2 }, createStone(StoneType.FLAT, Player.PLAYER1));
      placeStone(board, { row: 1, col: 0 }, createStone(StoneType.FLAT, Player.PLAYER2));
      placeStone(board, { row: 1, col: 1 }, createStone(StoneType.CAPSTONE, Player.PLAYER2)); // Capstone doesn't count

      const result = victoryDetector.checkFlatStoneVictory(board);
      
      expect(result.winner).toBe(Player.PLAYER1);
      expect(result.type).toBe('flat');
    });

    test('should detect Player 2 flat stone victory', () => {
      const board = createEmptyBoard(3);
      
      // Player 2 has more flat stones on top
      placeStone(board, { row: 0, col: 0 }, createStone(StoneType.FLAT, Player.PLAYER2));
      placeStone(board, { row: 0, col: 1 }, createStone(StoneType.FLAT, Player.PLAYER2));
      placeStone(board, { row: 0, col: 2 }, createStone(StoneType.FLAT, Player.PLAYER2));
      placeStone(board, { row: 1, col: 0 }, createStone(StoneType.FLAT, Player.PLAYER1));

      const result = victoryDetector.checkFlatStoneVictory(board);
      
      expect(result.winner).toBe(Player.PLAYER2);
      expect(result.type).toBe('flat');
    });

    test('should detect draw in flat stone victory', () => {
      const board = createEmptyBoard(2);
      
      // Equal flat stones
      placeStone(board, { row: 0, col: 0 }, createStone(StoneType.FLAT, Player.PLAYER1));
      placeStone(board, { row: 0, col: 1 }, createStone(StoneType.FLAT, Player.PLAYER2));

      const result = victoryDetector.checkFlatStoneVictory(board);
      
      expect(result.winner).toBe('draw');
      expect(result.type).toBe('flat');
    });

    test('should only count flat stones on top of stacks', () => {
      const board = createEmptyBoard(2);
      
      // Player 1 has flat stone on bottom, Player 2 on top
      placeStone(board, { row: 0, col: 0 }, createStone(StoneType.FLAT, Player.PLAYER1));
      placeStone(board, { row: 0, col: 0 }, createStone(StoneType.FLAT, Player.PLAYER2));
      
      // Player 2 has another flat stone on top
      placeStone(board, { row: 0, col: 1 }, createStone(StoneType.FLAT, Player.PLAYER2));

      const result = victoryDetector.checkFlatStoneVictory(board);
      
      expect(result.winner).toBe(Player.PLAYER2);
      expect(result.type).toBe('flat');
    });

    test('should not count walls or capstones', () => {
      const board = createEmptyBoard(3);
      
      // Mix of stone types - only flat stones should count
      placeStone(board, { row: 0, col: 0 }, createStone(StoneType.FLAT, Player.PLAYER1));
      placeStone(board, { row: 0, col: 1 }, createStone(StoneType.WALL, Player.PLAYER1));
      placeStone(board, { row: 0, col: 2 }, createStone(StoneType.CAPSTONE, Player.PLAYER1));
      placeStone(board, { row: 1, col: 0 }, createStone(StoneType.FLAT, Player.PLAYER2));

      const result = victoryDetector.checkFlatStoneVictory(board);
      
      expect(result.winner).toBe('draw'); // 1 flat stone each
      expect(result.type).toBe('flat');
    });
  });

  describe('Main Victory Check', () => {
    test('should prioritize current player road victory in simultaneous roads', () => {
      // This test verifies that when both players have roads, the current player wins
      // We'll create separate boards for each player to avoid intersection issues
      
      const board1 = createEmptyBoard(4);
      const board2 = createEmptyBoard(4);
      
      // Create Player 1's horizontal road
      for (let col = 0; col < 4; col++) {
        placeStone(board1, { row: 0, col }, createStone(StoneType.FLAT, Player.PLAYER1));
      }
      
      // Create Player 2's vertical road  
      for (let row = 0; row < 4; row++) {
        placeStone(board2, { row, col: 0 }, createStone(StoneType.FLAT, Player.PLAYER2));
      }
      
      // Verify each player has a road on their respective boards
      const player1Road = victoryDetector.checkRoadVictory(board1, Player.PLAYER1);
      const player2Road = victoryDetector.checkRoadVictory(board2, Player.PLAYER2);
      
      expect(player1Road.winner).toBe(Player.PLAYER1);
      expect(player2Road.winner).toBe(Player.PLAYER2);
      
      // Now test the priority logic by mocking the checkRoadVictory method
      const originalCheckRoadVictory = victoryDetector.checkRoadVictory;
      let callCount = 0;
      
      victoryDetector.checkRoadVictory = jest.fn().mockImplementation((board, player) => {
        callCount++;
        if (callCount === 1 && player === Player.PLAYER1) {
          return { winner: Player.PLAYER1, type: 'road' as const, winningPath: [] };
        }
        if (callCount === 2 && player === Player.PLAYER2) {
          return { winner: Player.PLAYER2, type: 'road' as const, winningPath: [] };
        }
        return { winner: null, type: null };
      });
      
      // Current player (Player 1) should win when both have roads
      const result = victoryDetector.checkVictory(board1, Player.PLAYER1, false, false);
      
      expect(result.winner).toBe(Player.PLAYER1);
      expect(result.type).toBe('road');
      
      // Restore original method
      victoryDetector.checkRoadVictory = originalCheckRoadVictory;
    });

    test('should check opponent road if current player has none', () => {
      const board = createEmptyBoard(4);
      
      // Only Player 2 has a road
      for (let row = 0; row < 4; row++) {
        placeStone(board, { row, col: 1 }, createStone(StoneType.FLAT, Player.PLAYER2));
      }

      const result = victoryDetector.checkVictory(board, Player.PLAYER1, false, false);
      
      expect(result.winner).toBe(Player.PLAYER2);
      expect(result.type).toBe('road');
    });

    test('should check flat stone victory when board is full', () => {
      const board = createEmptyBoard(2);
      
      // Fill board without roads
      placeStone(board, { row: 0, col: 0 }, createStone(StoneType.FLAT, Player.PLAYER1));
      placeStone(board, { row: 0, col: 1 }, createStone(StoneType.WALL, Player.PLAYER2));
      placeStone(board, { row: 1, col: 0 }, createStone(StoneType.WALL, Player.PLAYER1));
      placeStone(board, { row: 1, col: 1 }, createStone(StoneType.FLAT, Player.PLAYER2));

      const result = victoryDetector.checkVictory(board, Player.PLAYER1, true, false);
      
      expect(result.winner).toBe('draw'); // 1 flat stone each
      expect(result.type).toBe('flat');
    });

    test('should check flat stone victory when last piece is placed', () => {
      const board = createEmptyBoard(3);
      
      // Partially filled board
      placeStone(board, { row: 0, col: 0 }, createStone(StoneType.FLAT, Player.PLAYER1));
      placeStone(board, { row: 0, col: 1 }, createStone(StoneType.FLAT, Player.PLAYER1));
      placeStone(board, { row: 1, col: 0 }, createStone(StoneType.FLAT, Player.PLAYER2));

      const result = victoryDetector.checkVictory(board, Player.PLAYER1, false, true);
      
      expect(result.winner).toBe(Player.PLAYER1);
      expect(result.type).toBe('flat');
    });

    test('should return no victory for ongoing game', () => {
      const board = createEmptyBoard(4);
      
      // Partial game state with no victory conditions
      placeStone(board, { row: 1, col: 1 }, createStone(StoneType.FLAT, Player.PLAYER1));
      placeStone(board, { row: 2, col: 2 }, createStone(StoneType.FLAT, Player.PLAYER2));

      const result = victoryDetector.checkVictory(board, Player.PLAYER1, false, false);
      
      expect(result.winner).toBeNull();
      expect(result.type).toBeNull();
    });
  });

  describe('Helper Methods', () => {
    test('isBoardFull should detect full board', () => {
      const board = createEmptyBoard(2);
      
      expect(victoryDetector.isBoardFull(board)).toBe(false);
      
      // Fill the board
      placeStone(board, { row: 0, col: 0 }, createStone(StoneType.FLAT, Player.PLAYER1));
      placeStone(board, { row: 0, col: 1 }, createStone(StoneType.FLAT, Player.PLAYER1));
      placeStone(board, { row: 1, col: 0 }, createStone(StoneType.FLAT, Player.PLAYER1));
      placeStone(board, { row: 1, col: 1 }, createStone(StoneType.FLAT, Player.PLAYER1));
      
      expect(victoryDetector.isBoardFull(board)).toBe(true);
    });

    test('isLastPiece should detect when player has no pieces left', () => {
      const reserves = {
        [Player.PLAYER1]: { flatStones: 0, capstones: 0 },
        [Player.PLAYER2]: { flatStones: 5, capstones: 1 }
      };
      
      expect(victoryDetector.isLastPiece(Player.PLAYER1, reserves)).toBe(true);
      expect(victoryDetector.isLastPiece(Player.PLAYER2, reserves)).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty board', () => {
      const board = createEmptyBoard(4);
      
      const result = victoryDetector.checkVictory(board, Player.PLAYER1, false, false);
      
      expect(result.winner).toBeNull();
      expect(result.type).toBeNull();
    });

    test('should handle single stone on board', () => {
      const board = createEmptyBoard(4);
      placeStone(board, { row: 2, col: 2 }, createStone(StoneType.FLAT, Player.PLAYER1));
      
      const result = victoryDetector.checkVictory(board, Player.PLAYER1, false, false);
      
      expect(result.winner).toBeNull();
      expect(result.type).toBeNull();
    });

    test('should handle minimum board size (4x4)', () => {
      const board = createEmptyBoard(4);
      
      // Create minimum horizontal road
      for (let col = 0; col < 4; col++) {
        placeStone(board, { row: 0, col }, createStone(StoneType.FLAT, Player.PLAYER1));
      }
      
      const result = victoryDetector.checkRoadVictory(board, Player.PLAYER1);
      
      expect(result.winner).toBe(Player.PLAYER1);
      expect(result.type).toBe('road');
    });
  });
});