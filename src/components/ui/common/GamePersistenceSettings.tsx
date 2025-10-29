import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { gamePersistenceService, GameSettings } from '../../../services/GamePersistenceService';
import { Colors } from '../../../constants/colors';
import { scaleWidth, scaleFontSize } from '../../../utils/responsive';

export interface GamePersistenceSettingsProps {
  onSettingsChange?: (settings: GameSettings) => void;
}

export const GamePersistenceSettings: React.FC<GamePersistenceSettingsProps> = ({
  onSettingsChange,
}) => {
  const [settings, setSettings] = useState<GameSettings>({
    autoSave: true,
    keepGameHistory: true,
    maxHistoryEntries: 50,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const currentSettings = await gamePersistenceService.getSettings();
      setSettings(currentSettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async <K extends keyof GameSettings>(
    key: K,
    value: GameSettings[K]
  ) => {
    try {
      const newSettings = { ...settings, [key]: value };
      await gamePersistenceService.saveSettings({ [key]: value });
      setSettings(newSettings);
      onSettingsChange?.(newSettings);
    } catch (error) {
      console.error('Failed to save setting:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    }
  };

  const handleClearGameHistory = () => {
    Alert.alert(
      'Clear Game History',
      'Are you sure you want to clear all game history? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await gamePersistenceService.clearGameHistory();
              Alert.alert('Success', 'Game history cleared successfully.');
            } catch (error) {
              console.error('Failed to clear history:', error);
              Alert.alert('Error', 'Failed to clear game history.');
            }
          },
        },
      ]
    );
  };

  const handleExportData = async () => {
    try {
      const exportData = await gamePersistenceService.exportGameData();
      // In a real app, you'd use Share API or file system
      Alert.alert('Export Data', 'Game data exported successfully!');
      console.log('Export data:', exportData);
    } catch (error) {
      console.error('Failed to export data:', error);
      Alert.alert('Error', 'Failed to export game data.');
    }
  };

  const handleValidateData = async () => {
    try {
      const isValid = await gamePersistenceService.validateStoredData();
      Alert.alert(
        'Data Validation',
        isValid ? 'All stored data is valid.' : 'Some data issues were found and fixed.'
      );
    } catch (error) {
      console.error('Failed to validate data:', error);
      Alert.alert('Error', 'Failed to validate stored data.');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Game Persistence</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Auto-save games</Text>
            <Text style={styles.settingDescription}>
              Automatically save game progress after each move
            </Text>
          </View>
          <Switch
            value={settings.autoSave}
            onValueChange={(value) => updateSetting('autoSave', value)}
            trackColor={{ false: Colors.surface, true: Colors.accent }}
            thumbColor={settings.autoSave ? Colors.text : Colors.textSecondary}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Keep game history</Text>
            <Text style={styles.settingDescription}>
              Store completed games for review and statistics
            </Text>
          </View>
          <Switch
            value={settings.keepGameHistory}
            onValueChange={(value) => updateSetting('keepGameHistory', value)}
            trackColor={{ false: Colors.surface, true: Colors.accent }}
            thumbColor={settings.keepGameHistory ? Colors.text : Colors.textSecondary}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Max history entries</Text>
            <Text style={styles.settingDescription}>
              Maximum number of games to keep in history (current: {settings.maxHistoryEntries})
            </Text>
          </View>
        </View>

        <View style={styles.historyControls}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: Colors.accent }]}
            onPress={() => updateSetting('maxHistoryEntries', 25)}
          >
            <Text style={styles.buttonText}>25</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: Colors.accent }]}
            onPress={() => updateSetting('maxHistoryEntries', 50)}
          >
            <Text style={styles.buttonText}>50</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: Colors.accent }]}
            onPress={() => updateSetting('maxHistoryEntries', 100)}
          >
            <Text style={styles.buttonText}>100</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: Colors.accent }]}
          onPress={handleExportData}
        >
          <Text style={styles.actionButtonText}>Export Game Data</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: Colors.surface }]}
          onPress={handleValidateData}
        >
          <Text style={styles.actionButtonText}>Validate Stored Data</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: Colors.warning }]}
          onPress={handleClearGameHistory}
        >
          <Text style={styles.actionButtonText}>Clear Game History</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: scaleWidth(16),
  },
  loadingText: {
    color: Colors.text,
    fontSize: scaleFontSize(16),
    textAlign: 'center',
    marginTop: scaleWidth(32),
  },
  section: {
    marginBottom: scaleWidth(24),
  },
  sectionTitle: {
    fontSize: scaleFontSize(18),
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: scaleWidth(16),
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: scaleWidth(12),
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface,
  },
  settingInfo: {
    flex: 1,
    marginRight: scaleWidth(16),
  },
  settingLabel: {
    fontSize: scaleFontSize(16),
    fontWeight: '600',
    color: Colors.text,
    marginBottom: scaleWidth(4),
  },
  settingDescription: {
    fontSize: scaleFontSize(14),
    color: Colors.textSecondary,
    lineHeight: scaleFontSize(20),
  },
  historyControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: scaleWidth(12),
    gap: scaleWidth(8),
  },
  button: {
    flex: 1,
    paddingVertical: scaleWidth(8),
    borderRadius: scaleWidth(6),
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.background,
    fontSize: scaleFontSize(14),
    fontWeight: '600',
  },
  actionButton: {
    paddingVertical: scaleWidth(12),
    paddingHorizontal: scaleWidth(16),
    borderRadius: scaleWidth(8),
    alignItems: 'center',
    marginBottom: scaleWidth(12),
  },
  actionButtonText: {
    color: Colors.text,
    fontSize: scaleFontSize(16),
    fontWeight: '600',
  },
});