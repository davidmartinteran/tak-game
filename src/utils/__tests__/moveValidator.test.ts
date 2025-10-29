import { MoveValidator } from "../moveValidator";
import {
  GameState,
  PlaceMove,
  StackMove,
  StoneType,
  Player,
  Stack,
  Board,
} from "../../types";
import { getGameConfig } from "../gameLogic";

describe("MoveValidator", () => {
  let gameState: GameState;
  let board: Board;

  beforeEach(() => {
    // Create a 5x5 board for testing
    const config = getGameConfig(5);
    board = {
      size: 5,
      squares: Array(5)
        .fill(null)
        .map(() => Array(5).fill(null)),
    };

    gameState = {
      board,
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
      gamePhase: "normal",
      winner: null,
      moveHistory: [],
    };
  });

  describe("validatePlaceMove", () => {
    describe("basic validation", () => {
      it("should validate placing flat stone on empty square", () => {
        const move: PlaceMove = {
          type: "place",
          stoneType: StoneType.FLAT,
          position: { row: 2, col: 2 },
        };

        const result = MoveValidator.validatePlaceMove(move, gameState);
        expect(result.isValid).toBe(true);
      });

      it("should validate placing wall on empty square", () => {
        const move: PlaceMove = {
          type: "place",
          stoneType: StoneType.WALL,
          position: { row: 2, col: 2 },
        };

        const result = MoveValidator.validatePlaceMove(move, gameState);
        expect(result.isValid).toBe(true);
      });

      it("should validate placing capstone on empty square", () => {
        const move: PlaceMove = {
          type: "place",
          stoneType: StoneType.CAPSTONE,
          position: { row: 2, col: 2 },
        };

        const result = MoveValidator.validatePlaceMove(move, gameState);
        expect(result.isValid).toBe(true);
      });

      it("should reject placement outside board", () => {
        const move: PlaceMove = {
          type: "place",
          stoneType: StoneType.FLAT,
          position: { row: -1, col: 2 },
        };

        const result = MoveValidator.validatePlaceMove(move, gameState);
        expect(result.isValid).toBe(false);
        expect(result.reason).toBe("Position is outside the board");
      });

      it("should reject placement on occupied square", () => {
        // Place a stone first
        const stack: Stack = {
          stones: [
            {
              id: "stone1",
              type: StoneType.FLAT,
              owner: Player.PLAYER1,
            },
          ],
          controlledBy: Player.PLAYER1,
        };
        board.squares[2][2] = stack;

        const move: PlaceMove = {
          type: "place",
          stoneType: StoneType.FLAT,
          position: { row: 2, col: 2 },
        };

        const result = MoveValidator.validatePlaceMove(move, gameState);
        expect(result.isValid).toBe(false);
        expect(result.reason).toBe("Position is already occupied");
      });
    });

    describe("reserve validation", () => {
      it("should reject flat stone placement when no flat stones remaining", () => {
        gameState.reserves[Player.PLAYER1].flatStones = 0;

        const move: PlaceMove = {
          type: "place",
          stoneType: StoneType.FLAT,
          position: { row: 2, col: 2 },
        };

        const result = MoveValidator.validatePlaceMove(move, gameState);
        expect(result.isValid).toBe(false);
        expect(result.reason).toBe("No flat stones remaining");
      });

      it("should reject wall placement when no flat stones remaining", () => {
        gameState.reserves[Player.PLAYER1].flatStones = 0;

        const move: PlaceMove = {
          type: "place",
          stoneType: StoneType.WALL,
          position: { row: 2, col: 2 },
        };

        const result = MoveValidator.validatePlaceMove(move, gameState);
        expect(result.isValid).toBe(false);
        expect(result.reason).toBe(
          "No flat stones remaining (walls use flat stones)"
        );
      });

      it("should reject capstone placement when no capstones remaining", () => {
        gameState.reserves[Player.PLAYER1].capstones = 0;

        const move: PlaceMove = {
          type: "place",
          stoneType: StoneType.CAPSTONE,
          position: { row: 2, col: 2 },
        };

        const result = MoveValidator.validatePlaceMove(move, gameState);
        expect(result.isValid).toBe(false);
        expect(result.reason).toBe("No capstones remaining");
      });
    });

    describe("first-turn validation", () => {
      beforeEach(() => {
        gameState.gamePhase = "first-turn";
      });

      it("should validate placing opponent flat stone on first turn", () => {
        const move: PlaceMove = {
          type: "place",
          stoneType: StoneType.FLAT,
          position: { row: 2, col: 2 },
          isOpponentStone: true,
        };

        const result = MoveValidator.validatePlaceMove(move, gameState);
        expect(result.isValid).toBe(true);
      });

      it("should reject placing own stone on first turn", () => {
        const move: PlaceMove = {
          type: "place",
          stoneType: StoneType.FLAT,
          position: { row: 2, col: 2 },
          isOpponentStone: false,
        };

        const result = MoveValidator.validatePlaceMove(move, gameState);
        expect(result.isValid).toBe(false);
        expect(result.reason).toBe(
          "First turn must place opponent's flat stone"
        );
      });

      it("should reject placing wall on first turn", () => {
        const move: PlaceMove = {
          type: "place",
          stoneType: StoneType.WALL,
          position: { row: 2, col: 2 },
          isOpponentStone: true,
        };

        const result = MoveValidator.validatePlaceMove(move, gameState);
        expect(result.isValid).toBe(false);
        expect(result.reason).toBe("First turn can only place flat stones");
      });

      it("should reject placing capstone on first turn", () => {
        const move: PlaceMove = {
          type: "place",
          stoneType: StoneType.CAPSTONE,
          position: { row: 2, col: 2 },
          isOpponentStone: true,
        };

        const result = MoveValidator.validatePlaceMove(move, gameState);
        expect(result.isValid).toBe(false);
        expect(result.reason).toBe("First turn can only place flat stones");
      });

      it("should reject opponent stone placement after first turn", () => {
        gameState.gamePhase = "normal";

        const move: PlaceMove = {
          type: "place",
          stoneType: StoneType.FLAT,
          position: { row: 2, col: 2 },
          isOpponentStone: true,
        };

        const result = MoveValidator.validatePlaceMove(move, gameState);
        expect(result.isValid).toBe(false);
        expect(result.reason).toBe(
          "Cannot place opponent stones after first turn"
        );
      });

      it("should reject when opponent has no flat stones remaining", () => {
        gameState.reserves[Player.PLAYER2].flatStones = 0;

        const move: PlaceMove = {
          type: "place",
          stoneType: StoneType.FLAT,
          position: { row: 2, col: 2 },
          isOpponentStone: true,
        };

        const result = MoveValidator.validatePlaceMove(move, gameState);
        expect(result.isValid).toBe(false);
        expect(result.reason).toBe("Opponent has no flat stones remaining");
      });
    });
  });

  describe("validateStackMove", () => {
    let sourceStack: Stack;

    beforeEach(() => {
      // Create a stack controlled by player 1
      sourceStack = {
        stones: [
          { id: "stone1", type: StoneType.FLAT, owner: Player.PLAYER1 },
          { id: "stone2", type: StoneType.FLAT, owner: Player.PLAYER2 },
          { id: "stone3", type: StoneType.FLAT, owner: Player.PLAYER1 },
        ],
        controlledBy: Player.PLAYER1,
      };
      board.squares[2][2] = sourceStack;
    });

    describe("basic validation", () => {
      it("should validate simple stack move", () => {
        const move: StackMove = {
          type: "move",
          from: { row: 2, col: 2 },
          to: { row: 2, col: 3 },
          stonesToMove: 1,
          dropPattern: [1],
        };

        const result = MoveValidator.validateStackMove(move, gameState);
        expect(result.isValid).toBe(true);
      });

      it("should reject move from invalid position", () => {
        const move: StackMove = {
          type: "move",
          from: { row: -1, col: 2 },
          to: { row: 2, col: 3 },
          stonesToMove: 1,
          dropPattern: [1],
        };

        const result = MoveValidator.validateStackMove(move, gameState);
        expect(result.isValid).toBe(false);
        expect(result.reason).toBe("Source position is outside the board");
      });

      it("should reject move to invalid position", () => {
        const move: StackMove = {
          type: "move",
          from: { row: 2, col: 2 },
          to: { row: 5, col: 3 },
          stonesToMove: 1,
          dropPattern: [1],
        };

        const result = MoveValidator.validateStackMove(move, gameState);
        expect(result.isValid).toBe(false);
        expect(result.reason).toBe("Target position is outside the board");
      });

      it("should reject move from empty position", () => {
        const move: StackMove = {
          type: "move",
          from: { row: 0, col: 0 },
          to: { row: 0, col: 1 },
          stonesToMove: 1,
          dropPattern: [1],
        };

        const result = MoveValidator.validateStackMove(move, gameState);
        expect(result.isValid).toBe(false);
        expect(result.reason).toBe("No stack at source position");
      });

      it("should reject move from stack not controlled by current player", () => {
        sourceStack.controlledBy = Player.PLAYER2;

        const move: StackMove = {
          type: "move",
          from: { row: 2, col: 2 },
          to: { row: 2, col: 3 },
          stonesToMove: 1,
          dropPattern: [1],
        };

        const result = MoveValidator.validateStackMove(move, gameState);
        expect(result.isValid).toBe(false);
        expect(result.reason).toBe("Player does not control the source stack");
      });

      it("should reject moving more stones than available", () => {
        const move: StackMove = {
          type: "move",
          from: { row: 2, col: 2 },
          to: { row: 2, col: 3 },
          stonesToMove: 5,
          dropPattern: [5],
        };

        const result = MoveValidator.validateStackMove(move, gameState);
        expect(result.isValid).toBe(false);
        expect(result.reason).toBe(
          "Cannot move more stones than available in stack"
        );
      });

      it("should reject moving zero stones", () => {
        const move: StackMove = {
          type: "move",
          from: { row: 2, col: 2 },
          to: { row: 2, col: 3 },
          stonesToMove: 0,
          dropPattern: [],
        };

        const result = MoveValidator.validateStackMove(move, gameState);
        expect(result.isValid).toBe(false);
        expect(result.reason).toBe("Must move at least one stone");
      });

      it("should reject moving more than carry limit", () => {
        const move: StackMove = {
          type: "move",
          from: { row: 2, col: 2 },
          to: { row: 2, col: 3 },
          stonesToMove: 6, // Board size is 5, so carry limit is 5
          dropPattern: [6],
        };

        const result = MoveValidator.validateStackMove(move, gameState);
        expect(result.isValid).toBe(false);
        expect(result.reason).toBe("Cannot carry more than 5 stones");
      });

      it("should reject move to same position", () => {
        const move: StackMove = {
          type: "move",
          from: { row: 2, col: 2 },
          to: { row: 2, col: 2 },
          stonesToMove: 1,
          dropPattern: [1],
        };

        const result = MoveValidator.validateStackMove(move, gameState);
        expect(result.isValid).toBe(false);
        expect(result.reason).toBe("Cannot move to the same position");
      });
    });

    describe("path validation", () => {
      it("should validate horizontal movement", () => {
        const move: StackMove = {
          type: "move",
          from: { row: 2, col: 2 },
          to: { row: 2, col: 4 },
          stonesToMove: 2,
          dropPattern: [1, 1],
        };

        const result = MoveValidator.validateStackMove(move, gameState);
        expect(result.isValid).toBe(true);
      });

      it("should validate vertical movement", () => {
        const move: StackMove = {
          type: "move",
          from: { row: 2, col: 2 },
          to: { row: 4, col: 2 },
          stonesToMove: 2,
          dropPattern: [1, 1],
        };

        const result = MoveValidator.validateStackMove(move, gameState);
        expect(result.isValid).toBe(true);
      });

      it("should reject diagonal movement", () => {
        const move: StackMove = {
          type: "move",
          from: { row: 2, col: 2 },
          to: { row: 3, col: 3 },
          stonesToMove: 1,
          dropPattern: [1],
        };

        const result = MoveValidator.validateStackMove(move, gameState);
        expect(result.isValid).toBe(false);
        expect(result.reason).toBe(
          "Movement must be orthogonal (horizontal or vertical)"
        );
      });

      it("should reject movement blocked by wall", () => {
        // Place a wall in the path
        const wallStack: Stack = {
          stones: [
            { id: "wall1", type: StoneType.WALL, owner: Player.PLAYER2 },
          ],
          controlledBy: Player.PLAYER2,
        };
        board.squares[2][3] = wallStack;

        const move: StackMove = {
          type: "move",
          from: { row: 2, col: 2 },
          to: { row: 2, col: 4 },
          stonesToMove: 2,
          dropPattern: [1, 1],
        };

        const result = MoveValidator.validateStackMove(move, gameState);
        expect(result.isValid).toBe(false);
        expect(result.reason).toBe(
          "Cannot drop stones on wall at (2, 3) without capstone"
        );
      });

      it("should reject movement blocked by capstone", () => {
        // Place a capstone in the path
        const capstoneStack: Stack = {
          stones: [
            { id: "cap1", type: StoneType.CAPSTONE, owner: Player.PLAYER2 },
          ],
          controlledBy: Player.PLAYER2,
        };
        board.squares[2][3] = capstoneStack;

        const move: StackMove = {
          type: "move",
          from: { row: 2, col: 2 },
          to: { row: 2, col: 4 },
          stonesToMove: 1,
          dropPattern: [0, 1],
        };

        const result = MoveValidator.validateStackMove(move, gameState);
        expect(result.isValid).toBe(false);
        expect(result.reason).toBe("Movement blocked by capstone at (2, 3)");
      });
    });

    describe("drop pattern validation", () => {
      it("should validate correct drop pattern", () => {
        const move: StackMove = {
          type: "move",
          from: { row: 2, col: 2 },
          to: { row: 2, col: 4 },
          stonesToMove: 2,
          dropPattern: [1, 1],
        };

        const result = MoveValidator.validateStackMove(move, gameState);
        expect(result.isValid).toBe(true);
      });

      it("should reject drop pattern with wrong length", () => {
        const move: StackMove = {
          type: "move",
          from: { row: 2, col: 2 },
          to: { row: 2, col: 4 },
          stonesToMove: 2,
          dropPattern: [2], // Should be [1, 1] for 2-square path
        };

        const result = MoveValidator.validateStackMove(move, gameState);
        expect(result.isValid).toBe(false);
        expect(result.reason).toBe(
          "Drop pattern length must match movement path length"
        );
      });

      it("should reject drop pattern with wrong total", () => {
        const move: StackMove = {
          type: "move",
          from: { row: 2, col: 2 },
          to: { row: 2, col: 4 },
          stonesToMove: 2,
          dropPattern: [0, 1], // Total is 1, but moving 2 stones
        };

        const result = MoveValidator.validateStackMove(move, gameState);
        expect(result.isValid).toBe(false);
        expect(result.reason).toBe(
          "Total drops must equal number of stones being moved"
        );
      });

      it("should reject drop pattern with zero drops in middle", () => {
        const move: StackMove = {
          type: "move",
          from: { row: 2, col: 2 },
          to: { row: 2, col: 4 },
          stonesToMove: 2,
          dropPattern: [0, 2], // Cannot skip squares
        };

        const result = MoveValidator.validateStackMove(move, gameState);
        expect(result.isValid).toBe(false);
        expect(result.reason).toBe(
          "Must drop at least one stone per square traversed"
        );
      });

      it("should reject negative drops", () => {
        const move: StackMove = {
          type: "move",
          from: { row: 2, col: 2 },
          to: { row: 2, col: 3 },
          stonesToMove: 1,
          dropPattern: [-1],
        };

        const result = MoveValidator.validateStackMove(move, gameState);
        expect(result.isValid).toBe(false);
        expect(result.reason).toBe("Cannot drop negative stones");
      });

      it("should reject dropping more stones than remaining", () => {
        const move: StackMove = {
          type: "move",
          from: { row: 2, col: 2 },
          to: { row: 2, col: 4 },
          stonesToMove: 2,
          dropPattern: [3, 0], // Cannot drop 3 when only carrying 2
        };

        const result = MoveValidator.validateStackMove(move, gameState);
        expect(result.isValid).toBe(false);
        expect(result.reason).toBe("Cannot drop more stones than remaining");
      });

      it("should allow zero drops at final position", () => {
        const move: StackMove = {
          type: "move",
          from: { row: 2, col: 2 },
          to: { row: 2, col: 4 },
          stonesToMove: 2,
          dropPattern: [2, 0], // All stones dropped at first position
        };

        const result = MoveValidator.validateStackMove(move, gameState);
        expect(result.isValid).toBe(true);
      });
    });

    describe("wall flattening validation", () => {
      it("should reject dropping non-capstone on wall", () => {
        // Place a wall at the target
        const wallStack: Stack = {
          stones: [
            { id: "wall1", type: StoneType.WALL, owner: Player.PLAYER2 },
          ],
          controlledBy: Player.PLAYER2,
        };
        board.squares[2][3] = wallStack;

        // Try to move flat stone onto wall
        const move: StackMove = {
          type: "move",
          from: { row: 2, col: 2 },
          to: { row: 2, col: 3 },
          stonesToMove: 1,
          dropPattern: [1],
        };

        const result = MoveValidator.validateStackMove(move, gameState);
        expect(result.isValid).toBe(false);
        expect(result.reason).toBe(
          "Cannot drop stones on wall at (2, 3) without capstone"
        );
      });

      it("should allow capstone to flatten wall", () => {
        // Add capstone to source stack
        sourceStack.stones.push({
          id: "cap1",
          type: StoneType.CAPSTONE,
          owner: Player.PLAYER1,
        });
        sourceStack.controlledBy = Player.PLAYER1;

        // Place a wall at the target
        const wallStack: Stack = {
          stones: [
            { id: "wall1", type: StoneType.WALL, owner: Player.PLAYER2 },
          ],
          controlledBy: Player.PLAYER2,
        };
        board.squares[2][3] = wallStack;

        // Move capstone onto wall
        const move: StackMove = {
          type: "move",
          from: { row: 2, col: 2 },
          to: { row: 2, col: 3 },
          stonesToMove: 1,
          dropPattern: [1],
        };

        const result = MoveValidator.validateStackMove(move, gameState);
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe("validateMove", () => {
    it("should validate place moves", () => {
      const move: PlaceMove = {
        type: "place",
        stoneType: StoneType.FLAT,
        position: { row: 2, col: 2 },
      };

      const result = MoveValidator.validateMove(move, gameState);
      expect(result.isValid).toBe(true);
    });

    it("should validate stack moves", () => {
      // Set up a stack
      const stack: Stack = {
        stones: [{ id: "stone1", type: StoneType.FLAT, owner: Player.PLAYER1 }],
        controlledBy: Player.PLAYER1,
      };
      board.squares[2][2] = stack;

      const move: StackMove = {
        type: "move",
        from: { row: 2, col: 2 },
        to: { row: 2, col: 3 },
        stonesToMove: 1,
        dropPattern: [1],
      };

      const result = MoveValidator.validateMove(move, gameState);
      expect(result.isValid).toBe(true);
    });

    it("should reject unknown move types", () => {
      const move = {
        type: "unknown",
      } as any;

      const result = MoveValidator.validateMove(move, gameState);
      expect(result.isValid).toBe(false);
      expect(result.reason).toBe("Unknown move type");
    });
  });

  describe("getValidPlacementPositions", () => {
    it("should return all empty positions for normal game", () => {
      const positions = MoveValidator.getValidPlacementPositions(
        gameState,
        StoneType.FLAT
      );
      expect(positions).toHaveLength(25); // 5x5 board
    });

    it("should exclude occupied positions", () => {
      // Place a stone
      const stack: Stack = {
        stones: [{ id: "stone1", type: StoneType.FLAT, owner: Player.PLAYER1 }],
        controlledBy: Player.PLAYER1,
      };
      board.squares[2][2] = stack;

      const positions = MoveValidator.getValidPlacementPositions(
        gameState,
        StoneType.FLAT
      );
      expect(positions).toHaveLength(24);
      expect(positions).not.toContainEqual({ row: 2, col: 2 });
    });

    it("should return empty array when no stones in reserve", () => {
      gameState.reserves[Player.PLAYER1].flatStones = 0;

      const positions = MoveValidator.getValidPlacementPositions(
        gameState,
        StoneType.FLAT
      );
      expect(positions).toHaveLength(0);
    });
  });

  describe("getValidMoveTargets", () => {
    beforeEach(() => {
      // Set up a stack at (2,2)
      const stack: Stack = {
        stones: [
          { id: "stone1", type: StoneType.FLAT, owner: Player.PLAYER1 },
          { id: "stone2", type: StoneType.FLAT, owner: Player.PLAYER1 },
        ],
        controlledBy: Player.PLAYER1,
      };
      board.squares[2][2] = stack;
    });

    it("should return valid orthogonal targets", () => {
      const targets = MoveValidator.getValidMoveTargets(
        gameState,
        { row: 2, col: 2 },
        1
      );

      // Should include orthogonal positions
      expect(targets).toContainEqual({ row: 1, col: 2 }); // up
      expect(targets).toContainEqual({ row: 3, col: 2 }); // down
      expect(targets).toContainEqual({ row: 2, col: 1 }); // left
      expect(targets).toContainEqual({ row: 2, col: 3 }); // right

      // Should not include diagonal positions
      expect(targets).not.toContainEqual({ row: 1, col: 1 });
      expect(targets).not.toContainEqual({ row: 3, col: 3 });

      // Should not include source position
      expect(targets).not.toContainEqual({ row: 2, col: 2 });
    });

    it("should exclude targets blocked by walls", () => {
      // Place a wall that blocks movement
      const wallStack: Stack = {
        stones: [{ id: "wall1", type: StoneType.WALL, owner: Player.PLAYER2 }],
        controlledBy: Player.PLAYER2,
      };
      board.squares[2][3] = wallStack;

      const targets = MoveValidator.getValidMoveTargets(
        gameState,
        { row: 2, col: 2 },
        1
      );

      // Should not include positions beyond the wall
      expect(targets).not.toContainEqual({ row: 2, col: 4 });
      // But should still include the wall position itself (for capstone flattening)
      // and other directions
      expect(targets).toContainEqual({ row: 1, col: 2 });
      expect(targets).toContainEqual({ row: 3, col: 2 });
      expect(targets).toContainEqual({ row: 2, col: 1 });
    });
  });
});
