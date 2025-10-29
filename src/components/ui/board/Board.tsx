import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Board as BoardType, Position } from '../../../types';
import { Square } from './Square';
import { calculateBoardSize } from '../../../utils/responsive';

export interface BoardProps {
  board: BoardType;
  highlightedPositions: Position[];
  selectedPosition: Position | null;
  validTargets: Position[];
  onSquarePress: (position: Position) => void;
  onSquareLongPress: (position: Position) => void;
}

export const Board: React.FC<BoardProps> = ({
  board,
  highlightedPositions,
  selectedPosition,
  validTargets,
  onSquarePress,
  onSquareLongPress,
}) => {
  const boardSize = calculateBoardSize();
  const squareSize = boardSize / board.size;

  const isPositionHighlighted = (position: Position): boolean => {
    return highlightedPositions.some(
      (p) => p.row === position.row && p.col === position.col
    );
  };

  const isPositionSelected = (position: Position): boolean => {
    if (!selectedPosition) return false;
    return (
      selectedPosition.row === position.row &&
      selectedPosition.col === position.col
    );
  };

  const isValidTarget = (position: Position): boolean => {
    return validTargets.some(
      (p) => p.row === position.row && p.col === position.col
    );
  };

  return (
    <View
      style={[styles.container, { width: boardSize, height: boardSize }]}
      accessibilityLabel={`${board.size} by ${board.size} game board`}
      accessibilityRole="none"
    >
      {board.squares.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={styles.row}>
          {row.map((stack, colIndex) => {
            const position: Position = { row: rowIndex, col: colIndex };
            return (
              <Square
                key={`square-${rowIndex}-${colIndex}`}
                position={position}
                stack={stack}
                squareSize={squareSize}
                isHighlighted={isPositionHighlighted(position)}
                isSelected={isPositionSelected(position)}
                isValidTarget={isValidTarget(position)}
                onPress={() => onSquarePress(position)}
                onLongPress={() => onSquareLongPress(position)}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
};

Board.displayName = 'Board';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
  },
});

export default Board;
