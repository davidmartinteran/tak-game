import { GameState, Position, Player, StoneType, Stack, Stone, Board, GameConfig } from "../types";

// Utility function for board size to piece count mapping
export const GAME_CONFIGS: Record<number, GameConfig> = {
  4: { boardSize: 4, flatStones: 15, capstones: 0 },
  5: { boardSize: 5, flatStones: 21, capstones: 1 },
  6: { boardSize: 6, flatStones: 30, capstones: 1 },
  7: { boardSize: 7, flatStones: 40, capstones: 2 },
  8: { boardSize: 8, flatStones: 50, capstones: 2 },
};

export function getGameConfig(boardSize: number): GameConfig {
  const config = GAME_CONFIGS[boardSize];
  if (!config) {
    throw new Error(`Invalid board size: ${boardSize}. Supported sizes: 4, 5, 6, 7, 8`);
  }
  return config;
}

export class GameBoard {
  private squares: (Stack | null)[][];
  public readonly size: number;

  constructor(size: number) {
    if (!GAME_CONFIGS[size]) {
      throw new Error(`Invalid board size: ${size}. Supported sizes: 4, 5, 6, 7, 8`);
    }
    
    this.size = size;
    this.squares = this.initializeBoard(size);
  }

  private initializeBoard(size: number): (Stack | null)[][] {
    return Array(size).fill(null).map(() => Array(size).fill(null));
  }

  // Position validation
  isValidPosition(position: Position): boolean {
    return (
      position.row >= 0 &&
      position.row < this.size &&
      position.col >= 0 &&
      position.col < this.size
    );
  }

  // Stack manipulation methods
  getStack(position: Position): Stack | null {
    if (!this.isValidPosition(position)) {
      throw new Error(`Invalid position: (${position.row}, ${position.col})`);
    }
    return this.squares[position.row][position.col];
  }

  setStack(position: Position, stack: Stack | null): void {
    if (!this.isValidPosition(position)) {
      throw new Error(`Invalid position: (${position.row}, ${position.col})`);
    }
    this.squares[position.row][position.col] = stack;
  }

  isEmpty(position: Position): boolean {
    const stack = this.getStack(position);
    return stack === null || stack.stones.length === 0;
  }

  // Add stone to a position (creates stack if needed)
  addStone(position: Position, stone: Stone): void {
    const currentStack = this.getStack(position);
    
    if (currentStack === null) {
      // Create new stack
      const newStack: Stack = {
        stones: [stone],
        controlledBy: stone.owner
      };
      this.setStack(position, newStack);
    } else {
      // Add to existing stack
      currentStack.stones.push(stone);
      // Update control to the owner of the top stone
      currentStack.controlledBy = stone.owner;
    }
  }

  // Remove stones from top of stack
  removeStones(position: Position, count: number): Stone[] {
    const stack = this.getStack(position);
    if (!stack || stack.stones.length < count) {
      throw new Error(`Cannot remove ${count} stones from position (${position.row}, ${position.col})`);
    }

    const removedStones = stack.stones.splice(-count, count);
    
    // Update control or remove stack if empty
    if (stack.stones.length === 0) {
      this.setStack(position, null);
    } else {
      // Update control to the owner of the new top stone
      const topStone = stack.stones[stack.stones.length - 1];
      stack.controlledBy = topStone.owner;
    }

    return removedStones;
  }

  // Get the top stone of a stack
  getTopStone(position: Position): Stone | null {
    const stack = this.getStack(position);
    if (!stack || stack.stones.length === 0) {
      return null;
    }
    return stack.stones[stack.stones.length - 1];
  }

  // Get the top N stones of a stack (for animation purposes)
  getTopStones(position: Position, count: number): Stone[] {
    const stack = this.getStack(position);
    if (!stack || stack.stones.length < count) {
      return [];
    }
    
    // Return a copy of the top stones without removing them
    return stack.stones.slice(-count).map(stone => ({ ...stone }));
  }

  // Get stack height
  getStackHeight(position: Position): number {
    const stack = this.getStack(position);
    return stack ? stack.stones.length : 0;
  }

  // Check if a player controls a stack
  isControlledBy(position: Position, player: Player): boolean {
    const stack = this.getStack(position);
    return stack?.controlledBy === player;
  }

  // Board queries
  getAllStacks(): { position: Position; stack: Stack }[] {
    const stacks: { position: Position; stack: Stack }[] = [];
    
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        const position = { row, col };
        const stack = this.getStack(position);
        if (stack) {
          stacks.push({ position, stack });
        }
      }
    }
    
    return stacks;
  }

  // Get all positions controlled by a player
  getPositionsControlledBy(player: Player): Position[] {
    const positions: Position[] = [];
    
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        const position = { row, col };
        if (this.isControlledBy(position, player)) {
          positions.push(position);
        }
      }
    }
    
    return positions;
  }

  // Get adjacent positions (orthogonal only)
  getAdjacentPositions(position: Position): Position[] {
    const directions = [
      { row: -1, col: 0 }, // up
      { row: 1, col: 0 },  // down
      { row: 0, col: -1 }, // left
      { row: 0, col: 1 },  // right
    ];

    return directions
      .map((dir) => ({
        row: position.row + dir.row,
        col: position.col + dir.col,
      }))
      .filter((pos) => this.isValidPosition(pos));
  }

  // Check if board is full
  isFull(): boolean {
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        if (this.isEmpty({ row, col })) {
          return false;
        }
      }
    }
    return true;
  }

  // Get empty positions
  getEmptyPositions(): Position[] {
    const positions: Position[] = [];
    
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        const position = { row, col };
        if (this.isEmpty(position)) {
          positions.push(position);
        }
      }
    }
    
    return positions;
  }

  // Create a copy of the board
  clone(): GameBoard {
    const newBoard = new GameBoard(this.size);
    
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        const stack = this.squares[row][col];
        if (stack) {
          // Deep copy the stack
          const newStack: Stack = {
            stones: stack.stones.map(stone => ({ ...stone })),
            controlledBy: stack.controlledBy
          };
          newBoard.squares[row][col] = newStack;
        }
      }
    }
    
    return newBoard;
  }

  // Convert to Board interface for compatibility
  toBoard(): Board {
    return {
      size: this.size,
      squares: this.squares
    };
  }

  // Create GameBoard from Board interface
  static fromBoard(board: Board): GameBoard {
    const gameBoard = new GameBoard(board.size);
    gameBoard.squares = board.squares;
    return gameBoard;
  }
}

export class GameLogic {
  static isValidPosition(position: Position, boardSize: number): boolean {
    return (
      position.row >= 0 &&
      position.row < boardSize &&
      position.col >= 0 &&
      position.col < boardSize
    );
  }

  static isValidPlacement(gameState: GameState, position: Position): boolean {
    const { board } = gameState;
    const stack = board.squares[position.row][position.col];

    // Can only place on empty cells or cells with only flat stones on top
    return (
      stack === null ||
      (stack.stones.length > 0 &&
        stack.stones[stack.stones.length - 1].type === StoneType.FLAT)
    );
  }

  static canPlayerMove(gameState: GameState, player: Player): boolean {
    // TODO: Implement logic to check if player has valid moves
    return true;
  }

  static checkWinCondition(gameState: GameState): Player | null {
    // TODO: Implement win condition checking (road or flat stone count)
    return null;
  }

  static getAdjacentPositions(
    position: Position,
    boardSize: number
  ): Position[] {
    const directions = [
      { row: -1, col: 0 }, // up
      { row: 1, col: 0 }, // down
      { row: 0, col: -1 }, // left
      { row: 0, col: 1 }, // right
    ];

    return directions
      .map((dir) => ({
        row: position.row + dir.row,
        col: position.col + dir.col,
      }))
      .filter((pos) => this.isValidPosition(pos, boardSize));
  }
}
