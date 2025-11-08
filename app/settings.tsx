import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Alert, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Button } from '@/src/components/ui/common/Button';
import { Colors } from '@/src/constants/colors';
import { scaleWidth, scaleHeight, scaleFontSize } from '@/src/utils/responsive';
import { useSettings } from '@/src/contexts/SettingsContext';
import { HapticService } from '@/src/services/HapticService';
import { changeLanguage, getCurrentLanguage } from '@/src/i18n';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { settings, updateSetting, resetToDefaults } = useSettings();
  const [selectedLanguage, setSelectedLanguage] = useState(getCurrentLanguage());

  const languages = [
    { code: 'en', name: t('settings.english'), nativeName: 'English' },
    { code: 'es', name: t('settings.spanish'), nativeName: 'Español' },
  ];

  const handleLanguageChange = async (languageCode: string) => {
    await HapticService.stoneSelection();
    setSelectedLanguage(languageCode);
    await changeLanguage(languageCode);
  };

  const handleBack = () => {
    router.back();
  };

  const handleResetSettings = () => {
    Alert.alert(
      t('settings.resetConfirmTitle'),
      t('settings.resetConfirmMessage'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('settings.resetToDefaults'),
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
          title={`← ${t('common.back')}`}
          onPress={handleBack}
          style={styles.backButton}
          textStyle={styles.backButtonText}
        />
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Language Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
          <Text style={styles.languageDescription}>
            {t('settings.languageDescription')}
          </Text>

          <View style={styles.languageContainer}>
            {languages.map((language) => (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.languageOption,
                  selectedLanguage === language.code && styles.languageOptionSelected,
                ]}
                onPress={() => handleLanguageChange(language.code)}
                activeOpacity={0.7}
              >
                <View style={styles.languageInfo}>
                  <Text style={[
                    styles.languageName,
                    selectedLanguage === language.code && styles.languageNameSelected,
                  ]}>
                    {language.nativeName}
                  </Text>
                  <Text style={[
                    styles.languageSecondary,
                    selectedLanguage === language.code && styles.languageSecondarySelected,
                  ]}>
                    {language.name}
                  </Text>
                </View>
                {selectedLanguage === language.code && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Game Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.gameSettings')}</Text>

          <SettingRow
            title={t('settings.moveHints')}
            description={t('settings.moveHintsDesc')}
            value={settings.showMoveHints}
            onValueChange={(value) => updateSetting('showMoveHints', value)}
          />

          <SettingRow
            title={t('settings.animations')}
            description={t('settings.animationsDesc')}
            value={settings.animationsEnabled}
            onValueChange={(value) => updateSetting('animationsEnabled', value)}
          />
        </View>

        {/* Audio & Haptics Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.audioHaptics')}</Text>

          <SettingRow
            title={t('settings.soundEffects')}
            description={t('settings.soundEffectsDesc')}
            value={settings.soundEnabled}
            onValueChange={(value) => updateSetting('soundEnabled', value)}
          />

          <SettingRow
            title={t('settings.hapticFeedback')}
            description={t('settings.hapticFeedbackDesc')}
            value={settings.hapticsEnabled}
            onValueChange={(value) => updateSetting('hapticsEnabled', value)}
          />
        </View>

        {/* Data & Storage Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.dataStorage')}</Text>

          <SettingRow
            title={t('settings.autoSave')}
            description={t('settings.autoSaveDesc')}
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
          <Text style={styles.sectionTitle}>{t('settings.about')}</Text>

          <View style={styles.aboutCard}>
            <Text style={styles.aboutTitle}>{t('settings.aboutTitle')}</Text>
            <Text style={styles.aboutText}>
              {t('settings.aboutText')}
            </Text>
            <Text style={styles.aboutVersion}>{t('settings.version')}</Text>
          </View>
        </View>

        {/* Reset Section */}
        <View style={styles.section}>
          <Button
            title={t('settings.resetToDefaults')}
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

  languageDescription: {
    fontSize: scaleFontSize(14),
    color: Colors.textSecondary,
    marginBottom: scaleHeight(16),
  },

  languageContainer: {
    gap: scaleHeight(12),
  },

  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: scaleWidth(16),
    borderWidth: 2,
    borderColor: Colors.boardDark,
  },

  languageOptionSelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.boardDark,
  },

  languageInfo: {
    flex: 1,
  },

  languageName: {
    fontSize: scaleFontSize(18),
    fontWeight: '600',
    color: Colors.text,
    marginBottom: scaleHeight(4),
  },

  languageNameSelected: {
    color: Colors.accent,
  },

  languageSecondary: {
    fontSize: scaleFontSize(14),
    color: Colors.textSecondary,
  },

  languageSecondarySelected: {
    color: Colors.text,
  },

  checkmark: {
    width: scaleWidth(28),
    height: scaleWidth(28),
    borderRadius: scaleWidth(14),
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: scaleWidth(12),
  },

  checkmarkText: {
    fontSize: scaleFontSize(16),
    fontWeight: 'bold',
    color: Colors.background,
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