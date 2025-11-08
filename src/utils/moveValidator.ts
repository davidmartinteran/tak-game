import {
  GameState,
  Move,
  PlaceMove,
  StackMove,
  MoveValidation,
  Position,
  StoneType,
  Player,
} from '../types';
import { GameBoard } from './gameLogic';

export class MoveValidator {
  /**
   * Validates any type of move
   */
  static validateMove(move: Move, gameState: GameState): MoveValidation {
    if (move.type === 'place') {
      return this.validatePlaceMove(move, gameState);
    } else if (move.type === 'move') {
      return this.validateStackMove(move, gameState);
    }
    
    return {
      isValid: false,
      reason: 'Unknown move type',
    };
  }

  /**
   * Validates stone placement moves
   */
  static validatePlaceMove(move: PlaceMove, gameState: GameState): MoveValidation {
    const { board, currentPlayer, reserves, gamePhase } = gameState;
    const gameBoard = GameBoard.fromBoard(board);

    // Check if position is valid
    if (!gameBoard.isValidPosition(move.position)) {
      return {
        isValid: false,
        reason: 'Position is outside the board',
      };
    }

    // Check if position is empty
    if (!gameBoard.isEmpty(move.position)) {
      return {
        isValid: false,
        reason: 'Position is already occupied',
      };
    }

    // Handle first-turn rules
    if (gamePhase === 'first-turn') {
      return this.validateFirstTurnMove(move, gameState);
    }

    // Normal game validation
    if (move.isOpponentStone) {
      return {
        isValid: false,
        reason: 'Cannot place opponent stones after first turn',
      };
    }

    // Check if player has the stone type in reserve
    const playerReserve = reserves[currentPlayer];
    
    if (move.stoneType === StoneType.FLAT) {
      if (playerReserve.flatStones <= 0) {
        return {
          isValid: false,
          reason: 'No flat stones remaining',
        };
      }
    } else if (move.stoneType === StoneType.WALL) {
      if (playerReserve.flatStones <= 0) {
        return {
          isValid: false,
          reason: 'No flat stones remaining (walls use flat stones)',
        };
      }
    } else if (move.stoneType === StoneType.CAPSTONE) {
      if (playerReserve.capstones <= 0) {
        return {
          isValid: false,
          reason: 'No capstones remaining',
        };
      }
    }

    return {
      isValid: true,
    };
  }

  /**
   * Validates first-turn specific rules
   */
  private static validateFirstTurnMove(move: PlaceMove, gameState: GameState): MoveValidation {
    const { currentPlayer, reserves } = gameState;
    
    // First turn must place opponent's flat stone
    if (!move.isOpponentStone) {
      return {
        isValid: false,
        reason: 'First turn must place opponent\'s flat stone',
      };
    }

    if (move.stoneType !== StoneType.FLAT) {
      return {
        isValid: false,
        reason: 'First turn can only place flat stones',
      };
    }

    // Check if opponent has flat stones available
    const opponentPlayer = currentPlayer === Player.PLAYER1 ? Player.PLAYER2 : Player.PLAYER1;
    const opponentReserve = reserves[opponentPlayer];
    
    if (opponentReserve.flatStones <= 0) {
      return {
        isValid: false,
        reason: 'Opponent has no flat stones remaining',
      };
    }

    return {
      isValid: true,
    };
  }

  /**
   * Validates stack movement moves
   */
  static validateStackMove(move: StackMove, gameState: GameState): MoveValidation {
    const { board, currentPlayer } = gameState;
    const gameBoard = GameBoard.fromBoard(board);

    // Check if positions are valid
    if (!gameBoard.isValidPosition(move.from)) {
      return {
        isValid: false,
        reason: 'Source position is outside the board',
      };
    }

    if (!gameBoard.isValidPosition(move.to)) {
      return {
        isValid: false,
        reason: 'Target position is outside the board',
      };
    }

    // Check if source position has a stack
    if (gameBoard.isEmpty(move.from)) {
      return {
        isValid: false,
        reason: 'No stack at source position',
      };
    }

    // Check if player controls the source stack
    if (!gameBoard.isControlledBy(move.from, currentPlayer)) {
      return {
        isValid: false,
        reason: 'Player does not control the source stack',
      };
    }

    const sourceStackHeight = gameBoard.getStackHeight(move.from);
    
    if (move.stonesToMove <= 0) {
      return {
        isValid: false,
        reason: 'Must move at least one stone',
      };
    }

    // Check carry limit (equal to board size) - this should be checked first
    if (move.stonesToMove > board.size) {
      return {
        isValid: false,
        reason: `Cannot carry more than ${board.size} stones`,
      };
    }

    // Check if trying to move more stones than available
    if (move.stonesToMove > sourceStackHeight) {
      return {
        isValid: false,
        reason: 'Cannot move more stones than available in stack',
      };
    }

    // Validate movement path
    const pathValidation = this.validateMovementPath(move, gameBoard);
    if (!pathValidation.isValid) {
      return pathValidation;
    }

    // Validate drop pattern
    const dropValidation = this.validateDropPattern(move, gameBoard);
    if (!dropValidation.isValid) {
      return dropValidation;
    }

    return {
      isValid: true,
    };
  }

  /**
   * Validates the movement path (orthogonal, no obstacles)
   */
  private static validateMovementPath(move: StackMove, gameBoard: GameBoard): MoveValidation {
    const { from, to } = move;
    
    // Check if movement is orthogonal (same row or same column)
    const isHorizontal = from.row === to.row;
    const isVertical = from.col === to.col;
    
    if (!isHorizontal && !isVertical) {
      return {
        isValid: false,
        reason: 'Movement must be orthogonal (horizontal or vertical)',
      };
    }

    if (from.row === to.row && from.col === to.col) {
      return {
        isValid: false,
        reason: 'Cannot move to the same position',
      };
    }

    // Get the path between from and to positions
    const path = this.getMovementPath(from, to);
    
    // Check for obstacles along the path (walls and capstones block movement)
    // But we need to handle wall flattening by capstones in drop pattern validation
    for (const position of path) {
      const topStone = gameBoard.getTopStone(position);
      if (topStone) {
        if (topStone.type === StoneType.CAPSTONE) {
          return {
            isValid: false,
            reason: `Movement blocked by capstone at (${position.row}, ${position.col})`,
          };
        }
        // Walls can be flattened by capstones, so we check this in drop pattern validation
      }
    }

    return {
      isValid: true,
    };
  }

  /**
   * Validates the drop pattern for stack movement
   */
  private static validateDropPattern(move: StackMove, gameBoard: GameBoard): MoveValidation {
    const { from, to, stonesToMove, dropPattern } = move;

    // Get the path for the movement
    const path = this.getMovementPath(from, to);

    // Drop pattern must match the path length
    if (dropPattern.length !== path.length) {
      return {
        isValid: false,
        reason: 'Drop pattern length must match movement path length',
      };
    }

    // Check for negative drops first
    for (let i = 0; i < dropPattern.length; i++) {
      if (dropPattern[i] < 0) {
        return {
          isValid: false,
          reason: 'Cannot drop negative stones',
        };
      }
    }

    // Check that no stack will exceed maximum height (board size limit)
    const boardSize = gameBoard.size;
    for (let i = 0; i < path.length; i++) {
      const position = path[i];
      const currentStackHeight = gameBoard.getStackHeight(position);
      const stonesToDrop = dropPattern[i];
      const newStackHeight = currentStackHeight + stonesToDrop;

      if (newStackHeight > boardSize) {
        return {
          isValid: false,
          reason: `Cannot drop ${stonesToDrop} stone${stonesToDrop > 1 ? 's' : ''} at (${position.row + 1}, ${position.col + 1}): stack would exceed maximum height of ${boardSize}`,
        };
      }
    }

    // Check if dropping more stones than remaining at any point
    let stonesRemaining = stonesToMove;
    for (let i = 0; i < dropPattern.length; i++) {
      const stonesToDrop = dropPattern[i];
      
      if (stonesToDrop > stonesRemaining) {
        return {
          isValid: false,
          reason: 'Cannot drop more stones than remaining',
        };
      }

      stonesRemaining -= stonesToDrop;
    }

    // Sum of drops must equal stones to move
    const totalDrops = dropPattern.reduce((sum, drops) => sum + drops, 0);
    if (totalDrops !== stonesToMove) {
      return {
        isValid: false,
        reason: 'Total drops must equal number of stones being moved',
      };
    }

    // Must drop at least one stone on EVERY square in the path (TAK rule)
    // You cannot skip squares - must leave a trail
    for (let i = 0; i < path.length; i++) {
      const position = path[i];
      const stonesToDrop = dropPattern[i];

      if (stonesToDrop === 0) {
        return {
          isValid: false,
          reason: `Must drop at least one stone at each square in path (${position.row + 1}, ${position.col + 1})`,
        };
      }
    }

    // Check wall flattening logic and movement blocking
    const sourceStack = gameBoard.getStack(from);
    if (!sourceStack) {
      return {
        isValid: false,
        reason: 'No stack at source position',
      };
    }

    // Get the stones that will be moved (top N stones)
    const movingStones = sourceStack.stones.slice(-stonesToMove);
    stonesRemaining = stonesToMove;
    
    for (let i = 0; i < path.length; i++) {
      const position = path[i];
      const stonesToDrop = dropPattern[i];

      // Check if there's a wall blocking movement
      const topStone = gameBoard.getTopStone(position);
      if (topStone && topStone.type === StoneType.WALL) {
        // Calculate which stone is currently leading the movement
        // movingStones are ordered bottom to top (last element is the top/leading stone)
        const droppedSoFar = stonesToMove - stonesRemaining;
        const leadingStone = movingStones[movingStones.length - 1 - droppedSoFar];

        // Only capstones can flatten walls
        if (!leadingStone || leadingStone.type !== StoneType.CAPSTONE) {
          return {
            isValid: false,
            reason: `Cannot move through wall at (${position.row}, ${position.col}) - only capstones can flatten walls`,
          };
        }

        // If a capstone is leading, it can flatten the wall, but must drop at least one stone
        if (stonesToDrop === 0) {
          return {
            isValid: false,
            reason: `Capstone must stop to flatten wall at (${position.row}, ${position.col})`,
          };
        }
      }

      stonesRemaining -= stonesToDrop;
    }

    return {
      isValid: true,
    };
  }

  /**
   * Gets the path between two positions (excluding start, including end)
   */
  private static getMovementPath(from: Position, to: Position): Position[] {
    const path: Position[] = [];
    
    if (from.row === to.row) {
      // Horizontal movement
      const direction = from.col < to.col ? 1 : -1;
      
      for (let col = from.col + direction; col !== to.col + direction; col += direction) {
        path.push({ row: from.row, col });
      }
    } else {
      // Vertical movement
      const direction = from.row < to.row ? 1 : -1;
      
      for (let row = from.row + direction; row !== to.row + direction; row += direction) {
        path.push({ row, col: from.col });
      }
    }
    
    return path;
  }

  /**
   * Gets all valid positions for placing a stone
   */
  static getValidPlacementPositions(gameState: GameState, stoneType: StoneType): Position[] {
    const { board } = gameState;
    // const gameBoard = GameBoard.fromBoard(board); // Unused variable
    const validPositions: Position[] = [];

    for (let row = 0; row < board.size; row++) {
      for (let col = 0; col < board.size; col++) {
        const position = { row, col };
        const move: PlaceMove = {
          type: 'place',
          stoneType,
          position,
          isOpponentStone: gameState.gamePhase === 'first-turn',
        };

        const validation = this.validatePlaceMove(move, gameState);
        if (validation.isValid) {
          validPositions.push(position);
        }
      }
    }

    return validPositions;
  }

  /**
   * Gets all valid target positions for moving a stack from a given position
   */
  static getValidMoveTargets(gameState: GameState, from: Position, stonesToMove: number): Position[] {
    const { board } = gameState;
    const gameBoard = GameBoard.fromBoard(board);
    const validTargets: Position[] = [];

    // Check orthogonal directions (up, down, left, right)
    const directions = [
      { row: -1, col: 0 },  // up
      { row: 1, col: 0 },   // down
      { row: 0, col: -1 },  // left
      { row: 0, col: 1 },   // right
    ];

    for (const dir of directions) {
      // For each direction, check how far we can go
      // Maximum distance = number of stones (must drop 1 per square minimum)
      for (let distance = 1; distance <= stonesToMove; distance++) {
        const targetRow = from.row + (dir.row * distance);
        const targetCol = from.col + (dir.col * distance);
        const to = { row: targetRow, col: targetCol };

        // Check if position is valid
        if (!gameBoard.isValidPosition(to)) {
          break; // Out of bounds
        }

        // Check if there's a capstone blocking
        const topStone = gameBoard.getTopStone(to);
        if (topStone && topStone.type === StoneType.CAPSTONE) {
          break; // Can't move through capstones
        }

        // Check the path for walls or capstones that might block
        const path = this.getMovementPath(from, to);
        let canReach = true;

        for (const pathPos of path) {
          const pathTopStone = gameBoard.getTopStone(pathPos);
          if (pathTopStone && pathTopStone.type === StoneType.CAPSTONE) {
            canReach = false;
            break;
          }
          // Walls can be flattened by capstones, so we don't break here
          // The full validation will handle this
        }

        if (!canReach) {
          break; // Can't continue in this direction
        }

        // Try to create a valid move
        const move: StackMove = {
          type: 'move',
          from,
          to,
          stonesToMove,
          dropPattern: this.createSimpleDropPattern(from, to, stonesToMove),
        };

        const validation = this.validateStackMove(move, gameState);
        if (validation.isValid) {
          validTargets.push(to);
        }
      }
    }

    return validTargets;
  }

  /**
   * Creates a simple drop pattern that leaves 1 stone per square and rest at target
   */
  private static createSimpleDropPattern(from: Position, to: Position, stonesToMove: number): number[] {
    const path = this.getMovementPath(from, to);
    const dropPattern = new Array(path.length).fill(1); // Drop 1 at each square

    // Put remaining stones at the final position
    if (dropPattern.length > 0) {
      const remaining = stonesToMove - (path.length - 1);
      dropPattern[dropPattern.length - 1] = remaining;
    }

    return dropPattern;
  }
}