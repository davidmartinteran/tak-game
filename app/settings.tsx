import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Button } from '@/src/components/ui/common/Button';
import { Colors } from '@/src/constants/colors';
import { scaleWidth, scaleHeight, scaleFontSize } from '@/src/utils/responsive';
import { useSettings } from '@/src/contexts/SettingsContext';
import { HapticService } from '@/src/services/HapticService';

export default function SettingsScreen() {
  const { settings, updateSetting, resetToDefaults } = useSettings();

  const handleBack = () => {
    router.back();
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default values?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await HapticService.buttonPress();
            await resetToDefaults();
          },
        },
      ]
    );
  };

  const SettingRow: React.FC<{
    title: string;
    description: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
  }> = ({ title, description, value, onValueChange }) => (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={async (newValue) => {
          await HapticService.stoneSelection();
          onValueChange(newValue);
        }}
        trackColor={{ false: Colors.textSecondary, true: Colors.accent }}
        thumbColor={value ? Colors.background : Colors.surface}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Button
          title="← Back"
          onPress={handleBack}
          style={styles.backButton}
          textStyle={styles.backButtonText}
        />
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Game Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Game Settings</Text>
          
          <SettingRow
            title="Move Hints"
            description="Show valid move indicators during gameplay"
            value={settings.showMoveHints}
            onValueChange={(value) => updateSetting('showMoveHints', value)}
          />
          
          <SettingRow
            title="Animations"
            description="Enable smooth animations for moves and transitions"
            value={settings.animationsEnabled}
            onValueChange={(value) => updateSetting('animationsEnabled', value)}
          />
        </View>

        {/* Audio & Haptics Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audio & Haptics</Text>
          
          <SettingRow
            title="Sound Effects"
            description="Play sounds for moves and game events"
            value={settings.soundEnabled}
            onValueChange={(value) => updateSetting('soundEnabled', value)}
          />
          
          <SettingRow
            title="Haptic Feedback"
            description="Vibrate on touch interactions and moves"
            value={settings.hapticsEnabled}
            onValueChange={(value) => updateSetting('hapticsEnabled', value)}
          />
        </View>

        {/* Data & Storage Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Storage</Text>
          
          <SettingRow
            title="Auto-Save Games"
            description="Automatically save game progress"
            value={settings.autoSaveEnabled}
            onValueChange={(value) => updateSetting('autoSaveEnabled', value)}
          />
        </View>

        {/* Appearance Section - Future feature */}
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <Text style={styles.settingDescription}>Theme customization coming soon!</Text>
        </View> */}

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <View style={styles.aboutCard}>
            <Text style={styles.aboutTitle}>TAK - The Beautiful Game</Text>
            <Text style={styles.aboutText}>
              Tak is an abstract strategy game designed by James Ernest and Patrick Rothfuss. 
              Players compete to create a road connecting opposite edges of the board using 
              flat stones and capstones, while strategically placing walls to block opponents.
            </Text>
            <Text style={styles.aboutVersion}>Version 1.0.0</Text>
          </View>
        </View>

        {/* Reset Section */}
        <View style={styles.section}>
          <Button
            title="Reset to Defaults"
            onPress={handleResetSettings}
            style={styles.resetButton}
            textStyle={styles.resetButtonText}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scaleWidth(16),
    paddingTop: scaleHeight(60),
    paddingBottom: scaleHeight(16),
    borderBottomWidth: 1,
    borderBottomColor: Colors.boardDark,
  },

  backButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: scaleHeight(8),
  },

  backButtonText: {
    fontSize: scaleFontSize(16),
    color: Colors.accent,
    fontWeight: '600',
  },

  headerTitle: {
    flex: 1,
    fontSize: scaleFontSize(20),
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
  },

  headerSpacer: {
    width: scaleWidth(60), // Balance the back button
  },

  content: {
    flex: 1,
    paddingHorizontal: scaleWidth(16),
  },

  section: {
    marginTop: scaleHeight(24),
  },

  sectionTitle: {
    fontSize: scaleFontSize(18),
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: scaleHeight(16),
  },

  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: scaleWidth(16),
    borderRadius: 12,
    marginBottom: scaleHeight(12),
  },

  settingInfo: {
    flex: 1,
    marginRight: scaleWidth(16),
  },

  settingTitle: {
    fontSize: scaleFontSize(16),
    fontWeight: '600',
    color: Colors.text,
    marginBottom: scaleHeight(4),
  },

  settingDescription: {
    fontSize: scaleFontSize(14),
    color: Colors.textSecondary,
    lineHeight: scaleFontSize(18),
  },

  aboutCard: {
    backgroundColor: Colors.surface,
    padding: scaleWidth(20),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.boardDark,
  },

  aboutTitle: {
    fontSize: scaleFontSize(18),
    fontWeight: 'bold',
    color: Colors.accent,
    marginBottom: scaleHeight(12),
  },

  aboutText: {
    fontSize: scaleFontSize(14),
    color: Colors.textSecondary,
    lineHeight: scaleFontSize(20),
    marginBottom: scaleHeight(16),
  },

  aboutVersion: {
    fontSize: scaleFontSize(12),
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },

  resetButton: {
    backgroundColor: Colors.warning,
    paddingVertical: scaleHeight(12),
    borderRadius: 8,
    marginBottom: scaleHeight(32),
  },

  resetButtonText: {
    fontSize: scaleFontSize(16),
    fontWeight: '600',
    color: Colors.background,
  },
});