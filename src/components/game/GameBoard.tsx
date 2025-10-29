import React, { useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useGameStore } from '../../store';
import { Board } from '../ui/board/Board';
import { StoneTypeSelector } from '../ui/hud/StoneTypeSelector';
import { StackMoveSelector } from '../ui/hud/StackMoveSelector';
import { Position, StoneType } from '../../types';
import { HapticService } from '../../services/HapticService';

export const GameBoard: React.FC = () => {
  const gameState = useGameStore((state) => state.gameState);
  const uiState = useGameStore((state) => state.uiState);
  const placePieceWithFeedback = useGameStore((state) => state.placePieceWithFeedback);
  const selectPosition = useGameStore((state) => state.selectPosition);
  const selectStoneType = useGameStore((state) => state.selectStoneType);
  const clearSelection = useGameStore((state) => state.clearSelection);
  const getValidMoveTargets = useGameStore((state) => state.getValidMoveTargets);
  const moveStack = useGameStore((state) => state.moveStack);
  const isFirstTurn = useGameStore((state) => state.isFirstTurn);

  // Local state for stack move selector
  const [showStackMoveSelector, setShowStackMoveSelector] = useState(false);
  const [selectedStackPosition, setSelectedStackPosition] = useState<Position | null>(null);

  const handleSquarePress = useCallback(
    (position: Position) => {
      // If a stone type is selected, place it
      if (uiState.selectedStoneType) {
        const result = placePieceWithFeedback(uiState.selectedStoneType, position);
        if (result.success) {
          HapticService.stonePlacement();
        } else {
          HapticService.invalidMove();
        }
        return;
      }

      // If a position is selected, try to move the stack
      if (uiState.selectedPosition) {
        const from = uiState.selectedPosition;
        const to = position;

        // Check if it's a valid target
        const stack = gameState.board.squares[from.row][from.col];
        if (stack && stack.stones.length > 0) {
          const validTargets = getValidMoveTargets(from, stack.stones.length);
          const isValid = validTargets.some((t) => t.row === to.row && t.col === to.col);

          if (isValid) {
            // Move all stones to target
            const success = moveStack(from, to, stack.stones.length);
            if (success) {
              HapticService.stackMovement();
            }
          } else {
            HapticService.invalidMove();
          }
        }
        clearSelection();
        return;
      }

      // Otherwise, select the position
      const stack = gameState.board.squares[position.row][position.col];
      if (stack && stack.stones.length > 0) {
        selectPosition(position);
        HapticService.stoneSelection();
      }
    },
    [
      uiState.selectedStoneType,
      uiState.selectedPosition,
      gameState.board,
      placePieceWithFeedback,
      selectPosition,
      clearSelection,
      getValidMoveTargets,
      moveStack,
    ]
  );

  const handleSquareLongPress = useCallback(
    (position: Position) => {
      const stack = gameState.board.squares[position.row][position.col];
      if (stack && stack.stones.length > 1) {
        // Long press on stack - open stack movement selector
        setSelectedStackPosition(position);
        setShowStackMoveSelector(true);
        HapticService.longPress();
      }
    },
    [gameState.board]
  );

  const handleStackMoveSelect = useCallback(
    (from: Position, to: Position, stonesToMove: number, dropPattern?: number[]) => {
      const success = moveStack(from, to, stonesToMove, dropPattern);
      if (success) {
        HapticService.stackMovement();
      } else {
        HapticService.invalidMove();
      }
      setShowStackMoveSelector(false);
      setSelectedStackPosition(null);
      clearSelection();
    },
    [moveStack, clearSelection]
  );

  const handleStackMoveCancel = useCallback(() => {
    setShowStackMoveSelector(false);
    setSelectedStackPosition(null);
    clearSelection();
  }, [clearSelection]);

  // Calculate valid targets based on selection
  // Only show adjacent targets (1 square away) for simple click
  const validTargets: Position[] = React.useMemo(() => {
    if (uiState.selectedPosition) {
      const stack = gameState.board.squares[uiState.selectedPosition.row][uiState.selectedPosition.col];
      if (stack && stack.stones.length > 0) {
        // For simple selection, only show adjacent squares (1 move away)
        const allTargets = getValidMoveTargets(uiState.selectedPosition, stack.stones.length);
        // Filter to only adjacent positions (distance = 1)
        return allTargets.filter(target => {
          const rowDist = Math.abs(target.row - uiState.selectedPosition!.row);
          const colDist = Math.abs(target.col - uiState.selectedPosition!.col);
          return (rowDist === 1 && colDist === 0) || (rowDist === 0 && colDist === 1);
        });
      }
    }
    return [];
  }, [uiState.selectedPosition, gameState.board, getValidMoveTargets]);

  const handleStoneTypeSelect = useCallback(
    (type: StoneType | null) => {
      if (type === null) {
        // Deselect stone type and clear selection
        selectStoneType(null as any);
        clearSelection();
      } else {
        selectStoneType(type);
      }
      HapticService.buttonPress();
    },
    [selectStoneType, clearSelection]
  );

  // Get valid targets for stack move selector
  const stackMoveValidTargets = React.useMemo(() => {
    if (selectedStackPosition) {
      const stack = gameState.board.squares[selectedStackPosition.row][selectedStackPosition.col];
      if (stack && stack.stones.length > 0) {
        return getValidMoveTargets(selectedStackPosition, stack.stones.length);
      }
    }
    return [];
  }, [selectedStackPosition, gameState.board, getValidMoveTargets]);

  return (
    <ScrollView
      style={styles.scrollContainer}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Stone Type Selector */}
      <StoneTypeSelector
        selectedType={uiState.selectedStoneType}
        onSelectType={handleStoneTypeSelect}
        isFirstTurn={isFirstTurn()}
        reserves={gameState.reserves}
        currentPlayer={gameState.currentPlayer}
      />

      {/* Game Board */}
      <View style={styles.boardContainer}>
        <Board
          board={gameState.board}
          highlightedPositions={uiState.highlightedPositions}
          selectedPosition={uiState.selectedPosition}
          validTargets={validTargets}
          onSquarePress={handleSquarePress}
          onSquareLongPress={handleSquareLongPress}
        />
      </View>

      {/* Stack Move Selector Modal */}
      <StackMoveSelector
        visible={showStackMoveSelector}
        stack={selectedStackPosition ? gameState.board.squares[selectedStackPosition.row][selectedStackPosition.col] : null}
        position={selectedStackPosition}
        boardSize={gameState.board.size}
        validTargets={stackMoveValidTargets}
        onMoveSelect={handleStackMoveSelect}
        onCancel={handleStackMoveCancel}
      />
    </ScrollView>
  );
};

GameBoard.displayName = 'GameBoard';

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  boardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
});

export default GameBoard;
