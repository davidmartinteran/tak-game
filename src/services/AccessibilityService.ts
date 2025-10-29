import { AccessibilityInfo, Platform } from 'react-native';
import { GameState, Position, Stone, StoneType, Player } from '../types';

/**
 * Service for providing enhanced accessibility features
 * Generates descriptive text for screen readers and manages accessibility state
 */
export class AccessibilityService {
  private static screenReaderEnabled = false;
  private static initialized = false;

  /**
   * Initialize the accessibility service
   */
  static async initialize(): Promise<void> {
    if (AccessibilityService.initialized) return;

    try {
      // Check if screen reader is enabled
      const isEnabled = await AccessibilityInfo.isScreenReaderEnabled();
      AccessibilityService.screenReaderEnabled = isEnabled;

      // Listen for screen reader changes
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const subscription = AccessibilityInfo.addEventListener(
        'screenReaderChanged',
        (enabled: boolean) => {
          AccessibilityService.screenReaderEnabled = enabled;
        }
      );

      AccessibilityService.initialized = true;
    } catch (error) {
      console.warn('Failed to initialize accessibility service:', error);
    }
  }

  /**
   * Check if screen reader is enabled
   */
  static isScreenReaderEnabled(): boolean {
    return AccessibilityService.screenReaderEnabled;
  }

  /**
   * Generate accessibility label for a board position
   */
  static getBoardPositionLabel(position: Position, boardSize: number): string {
    const row = position.row + 1;
    const col = position.col + 1;
    return `Row ${row}, Column ${col} of ${boardSize}`;
  }

  /**
   * Generate accessibility label for a stone
   */
  static getStoneLabel(stone: Stone): string {
    const playerName = stone.owner === 'player1' ? 'Player 1' : 'Player 2';
    const stoneTypeName = AccessibilityService.getStoneTypeName(stone.type);
    return `${playerName}'s ${stoneTypeName}`;
  }

  /**
   * Generate accessibility label for a stack
   */
  static getStackLabel(stones: Stone[], controlledBy: Player | null): string {
    if (stones.length === 0) return 'Empty square';
    
    const stackHeight = stones.length;
    const controllerName = controlledBy 
      ? (controlledBy === 'player1' ? 'Player 1' : 'Player 2')
      : 'no one';
    
    if (stackHeight === 1) {
      const stone = stones[0];
      const stoneLabel = AccessibilityService.getStoneLabel(stone);
      return `${stoneLabel}, controlled by ${controllerName}`;
    }
    
    const topStone = stones[stones.length - 1];
    const topStoneLabel = AccessibilityService.getStoneLabel(topStone);
    
    return `Stack of ${stackHeight} stones, top stone is ${topStoneLabel}, controlled by ${controllerName}`;
  }

  /**
   * Generate accessibility hint for a square
   */
  static getSquareHint(
    position: Position,
    stones: Stone[] | null,
    isHighlighted: boolean,
    gamePhase: string,
    currentPlayer: Player
  ): string {
    if (!stones || stones.length === 0) {
      if (isHighlighted) {
        return gamePhase === 'first-turn' 
          ? "Tap to place opponent's flat stone"
          : "Tap to place selected stone";
      }
      return "Empty square";
    }

    const controlledBy = AccessibilityService.getStackController(stones);
    const isOwnStack = controlledBy === currentPlayer;
    
    if (isHighlighted) {
      return "Valid move target, tap to move here";
    }
    
    if (isOwnStack) {
      return "Your stack, tap to select, long press for move options";
    }
    
    return "Opponent's stack";
  }

  /**
   * Generate accessibility label for stone type selection
   */
  static getStoneTypeSelectionLabel(
    stoneType: StoneType,
    count: number,
    isSelected: boolean
  ): string {
    const typeName = AccessibilityService.getStoneTypeName(stoneType);
    const selectedText = isSelected ? ', selected' : '';
    const countText = count > 0 ? ` (${count} remaining)` : ' (none remaining)';
    
    return `${typeName}${countText}${selectedText}`;
  }

  /**
   * Generate accessibility hint for stone type selection
   */
  static getStoneTypeSelectionHint(
    stoneType: StoneType,
    count: number,
    gamePhase: string
  ): string {
    if (count === 0) return "Not available";
    
    if (gamePhase === 'first-turn') {
      return stoneType === 'flat' 
        ? "Tap to select for placing opponent's stone"
        : "Not available during first turn";
    }
    
    return "Tap to select this stone type for placement";
  }

  /**
   * Generate accessibility announcement for game state changes
   */
  static getGameStateAnnouncement(
    gameState: GameState,
    previousGameState?: GameState
  ): string | null {
    // Turn change announcement
    if (previousGameState && gameState.currentPlayer !== previousGameState.currentPlayer) {
      const playerName = gameState.currentPlayer === 'player1' ? 'Player 1' : 'Player 2';
      
      if (gameState.gamePhase === 'first-turn') {
        return `${playerName}'s turn. Place opponent's flat stone.`;
      } else {
        return `${playerName}'s turn.`;
      }
    }

    // Game phase change announcement
    if (previousGameState && gameState.gamePhase !== previousGameState.gamePhase) {
      if (gameState.gamePhase === 'normal') {
        return "First turn phase complete. Now play with your own stones.";
      } else if (gameState.gamePhase === 'ended') {
        if (gameState.winner === 'draw') {
          return "Game ended in a draw!";
        } else if (gameState.winner) {
          const winnerName = gameState.winner === 'player1' ? 'Player 1' : 'Player 2';
          return `Game over! ${winnerName} wins!`;
        }
      }
    }

    return null;
  }

  /**
   * Generate accessibility label for move history
   */
  static getMoveHistoryLabel(moveIndex: number, totalMoves: number): string {
    return `Move ${moveIndex + 1} of ${totalMoves}`;
  }

  /**
   * Generate accessibility label for victory condition
   */
  static getVictoryLabel(winner: Player | 'draw' | null, victoryType?: string): string {
    if (winner === 'draw') {
      return "Game ended in a draw";
    }
    
    if (!winner) {
      return "Game in progress";
    }
    
    const winnerName = winner === 'player1' ? 'Player 1' : 'Player 2';
    const victoryTypeText = victoryType ? ` by ${victoryType}` : '';
    
    return `${winnerName} wins${victoryTypeText}`;
  }

  /**
   * Announce important game events to screen readers
   */
  static announceToScreenReader(message: string): void {
    if (!AccessibilityService.isScreenReaderEnabled()) return;
    
    try {
      if (Platform.OS === 'ios') {
        AccessibilityInfo.announceForAccessibility(message);
      } else if (Platform.OS === 'android') {
        AccessibilityInfo.announceForAccessibility(message);
      }
    } catch (error) {
      console.warn('Failed to announce to screen reader:', error);
    }
  }

  /**
   * Get human-readable stone type name
   */
  private static getStoneTypeName(stoneType: StoneType): string {
    switch (stoneType) {
      case 'flat':
        return 'flat stone';
      case 'wall':
        return 'wall';
      case 'capstone':
        return 'capstone';
      default:
        return 'stone';
    }
  }

  /**
   * Determine who controls a stack
   */
  private static getStackController(stones: Stone[]): Player | null {
    if (stones.length === 0) return null;
    
    // Find the topmost non-wall stone, or the top stone if all are walls
    for (let i = stones.length - 1; i >= 0; i--) {
      const stone = stones[i];
      if (stone.type !== 'wall') {
        return stone.owner;
      }
    }
    
    // If all stones are walls, the top stone controls
    return stones[stones.length - 1].owner;
  }
}