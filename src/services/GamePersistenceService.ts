import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameState } from '../types';

// Storage keys
const STORAGE_KEYS = {
  CURRENT_GAME: 'tak_current_game',
  GAME_HISTORY: 'tak_game_history',
  SETTINGS: 'tak_settings',
} as const;

// Serializable game state for storage
export interface SerializableGameState {
  gameState: GameState;
  timestamp: number;
  gameId: string;
}

// Game history entry
export interface GameHistoryEntry {
  gameId: string;
  startTime: number;
  endTime?: number;
  boardSize: number;
  winner: string | null;
  totalMoves: number;
  gameState: GameState;
}

// Settings interface
export interface GameSettings {
  autoSave: boolean;
  keepGameHistory: boolean;
  maxHistoryEntries: number;
}

// Default settings
const DEFAULT_SETTINGS: GameSettings = {
  autoSave: true,
  keepGameHistory: true,
  maxHistoryEntries: 50,
};

export class GamePersistenceService {
  private static instance: GamePersistenceService;
  private currentGameId: string | null = null;

  private constructor() {}

  static getInstance(): GamePersistenceService {
    if (!GamePersistenceService.instance) {
      GamePersistenceService.instance = new GamePersistenceService();
    }
    return GamePersistenceService.instance;
  }

  // Generate unique game ID
  private generateGameId(): string {
    return `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Save current game state
  async saveCurrentGame(gameState: GameState): Promise<void> {
    try {
      if (!this.currentGameId) {
        this.currentGameId = this.generateGameId();
      }

      const serializableState: SerializableGameState = {
        gameState,
        timestamp: Date.now(),
        gameId: this.currentGameId,
      };

      await AsyncStorage.setItem(
        STORAGE_KEYS.CURRENT_GAME,
        JSON.stringify(serializableState)
      );
    } catch (error) {
      console.error('Failed to save current game:', error);
      throw new Error('Failed to save game state');
    }
  }

  // Load current game state
  async loadCurrentGame(): Promise<SerializableGameState | null> {
    try {
      const savedGame = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_GAME);
      if (!savedGame) {
        return null;
      }

      const parsedGame: SerializableGameState = JSON.parse(savedGame);
      this.currentGameId = parsedGame.gameId;
      
      return parsedGame;
    } catch (error) {
      console.error('Failed to load current game:', error);
      return null;
    }
  }

  // Clear current game
  async clearCurrentGame(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_GAME);
      this.currentGameId = null;
    } catch (error) {
      console.error('Failed to clear current game:', error);
      throw new Error('Failed to clear game state');
    }
  }

  // Check if there's a saved game
  async hasSavedGame(): Promise<boolean> {
    try {
      const savedGame = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_GAME);
      return savedGame !== null;
    } catch (error) {
      console.error('Failed to check for saved game:', error);
      return false;
    }
  }

  // Save completed game to history
  async saveGameToHistory(gameState: GameState, startTime: number): Promise<void> {
    try {
      const settings = await this.getSettings();
      if (!settings.keepGameHistory) {
        return;
      }

      const gameHistory = await this.getGameHistory();
      
      const historyEntry: GameHistoryEntry = {
        gameId: this.currentGameId || this.generateGameId(),
        startTime,
        endTime: Date.now(),
        boardSize: gameState.board.size,
        winner: gameState.winner,
        totalMoves: gameState.moveHistory.length,
        gameState,
      };

      gameHistory.unshift(historyEntry);

      // Limit history size
      if (gameHistory.length > settings.maxHistoryEntries) {
        gameHistory.splice(settings.maxHistoryEntries);
      }

      await AsyncStorage.setItem(
        STORAGE_KEYS.GAME_HISTORY,
        JSON.stringify(gameHistory)
      );
    } catch (error) {
      console.error('Failed to save game to history:', error);
      throw new Error('Failed to save game history');
    }
  }

  // Get game history
  async getGameHistory(): Promise<GameHistoryEntry[]> {
    try {
      const historyData = await AsyncStorage.getItem(STORAGE_KEYS.GAME_HISTORY);
      if (!historyData) {
        return [];
      }

      return JSON.parse(historyData);
    } catch (error) {
      console.error('Failed to load game history:', error);
      return [];
    }
  }

  // Clear game history
  async clearGameHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.GAME_HISTORY);
    } catch (error) {
      console.error('Failed to clear game history:', error);
      throw new Error('Failed to clear game history');
    }
  }

  // Get specific game from history
  async getGameFromHistory(gameId: string): Promise<GameHistoryEntry | null> {
    try {
      const history = await this.getGameHistory();
      return history.find(entry => entry.gameId === gameId) || null;
    } catch (error) {
      console.error('Failed to get game from history:', error);
      return null;
    }
  }

  // Settings management
  async getSettings(): Promise<GameSettings> {
    try {
      const settingsData = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!settingsData) {
        return DEFAULT_SETTINGS;
      }

      const savedSettings = JSON.parse(settingsData);
      return { ...DEFAULT_SETTINGS, ...savedSettings };
    } catch (error) {
      console.error('Failed to load settings:', error);
      return DEFAULT_SETTINGS;
    }
  }

  async saveSettings(settings: Partial<GameSettings>): Promise<void> {
    try {
      const currentSettings = await this.getSettings();
      const newSettings = { ...currentSettings, ...settings };
      
      await AsyncStorage.setItem(
        STORAGE_KEYS.SETTINGS,
        JSON.stringify(newSettings)
      );
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw new Error('Failed to save settings');
    }
  }

  // Data migration and integrity
  async validateStoredData(): Promise<boolean> {
    try {
      // Check if current game data is valid
      const currentGame = await this.loadCurrentGame();
      if (currentGame) {
        if (!this.isValidGameState(currentGame.gameState)) {
          console.warn('Invalid current game state detected, clearing...');
          await this.clearCurrentGame();
        }
      }

      // Check game history integrity
      const history = await this.getGameHistory();
      const validHistory = history.filter(entry => 
        this.isValidGameState(entry.gameState) && 
        entry.gameId && 
        entry.startTime
      );

      if (validHistory.length !== history.length) {
        console.warn('Invalid history entries detected, cleaning...');
        await AsyncStorage.setItem(
          STORAGE_KEYS.GAME_HISTORY,
          JSON.stringify(validHistory)
        );
      }

      return true;
    } catch (error) {
      console.error('Data validation failed:', error);
      return false;
    }
  }

  // Validate game state structure
  private isValidGameState(gameState: any): boolean {
    if (!gameState || typeof gameState !== 'object') {
      return false;
    }

    // Check required properties
    const requiredProps = ['board', 'currentPlayer', 'reserves', 'gamePhase', 'moveHistory'];
    for (const prop of requiredProps) {
      if (!(prop in gameState)) {
        return false;
      }
    }

    // Check board structure
    if (!gameState.board || !gameState.board.size || !Array.isArray(gameState.board.squares)) {
      return false;
    }

    // Check reserves structure
    if (!gameState.reserves || typeof gameState.reserves !== 'object') {
      return false;
    }

    // Check move history
    if (!Array.isArray(gameState.moveHistory)) {
      return false;
    }

    return true;
  }

  // Export game data for backup
  async exportGameData(): Promise<string> {
    try {
      const currentGame = await this.loadCurrentGame();
      const history = await this.getGameHistory();
      const settings = await this.getSettings();

      const exportData = {
        currentGame,
        history,
        settings,
        exportDate: new Date().toISOString(),
        version: '1.0.0',
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Failed to export game data:', error);
      throw new Error('Failed to export game data');
    }
  }

  // Import game data from backup
  async importGameData(jsonData: string): Promise<void> {
    try {
      const importData = JSON.parse(jsonData);
      
      // Validate import data structure
      if (!importData.version || !importData.exportDate) {
        throw new Error('Invalid import data format');
      }

      // Import current game if valid
      if (importData.currentGame && this.isValidGameState(importData.currentGame.gameState)) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.CURRENT_GAME,
          JSON.stringify(importData.currentGame)
        );
      }

      // Import history if valid
      if (Array.isArray(importData.history)) {
        const validHistory = importData.history.filter((entry: any) => 
          this.isValidGameState(entry.gameState)
        );
        await AsyncStorage.setItem(
          STORAGE_KEYS.GAME_HISTORY,
          JSON.stringify(validHistory)
        );
      }

      // Import settings if valid
      if (importData.settings && typeof importData.settings === 'object') {
        await this.saveSettings(importData.settings);
      }
    } catch (error) {
      console.error('Failed to import game data:', error);
      throw new Error('Failed to import game data');
    }
  }

  // Get current game ID
  getCurrentGameId(): string | null {
    return this.currentGameId;
  }

  // Set current game ID (for loading existing games)
  setCurrentGameId(gameId: string): void {
    this.currentGameId = gameId;
  }

  // Clear all stored data
  async clearAllData(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_GAME),
        AsyncStorage.removeItem(STORAGE_KEYS.GAME_HISTORY),
        AsyncStorage.removeItem(STORAGE_KEYS.SETTINGS),
      ]);
      this.currentGameId = null;
    } catch (error) {
      console.error('Failed to clear all data:', error);
      throw new Error('Failed to clear all data');
    }
  }
}

// Export singleton instance
export const gamePersistenceService = GamePersistenceService.getInstance();