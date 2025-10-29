// Persistence slice - manages game save/load operations

import { StateCreator } from 'zustand';
import { gamePersistenceService } from '../../services/GamePersistenceService';

export interface PersistenceSlice {
  // Persistence operations
  saveGame: () => Promise<void>;
  loadGame: () => Promise<boolean>;
  hasSavedGame: () => Promise<boolean>;
  clearSavedGame: () => Promise<void>;
}

export const createPersistenceSlice: StateCreator<PersistenceSlice, [], [], PersistenceSlice> = (set, get) => ({
  // Persistence operations
  saveGame: async () => {
    try {
      // This will be implemented in the combined store to access gameState
      console.warn('saveGame needs gameState access - will be implemented in combined store');
    } catch (error) {
      console.error('Failed to save game:', error);
      throw error;
    }
  },

  loadGame: async (): Promise<boolean> => {
    try {
      const savedGame = await gamePersistenceService.loadCurrentGame();
      if (!savedGame) {
        return false;
      }

      // This will be implemented in the combined store to set the state
      console.warn('loadGame needs setState access - will be implemented in combined store');
      return true;
    } catch (error) {
      console.error('Failed to load game:', error);
      return false;
    }
  },

  hasSavedGame: async (): Promise<boolean> => {
    try {
      return await gamePersistenceService.hasSavedGame();
    } catch (error) {
      console.error('Failed to check for saved game:', error);
      return false;
    }
  },

  clearSavedGame: async () => {
    try {
      await gamePersistenceService.clearCurrentGame();
    } catch (error) {
      console.error('Failed to clear saved game:', error);
      throw error;
    }
  },
});
