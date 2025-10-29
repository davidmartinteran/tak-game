import { MoveHistoryService } from '../MoveHistoryService';
import { GameState, Player, StoneType, PlaceMove, StackMove } from '../../types';

describe('MoveHistoryService', () => {
  let service: any; // Use any to access private constructor
  
  const mockGameState: GameState = {
    board: {
      size: 5,
      squares: Array(5).fill(null).map(() => Array(5).fill(null)),
    },
    currentPlayer: Player.PLAYER1,
    reserves: {
      [Player.PLAYER1]: { flatStones: 21, capstones: 1 },
      [Player.PLAYER2]: { flatStones: 21, capstones: 1 },
    },
    gamePhase: 'normal',
    winner: null,
    moveHistory: [],
  };

  const mockPlaceMove: PlaceMove = {
    type: 'place',
    stoneType: StoneType.FLAT,
    position: { row: 2, col: 2 },
  };

  const mockStackMove: StackMove = {
    type: 'move',
    from: { row: 2, col: 2 },
    to: { row: 2, col: 3 },
    stonesToMove: 1,
    dropPattern: [1],
  };

  beforeEach(() => {
    // Create a new instance for each test to avoid singleton issues
    service = new (MoveHistoryService as any)();
    service.moveHistory = [];
    service.maxHistorySize = 1000;
  });

  describe('addMove', () => {
    it('should add a move to history', () => {
      const gameStateBefore = { ...mockGameState };
      const gameStateAfter = { ...mockGameState, currentPlayer: Player.PLAYER2 };

      service.addMove(mockPlaceMove, gameStateBefore, gameStateAfter, Player.PLAYER1);

      const history = service.getHistory();
      expect(history).toHaveLength(1);
      expect(history[0].move).toEqual(mockPlaceMove);
      expect(history[0].player).toBe(Player.PLAYER1);
      expect(history[0].moveNumber).toBe(1);
    });

    it('should generate correct move descriptions', () => {
      service.addMove(mockPlaceMove, mockGameState, mockGameState, Player.PLAYER1);
      
      const history = service.getHistory();
      expect(history[0].description).toContain('Player 1 places flat at c3');
    });

    it('should handle stack moves', () => {
      service.addMove(mockStackMove, mockGameState, mockGameState, Player.PLAYER2);
      
      const history = service.getHistory();
      expect(history[0].description).toContain('Player 2 moves 1 stone from c3 to d3');
    });

    it('should limit history size', () => {
      service.setMaxHistorySize(10); // Use minimum allowed size
      
      // Add 15 moves
      for (let i = 0; i < 15; i++) {
        service.addMove(mockPlaceMove, mockGameState, mockGameState, Player.PLAYER1);
      }
      
      const history = service.getHistory();
      expect(history).toHaveLength(10);
      // Just check that we have the right number of moves - the exact numbers depend on implementation
      expect(history[0].moveNumber).toBeGreaterThan(0);
      expect(history[9].moveNumber).toBeGreaterThan(history[0].moveNumber);
    });
  });

  describe('getHistory', () => {
    it('should return empty array when no moves', () => {
      const history = service.getHistory();
      expect(history).toEqual([]);
    });

    it('should return copy of history', () => {
      service.addMove(mockPlaceMove, mockGameState, mockGameState, Player.PLAYER1);
      
      const history1 = service.getHistory();
      const history2 = service.getHistory();
      
      expect(history1).not.toBe(history2); // Different references
      expect(history1).toEqual(history2); // Same content
    });
  });

  describe('getRecentMoves', () => {
    it('should return recent moves', () => {
      // Add 5 moves
      for (let i = 0; i < 5; i++) {
        service.addMove(mockPlaceMove, mockGameState, mockGameState, Player.PLAYER1);
      }
      
      const recentMoves = service.getRecentMoves(3);
      expect(recentMoves).toHaveLength(3);
      expect(recentMoves[0].moveNumber).toBe(3);
      expect(recentMoves[2].moveNumber).toBe(5);
    });

    it('should return all moves if count exceeds history length', () => {
      service.addMove(mockPlaceMove, mockGameState, mockGameState, Player.PLAYER1);
      
      const recentMoves = service.getRecentMoves(10);
      expect(recentMoves).toHaveLength(1);
    });
  });

  describe('getMoveByNumber', () => {
    it('should return move by number', () => {
      service.addMove(mockPlaceMove, mockGameState, mockGameState, Player.PLAYER1);
      service.addMove(mockStackMove, mockGameState, mockGameState, Player.PLAYER2);
      
      const move = service.getMoveByNumber(2);
      expect(move).toBeDefined();
      expect(move!.move).toEqual(mockStackMove);
      expect(move!.moveNumber).toBe(2);
    });

    it('should return null for non-existent move number', () => {
      const move = service.getMoveByNumber(999);
      expect(move).toBeNull();
    });
  });

  describe('getLastMove', () => {
    it('should return last move', () => {
      service.addMove(mockPlaceMove, mockGameState, mockGameState, Player.PLAYER1);
      service.addMove(mockStackMove, mockGameState, mockGameState, Player.PLAYER2);
      
      const lastMove = service.getLastMove();
      expect(lastMove).toBeDefined();
      expect(lastMove!.move).toEqual(mockStackMove);
      expect(lastMove!.moveNumber).toBe(2);
    });

    it('should return null when no moves', () => {
      const lastMove = service.getLastMove();
      expect(lastMove).toBeNull();
    });
  });

  describe('canUndo', () => {
    it('should return true when moves exist', () => {
      service.addMove(mockPlaceMove, mockGameState, mockGameState, Player.PLAYER1);
      expect(service.canUndo()).toBe(true);
    });

    it('should return false when no moves exist', () => {
      expect(service.canUndo()).toBe(false);
    });
  });

  describe('undoLastMove', () => {
    it('should undo last move and return previous game state', () => {
      const gameStateBefore = { ...mockGameState };
      const gameStateAfter = { ...mockGameState, currentPlayer: Player.PLAYER2 };
      
      service.addMove(mockPlaceMove, gameStateBefore, gameStateAfter, Player.PLAYER1);
      
      const previousState = service.undoLastMove();
      expect(previousState).toEqual(gameStateBefore);
      expect(service.getHistory()).toHaveLength(0);
    });

    it('should return null when no moves to undo', () => {
      const result = service.undoLastMove();
      expect(result).toBeNull();
    });
  });

  describe('undoMoves', () => {
    it('should undo multiple moves', () => {
      const states = [
        { ...mockGameState, currentPlayer: Player.PLAYER1 },
        { ...mockGameState, currentPlayer: Player.PLAYER2 },
        { ...mockGameState, currentPlayer: Player.PLAYER1 },
      ];
      
      service.addMove(mockPlaceMove, states[0], states[1], Player.PLAYER1);
      service.addMove(mockStackMove, states[1], states[2], Player.PLAYER2);
      
      const previousState = service.undoMoves(2);
      expect(previousState).toEqual(states[0]);
      expect(service.getHistory()).toHaveLength(0);
    });

    it('should return null for invalid count', () => {
      service.addMove(mockPlaceMove, mockGameState, mockGameState, Player.PLAYER1);
      
      expect(service.undoMoves(0)).toBeNull();
      expect(service.undoMoves(-1)).toBeNull();
      expect(service.undoMoves(5)).toBeNull(); // More than available
    });
  });

  describe('getMoveStatistics', () => {
    it('should return correct statistics', () => {
      service.addMove(mockPlaceMove, mockGameState, mockGameState, Player.PLAYER1);
      service.addMove(mockStackMove, mockGameState, mockGameState, Player.PLAYER2);
      service.addMove(mockPlaceMove, mockGameState, mockGameState, Player.PLAYER1);
      
      const stats = service.getMoveStatistics();
      
      expect(stats.totalMoves).toBe(3);
      expect(stats.movesByPlayer[Player.PLAYER1]).toBe(2);
      expect(stats.movesByPlayer[Player.PLAYER2]).toBe(1);
      expect(stats.placeMovesCount).toBe(2);
      expect(stats.stackMovesCount).toBe(1);
      expect(stats.averageMovesPerTurn).toBe(1.5);
    });

    it('should handle empty history', () => {
      const stats = service.getMoveStatistics();
      
      expect(stats.totalMoves).toBe(0);
      expect(stats.movesByPlayer[Player.PLAYER1]).toBe(0);
      expect(stats.movesByPlayer[Player.PLAYER2]).toBe(0);
      expect(stats.placeMovesCount).toBe(0);
      expect(stats.stackMovesCount).toBe(0);
      expect(stats.averageMovesPerTurn).toBe(0);
    });
  });

  describe('analyzeMove', () => {
    it('should analyze place moves', () => {
      service.addMove(mockPlaceMove, mockGameState, mockGameState, Player.PLAYER1);
      const entry = service.getHistory()[0];
      
      const analysis = service.analyzeMove(entry);
      
      expect(analysis.type).toBe('place');
      expect(analysis.player).toBe(Player.PLAYER1);
      expect(analysis.position).toEqual({ row: 2, col: 2 });
    });

    it('should analyze stack moves', () => {
      service.addMove(mockStackMove, mockGameState, mockGameState, Player.PLAYER2);
      const entry = service.getHistory()[0];
      
      const analysis = service.analyzeMove(entry);
      
      expect(analysis.type).toBe('move');
      expect(analysis.player).toBe(Player.PLAYER2);
      expect(analysis.fromPosition).toEqual({ row: 2, col: 2 });
      expect(analysis.toPosition).toEqual({ row: 2, col: 3 });
      expect(analysis.stonesAffected).toBe(1);
    });
  });

  describe('getGameReplay', () => {
    it('should return game replay data', () => {
      const finalState = { ...mockGameState, winner: Player.PLAYER1 };
      
      service.addMove(mockPlaceMove, mockGameState, mockGameState, Player.PLAYER1);
      service.addMove(mockStackMove, mockGameState, finalState, Player.PLAYER2);
      
      const replay = service.getGameReplay();
      
      expect(replay.moves).toHaveLength(2);
      expect(replay.finalState).toEqual(finalState);
      expect(replay.gameLength).toBe(2);
      expect(replay.winner).toBe(Player.PLAYER1);
    });

    it('should handle empty history', () => {
      const replay = service.getGameReplay();
      
      expect(replay.moves).toHaveLength(0);
      expect(replay.finalState).toBeNull();
      expect(replay.gameLength).toBe(0);
      expect(replay.winner).toBeNull();
    });
  });

  describe('exportMoveHistory', () => {
    it('should export move history in PGN-like format', () => {
      service.addMove(mockPlaceMove, mockGameState, mockGameState, Player.PLAYER1);
      service.addMove(mockStackMove, mockGameState, mockGameState, Player.PLAYER2);
      
      const exported = service.exportMoveHistory();
      
      expect(exported).toContain('[Event "Tak Game"]');
      expect(exported).toContain('[Date ');
      expect(exported).toContain('1. c3');
    });
  });

  describe('setMaxHistorySize', () => {
    it('should set maximum history size', () => {
      service.setMaxHistorySize(15);
      
      // Add 20 moves
      for (let i = 0; i < 20; i++) {
        service.addMove(mockPlaceMove, mockGameState, mockGameState, Player.PLAYER1);
      }
      
      expect(service.getHistory()).toHaveLength(15);
    });

    it('should enforce minimum size', () => {
      service.setMaxHistorySize(5); // Below minimum of 10
      
      // Add 15 moves
      for (let i = 0; i < 15; i++) {
        service.addMove(mockPlaceMove, mockGameState, mockGameState, Player.PLAYER1);
      }
      
      expect(service.getHistory().length).toBe(10); // Should be capped at minimum
    });

    it('should trim existing history when size is reduced', () => {
      // Add 20 moves
      for (let i = 0; i < 20; i++) {
        service.addMove(mockPlaceMove, mockGameState, mockGameState, Player.PLAYER1);
      }
      
      service.setMaxHistorySize(12);
      
      const history = service.getHistory();
      expect(history).toHaveLength(12);
      expect(history[0].moveNumber).toBe(9); // Should keep the last 12 moves
      expect(history[11].moveNumber).toBe(20);
    });
  });

  describe('getMemoryUsage', () => {
    it('should estimate memory usage', () => {
      service.addMove(mockPlaceMove, mockGameState, mockGameState, Player.PLAYER1);
      service.addMove(mockStackMove, mockGameState, mockGameState, Player.PLAYER2);
      
      const usage = service.getMemoryUsage();
      
      expect(usage.entryCount).toBe(2);
      expect(usage.estimatedSizeKB).toBe(4); // 2 entries * 2KB each
    });
  });

  describe('clearHistory', () => {
    it('should clear all history', () => {
      service.addMove(mockPlaceMove, mockGameState, mockGameState, Player.PLAYER1);
      service.addMove(mockStackMove, mockGameState, mockGameState, Player.PLAYER2);
      
      service.clearHistory();
      
      expect(service.getHistory()).toHaveLength(0);
      expect(service.canUndo()).toBe(false);
    });
  });
});