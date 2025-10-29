import { useGameStore } from '../index';
import { Player, StoneType } from '../../types';

// Mock the store for testing
const createTestStore = () => {
  const store = useGameStore.getState();
  return store;
};

describe('GameStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useGameStore.getState().initializeGame(5);
  });

  describe('Game Initialization', () => {
    test('should initialize game with correct board size and reserves', () => {
      const store = createTestStore();
      store.initializeGame(5);
      
      const { gameState } = useGameStore.getState();
      
      expect(gameState.board.size).toBe(5);
      expect(gameState.currentPlayer).toBe(Player.PLAYER1);
      expect(gameState.gamePhase).toBe('first-turn');
      expect(gameState.winner).toBeNull();
      expect(gameState.reserves[Player.PLAYER1].flatStones).toBe(21);
      expect(gameState.reserves[Player.PLAYER1].capstones).toBe(1);
      expect(gameState.reserves[Player.PLAYER2].flatStones).toBe(21);
      expect(gameState.reserves[Player.PLAYER2].capstones).toBe(1);
    });

    test('should initialize different board sizes correctly', () => {
      const store = createTestStore();
      
      // Test 4x4 board
      store.initializeGame(4);
      let { gameState } = useGameStore.getState();
      expect(gameState.board.size).toBe(4);
      expect(gameState.reserves[Player.PLAYER1].flatStones).toBe(15);
      expect(gameState.reserves[Player.PLAYER1].capstones).toBe(0);
      
      // Test 6x6 board
      store.initializeGame(6);
      gameState = useGameStore.getState().gameState;
      expect(gameState.board.size).toBe(6);
      expect(gameState.reserves[Player.PLAYER1].flatStones).toBe(30);
      expect(gameState.reserves[Player.PLAYER1].capstones).toBe(1);
    });
  });

  describe('Stone Placement', () => {
    test('should place opponent stone on first turn', () => {
      const store = createTestStore();
      const position = { row: 2, col: 2 };
      
      const success = store.placePiece(StoneType.FLAT, position);
      
      expect(success).toBe(true);
      const { gameState } = useGameStore.getState();
      expect(gameState.reserves[Player.PLAYER2].flatStones).toBe(20); // Opponent's stone used
      expect(gameState.reserves[Player.PLAYER1].flatStones).toBe(21); // Current player's stones unchanged
    });

    test('should place own stone after first turn phase', () => {
      const store = createTestStore();
      
      // Complete first turn phase
      store.placePiece(StoneType.FLAT, { row: 0, col: 0 }); // Player 1 places opponent stone
      store.placePiece(StoneType.FLAT, { row: 1, col: 1 }); // Player 2 places opponent stone
      
      // Now in normal phase
      const success = store.placePiece(StoneType.FLAT, { row: 2, col: 2 });
      
      expect(success).toBe(true);
      const { gameState } = useGameStore.getState();
      expect(gameState.gamePhase).toBe('normal');
      expect(gameState.reserves[Player.PLAYER1].flatStones).toBe(19); // Current player's stone used
    });

    test('should not place stone on occupied position', () => {
      const store = createTestStore();
      const position = { row: 2, col: 2 };
      
      // Place first stone
      store.placePiece(StoneType.FLAT, position);
      
      // Try to place second stone on same position
      const success = store.placePiece(StoneType.FLAT, position);
      
      expect(success).toBe(false);
    });
  });

  describe('Selection and Highlighting', () => {
    test('should select stone type and highlight valid positions', () => {
      const store = createTestStore();
      
      store.selectStoneType(StoneType.FLAT);
      
      const { uiState } = useGameStore.getState();
      expect(uiState.selectedStoneType).toBe(StoneType.FLAT);
      expect(uiState.highlightedPositions.length).toBeGreaterThan(0);
    });

    test('should select position', () => {
      const store = createTestStore();
      const position = { row: 2, col: 2 };
      
      store.selectPosition(position);
      
      const { uiState } = useGameStore.getState();
      expect(uiState.selectedPosition).toEqual(position);
    });

    test('should clear selection', () => {
      const store = createTestStore();
      
      store.selectStoneType(StoneType.FLAT);
      store.selectPosition({ row: 2, col: 2 });
      store.clearSelection();
      
      const { uiState } = useGameStore.getState();
      expect(uiState.selectedStoneType).toBeNull();
      expect(uiState.selectedPosition).toBeNull();
      expect(uiState.highlightedPositions).toEqual([]);
    });
  });

  describe('Computed Selectors', () => {
    test('should get current player reserve', () => {
      const store = createTestStore();
      
      const reserve = store.getCurrentPlayerReserve();
      
      expect(reserve.flatStones).toBe(21);
      expect(reserve.capstones).toBe(1);
    });

    test('should get valid placement positions', () => {
      const store = createTestStore();
      
      const positions = store.getValidPlacementPositions(StoneType.FLAT);
      
      expect(positions.length).toBe(25); // 5x5 board, all empty
    });

    test('should check if player can move', () => {
      const store = createTestStore();
      
      const canMove = store.canPlayerMove(Player.PLAYER1);
      
      expect(canMove).toBe(true); // Has stones to place
    });
  });

  describe('Game Phase Management', () => {
    test('should transition from first-turn to normal phase', () => {
      const store = createTestStore();
      
      // Player 1 first turn
      store.placePiece(StoneType.FLAT, { row: 0, col: 0 });
      let { gameState } = useGameStore.getState();
      expect(gameState.gamePhase).toBe('first-turn');
      expect(gameState.currentPlayer).toBe(Player.PLAYER2);
      
      // Player 2 first turn
      store.placePiece(StoneType.FLAT, { row: 1, col: 1 });
      gameState = useGameStore.getState().gameState;
      expect(gameState.gamePhase).toBe('normal');
      expect(gameState.currentPlayer).toBe(Player.PLAYER1);
    });
  });

  describe('Move History', () => {
    test('should track move history', () => {
      const store = createTestStore();
      
      store.placePiece(StoneType.FLAT, { row: 0, col: 0 });
      store.placePiece(StoneType.FLAT, { row: 1, col: 1 });
      
      const { gameState } = useGameStore.getState();
      expect(gameState.moveHistory).toHaveLength(2);
      expect(gameState.moveHistory[0].type).toBe('place');
      expect(gameState.moveHistory[1].type).toBe('place');
    });
  });

  describe('UI State Management', () => {
    test('should manage victory modal state', () => {
      const store = createTestStore();
      
      store.setShowingVictoryModal(true);
      
      const { uiState } = useGameStore.getState();
      expect(uiState.showingVictoryModal).toBe(true);
    });

    test('should manage animating moves', () => {
      const store = createTestStore();
      const moves = [{ type: 'place' as const, stoneType: StoneType.FLAT, position: { row: 0, col: 0 } }];
      
      store.setAnimatingMoves(moves);
      
      const { uiState } = useGameStore.getState();
      expect(uiState.animatingMoves).toEqual(moves);
    });
  });

  describe('Game Reset', () => {
    test('should reset game to initial state', () => {
      const store = createTestStore();
      
      // Make some moves
      store.placePiece(StoneType.FLAT, { row: 0, col: 0 });
      store.selectStoneType(StoneType.WALL);
      
      // Reset game
      store.resetGame();
      
      const { gameState, uiState } = useGameStore.getState();
      expect(gameState.moveHistory).toHaveLength(0);
      expect(gameState.gamePhase).toBe('first-turn');
      expect(gameState.currentPlayer).toBe(Player.PLAYER1);
      expect(uiState.selectedStoneType).toBeNull();
    });
  });
});