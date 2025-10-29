import { GameBoard, getGameConfig, GAME_CONFIGS } from "../gameLogic";
import { StoneType, Player, Stone, Stack } from "../../types";

describe("GameBoard", () => {
  let board: GameBoard;

  beforeEach(() => {
    board = new GameBoard(5);
  });

  describe("constructor", () => {
    it("should create a board with correct size", () => {
      expect(board.size).toBe(5);
    });

    it("should throw error for invalid board size", () => {
      expect(() => new GameBoard(3)).toThrow("Invalid board size: 3");
      expect(() => new GameBoard(9)).toThrow("Invalid board size: 9");
    });

    it("should initialize empty board", () => {
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          expect(board.isEmpty({ row, col })).toBe(true);
        }
      }
    });
  });

  describe("position validation", () => {
    it("should validate correct positions", () => {
      expect(board.isValidPosition({ row: 0, col: 0 })).toBe(true);
      expect(board.isValidPosition({ row: 4, col: 4 })).toBe(true);
      expect(board.isValidPosition({ row: 2, col: 3 })).toBe(true);
    });

    it("should reject invalid positions", () => {
      expect(board.isValidPosition({ row: -1, col: 0 })).toBe(false);
      expect(board.isValidPosition({ row: 0, col: -1 })).toBe(false);
      expect(board.isValidPosition({ row: 5, col: 0 })).toBe(false);
      expect(board.isValidPosition({ row: 0, col: 5 })).toBe(false);
    });
  });

  describe("stack manipulation", () => {
    const testStone: Stone = {
      id: "stone1",
      type: StoneType.FLAT,
      owner: Player.PLAYER1,
    };

    it("should add stone to empty position", () => {
      const position = { row: 2, col: 2 };
      board.addStone(position, testStone);

      const stack = board.getStack(position);
      expect(stack).not.toBeNull();
      expect(stack!.stones).toHaveLength(1);
      expect(stack!.stones[0]).toEqual(testStone);
      expect(stack!.controlledBy).toBe(Player.PLAYER1);
    });

    it("should add stone to existing stack", () => {
      const position = { row: 2, col: 2 };
      const stone2: Stone = {
        id: "stone2",
        type: StoneType.WALL,
        owner: Player.PLAYER2,
      };

      board.addStone(position, testStone);
      board.addStone(position, stone2);

      const stack = board.getStack(position);
      expect(stack!.stones).toHaveLength(2);
      expect(stack!.controlledBy).toBe(Player.PLAYER2);
    });

    it("should remove stones from stack", () => {
      const position = { row: 2, col: 2 };
      const stone2: Stone = {
        id: "stone2",
        type: StoneType.WALL,
        owner: Player.PLAYER2,
      };

      board.addStone(position, testStone);
      board.addStone(position, stone2);

      const removedStones = board.removeStones(position, 1);
      expect(removedStones).toHaveLength(1);
      expect(removedStones[0]).toEqual(stone2);

      const stack = board.getStack(position);
      expect(stack!.stones).toHaveLength(1);
      expect(stack!.controlledBy).toBe(Player.PLAYER1);
    });

    it("should remove entire stack when all stones removed", () => {
      const position = { row: 2, col: 2 };
      board.addStone(position, testStone);

      board.removeStones(position, 1);
      expect(board.isEmpty(position)).toBe(true);
    });

    it("should throw error when removing more stones than available", () => {
      const position = { row: 2, col: 2 };
      board.addStone(position, testStone);

      expect(() => board.removeStones(position, 2)).toThrow();
    });
  });

  describe("stack queries", () => {
    const testStone: Stone = {
      id: "stone1",
      type: StoneType.FLAT,
      owner: Player.PLAYER1,
    };

    it("should get top stone", () => {
      const position = { row: 2, col: 2 };
      const stone2: Stone = {
        id: "stone2",
        type: StoneType.CAPSTONE,
        owner: Player.PLAYER2,
      };

      board.addStone(position, testStone);
      board.addStone(position, stone2);

      const topStone = board.getTopStone(position);
      expect(topStone).toEqual(stone2);
    });

    it("should return null for top stone on empty position", () => {
      const position = { row: 2, col: 2 };
      expect(board.getTopStone(position)).toBeNull();
    });

    it("should get stack height", () => {
      const position = { row: 2, col: 2 };
      expect(board.getStackHeight(position)).toBe(0);

      board.addStone(position, testStone);
      expect(board.getStackHeight(position)).toBe(1);

      const stone2: Stone = {
        id: "stone2",
        type: StoneType.WALL,
        owner: Player.PLAYER2,
      };
      board.addStone(position, stone2);
      expect(board.getStackHeight(position)).toBe(2);
    });

    it("should check stack control", () => {
      const position = { row: 2, col: 2 };
      expect(board.isControlledBy(position, Player.PLAYER1)).toBe(false);

      board.addStone(position, testStone);
      expect(board.isControlledBy(position, Player.PLAYER1)).toBe(true);
      expect(board.isControlledBy(position, Player.PLAYER2)).toBe(false);
    });
  });

  describe("board queries", () => {
    const stone1: Stone = {
      id: "stone1",
      type: StoneType.FLAT,
      owner: Player.PLAYER1,
    };
    const stone2: Stone = {
      id: "stone2",
      type: StoneType.WALL,
      owner: Player.PLAYER2,
    };

    it("should get all stacks", () => {
      board.addStone({ row: 0, col: 0 }, stone1);
      board.addStone({ row: 2, col: 3 }, stone2);

      const stacks = board.getAllStacks();
      expect(stacks).toHaveLength(2);
      expect(
        stacks.some((s) => s.position.row === 0 && s.position.col === 0)
      ).toBe(true);
      expect(
        stacks.some((s) => s.position.row === 2 && s.position.col === 3)
      ).toBe(true);
    });

    it("should get positions controlled by player", () => {
      board.addStone({ row: 0, col: 0 }, stone1);
      board.addStone({ row: 1, col: 1 }, stone1);
      board.addStone({ row: 2, col: 2 }, stone2);

      const player1Positions = board.getPositionsControlledBy(Player.PLAYER1);
      const player2Positions = board.getPositionsControlledBy(Player.PLAYER2);

      expect(player1Positions).toHaveLength(2);
      expect(player2Positions).toHaveLength(1);
    });

    it("should get adjacent positions", () => {
      const center = { row: 2, col: 2 };
      const adjacent = board.getAdjacentPositions(center);

      expect(adjacent).toHaveLength(4);
      expect(adjacent).toContainEqual({ row: 1, col: 2 }); // up
      expect(adjacent).toContainEqual({ row: 3, col: 2 }); // down
      expect(adjacent).toContainEqual({ row: 2, col: 1 }); // left
      expect(adjacent).toContainEqual({ row: 2, col: 3 }); // right
    });

    it("should get adjacent positions for corner", () => {
      const corner = { row: 0, col: 0 };
      const adjacent = board.getAdjacentPositions(corner);

      expect(adjacent).toHaveLength(2);
      expect(adjacent).toContainEqual({ row: 1, col: 0 });
      expect(adjacent).toContainEqual({ row: 0, col: 1 });
    });

    it("should check if board is full", () => {
      expect(board.isFull()).toBe(false);

      // Fill the board
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          board.addStone({ row, col }, stone1);
        }
      }

      expect(board.isFull()).toBe(true);
    });

    it("should get empty positions", () => {
      const emptyPositions = board.getEmptyPositions();
      expect(emptyPositions).toHaveLength(25); // 5x5 board

      board.addStone({ row: 2, col: 2 }, stone1);
      const emptyAfter = board.getEmptyPositions();
      expect(emptyAfter).toHaveLength(24);
    });
  });

  describe("board cloning", () => {
    it("should create independent copy", () => {
      const stone: Stone = {
        id: "stone1",
        type: StoneType.FLAT,
        owner: Player.PLAYER1,
      };

      board.addStone({ row: 2, col: 2 }, stone);
      const cloned = board.clone();

      expect(cloned.size).toBe(board.size);
      expect(cloned.getStackHeight({ row: 2, col: 2 })).toBe(1);

      // Modify original
      board.addStone({ row: 2, col: 2 }, stone);

      // Clone should be unchanged
      expect(cloned.getStackHeight({ row: 2, col: 2 })).toBe(1);
      expect(board.getStackHeight({ row: 2, col: 2 })).toBe(2);
    });
  });

  describe("error handling", () => {
    it("should throw error for invalid position in getStack", () => {
      expect(() => board.getStack({ row: -1, col: 0 })).toThrow();
      expect(() => board.getStack({ row: 5, col: 0 })).toThrow();
    });

    it("should throw error for invalid position in setStack", () => {
      const stack: Stack = {
        stones: [],
        controlledBy: null,
      };
      expect(() => board.setStack({ row: -1, col: 0 }, stack)).toThrow();
      expect(() => board.setStack({ row: 5, col: 0 }, stack)).toThrow();
    });
  });
});

describe("Game Configuration Utilities", () => {
  describe("GAME_CONFIGS", () => {
    it("should have correct configurations for all board sizes", () => {
      expect(GAME_CONFIGS[4]).toEqual({
        boardSize: 4,
        flatStones: 15,
        capstones: 0,
      });
      expect(GAME_CONFIGS[5]).toEqual({
        boardSize: 5,
        flatStones: 21,
        capstones: 1,
      });
      expect(GAME_CONFIGS[6]).toEqual({
        boardSize: 6,
        flatStones: 30,
        capstones: 1,
      });
      expect(GAME_CONFIGS[7]).toEqual({
        boardSize: 7,
        flatStones: 40,
        capstones: 2,
      });
      expect(GAME_CONFIGS[8]).toEqual({
        boardSize: 8,
        flatStones: 50,
        capstones: 2,
      });
    });
  });

  describe("getGameConfig", () => {
    it("should return correct config for valid board sizes", () => {
      expect(getGameConfig(4)).toEqual({
        boardSize: 4,
        flatStones: 15,
        capstones: 0,
      });
      expect(getGameConfig(5)).toEqual({
        boardSize: 5,
        flatStones: 21,
        capstones: 1,
      });
      expect(getGameConfig(8)).toEqual({
        boardSize: 8,
        flatStones: 50,
        capstones: 2,
      });
    });

    it("should throw error for invalid board sizes", () => {
      expect(() => getGameConfig(3)).toThrow("Invalid board size: 3");
      expect(() => getGameConfig(9)).toThrow("Invalid board size: 9");
      expect(() => getGameConfig(0)).toThrow("Invalid board size: 0");
    });
  });
});
