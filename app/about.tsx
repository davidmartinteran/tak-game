import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Button } from '@/src/components/ui/common/Button';
import { Colors } from '@/src/constants/colors';
import { scaleWidth, scaleHeight, scaleFontSize } from '@/src/utils/responsive';

export default function AboutScreen() {
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
          title="← Back"
          onPress={handleBack}
          style={styles.backButton}
          textStyle={styles.backButtonText}
        />
        <Text style={styles.headerTitle}>About TAK</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Game Title Section */}
        <View style={styles.section}>
          <Text style={styles.gameTitle}>TAK</Text>
          <Text style={styles.gameSubtitle}>The Beautiful Game</Text>
        </View>

        {/* Game Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What is TAK?</Text>
          <Text style={styles.bodyText}>
            Tak is an abstract strategy game designed by James Ernest and Patrick Rothfuss. 
            It was first introduced in Patrick Rothfuss&apos;s fantasy novel &quot;The Wise Man&apos;s Fear&quot; 
            as a fictional game, and later brought to life as a real board game.
          </Text>
        </View>

        {/* How to Play */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How to Play</Text>
          <Text style={styles.bodyText}>
            The goal of Tak is to create a road - a connected line of your pieces that spans 
            from one edge of the board to the opposite edge. Players take turns placing and 
            moving pieces on the board.
          </Text>
          
          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>Piece Types:</Text>
            <Text style={styles.bulletText}>• <Text style={styles.bold}>Flat Stones</Text> - Basic pieces that can form roads</Text>
            <Text style={styles.bulletText}>• <Text style={styles.bold}>Walls</Text> - Standing stones that block roads and movement</Text>
            <Text style={styles.bulletText}>• <Text style={styles.bold}>Capstones</Text> - Special pieces that can flatten walls and form roads</Text>
          </View>

          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>Victory Conditions:</Text>
            <Text style={styles.bulletText}>• Create a road connecting opposite edges</Text>
            <Text style={styles.bulletText}>• Have the most flat stones when the board is full</Text>
          </View>
        </View>

        {/* Special Rules */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Rules</Text>
          <Text style={styles.bodyText}>
            <Text style={styles.bold}>First Turn:</Text> Each player&apos;s first move must place an opponent&apos;s flat stone. 
            This ensures a more balanced opening.
          </Text>
          <Text style={styles.bodyText}>
            <Text style={styles.bold}>Stack Movement:</Text> You can pick up and move stacks of pieces, 
            dropping them along orthogonal paths. The carry limit equals the board size.
          </Text>
        </View>

        {/* Board Sizes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Board Sizes</Text>
          <View style={styles.boardSizeGrid}>
            <View style={styles.boardSizeItem}>
              <Text style={styles.boardSizeTitle}>4×4</Text>
              <Text style={styles.boardSizeDesc}>Quick Game</Text>
              <Text style={styles.boardSizeDetails}>15 stones, 0 capstones</Text>
            </View>
            <View style={styles.boardSizeItem}>
              <Text style={styles.boardSizeTitle}>5×5</Text>
              <Text style={styles.boardSizeDesc}>Standard Game</Text>
              <Text style={styles.boardSizeDetails}>21 stones, 1 capstone</Text>
            </View>
            <View style={styles.boardSizeItem}>
              <Text style={styles.boardSizeTitle}>6×6</Text>
              <Text style={styles.boardSizeDesc}>Extended Game</Text>
              <Text style={styles.boardSizeDetails}>30 stones, 1 capstone</Text>
            </View>
            <View style={styles.boardSizeItem}>
              <Text style={styles.boardSizeTitle}>7×7</Text>
              <Text style={styles.boardSizeDesc}>Long Game</Text>
              <Text style={styles.boardSizeDetails}>40 stones, 2 capstones</Text>
            </View>
            <View style={styles.boardSizeItem}>
              <Text style={styles.boardSizeTitle}>8×8</Text>
              <Text style={styles.boardSizeDesc}>Epic Game</Text>
              <Text style={styles.boardSizeDetails}>50 stones, 2 capstones</Text>
            </View>
          </View>
        </View>

        {/* Credits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Credits</Text>
          <Text style={styles.bodyText}>
            <Text style={styles.bold}>Game Design:</Text> James Ernest & Patrick Rothfuss
          </Text>
          <Text style={styles.bodyText}>
            <Text style={styles.bold}>Original Publisher:</Text> Cheapass Games
          </Text>
          <Text style={styles.bodyText}>
            <Text style={styles.bold}>Mobile Implementation:</Text> Built with React Native
          </Text>
        </View>

        {/* Learn More Button */}
        <View style={styles.section}>
          <Button
            title="Learn More Online"
            onPress={handleLearnMore}
            style={styles.learnMoreButton}
            textStyle={styles.learnMoreButtonText}
          />
        </View>

        {/* Version */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
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