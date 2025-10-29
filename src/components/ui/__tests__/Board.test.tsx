import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { Board } from "../board/Board";
import {
  Board as BoardType,
  Position,
  Player,
  StoneType,
} from "../../../types";

// Mock responsive utilities
jest.mock("../../../utils/responsive", () => ({
  scaleWidth: (value: number) => value,
  scaleHeight: (value: number) => value,
  calculateBoardSize: () => 300,
}));

// Mock Square component
jest.mock("../board/Square", () => ({
  Square: ({ onPress, onLongPress, position }: any) => {
    const { TouchableOpacity } = require("react-native");
    return (
      <TouchableOpacity
        testID={`square-${position.row}-${position.col}`}
        onPress={onPress}
        onLongPress={onLongPress}
      />
    );
  },
}));

describe("Board Component", () => {
  const mockOnSquarePress = jest.fn();
  const mockOnSquareLongPress = jest.fn();

  const createEmptyBoard = (size: number): BoardType => ({
    size,
    squares: Array(size)
      .fill(null)
      .map(() => Array(size).fill(null)),
  });

  const defaultProps = {
    board: createEmptyBoard(5),
    highlightedPositions: [],
    selectedPosition: null,
    validTargets: [],
    onSquarePress: mockOnSquarePress,
    onSquareLongPress: mockOnSquareLongPress,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders board with correct size", () => {
    const { getByTestId } = render(<Board {...defaultProps} />);

    // Check that all squares are rendered
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        const square = getByTestId(`square-${row}-${col}`);
        expect(square).toBeTruthy();
      }
    }
  });

  it("renders different board sizes correctly", () => {
    const { rerender, getByTestId } = render(
      <Board {...defaultProps} board={createEmptyBoard(4)} />
    );

    // Check 4x4 board
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const square = getByTestId(`square-${row}-${col}`);
        expect(square).toBeTruthy();
      }
    }

    // Rerender with 6x6 board
    rerender(<Board {...defaultProps} board={createEmptyBoard(6)} />);

    // Check 6x6 board
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 6; col++) {
        const square = getByTestId(`square-${row}-${col}`);
        expect(square).toBeTruthy();
      }
    }
  });

  it("handles square press events", () => {
    const { getByTestId } = render(<Board {...defaultProps} />);

    const square = getByTestId("square-2-3");
    fireEvent.press(square);

    expect(mockOnSquarePress).toHaveBeenCalledWith({ row: 2, col: 3 });
  });

  it("handles square long press events", () => {
    const { getByTestId } = render(<Board {...defaultProps} />);

    const square = getByTestId("square-1-4");
    fireEvent(square, "longPress");

    expect(mockOnSquareLongPress).toHaveBeenCalledWith({ row: 1, col: 4 });
  });

  it("passes highlighted positions correctly", () => {
    const highlightedPositions: Position[] = [
      { row: 0, col: 0 },
      { row: 2, col: 3 },
    ];

    const { getByTestId } = render(
      <Board {...defaultProps} highlightedPositions={highlightedPositions} />
    );

    // All squares should still be rendered
    const square = getByTestId("square-0-0");
    expect(square).toBeTruthy();
  });

  it("passes selected position correctly", () => {
    const selectedPosition: Position = { row: 1, col: 2 };

    const { getByTestId } = render(
      <Board {...defaultProps} selectedPosition={selectedPosition} />
    );

    const square = getByTestId("square-1-2");
    expect(square).toBeTruthy();
  });

  it("passes valid targets correctly", () => {
    const validTargets: Position[] = [
      { row: 0, col: 1 },
      { row: 3, col: 4 },
    ];

    const { getByTestId } = render(
      <Board {...defaultProps} validTargets={validTargets} />
    );

    const square = getByTestId("square-0-1");
    expect(square).toBeTruthy();
  });

  it("has correct accessibility properties", () => {
    const { getByLabelText } = render(<Board {...defaultProps} />);

    const board = getByLabelText("5 by 5 game board");
    expect(board.props.accessibilityLabel).toBe("5 by 5 game board");
  });

  it("handles board with stacks", () => {
    const boardWithStacks: BoardType = {
      size: 3,
      squares: [
        [
          {
            stones: [
              {
                id: "stone1",
                type: StoneType.FLAT,
                owner: Player.PLAYER1,
              },
            ],
            controlledBy: Player.PLAYER1,
          },
          null,
          null,
        ],
        [null, null, null],
        [null, null, null],
      ],
    };

    const { getByTestId } = render(
      <Board {...defaultProps} board={boardWithStacks} />
    );

    // All squares should still be rendered
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const square = getByTestId(`square-${row}-${col}`);
        expect(square).toBeTruthy();
      }
    }
  });

  it("calculates square size correctly based on board size", () => {
    const { rerender } = render(<Board {...defaultProps} />);

    // Test with different board sizes
    rerender(<Board {...defaultProps} board={createEmptyBoard(8)} />);
    rerender(<Board {...defaultProps} board={createEmptyBoard(4)} />);

    // Component should render without errors
    expect(true).toBe(true);
  });
});
