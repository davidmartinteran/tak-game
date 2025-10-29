// Combined Zustand store - integrates all slices

import { create } from 'zustand';
import {
  Move,
  PlaceMove,
  StackMove,
  Position,
  StoneType,
  GameState,
  Player,
  Stone,
  StoneType as StoneTypeEnum
} from '../types';
import { GameBoard } from '../utils/gameLogic';
import { MoveValidator } from '../utils/moveValidator';
import { VictoryDetector } from '../utils/victoryDetector';
import { HapticService } from '../services/HapticService';
import { reportError, getUserFriendlyMessage } from '../services/ErrorHandlingService';
import { gamePersistenceService } from '../services/GamePersistenceService';
import { moveHistoryService } from '../services/MoveHistoryService';

// Import slices
import { BoardSlice, createBoardSlice } from './slices/boardSlice';
import { GameFlowSlice, createGameFlowSlice, generateStoneId } from './slices/gameFlowSlice';
import { UISlice, createUISlice, createInitialUIState } from './slices/uiSlice';
import { MoveSlice, createMoveSlice } from './slices/moveSlice';
import { PersistenceSlice, createPersistenceSlice } from './slices/persistenceSlice';

// Combined store type
type GameStore = BoardSlice & GameFlowSlice & UISlice & MoveSlice & PersistenceSlice;

// Create the combined store
export const useGameStore = create<GameStore>()((...args) => {
  const [set, get] = args;

  // Create base slices
  const boardSlice = createBoardSlice(...args);
  const gameFlowSlice = createGameFlowSlice(...args);
  const uiSlice = createUISlice(...args);
  const moveSlice = createMoveSlice(...args);
  const persistenceSlice = createPersistenceSlice(...args);

  // Override methods that need cross-slice access
  const crossSliceMethods = {
    // Override selectStoneType to include valid positions
    selectStoneType: (stoneType: StoneType) => {
      const { gameState } = get();
      const { uiState } = get();
      const validPositions = MoveValidator.getValidPlacementPositions(gameState, stoneType);

      set({
        uiState: {
          ...uiState,
          selectedStoneType: stoneType,
          highlightedPositions: validPositions,
        },
      });
    },

    // Override makeMove with full implementation
    makeMove: (move: Move): boolean => {
      const { gameState, uiState } = get();

      // Validate the move
      const validation = MoveValidator.validateMove(move, gameState);
      if (!validation.isValid) {
        console.warn('Invalid move:', validation.reason);
        return false;
      }

      // Store game state before move for history
      const gameStateBefore = JSON.parse(JSON.stringify(gameState));

      // For stack moves, trigger animation
      if (move.type === 'move') {
        set({
          uiState: {
            ...uiState,
            animatingMoves: [...uiState.animatingMoves, move],
          },
        });
      }

      // Execute the move
      const newGameState = { ...gameState };
      const gameBoard = GameBoard.fromBoard(newGameState.board);

      if (move.type === 'place') {
        const success = executePlaceMoveInternal(move, newGameState, gameBoard);
        if (!success) return false;
      } else if (move.type === 'move') {
        const success = get().executeStackMove(move, newGameState, gameBoard);
        if (!success) return false;
      }

      // Update board in game state
      newGameState.board = gameBoard.toBoard();

      // Add move to history
      newGameState.moveHistory.push(move);

      // Add move to detailed history service
      moveHistoryService.addMove(move, gameStateBefore, newGameState, gameState.currentPlayer);

      // Check for victory
      const victoryDetector = new VictoryDetector();
      const isBoardFull = gameBoard.isFull();
      const isLastPiece = victoryDetector.isLastPiece(newGameState.currentPlayer, newGameState.reserves);
      const victoryResult = victoryDetector.checkVictory(
        newGameState.board,
        newGameState.currentPlayer,
        isBoardFull,
        isLastPiece
      );

      if (victoryResult.winner) {
        newGameState.winner = victoryResult.winner;
        newGameState.gamePhase = 'ended';

        // Provide haptic feedback for victory
        HapticService.victory();

        // Save completed game to history
        const { gameStartTime } = get();
        if (gameStartTime) {
          gamePersistenceService.saveGameToHistory(newGameState, gameStartTime).catch(error => {
            console.error('Failed to save game to history:', error);
          });
        }

        // Store victory information
        set({
          gameState: newGameState,
          uiState: {
            ...uiState,
            showingVictoryModal: true,
            victoryType: victoryResult.type,
            winningPath: victoryResult.winningPath || []
          }
        });
      } else {
        // Switch to next player and update game phase
        get().updateGamePhase(newGameState);
        get().switchPlayerInState(newGameState);
        set({ gameState: newGameState });

        // Auto-save game state if enabled
        gamePersistenceService.getSettings().then(settings => {
          if (settings.autoSave) {
            get().saveGame().catch(error => {
              console.error('Auto-save failed:', error);
            });
          }
        });
      }

      // Clear UI selections
      get().clearSelection();

      return true;
    },

    // Override makeMoveWithFeedback with full implementation
    makeMoveWithFeedback: (move: Move) => {
      try {
        const { gameState } = get();

        // Validate the move
        const validation = MoveValidator.validateMove(move, gameState);
        if (!validation.isValid) {
          HapticService.invalidMove();

          const error = new Error(validation.reason || 'Invalid move');
          reportError(error, {
            component: 'GameStore',
            action: move.type === 'place' ? 'place_stone' : 'move_stack',
            gameState: {
              currentPlayer: gameState.currentPlayer,
              gamePhase: gameState.gamePhase,
              boardSize: gameState.board.size
            },
            additionalInfo: { move, validation }
          }, 'low');

          return {
            success: false,
            message: getUserFriendlyMessage(error, {
              component: 'GameStore',
              action: move.type === 'place' ? 'place_stone' : 'move_stack'
            }),
            type: 'error' as const
          };
        }

        // Execute the move
        const success = get().makeMove(move);

        if (success) {
          // Provide haptic feedback
          if (move.type === 'place') {
            HapticService.stonePlacement();
          } else if (move.type === 'move') {
            HapticService.stackMovement();
          }

          // Provide success feedback
          let message = '';
          if (move.type === 'place') {
            if (move.isOpponentStone) {
              message = 'Opponent stone placed successfully';
            } else {
              const stoneTypeName = move.stoneType.charAt(0).toUpperCase() + move.stoneType.slice(1);
              message = `${stoneTypeName} placed successfully`;
            }
          } else {
            message = 'Stack moved successfully';
          }

          return { success: true, message, type: 'info' as const };
        } else {
          const error = new Error('Move execution failed');
          reportError(error, {
            component: 'GameStore',
            action: 'execute_move',
            gameState: {
              currentPlayer: gameState.currentPlayer,
              gamePhase: gameState.gamePhase
            },
            additionalInfo: { move }
          }, 'medium');

          return {
            success: false,
            message: 'Move execution failed. Please try again.',
            type: 'error' as const
          };
        }
      } catch (error) {
        const gameError = error instanceof Error ? error : new Error(String(error));
        reportError(gameError, {
          component: 'GameStore',
          action: 'make_move_with_feedback',
          additionalInfo: { move }
        }, 'high');

        return {
          success: false,
          message: 'An unexpected error occurred. Please try again.',
          type: 'error' as const
        };
      }
    },

    // Override placePiece
    placePiece: (stoneType: StoneType, position: Position): boolean => {
      const { gameState } = get();

      const move: PlaceMove = {
        type: 'place',
        stoneType,
        position,
        isOpponentStone: gameState.gamePhase === 'first-turn',
      };

      return get().makeMove(move);
    },

    // Override placePieceWithFeedback
    placePieceWithFeedback: (stoneType: StoneType, position: Position) => {
      try {
        const { gameState } = get();

        const move: PlaceMove = {
          type: 'place',
          stoneType,
          position,
          isOpponentStone: gameState.gamePhase === 'first-turn',
        };

        return get().makeMoveWithFeedback(move);
      } catch (error) {
        const gameError = error instanceof Error ? error : new Error(String(error));
        reportError(gameError, {
          component: 'GameStore',
          action: 'place_piece_with_feedback',
          additionalInfo: { stoneType, position }
        }, 'medium');

        return {
          success: false,
          message: 'Failed to place stone. Please try again.',
          type: 'error' as const
        };
      }
    },

    // Override getValidPlacementPositions
    getValidPlacementPositions: (stoneType: StoneType): Position[] => {
      const { gameState } = get();
      return MoveValidator.getValidPlacementPositions(gameState, stoneType);
    },

    // Override getValidMoveTargets
    getValidMoveTargets: (from: Position, stonesToMove: number): Position[] => {
      const { gameState } = get();
      return MoveValidator.getValidMoveTargets(gameState, from, stonesToMove);
    },

    // Override startStackMovementAnimation
    startStackMovementAnimation: (move: StackMove) => {
      const { gameState } = get();
      const gameBoard = GameBoard.fromBoard(gameState.board);
      const movingStones = gameBoard.getTopStones(move.from, move.stonesToMove);
      const path = get().getMovementPath(move.from, move.to);

      console.log('Starting stack movement animation:', { move, movingStones, path });

      return { movingStones, path };
    },

    // Override undoLastMove
    undoLastMove: (): boolean => {
      try {
        const previousGameState = moveHistoryService.undoLastMove();
        if (!previousGameState) {
          return false;
        }

        set({
          gameState: previousGameState,
          uiState: createInitialUIState(),
        });

        // Auto-save after undo if enabled
        gamePersistenceService.getSettings().then(settings => {
          if (settings.autoSave) {
            get().saveGame().catch(error => {
              console.error('Auto-save after undo failed:', error);
            });
          }
        });

        return true;
      } catch (error) {
        console.error('Failed to undo move:', error);
        return false;
      }
    },

    // Override undoMoves
    undoMoves: (count: number): boolean => {
      try {
        const previousGameState = moveHistoryService.undoMoves(count);
        if (!previousGameState) {
          return false;
        }

        set({
          gameState: previousGameState,
          uiState: createInitialUIState(),
        });

        // Auto-save after undo if enabled
        gamePersistenceService.getSettings().then(settings => {
          if (settings.autoSave) {
            get().saveGame().catch(error => {
              console.error('Auto-save after undo failed:', error);
            });
          }
        });

        return true;
      } catch (error) {
        console.error('Failed to undo moves:', error);
        return false;
      }
    },

    // Override saveGame
    saveGame: async () => {
      try {
        const { gameState } = get();
        await gamePersistenceService.saveCurrentGame(gameState);
      } catch (error) {
        console.error('Failed to save game:', error);
        throw error;
      }
    },

    // Override loadGame
    loadGame: async (): Promise<boolean> => {
      try {
        const savedGame = await gamePersistenceService.loadCurrentGame();
        if (!savedGame) {
          return false;
        }

        set({
          gameState: savedGame.gameState,
          uiState: createInitialUIState(),
          gameStartTime: savedGame.timestamp,
        });

        // Rebuild move history
        moveHistoryService.clearHistory();

        return true;
      } catch (error) {
        console.error('Failed to load game:', error);
        return false;
      }
    },

    // Override initializeGame to also reset UI and move history
    initializeGame: (boardSize: number) => {
      moveHistoryService.clearHistory();
      gameFlowSlice.initializeGame(boardSize);
      uiSlice.resetUIState();
    },

    // Override resetGame
    resetGame: () => {
      moveHistoryService.clearHistory();
      gameFlowSlice.resetGame();
      uiSlice.resetUIState();
    },

    // Override canPlayerMove with full implementation
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

      // Check if player has any stacks they can move
      const controlledPositions = gameBoard.getPositionsControlledBy(player);
      for (const position of controlledPositions) {
        const stackHeight = gameBoard.getStackHeight(position);
        const maxCarry = Math.min(stackHeight, gameState.board.size);

        for (let stonesToMove = 1; stonesToMove <= maxCarry; stonesToMove++) {
          const validTargets = get().getValidMoveTargets(position, stonesToMove);
          if (validTargets.length > 0) {
            return true;
          }
        }
      }

      return false;
    },
  };

  // Combine all slices and overrides
  return {
    ...boardSlice,
    ...gameFlowSlice,
    ...uiSlice,
    ...moveSlice,
    ...persistenceSlice,
    ...crossSliceMethods,
  };
});

// Internal helper function for place move
function executePlaceMoveInternal(move: PlaceMove, gameState: GameState, gameBoard: GameBoard): boolean {
  const { stoneType, position, isOpponentStone } = move;

  // Determine stone owner
  const stoneOwner = isOpponentStone
    ? (gameState.currentPlayer === Player.PLAYER1 ? Player.PLAYER2 : Player.PLAYER1)
    : gameState.currentPlayer;

  // Create the stone
  const stone: Stone = {
    id: generateStoneId(),
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
    if (stoneType === StoneTypeEnum.CAPSTONE) {
      gameState.reserves[gameState.currentPlayer].capstones--;
    } else {
      gameState.reserves[gameState.currentPlayer].flatStones--;
    }
  }

  return true;
}

// Export the store type for use in components
export type { GameStore };
