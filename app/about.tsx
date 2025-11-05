import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Button } from '@/src/components/ui/common/Button';
import { Colors } from '@/src/constants/colors';
import { scaleWidth, scaleHeight, scaleFontSize } from '@/src/utils/responsive';

export default function AboutScreen() {
  const { t } = useTranslation();

  const handleBack = () => {
    router.back();
  };

  const handleLearnMore = () => {
    Linking.openURL('https://en.wikipedia.org/wiki/Tak_(game)');
  };

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
        <Text style={styles.headerTitle}>{t('about.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Game Title Section */}
        <View style={styles.section}>
          <Text style={styles.gameTitle}>{t('about.gameTitle')}</Text>
          <Text style={styles.gameSubtitle}>{t('about.gameSubtitle')}</Text>
        </View>

        {/* Game Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('about.whatIsTak')}</Text>
          <Text style={styles.bodyText}>
            {t('about.whatIsTakText')}
          </Text>
        </View>

        {/* How to Play */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('about.howToPlay')}</Text>
          <Text style={styles.bodyText}>
            {t('about.howToPlayText')}
          </Text>

          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>{t('about.pieceTypes')}</Text>
            <Text style={styles.bulletText}>• <Text style={styles.bold}>{t('stoneTypes.flat')}</Text> - {t('about.flatStonesDesc')}</Text>
            <Text style={styles.bulletText}>• <Text style={styles.bold}>{t('stoneTypes.standing')}</Text> - {t('about.wallsDesc')}</Text>
            <Text style={styles.bulletText}>• <Text style={styles.bold}>{t('stoneTypes.capstone')}</Text> - {t('about.capstonesDesc')}</Text>
          </View>

          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>{t('about.victoryConditions')}</Text>
            <Text style={styles.bulletText}>• {t('about.createRoad')}</Text>
            <Text style={styles.bulletText}>• {t('about.mostFlats')}</Text>
          </View>
        </View>

        {/* Special Rules */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('about.specialRules')}</Text>
          <Text style={styles.bodyText}>
            <Text style={styles.bold}>{t('about.firstTurn')}</Text> {t('about.firstTurnText')}
          </Text>
          <Text style={styles.bodyText}>
            <Text style={styles.bold}>{t('about.stackMovement')}</Text> {t('about.stackMovementText')}
          </Text>
        </View>

        {/* Board Sizes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('about.boardSizes')}</Text>
          <View style={styles.boardSizeGrid}>
            <View style={styles.boardSizeItem}>
              <Text style={styles.boardSizeTitle}>4×4</Text>
              <Text style={styles.boardSizeDesc}>{t('about.quickGame')}</Text>
              <Text style={styles.boardSizeDetails}>15 {t('about.stones')}, 0 {t('about.capstones')}</Text>
            </View>
            <View style={styles.boardSizeItem}>
              <Text style={styles.boardSizeTitle}>5×5</Text>
              <Text style={styles.boardSizeDesc}>{t('about.standardGame')}</Text>
              <Text style={styles.boardSizeDetails}>21 {t('about.stones')}, 1 {t('about.capstone')}</Text>
            </View>
            <View style={styles.boardSizeItem}>
              <Text style={styles.boardSizeTitle}>6×6</Text>
              <Text style={styles.boardSizeDesc}>{t('about.extendedGame')}</Text>
              <Text style={styles.boardSizeDetails}>30 {t('about.stones')}, 1 {t('about.capstone')}</Text>
            </View>
            <View style={styles.boardSizeItem}>
              <Text style={styles.boardSizeTitle}>7×7</Text>
              <Text style={styles.boardSizeDesc}>{t('about.longGame')}</Text>
              <Text style={styles.boardSizeDetails}>40 {t('about.stones')}, 2 {t('about.capstones')}</Text>
            </View>
            <View style={styles.boardSizeItem}>
              <Text style={styles.boardSizeTitle}>8×8</Text>
              <Text style={styles.boardSizeDesc}>{t('about.epicGame')}</Text>
              <Text style={styles.boardSizeDetails}>50 {t('about.stones')}, 2 {t('about.capstones')}</Text>
            </View>
          </View>
        </View>

        {/* Credits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('about.credits')}</Text>
          <Text style={styles.bodyText}>
            <Text style={styles.bold}>{t('about.gameDesign')}</Text> {t('about.gameDesigners')}
          </Text>
          <Text style={styles.bodyText}>
            <Text style={styles.bold}>{t('about.originalPublisher')}</Text> {t('about.publisher')}
          </Text>
          <Text style={styles.bodyText}>
            <Text style={styles.bold}>{t('about.mobileImplementation')}</Text> {t('about.builtWith')}
          </Text>
        </View>

        {/* Learn More Button */}
        <View style={styles.section}>
          <Button
            title={t('about.learnMoreOnline')}
            onPress={handleLearnMore}
            style={styles.learnMoreButton}
            textStyle={styles.learnMoreButtonText}
          />
        </View>

        {/* Version */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>{t('about.version')}</Text>
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
    width: scaleWidth(60),
  },

  content: {
    flex: 1,
    paddingHorizontal: scaleWidth(20),
  },

  section: {
    marginTop: scaleHeight(24),
  },

  gameTitle: {
    fontSize: scaleFontSize(48),
    fontWeight: 'bold',
    color: Colors.accent,
    textAlign: 'center',
    letterSpacing: 4,
  },

  gameSubtitle: {
    fontSize: scaleFontSize(16),
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: scaleHeight(8),
    fontStyle: 'italic',
  },

  sectionTitle: {
    fontSize: scaleFontSize(20),
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: scaleHeight(12),
  },

  subsectionTitle: {
    fontSize: scaleFontSize(16),
    fontWeight: '600',
    color: Colors.text,
    marginTop: scaleHeight(12),
    marginBottom: scaleHeight(8),
  },

  bodyText: {
    fontSize: scaleFontSize(15),
    color: Colors.textSecondary,
    lineHeight: scaleFontSize(22),
    marginBottom: scaleHeight(12),
  },

  bulletText: {
    fontSize: scaleFontSize(14),
    color: Colors.textSecondary,
    lineHeight: scaleFontSize(20),
    marginBottom: scaleHeight(6),
    marginLeft: scaleWidth(8),
  },

  bold: {
    fontWeight: 'bold',
    color: Colors.text,
  },

  subsection: {
    marginTop: scaleHeight(8),
  },

  boardSizeGrid: {
    gap: scaleHeight(12),
  },

  boardSizeItem: {
    backgroundColor: Colors.surface,
    padding: scaleWidth(16),
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
  },

  boardSizeTitle: {
    fontSize: scaleFontSize(18),
    fontWeight: 'bold',
    color: Colors.accent,
  },

  boardSizeDesc: {
    fontSize: scaleFontSize(14),
    color: Colors.text,
    marginTop: scaleHeight(2),
  },

  boardSizeDetails: {
    fontSize: scaleFontSize(12),
    color: Colors.textSecondary,
    marginTop: scaleHeight(4),
  },

  learnMoreButton: {
    backgroundColor: Colors.highlight,
    paddingVertical: scaleHeight(12),
    borderRadius: 8,
  },

  learnMoreButtonText: {
    fontSize: scaleFontSize(16),
    fontWeight: '600',
    color: Colors.background,
  },

  footer: {
    alignItems: 'center',
    marginTop: scaleHeight(32),
    marginBottom: scaleHeight(40),
  },

  versionText: {
    fontSize: scaleFontSize(12),
    color: Colors.textSecondary,
    opacity: 0.7,
  },
});