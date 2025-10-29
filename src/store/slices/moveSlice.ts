// Move slice - manages move execution, validation, and history

import { StateCreator } from 'zustand';
import {
  Move,
  PlaceMove,
  StackMove,
  Position,
  StoneType,
  GameState,
  Player,
  Stone
} from '../../types';
import { GameBoard } from '../../utils/gameLogic';
import { moveHistoryService, MoveHistoryEntry } from '../../services/MoveHistoryService';

export interface MoveSlice {
  // Move execution
  makeMove: (move: Move) => boolean;
  makeMoveWithFeedback: (move: Move) => { success: boolean; message?: string; type?: 'error' | 'warning' | 'info' };
  placePiece: (stoneType: StoneType, position: Position) => boolean;
  placePieceWithFeedback: (stoneType: StoneType, position: Position) => { success: boolean; message?: string; type?: 'error' | 'warning' | 'info' };
  moveStack: (from: Position, to: Position, stonesToMove: number, dropPattern?: number[]) => boolean;

  // Move validation helpers
  getValidPlacementPositions: (stoneType: StoneType) => Position[];
  getValidMoveTargets: (from: Position, stonesToMove: number) => Position[];

  // Undo functionality
  canUndo: () => boolean;
  undoLastMove: () => boolean;
  undoMoves: (count: number) => boolean;

  // Move history
  getMoveHistory: () => MoveHistoryEntry[];
  getRecentMoves: (count?: number) => MoveHistoryEntry[];
  getMoveStatistics: () => any;
  exportMoveHistory: () => string;

  // Helper methods
  getMovementPath: (from: Position, to: Position) => Position[];
  startStackMovementAnimation: (move: StackMove) => { movingStones: Stone[]; path: Position[] };

  // Internal methods
  executePlaceMove: (move: PlaceMove, gameState: GameState, gameBoard: GameBoard) => boolean;
  executeStackMove: (move: StackMove, gameState: GameState, gameBoard: GameBoard) => boolean;
}

export const createMoveSlice: StateCreator<MoveSlice, [], [], MoveSlice> = (set, get) => ({
  // Move execution
  makeMove: (move: Move): boolean => {
    // This will be connected to gameState from gameFlowSlice in the combined store
    // For now, it's a placeholder that will be implemented in the integration layer
    console.warn('makeMove needs gameState access - will be implemented in combined store');
    return false;
  },

  makeMoveWithFeedback: (move: Move) => {
    // This will be implemented in the combined store
    console.warn('makeMoveWithFeedback needs gameState access - will be implemented in combined store');
    return {
      success: false,
      message: 'Not yet implemented in slice',
      type: 'error' as const
    };
  },

  placePiece: (stoneType: StoneType, position: Position): boolean => {
    // This will be implemented in the combined store
    console.warn('placePiece needs gameState access - will be implemented in combined store');
    return false;
  },

  placePieceWithFeedback: (stoneType: StoneType, position: Position) => {
    // This will be implemented in the combined store
    console.warn('placePieceWithFeedback needs gameState access - will be implemented in combined store');
    return {
      success: false,
      message: 'Not yet implemented in slice',
      type: 'error' as const
    };
  },

  moveStack: (from: Position, to: Position, stonesToMove: number, dropPattern?: number[]): boolean => {
    let finalDropPattern = dropPattern;
    if (!finalDropPattern) {
      const path = get().getMovementPath(from, to);
      finalDropPattern = new Array(path.length).fill(0);
      if (finalDropPattern.length > 0) {
        finalDropPattern[finalDropPattern.length - 1] = stonesToMove;
      }
    }

    const move: StackMove = {
      type: 'move',
      from,
      to,
      stonesToMove,
      dropPattern: finalDropPattern,
    };

    return get().makeMove(move);
  },

  // Move validation helpers
  getValidPlacementPositions: (stoneType: StoneType): Position[] => {
    // This will be implemented in the combined store
    console.warn('getValidPlacementPositions needs gameState access - will be implemented in combined store');
    return [];
  },

  getValidMoveTargets: (from: Position, stonesToMove: number): Position[] => {
    // This will be implemented in the combined store
    console.warn('getValidMoveTargets needs gameState access - will be implemented in combined store');
    return [];
  },

  // Undo functionality
  canUndo: (): boolean => {
    return moveHistoryService.canUndo();
  },

  undoLastMove: (): boolean => {
    try {
      const previousGameState = moveHistoryService.undoLastMove();
      if (!previousGameState) {
        return false;
      }

      // This will be implemented in the combined store to actually set the state
      console.warn('undoLastMove needs setState access - will be implemented in combined store');
      return true;
    } catch (error) {
      console.error('Failed to undo move:', error);
      return false;
    }
  },

  undoMoves: (count: number): boolean => {
    try {
      const previousGameState = moveHistoryService.undoMoves(count);
      if (!previousGameState) {
        return false;
      }

      // This will be implemented in the combined store
      console.warn('undoMoves needs setState access - will be implemented in combined store');
      return true;
    } catch (error) {
      console.error('Failed to undo moves:', error);
      return false;
    }
  },

  // Move history
  getMoveHistory: (): MoveHistoryEntry[] => {
    return moveHistoryService.getHistory();
  },

  getRecentMoves: (count: number = 10): MoveHistoryEntry[] => {
    return moveHistoryService.getRecentMoves(count);
  },

  getMoveStatistics: () => {
    return moveHistoryService.getMoveStatistics();
  },

  exportMoveHistory: (): string => {
    return moveHistoryService.exportMoveHistory();
  },

  // Helper methods
  getMovementPath: (from: Position, to: Position): Position[] => {
    const path: Position[] = [];

    if (from.row === to.row) {
      // Horizontal movement
      const direction = from.col < to.col ? 1 : -1;
      for (let col = from.col + direction; col !== to.col + direction; col += direction) {
        path.push({ row: from.row, col });
      }
    } else {
      // Vertical movement
      const direction = from.row < to.row ? 1 : -1;
      for (let row = from.row + direction; row !== to.row + direction; row += direction) {
        path.push({ row, col: from.col });
      }
    }

    return path;
  },

  startStackMovementAnimation: (move: StackMove) => {
    // This will be implemented in the combined store
    console.warn('startStackMovementAnimation needs gameState access - will be implemented in combined store');
    return { movingStones: [], path: [] };
  },

  // Internal helper methods
  executePlaceMove: (move: PlaceMove, gameState: GameState, gameBoard: GameBoard): boolean => {
    const { stoneType, position, isOpponentStone } = move;

    // Determine stone owner
    const stoneOwner = isOpponentStone
      ? (gameState.currentPlayer === Player.PLAYER1 ? Player.PLAYER2 : Player.PLAYER1)
      : gameState.currentPlayer;

    // Create the stone (ID generation will be handled by gameFlowSlice)
    const stone: Stone = {
      id: `stone_${Date.now()}_${Math.random()}`, // Temporary ID
      type: stoneType,
      owner: stoneOwner,
    };

    // Add stone to board
    gameBoard.addStone(position, stone);

    // Update reserves
    if (isOpponentStone) {
      const opponentPlayer = gameState.currentPlayer === Player.PLAYER1 ? Player.PLAYER2 : Player.PLAYER1;
      gameState.reserves[opponentPlayer].flatStones--;
    } else {
      if (stoneType === StoneType.CAPSTONE) {
        gameState.reserves[gameState.currentPlayer].capstones--;
      } else {
        gameState.reserves[gameState.currentPlayer].flatStones--;
      }
    }

    return true;
  },

  executeStackMove: (move: StackMove, gameState: GameState, gameBoard: GameBoard): boolean => {
    const { from, to, stonesToMove, dropPattern } = move;

    // Remove stones from source
    const movingStones = gameBoard.removeStones(from, stonesToMove);

    // Get movement path
    const path = get().getMovementPath(from, to);

    // Drop stones along the path
    // movingStones are ordered [bottom, ..., top]
    // We need to drop from top to bottom, maintaining their relative order
    let stonesRemaining = [...movingStones];

    for (let i = 0; i < path.length; i++) {
      const position = path[i];
      const stonesToDrop = dropPattern[i];

      if (stonesToDrop > 0) {
        // Check for wall flattening by capstone
        const topStone = gameBoard.getTopStone(position);
        if (topStone && topStone.type === StoneType.WALL) {
          // The leading stone is the last one in stonesRemaining (the top stone)
          const leadingStone = stonesRemaining[stonesRemaining.length - 1];

          // Only capstones can flatten walls
          if (leadingStone && leadingStone.type === StoneType.CAPSTONE) {
            // Flatten the wall (convert it to a flat stone)
            const stack = gameBoard.getStack(position);
            if (stack) {
              const wallStone = stack.stones[stack.stones.length - 1];
              wallStone.type = StoneType.FLAT;
            }
          }
        }

        // Drop stones from the bottom of the moving stack first
        // When you move a stack, you drop the bottom stones first, keeping the top
        // movingStones = [bottom, ..., top], so we splice from the beginning
        const stonesToPlace = stonesRemaining.splice(0, stonesToDrop);

        // Add stones in their original order (bottom to top)
        // addStone pushes to the end, so they maintain their relative order
        for (const stone of stonesToPlace) {
          gameBoard.addStone(position, stone);
        }
      }
    }

    return true;
  },
});
