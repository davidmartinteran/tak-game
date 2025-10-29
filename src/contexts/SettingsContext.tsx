import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HapticService } from '../services/HapticService';

interface GameSettings {
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  animationsEnabled: boolean;
  showMoveHints: boolean;
  autoSaveEnabled: boolean;
}

interface SettingsContextType {
  settings: GameSettings;
  updateSetting: <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  isLoading: boolean;
}

const defaultSettings: GameSettings = {
  hapticsEnabled: true,
  soundEnabled: true,
  animationsEnabled: true,
  showMoveHints: true,
  autoSaveEnabled: true,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const SETTINGS_STORAGE_KEY = '@tak_game_settings';

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<GameSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from storage on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Apply settings changes to services
  useEffect(() => {
    HapticService.setEnabled(settings.hapticsEnabled);
  }, [settings.hapticsEnabled]);

  const loadSettings = async () => {
    try {
      const storedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        setSettings({ ...defaultSettings, ...parsedSettings });
      }
    } catch (error) {
      console.warn('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: GameSettings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const updateSetting = async <K extends keyof GameSettings>(
    key: K,
    value: GameSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const resetToDefaults = async () => {
    setSettings(defaultSettings);
    await saveSettings(defaultSettings);
  };

  const contextValue: SettingsContextType = {
    settings,
    updateSetting,
    resetToDefaults,
    isLoading,
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export type { GameSettings };