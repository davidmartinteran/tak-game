import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { GameBoard } from './GameBoard';
import { VictoryModal } from '../ui/feedback/VictoryModal';
import { GameStatus } from '../ui/hud/GameStatus';
import { Toast } from '../ui/feedback/Toast';
import { Button } from '../ui/common/Button';
import { LoadingState } from '../ui/common/LoadingState';
import { useGameStore } from '../../store';
import { ToastProvider, useToast } from '../../contexts/ToastContext';
import { ErrorProvider, useErrorHandler } from '../../contexts/ErrorContext';
import { ErrorBoundary } from '../layout/ErrorBoundary';
import { Colors } from '../../constants/colors';
import { scaleWidth, scaleHeight, scaleFontSize } from '../../utils/responsive';

interface GameFlowManagerContentProps {
  initialBoardSize?: number;
  resumeGame?: boolean;
}

const GameFlowManagerContent: React.FC<GameFlowManagerContentProps> = ({ initialBoardSize, resumeGame }) => {
  const gameState = useGameStore((state) => state.gameState);
  const uiState = useGameStore((state) => state.uiState);
  const initializeGame = useGameStore((state) => state.initializeGame);
  const resetGame = useGameStore((state) => state.resetGame);
  const cleanupGameState = useGameStore((state) => state.cleanupGameState);
  const setShowingVictoryModal = useGameStore((state) => state.setShowingVictoryModal);
  const isGameEnded = useGameStore((state) => state.isGameEnded);
  const isFirstTurn = useGameStore((state) => state.isFirstTurn);
  const loadGame = useGameStore((state) => state.loadGame);
  const saveGame = useGameStore((state) => state.saveGame);
  const clearSavedGame = useGameStore((state) => state.clearSavedGame);
  
  // Use toast context
  const { toastVisible, toastMessage, toastType, hideToast } = useToast();
  
  // Use error handler
  const { reportError, showErrorToast, showSuccessToast, showInfoToast } = useErrorHandler();
  
  // Local state for flow management
  const [gameStarted, setGameStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Track game phase changes for user guidance
  const [lastGamePhase, setLastGamePhase] = useState<string | null>(null);

  // Handle board size selection from menu
  const handleBoardSizeSelect = React.useCallback(async (size: number) => {
    try {
      setIsLoading(true);

      // Clear any saved game when starting a new game
      await clearSavedGame();

      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 300));

      initializeGame(size);
      setGameStarted(true);
      setInitialized(true);
      setLastGamePhase('first-turn');

      // Show welcome message with first-turn instructions
      setTimeout(() => {
        showInfoToast(
          `New ${size}x${size} game started! First turn: place opponent's flat stone.`
        );
      }, 500);
    } catch (error) {
      const gameError = error instanceof Error ? error : new Error(String(error));
      showErrorToast(gameError, {
        component: 'GameFlowManager',
        action: 'initialize_game',
        additionalInfo: { boardSize: size }
      });
    } finally {
      setIsLoading(false);
    }
  }, [initializeGame, showInfoToast, showErrorToast, clearSavedGame]);

  // Load saved game if resumeGame is true
  useEffect(() => {
    if (resumeGame && !gameStarted) {
      const loadSavedGame = async () => {
        try {
          setIsLoading(true);

          const success = await loadGame();
          if (success) {
            setGameStarted(true);
            setInitialized(true);
            setLastGamePhase(gameState.gamePhase);

            setTimeout(() => {
              showSuccessToast('Game resumed successfully!');
            }, 500);
          } else {
            showErrorToast(
              new Error('No saved game found'),
              {
                component: 'GameFlowManager',
                action: 'resume_game'
              }
            );
            // Redirect to board size selection if no saved game
            router.replace('/board-size');
          }
        } catch (error) {
          const gameError = error instanceof Error ? error : new Error(String(error));
          showErrorToast(gameError, {
            component: 'GameFlowManager',
            action: 'resume_game'
          });
          // Redirect to board size selection on error
          router.replace('/board-size');
        } finally {
          setIsLoading(false);
        }
      };

      loadSavedGame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeGame]); // Only run when resumeGame changes

  // Initialize game with provided board size
  useEffect(() => {
    if (initialBoardSize && !initialized && !resumeGame) {
      handleBoardSizeSelect(initialBoardSize);
    }
  }, [initialBoardSize, initialized, resumeGame, handleBoardSizeSelect]);

  // Handle new game from victory modal - clear saved game and go to size selection
  const handleNewGameFromVictory = async () => {
    try {
      setShowingVictoryModal(false);
      await clearSavedGame(); // Clear any saved game
      cleanupGameState();
      router.replace('/board-size'); // Navigate to board size selection screen
    } catch (error) {
      const gameError = error instanceof Error ? error : new Error(String(error));
      showErrorToast(gameError, {
        component: 'GameFlowManager',
        action: 'new_game_from_victory'
      });
      // Still navigate even if cleanup failed
      router.replace('/board-size');
    }
  };

  // Handle main menu from victory modal
  const handleMainMenuFromVictory = () => {
    try {
      cleanupGameState();
      setShowingVictoryModal(false);
      router.back(); // Return to main menu
    } catch (error) {
      const gameError = error instanceof Error ? error : new Error(String(error));
      showErrorToast(gameError, {
        component: 'GameFlowManager',
        action: 'return_to_main_menu'
      });
      // Still try to navigate back even if cleanup failed
      router.back();
    }
  };

  // Handle restart current game
  const handleRestartGame = () => {
    Alert.alert(
      'Restart Game',
      'Are you sure you want to restart the current game? All progress will be lost.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Restart',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await new Promise(resolve => setTimeout(resolve, 200));
              
              resetGame();
              setLastGamePhase('first-turn');
              showSuccessToast('Game restarted! First turn: place opponent\'s flat stone.');
            } catch (error) {
              const gameError = error instanceof Error ? error : new Error(String(error));
              showErrorToast(gameError, {
                component: 'GameFlowManager',
                action: 'restart_game'
              }, {
                actionButton: {
                  text: 'Try Again',
                  onPress: () => handleRestartGame()
                }
              });
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  // Handle return to main menu - always save automatically
  const handleReturnToMenu = async () => {
    try {
      // Only save if game hasn't ended
      if (!isGameEnded()) {
        await saveGame();
      }
      router.back(); // Return to main menu
    } catch (error) {
      const gameError = error instanceof Error ? error : new Error(String(error));
      showErrorToast(gameError, {
        component: 'GameFlowManager',
        action: 'save_and_exit'
      });
      // Still navigate back even if save failed
      router.back();
    }
  };

  // Handle change board size - clear saved game and go to size selection
  const handleChangeBoardSize = async () => {
    try {
      await clearSavedGame(); // Clear any saved game
      cleanupGameState();
      router.replace('/board-size'); // Navigate to board size selection screen
    } catch (error) {
      const gameError = error instanceof Error ? error : new Error(String(error));
      showErrorToast(gameError, {
        component: 'GameFlowManager',
        action: 'change_board_size'
      });
      // Still navigate even if clear failed
      router.replace('/board-size');
    }
  };

  // Auto-show victory modal when game ends
  useEffect(() => {
    console.log('Victory check:', {
      isGameEnded: isGameEnded(),
      winner: gameState.winner,
      showingVictoryModal: uiState.showingVictoryModal,
      gamePhase: gameState.gamePhase
    });
    
    if (isGameEnded() && gameState.winner && !uiState.showingVictoryModal) {
      console.log('Showing victory modal for winner:', gameState.winner);
      // Small delay to let the final move animation complete
      const timer = setTimeout(() => {
        setShowingVictoryModal(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [gameState.winner, gameState.gamePhase, isGameEnded, uiState.showingVictoryModal, setShowingVictoryModal]);

  // Track game phase changes and provide user guidance
  useEffect(() => {
    if (!gameStarted) return;
    
    const currentPhase = gameState.gamePhase;
    
    // Detect phase transitions
    if (lastGamePhase !== currentPhase) {
      setLastGamePhase(currentPhase);
      
      if (currentPhase === 'normal' && lastGamePhase === 'first-turn') {
        // Transition from first-turn to normal gameplay
        showSuccessToast('First turn phase complete! Now play with your own stones.');
      } else if (currentPhase === 'ended') {
        // Game ended
        if (gameState.winner === 'draw') {
          showInfoToast('Game ended in a draw!');
        } else if (gameState.winner) {
          const playerName = gameState.winner === 'player1' ? 'Player 1' : 'Player 2';
          showSuccessToast(`${playerName} wins!`);
        }
      }
    }
  }, [gameState.gamePhase, gameState.winner, lastGamePhase, gameStarted, showInfoToast, showSuccessToast]);

  // Provide turn-based guidance
  useEffect(() => {
    if (!gameStarted || isGameEnded()) return;
    
    // Show guidance for first-turn phase
    if (isFirstTurn() && gameState.moveHistory.length === 0) {
      // This is handled in handleBoardSizeSelect, so skip here
      return;
    }
    
    // Show guidance when switching players in first-turn phase
    if (isFirstTurn() && gameState.moveHistory.length > 0) {
      const isPlayer1Turn = gameState.currentPlayer === 'player1';
      const playerName = isPlayer1Turn ? 'Player 1' : 'Player 2';
      
      // Check if this player has already made their first move
      const playerMoves = gameState.moveHistory.filter((_, index) => {
        return isPlayer1Turn ? index % 2 === 0 : index % 2 === 1;
      });
      
      if (playerMoves.length === 0) {
        // This player hasn't made their first move yet
        setTimeout(() => {
          showInfoToast(`${playerName}'s turn: place opponent's flat stone.`);
        }, 300);
      }
    }
  }, [gameState.currentPlayer, gameState.moveHistory.length, gameStarted, isFirstTurn, isGameEnded, gameState.moveHistory, showInfoToast]);

  // If no board size provided and not resuming, redirect to board size selection
  React.useEffect(() => {
    if (!initialBoardSize && !resumeGame && !initialized && !isLoading) {
      router.replace('/board-size');
    }
  }, [initialBoardSize, resumeGame, initialized, isLoading]);

  // Show loading while initializing
  if (isLoading) {
    return (
      <View style={styles.container}>
        <LoadingState
          visible={true}
          message="Loading game..."
          overlay={false}
        />
      </View>
    );
  }

  // Don't render game if not started
  if (!gameStarted) {
    return (
      <View style={styles.container}>
        <LoadingState
          visible={true}
          message="Initializing game..."
          overlay={false}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Game header with status and controls */}
      <View style={styles.header}>
        <GameStatus gameState={gameState} />
        
        <View style={styles.controlButtons}>
          <Button
            title="Menu"
            onPress={handleReturnToMenu}
            style={StyleSheet.flatten([styles.controlButton, styles.menuButton])}
            textStyle={styles.controlButtonText}
          />
          <Button
            title="Change Size"
            onPress={handleChangeBoardSize}
            style={StyleSheet.flatten([styles.controlButton, styles.changeSizeButton])}
            textStyle={styles.controlButtonText}
          />
          <Button
            title="Restart"
            onPress={handleRestartGame}
            style={StyleSheet.flatten([styles.controlButton, styles.restartButton])}
            textStyle={styles.controlButtonText}
          />
        </View>
      </View>

      {/* Game board */}
      <View style={styles.gameContainer}>
        <ErrorBoundary
          onError={(error: Error, errorInfo: React.ErrorInfo) => {
            reportError(error, {
              component: 'GameBoard',
              action: 'render',
              additionalInfo: { errorInfo }
            }, 'high');
          }}
        >
          <GameBoard />
        </ErrorBoundary>
      </View>

      {/* Loading overlay */}
      <LoadingState
        visible={isLoading}
        message="Loading game..."
        overlay={true}
      />

      {/* Victory modal */}
      <VictoryModal
        visible={uiState.showingVictoryModal}
        winner={gameState.winner}
        victoryType={uiState.victoryType}
        winningPath={uiState.winningPath}
        onNewGame={handleNewGameFromVictory}
        onMainMenu={handleMainMenuFromVictory}
        onClose={() => setShowingVictoryModal(false)}
      />

      {/* Toast notifications for user feedback */}
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        duration={4000}
        onHide={hideToast}
      />
    </View>
  );
};

interface GameFlowManagerProps {
  initialBoardSize?: number;
  resumeGame?: boolean;
}

export const GameFlowManager: React.FC<GameFlowManagerProps> = ({ initialBoardSize, resumeGame }) => {
  return (
    <ErrorBoundary
      onError={(error: Error, errorInfo: React.ErrorInfo) => {
        console.error('Critical GameFlowManager error:', error, errorInfo);
      }}
    >
      <ErrorProvider>
        <ToastProvider>
          <GameFlowManagerContent initialBoardSize={initialBoardSize} resumeGame={resumeGame} />
        </ToastProvider>
      </ErrorProvider>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  header: {
    paddingHorizontal: scaleWidth(16),
    paddingTop: scaleHeight(8),
    paddingBottom: scaleHeight(4),
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.boardDark,
  },

  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: scaleHeight(8),
    gap: scaleWidth(12),
  },

  controlButton: {
    flex: 1,
    paddingVertical: scaleHeight(8),
    borderRadius: 6,
  },

  menuButton: {
    backgroundColor: Colors.textSecondary,
  },

  changeSizeButton: {
    backgroundColor: Colors.accent,
  },

  restartButton: {
    backgroundColor: Colors.warning,
  },

  controlButtonText: {
    fontSize: scaleFontSize(14),
    fontWeight: '600',
    color: Colors.background,
  },

  gameContainer: {
    flex: 1,
  },
});