import AsyncStorage from '@react-native-async-storage/async-storage';
import { GamePersistenceService, GameSettings } from '../GamePersistenceService';
import { GameState, Player } from '../../types';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('GamePersistenceService', () => {
  let service: GamePersistenceService;
  
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

  beforeEach(() => {
    service = GamePersistenceService.getInstance();
    jest.clearAllMocks();
  });

  describe('saveCurrentGame', () => {
    it('should save game state to AsyncStorage', async () => {
      mockAsyncStorage.setItem.mockResolvedValue();

      await service.saveCurrentGame(mockGameState);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'tak_current_game',
        expect.stringContaining('"gameState"')
      );
    });

    it('should handle save errors', async () => {
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

      await expect(service.saveCurrentGame(mockGameState)).rejects.toThrow('Failed to save game state');
    });
  });

  describe('loadCurrentGame', () => {
    it('should load saved game state', async () => {
      const savedGame = {
        gameState: mockGameState,
        timestamp: Date.now(),
        gameId: 'test-game-id',
      };
      
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(savedGame));

      const result = await service.loadCurrentGame();

      expect(result).toEqual(savedGame);
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('tak_current_game');
    });

    it('should return null when no saved game exists', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await service.loadCurrentGame();

      expect(result).toBeNull();
    });

    it('should handle load errors', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const result = await service.loadCurrentGame();

      expect(result).toBeNull();
    });
  });

  describe('clearCurrentGame', () => {
    it('should remove current game from storage', async () => {
      mockAsyncStorage.removeItem.mockResolvedValue();

      await service.clearCurrentGame();

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('tak_current_game');
    });

    it('should handle clear errors', async () => {
      mockAsyncStorage.removeItem.mockRejectedValue(new Error('Storage error'));

      await expect(service.clearCurrentGame()).rejects.toThrow('Failed to clear game state');
    });
  });

  describe('hasSavedGame', () => {
    it('should return true when saved game exists', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('{"gameState": {}}');

      const result = await service.hasSavedGame();

      expect(result).toBe(true);
    });

    it('should return false when no saved game exists', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await service.hasSavedGame();

      expect(result).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const result = await service.hasSavedGame();

      expect(result).toBe(false);
    });
  });

  describe('saveGameToHistory', () => {
    it('should save completed game to history', async () => {
      const settings: GameSettings = {
        autoSave: true,
        keepGameHistory: true,
        maxHistoryEntries: 50,
      };
      
      mockAsyncStorage.getItem
        .mockResolvedValueOnce(JSON.stringify(settings)) // getSettings call
        .mockResolvedValueOnce('[]'); // getGameHistory call
      
      mockAsyncStorage.setItem.mockResolvedValue();

      const completedGameState = { ...mockGameState, winner: Player.PLAYER1 };
      await service.saveGameToHistory(completedGameState, Date.now() - 1000);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'tak_game_history',
        expect.stringContaining('"winner":"player1"')
      );
    });

    it('should not save to history when keepGameHistory is false', async () => {
      const settings: GameSettings = {
        autoSave: true,
        keepGameHistory: false,
        maxHistoryEntries: 50,
      };
      
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(settings));

      await service.saveGameToHistory(mockGameState, Date.now());

      expect(mockAsyncStorage.setItem).not.toHaveBeenCalledWith(
        'tak_game_history',
        expect.any(String)
      );
    });

    it('should limit history size', async () => {
      const settings: GameSettings = {
        autoSave: true,
        keepGameHistory: true,
        maxHistoryEntries: 2,
      };
      
      const existingHistory = [
        { gameId: 'game1', startTime: 1, endTime: 2, boardSize: 5, winner: null, totalMoves: 10, gameState: mockGameState },
        { gameId: 'game2', startTime: 3, endTime: 4, boardSize: 5, winner: null, totalMoves: 15, gameState: mockGameState },
      ];
      
      mockAsyncStorage.getItem
        .mockResolvedValueOnce(JSON.stringify(settings))
        .mockResolvedValueOnce(JSON.stringify(existingHistory));
      
      mockAsyncStorage.setItem.mockResolvedValue();

      await service.saveGameToHistory(mockGameState, Date.now());

      const setItemCall = mockAsyncStorage.setItem.mock.calls.find(
        call => call[0] === 'tak_game_history'
      );
      
      expect(setItemCall).toBeDefined();
      const savedHistory = JSON.parse(setItemCall![1]);
      expect(savedHistory).toHaveLength(2); // Should be limited to maxHistoryEntries
    });
  });

  describe('getSettings', () => {
    it('should return default settings when none exist', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const settings = await service.getSettings();

      expect(settings).toEqual({
        autoSave: true,
        keepGameHistory: true,
        maxHistoryEntries: 50,
      });
    });

    it('should return saved settings', async () => {
      const savedSettings: GameSettings = {
        autoSave: false,
        keepGameHistory: true,
        maxHistoryEntries: 25,
      };
      
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(savedSettings));

      const settings = await service.getSettings();

      expect(settings).toEqual(savedSettings);
    });

    it('should merge with defaults for partial settings', async () => {
      const partialSettings = { autoSave: false };
      
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(partialSettings));

      const settings = await service.getSettings();

      expect(settings).toEqual({
        autoSave: false,
        keepGameHistory: true,
        maxHistoryEntries: 50,
      });
    });
  });

  describe('saveSettings', () => {
    it('should save settings to storage', async () => {
      const currentSettings: GameSettings = {
        autoSave: true,
        keepGameHistory: true,
        maxHistoryEntries: 50,
      };
      
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(currentSettings));
      mockAsyncStorage.setItem.mockResolvedValue();

      const newSettings = { autoSave: false };
      await service.saveSettings(newSettings);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'tak_settings',
        JSON.stringify({ ...currentSettings, ...newSettings })
      );
    });
  });

  describe('validateStoredData', () => {
    it('should validate and clean invalid data', async () => {
      const invalidGameState = { invalid: 'data' };
      const validHistory = [
        { gameId: 'valid', startTime: 1, gameState: mockGameState },
        { invalid: 'entry' },
      ];
      
      mockAsyncStorage.getItem
        .mockResolvedValueOnce(JSON.stringify({ gameState: invalidGameState, timestamp: Date.now(), gameId: 'invalid' }))
        .mockResolvedValueOnce(JSON.stringify(validHistory));
      
      mockAsyncStorage.removeItem.mockResolvedValue();
      mockAsyncStorage.setItem.mockResolvedValue();

      const result = await service.validateStoredData();

      expect(result).toBe(true);
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('tak_current_game');
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'tak_game_history',
        expect.stringContaining('"gameId":"valid"')
      );
    });
  });

  describe('exportGameData', () => {
    it('should export all game data', async () => {
      const currentGame = { gameState: mockGameState, timestamp: Date.now(), gameId: 'current' };
      const history = [{ gameId: 'history1', gameState: mockGameState }];
      const settings = { autoSave: true, keepGameHistory: true, maxHistoryEntries: 50 };
      
      mockAsyncStorage.getItem
        .mockResolvedValueOnce(JSON.stringify(currentGame))
        .mockResolvedValueOnce(JSON.stringify(history))
        .mockResolvedValueOnce(JSON.stringify(settings));

      const exportData = await service.exportGameData();

      const parsed = JSON.parse(exportData);
      expect(parsed).toHaveProperty('currentGame');
      expect(parsed).toHaveProperty('history');
      expect(parsed).toHaveProperty('settings');
      expect(parsed).toHaveProperty('exportDate');
      expect(parsed).toHaveProperty('version');
    });
  });

  describe('importGameData', () => {
    it('should import valid game data', async () => {
      const importData = {
        currentGame: { gameState: mockGameState, timestamp: Date.now(), gameId: 'imported' },
        history: [{ gameId: 'imported-history', gameState: mockGameState }],
        settings: { autoSave: false },
        exportDate: new Date().toISOString(),
        version: '1.0.0',
      };
      
      mockAsyncStorage.setItem.mockResolvedValue();
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify({ autoSave: true, keepGameHistory: true, maxHistoryEntries: 50 }));

      await service.importGameData(JSON.stringify(importData));

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'tak_current_game',
        JSON.stringify(importData.currentGame)
      );
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'tak_game_history',
        JSON.stringify(importData.history)
      );
    });

    it('should reject invalid import data', async () => {
      const invalidData = { invalid: 'data' };

      await expect(service.importGameData(JSON.stringify(invalidData))).rejects.toThrow('Failed to import game data');
    });
  });

  describe('clearAllData', () => {
    it('should clear all stored data', async () => {
      mockAsyncStorage.removeItem.mockResolvedValue();

      await service.clearAllData();

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('tak_current_game');
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('tak_game_history');
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('tak_settings');
    });
  });
});