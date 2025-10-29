import { GameState, Move, Player, Position, StackMove } from '../types';

// Extended move information for history tracking
export interface MoveHistoryEntry {
  move: Move;
  gameStateBefore: GameState;
  gameStateAfter: GameState;
  timestamp: number;
  moveNumber: number;
  player: Player;
  description: string;
}

// Move analysis for display
export interface MoveAnalysis {
  type: 'place' | 'move';
  player: Player;
  description: string;
  position?: Position;
  fromPosition?: Position;
  toPosition?: Position;
  stonesAffected?: number;
  isCapture?: boolean;
  isRoadBuilding?: boolean;
  isBlocking?: boolean;
}

export class MoveHistoryService {
  private static instance: MoveHistoryService;
  private moveHistory: MoveHistoryEntry[] = [];
  private maxHistorySize: number = 1000; // Prevent memory issues

  private constructor() {}

  static getInstance(): MoveHistoryService {
    if (!MoveHistoryService.instance) {
      MoveHistoryService.instance = new MoveHistoryService();
    }
    return MoveHistoryService.instance;
  }

  // Add a move to history
  addMove(
    move: Move,
    gameStateBefore: GameState,
    gameStateAfter: GameState,
    player: Player
  ): void {
    const entry: MoveHistoryEntry = {
      move,
      gameStateBefore: this.deepCloneGameState(gameStateBefore),
      gameStateAfter: this.deepCloneGameState(gameStateAfter),
      timestamp: Date.now(),
      moveNumber: this.moveHistory.length + 1,
      player,
      description: this.generateMoveDescription(move, player),
    };

    this.moveHistory.push(entry);

    // Limit history size to prevent memory issues
    if (this.moveHistory.length > this.maxHistorySize) {
      this.moveHistory = this.moveHistory.slice(-this.maxHistorySize);
    }
  }

  // Get full move history
  getHistory(): MoveHistoryEntry[] {
    return [...this.moveHistory];
  }

  // Get recent moves (last N moves)
  getRecentMoves(count: number = 10): MoveHistoryEntry[] {
    return this.moveHistory.slice(-count);
  }

  // Get move by number
  getMoveByNumber(moveNumber: number): MoveHistoryEntry | null {
    return this.moveHistory.find(entry => entry.moveNumber === moveNumber) || null;
  }

  // Get last move
  getLastMove(): MoveHistoryEntry | null {
    return this.moveHistory.length > 0 ? this.moveHistory[this.moveHistory.length - 1] : null;
  }

  // Check if undo is possible
  canUndo(): boolean {
    return this.moveHistory.length > 0;
  }

  // Undo last move and return the previous game state
  undoLastMove(): GameState | null {
    if (!this.canUndo()) {
      return null;
    }

    const lastEntry = this.moveHistory.pop();
    if (!lastEntry) {
      return null;
    }

    return this.deepCloneGameState(lastEntry.gameStateBefore);
  }

  // Undo multiple moves
  undoMoves(count: number): GameState | null {
    if (count <= 0 || count > this.moveHistory.length) {
      return null;
    }

    // Remove the specified number of moves
    const removedMoves = this.moveHistory.splice(-count, count);
    
    if (removedMoves.length === 0) {
      return null;
    }

    // Return the game state before the first removed move
    return this.deepCloneGameState(removedMoves[0].gameStateBefore);
  }

  // Clear history
  clearHistory(): void {
    this.moveHistory = [];
  }

  // Get move statistics
  getMoveStatistics(): {
    totalMoves: number;
    movesByPlayer: Record<Player, number>;
    placeMovesCount: number;
    stackMovesCount: number;
    averageMovesPerTurn: number;
  } {
    const stats = {
      totalMoves: this.moveHistory.length,
      movesByPlayer: {
        [Player.PLAYER1]: 0,
        [Player.PLAYER2]: 0,
      },
      placeMovesCount: 0,
      stackMovesCount: 0,
      averageMovesPerTurn: 0,
    };

    this.moveHistory.forEach(entry => {
      stats.movesByPlayer[entry.player]++;
      
      if (entry.move.type === 'place') {
        stats.placeMovesCount++;
      } else if (entry.move.type === 'move') {
        stats.stackMovesCount++;
      }
    });

    stats.averageMovesPerTurn = stats.totalMoves > 0 ? stats.totalMoves / 2 : 0;

    return stats;
  }

  // Analyze move for strategic insights
  analyzeMove(entry: MoveHistoryEntry): MoveAnalysis {
    const { move, player } = entry;
    
    const analysis: MoveAnalysis = {
      type: move.type,
      player,
      description: entry.description,
    };

    if (move.type === 'place') {
      analysis.position = move.position;
      
      // Check if this move is road-building
      analysis.isRoadBuilding = this.isRoadBuildingMove(move, entry.gameStateAfter);
      
      // Check if this move is blocking
      analysis.isBlocking = this.isBlockingMove(move, entry.gameStateBefore, entry.gameStateAfter);
    } else if (move.type === 'move') {
      analysis.fromPosition = move.from;
      analysis.toPosition = move.to;
      analysis.stonesAffected = move.stonesToMove;
      
      // Check if this move captures/flattens stones
      analysis.isCapture = this.isCaptureMove(move, entry.gameStateBefore);
      
      // Check if this move builds roads
      analysis.isRoadBuilding = this.isRoadBuildingMove(move, entry.gameStateAfter);
    }

    return analysis;
  }

  // Get game replay data
  getGameReplay(): {
    moves: MoveAnalysis[];
    finalState: GameState | null;
    gameLength: number;
    winner: Player | 'draw' | null;
  } {
    const moves = this.moveHistory.map(entry => this.analyzeMove(entry));
    const lastEntry = this.getLastMove();
    
    return {
      moves,
      finalState: lastEntry ? lastEntry.gameStateAfter : null,
      gameLength: this.moveHistory.length,
      winner: lastEntry ? lastEntry.gameStateAfter.winner : null,
    };
  }

  // Export move history as PGN-like format
  exportMoveHistory(): string {
    const lines: string[] = [];
    lines.push('[Event "Tak Game"]');
    lines.push(`[Date "${new Date().toISOString().split('T')[0]}"]`);
    lines.push(`[Result "${this.getGameResult()}"]`);
    lines.push('');

    // Add moves in pairs (Player 1, Player 2)
    for (let i = 0; i < this.moveHistory.length; i += 2) {
      const moveNumber = Math.floor(i / 2) + 1;
      const player1Move = this.moveHistory[i];
      const player2Move = this.moveHistory[i + 1];

      let line = `${moveNumber}. ${this.formatMoveForExport(player1Move.move)}`;
      if (player2Move) {
        line += ` ${this.formatMoveForExport(player2Move.move)}`;
      }
      lines.push(line);
    }

    return lines.join('\n');
  }

  // Import move history from PGN-like format
  importMoveHistory(pgnData: string): Move[] {
    const moves: Move[] = [];
    const lines = pgnData.split('\n');
    
    for (const line of lines) {
      if (line.match(/^\d+\./)) {
        // Parse move line
        const moveMatches = line.match(/\d+\.\s+(.+)/);
        if (moveMatches) {
          const movePart = moveMatches[1];
          const individualMoves = movePart.split(/\s+/);
          
          for (const moveStr of individualMoves) {
            const move = this.parseMoveFromString(moveStr);
            if (move) {
              moves.push(move);
            }
          }
        }
      }
    }

    return moves;
  }

  // Private helper methods

  private deepCloneGameState(gameState: GameState): GameState {
    return JSON.parse(JSON.stringify(gameState));
  }

  private generateMoveDescription(move: Move, player: Player): string {
    const playerName = player === Player.PLAYER1 ? 'Player 1' : 'Player 2';
    
    if (move.type === 'place') {
      const stoneType = move.stoneType.charAt(0).toUpperCase() + move.stoneType.slice(1);
      const position = `${String.fromCharCode(97 + move.position.col)}${move.position.row + 1}`;
      
      if (move.isOpponentStone) {
        return `${playerName} places opponent's flat stone at ${position}`;
      } else {
        return `${playerName} places ${stoneType.toLowerCase()} at ${position}`;
      }
    } else if (move.type === 'move') {
      const fromPos = `${String.fromCharCode(97 + move.from.col)}${move.from.row + 1}`;
      const toPos = `${String.fromCharCode(97 + move.to.col)}${move.to.row + 1}`;
      const stones = move.stonesToMove === 1 ? 'stone' : 'stones';
      
      return `${playerName} moves ${move.stonesToMove} ${stones} from ${fromPos} to ${toPos}`;
    }

    return `${playerName} makes unknown move`;
  }

  private isRoadBuildingMove(move: Move, gameStateAfter: GameState): boolean {
    // This would require more complex analysis of the board state
    // For now, return false as a placeholder
    // TODO: Implement road detection logic
    return false;
  }

  private isBlockingMove(move: Move, gameStateBefore: GameState, gameStateAfter: GameState): boolean {
    // This would require analyzing if the move blocks opponent's potential roads
    // For now, return false as a placeholder
    // TODO: Implement blocking detection logic
    return false;
  }

  private isCaptureMove(move: StackMove, gameStateBefore: GameState): boolean {
    // Check if the move flattens any walls (captures)
    const targetSquare = gameStateBefore.board.squares[move.to.row][move.to.col];
    if (targetSquare && targetSquare.stones.length > 0) {
      const topStone = targetSquare.stones[targetSquare.stones.length - 1];
      return topStone.type === 'wall';
    }
    return false;
  }

  private getGameResult(): string {
    const lastEntry = this.getLastMove();
    if (!lastEntry) {
      return '*';
    }

    const winner = lastEntry.gameStateAfter.winner;
    if (winner === Player.PLAYER1) {
      return '1-0';
    } else if (winner === Player.PLAYER2) {
      return '0-1';
    } else if (winner === 'draw') {
      return '1/2-1/2';
    }

    return '*';
  }

  private formatMoveForExport(move: Move): string {
    if (move.type === 'place') {
      const position = `${String.fromCharCode(97 + move.position.col)}${move.position.row + 1}`;
      let prefix = '';
      
      if (move.stoneType === 'wall') {
        prefix = 'S';
      } else if (move.stoneType === 'capstone') {
        prefix = 'C';
      }
      
      return `${prefix}${position}`;
    } else if (move.type === 'move') {
      const fromPos = `${String.fromCharCode(97 + move.from.col)}${move.from.row + 1}`;
      const toPos = `${String.fromCharCode(97 + move.to.col)}${move.to.row + 1}`;
      
      if (move.stonesToMove === 1) {
        return `${fromPos}${toPos}`;
      } else {
        return `${move.stonesToMove}${fromPos}${toPos}`;
      }
    }

    return '';
  }

  private parseMoveFromString(moveStr: string): Move | null {
    // This is a simplified parser - would need more robust implementation
    // TODO: Implement proper move parsing from string notation
    return null;
  }

  // Set maximum history size
  setMaxHistorySize(size: number): void {
    this.maxHistorySize = Math.max(10, size); // Minimum 10 moves for testing
    
    // Trim current history if needed
    if (this.moveHistory.length > this.maxHistorySize) {
      this.moveHistory = this.moveHistory.slice(-this.maxHistorySize);
    }
  }

  // Get memory usage estimate
  getMemoryUsage(): {
    entryCount: number;
    estimatedSizeKB: number;
  } {
    const entryCount = this.moveHistory.length;
    // Rough estimate: each entry is about 2KB when serialized
    const estimatedSizeKB = entryCount * 2;
    
    return {
      entryCount,
      estimatedSizeKB,
    };
  }
}

// Export singleton instance
export const moveHistoryService = MoveHistoryService.getInstance();