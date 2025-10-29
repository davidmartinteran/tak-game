// Board state slice - manages board state and basic board operations

import { StateCreator } from 'zustand';
import { Board, Position, Stack, Stone } from '../../types';
import { GameBoard } from '../../utils/gameLogic';

export interface BoardSlice {
  // Board-specific state
  board: Board;

  // Board operations
  getBoardInstance: () => GameBoard;
  getStack: (position: Position) => Stack | null;
  getTopStone: (position: Position) => Stone | null;
  getStackHeight: (position: Position) => number;
  isEmpty: (position: Position) => boolean;
  getEmptyPositions: () => Position[];
}

export const createBoardSlice: StateCreator<BoardSlice> = (set, get) => ({
  // Initial state
  board: new GameBoard(5).toBoard(),

  // Board operations
  getBoardInstance: () => {
    const { board } = get();
    return GameBoard.fromBoard(board);
  },

  getStack: (position: Position): Stack | null => {
    const { board } = get();
    if (position.row < 0 || position.row >= board.size ||
        position.col < 0 || position.col >= board.size) {
      return null;
    }
    return board.squares[position.row][position.col];
  },

  getTopStone: (position: Position): Stone | null => {
    const stack = get().getStack(position);
    if (!stack || stack.stones.length === 0) {
      return null;
    }
    return stack.stones[stack.stones.length - 1];
  },

  getStackHeight: (position: Position): number => {
    const stack = get().getStack(position);
    return stack ? stack.stones.length : 0;
  },

  isEmpty: (position: Position): boolean => {
    const stack = get().getStack(position);
    return !stack || stack.stones.length === 0;
  },

  getEmptyPositions: (): Position[] => {
    const gameBoard = get().getBoardInstance();
    return gameBoard.getEmptyPositions();
  },
});
