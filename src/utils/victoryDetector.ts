import { Board, Player, Position, StoneType } from '../types';

export interface VictoryResult {
  winner: Player | 'draw' | null;
  type: 'road' | 'flat' | null;
  winningPath?: Position[];
}

export class VictoryDetector {
  /**
   * Main victory check - checks both road and flat stone victories
   */
  checkVictory(board: Board, currentPlayer: Player, isBoardFull: boolean, isLastPiece: boolean): VictoryResult {
    // First check for road victory (current player gets priority in simultaneous roads)
    const roadVictory = this.checkRoadVictory(board, currentPlayer);
    if (roadVictory.winner) {
      return roadVictory;
    }

    // Check for opponent road victory only if current player doesn't have one
    const otherPlayer = currentPlayer === Player.PLAYER1 ? Player.PLAYER2 : Player.PLAYER1;
    const opponentRoadVictory = this.checkRoadVictory(board, otherPlayer);
    if (opponentRoadVictory.winner) {
      return opponentRoadVictory;
    }

    // Check flat stone victory if board is full or last piece was placed
    if (isBoardFull || isLastPiece) {
      return this.checkFlatStoneVictory(board);
    }

    return { winner: null, type: null };
  }

  /**
   * Check for road victory - connecting opposite edges with flat stones and capstones
   */
  checkRoadVictory(board: Board, player: Player): VictoryResult {
    const visited = Array(board.size).fill(null).map(() => Array(board.size).fill(false));
    
    // Check all possible starting positions for roads
    // We need to check both horizontal and vertical roads from any edge position
    
    // Check for horizontal roads (connecting left and right edges)
    for (let row = 0; row < board.size; row++) {
      // Start from left edge
      if (this.isRoadStone(board, { row, col: 0 }, player) && !visited[row][0]) {
        const path = this.floodFillRoad(board, { row, col: 0 }, player, visited);
        if (path && this.hasReachedOppositeEdge(path, board.size, 'horizontal')) {
          return { winner: player, type: 'road', winningPath: path };
        }
      }
    }

    // Reset visited for vertical check
    visited.forEach(row => row.fill(false));

    // Check for vertical roads (connecting top and bottom edges)
    for (let col = 0; col < board.size; col++) {
      // Start from top edge
      if (this.isRoadStone(board, { row: 0, col }, player) && !visited[0][col]) {
        const path = this.floodFillRoad(board, { row: 0, col }, player, visited);
        if (path && this.hasReachedOppositeEdge(path, board.size, 'vertical')) {
          return { winner: player, type: 'road', winningPath: path };
        }
      }
    }

    return { winner: null, type: null };
  }

  /**
   * Flood-fill algorithm to find connected road stones
   */
  private floodFillRoad(
    board: Board, 
    start: Position, 
    player: Player, 
    visited: boolean[][]
  ): Position[] | null {
    const path: Position[] = [];
    const stack: Position[] = [start];

    while (stack.length > 0) {
      const current = stack.pop()!;
      
      if (visited[current.row][current.col] || !this.isRoadStone(board, current, player)) {
        continue;
      }

      visited[current.row][current.col] = true;
      path.push(current);

      // Check all four adjacent positions
      const neighbors = [
        { row: current.row - 1, col: current.col }, // up
        { row: current.row + 1, col: current.col }, // down
        { row: current.row, col: current.col - 1 }, // left
        { row: current.row, col: current.col + 1 }  // right
      ];

      for (const neighbor of neighbors) {
        if (this.isValidPosition(neighbor, board.size) && 
            !visited[neighbor.row][neighbor.col] &&
            this.isRoadStone(board, neighbor, player)) {
          stack.push(neighbor);
        }
      }
    }

    return path.length > 0 ? path : null;
  }

  /**
   * Check if a position contains a road stone (flat stone or capstone) controlled by the player
   */
  private isRoadStone(board: Board, position: Position, player: Player): boolean {
    const stack = board.squares[position.row][position.col];
    if (!stack || stack.stones.length === 0) {
      return false;
    }

    const topStone = stack.stones[stack.stones.length - 1];
    return stack.controlledBy === player && 
           (topStone.type === StoneType.FLAT || topStone.type === StoneType.CAPSTONE);
  }

  /**
   * Check if the path reaches the opposite edge
   */
  private hasReachedOppositeEdge(path: Position[], boardSize: number, direction: 'horizontal' | 'vertical'): boolean {
    if (direction === 'horizontal') {
      // Need to reach from left edge (col 0) to right edge (col boardSize-1)
      const hasLeftEdge = path.some(pos => pos.col === 0);
      const hasRightEdge = path.some(pos => pos.col === boardSize - 1);
      return hasLeftEdge && hasRightEdge;
    } else {
      // Need to reach from top edge (row 0) to bottom edge (row boardSize-1)
      const hasTopEdge = path.some(pos => pos.row === 0);
      const hasBottomEdge = path.some(pos => pos.row === boardSize - 1);
      return hasTopEdge && hasBottomEdge;
    }
  }

  /**
   * Check for flat stone victory - count flat stones on top of stacks
   */
  checkFlatStoneVictory(board: Board): VictoryResult {
    let player1FlatStones = 0;
    let player2FlatStones = 0;

    for (let row = 0; row < board.size; row++) {
      for (let col = 0; col < board.size; col++) {
        const stack = board.squares[row][col];
        if (stack && stack.stones.length > 0) {
          const topStone = stack.stones[stack.stones.length - 1];
          if (topStone.type === StoneType.FLAT) {
            if (topStone.owner === Player.PLAYER1) {
              player1FlatStones++;
            } else if (topStone.owner === Player.PLAYER2) {
              player2FlatStones++;
            }
          }
        }
      }
    }

    if (player1FlatStones > player2FlatStones) {
      return { winner: Player.PLAYER1, type: 'flat' };
    } else if (player2FlatStones > player1FlatStones) {
      return { winner: Player.PLAYER2, type: 'flat' };
    } else {
      return { winner: 'draw', type: 'flat' };
    }
  }

  /**
   * Check if a position is valid on the board
   */
  private isValidPosition(position: Position, boardSize: number): boolean {
    return position.row >= 0 && position.row < boardSize &&
           position.col >= 0 && position.col < boardSize;
  }

  /**
   * Helper method to check if the board is full
   */
  isBoardFull(board: Board): boolean {
    for (let row = 0; row < board.size; row++) {
      for (let col = 0; col < board.size; col++) {
        if (board.squares[row][col] === null) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Helper method to check if a player has placed their last piece
   */
  isLastPiece(player: Player, reserves: Record<Player, { flatStones: number; capstones: number }>): boolean {
    const reserve = reserves[player];
    return reserve.flatStones === 0 && reserve.capstones === 0;
  }
}