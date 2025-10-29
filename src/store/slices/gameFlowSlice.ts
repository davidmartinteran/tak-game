// Game flow slice - manages game phase, turns, and victory conditions

import { StateCreator } from 'zustand';
import { Player, GameState, PlayerReserve } from '../../types';
import { VictoryDetector } from '../../utils/victoryDetector';
import { GameBoard, getGameConfig } from '../../utils/gameLogic';

export interface GameFlowSlice {
  // Game flow state
  gameState: GameState;
  gameStartTime: number | null;

  // Game initialization
  initializeGame: (boardSize: number) => void;
  resetGame: () => void;
  cleanupGameState: () => void;

  // Game phase management
  updateGamePhase: (gameState: GameState) => void;
  isFirstTurn: () => boolean;
  isGameEnded: () => boolean;

  // Player management
  switchPlayer: () => void;
  switchPlayerInState: (gameState: GameState) => void;
  getCurrentPlayerReserve: () => PlayerReserve;
  canPlayerMove: (player: Player) => boolean;

  // Victory detection
  checkVictory: () => Player | 'draw' | null;
}

// Helper function to create initial game state
const createInitialGameState = (boardSize: number): GameState => {
  const config = getGameConfig(boardSize);
  const gameBoard = new GameBoard(boardSize);

  return {
    board: gameBoard.toBoard(),
    currentPlayer: Player.PLAYER1,
    reserves: {
      [Player.PLAYER1]: {
        flatStones: config.flatStones,
        capstones: config.capstones,
      },
      [Player.PLAYER2]: {
        flatStones: config.flatStones,
        capstones: config.capstones,
      },
    },
    gamePhase: 'first-turn',
    winner: null,
    moveHistory: [],
  };
};

// Generate unique stone ID
let stoneIdCounter = 0;
export const generateStoneId = (): string => {
  return `stone_${++stoneIdCounter}`;
};

export const resetStoneIdCounter = () => {
  stoneIdCounter = 0;
};

export const createGameFlowSlice: StateCreator<GameFlowSlice, [], [], GameFlowSlice> = (set, get) => ({
  // Initial state
  gameState: createInitialGameState(5),
  gameStartTime: null,

  // Game initialization
  initializeGame: (boardSize: number) => {
    const gameStartTime = Date.now();
    resetStoneIdCounter();

    set({
      gameState: createInitialGameState(boardSize),
      gameStartTime,
    });
  },

  resetGame: () => {
    const { gameState } = get();
    get().cleanupGameState();
    const gameStartTime = Date.now();
    resetStoneIdCounter();

    set({
      gameState: createInitialGameState(gameState.board.size),
      gameStartTime,
    });
  },

  cleanupGameState: () => {
    resetStoneIdCounter();
  },

  // Game phase management
  updateGamePhase: (gameState: GameState) => {
    if (gameState.gamePhase === 'first-turn') {
      let player1FirstMove = false;
      let player2FirstMove = false;

      for (let i = 0; i < gameState.moveHistory.length; i++) {
        const move = gameState.moveHistory[i];
        if (move.type === 'place' && move.isOpponentStone) {
          if (i % 2 === 0) {
            player1FirstMove = true;
          } else {
            player2FirstMove = true;
          }
        }
      }

      if (player1FirstMove && player2FirstMove) {
        gameState.gamePhase = 'normal';
        // Ensure Player 1 starts the normal phase
        gameState.currentPlayer = Player.PLAYER1;
      }
    }
  },

  isFirstTurn: (): boolean => {
    const { gameState } = get();
    return gameState.gamePhase === 'first-turn';
  },

  isGameEnded: (): boolean => {
    const { gameState } = get();
    return gameState.gamePhase === 'ended';
  },

  // Player management
  switchPlayer: () => {
    const { gameState } = get();
    const newGameState = { ...gameState };
    get().switchPlayerInState(newGameState);
    set({ gameState: newGameState });
  },

  switchPlayerInState: (gameState: GameState) => {
    gameState.currentPlayer = gameState.currentPlayer === Player.PLAYER1
      ? Player.PLAYER2
      : Player.PLAYER1;
  },

  getCurrentPlayerReserve: (): PlayerReserve => {
    const { gameState } = get();
    return gameState.reserves[gameState.currentPlayer];
  },

  canPlayerMove: (player: Player): boolean => {
    const { gameState } = get();
    const gameBoard = GameBoard.fromBoard(gameState.board);

    // Check if player has any stones to place
    const reserve = gameState.reserves[player];
    if (reserve.flatStones > 0 || reserve.capstones > 0) {
      const emptyPositions = gameBoard.getEmptyPositions();
      if (emptyPositions.length > 0) {
        return true;
      }
    }

    // Note: Full stack movement validation would require access to moveSlice
    // This is simplified for now
    return false;
  },

  // Victory detection
  checkVictory: (): Player | 'draw' | null => {
    const { gameState } = get();
    const victoryDetector = new VictoryDetector();
    const isBoardFull = victoryDetector.isBoardFull(gameState.board);
    const isLastPiece = victoryDetector.isLastPiece(gameState.currentPlayer, gameState.reserves);
    const victoryResult = victoryDetector.checkVictory(
      gameState.board,
      gameState.currentPlayer,
      isBoardFull,
      isLastPiece
    );
    return victoryResult.winner;
  },
});
