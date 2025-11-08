import React from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Button } from '@/src/components/ui/common/Button';
import { Colors } from '@/src/constants/colors';
import { scaleWidth, scaleHeight, scaleFontSize } from '@/src/utils/responsive';

interface BoardSizeOption {
  size: number;
  flatStones: number;
  capstones: number;
  descriptionKey: string;
  gameLength: string;
}

const BOARD_SIZE_OPTIONS: BoardSizeOption[] = [
  { size: 4, flatStones: 15, capstones: 0, descriptionKey: 'boardSize.quickGame', gameLength: '10-15' },
  { size: 5, flatStones: 21, capstones: 1, descriptionKey: 'boardSize.standardGame', gameLength: '15-25' },
  { size: 6, flatStones: 30, capstones: 1, descriptionKey: 'boardSize.extendedGame', gameLength: '25-35' },
  { size: 7, flatStones: 40, capstones: 2, descriptionKey: 'boardSize.longGame', gameLength: '35-50' },
  { size: 8, flatStones: 50, capstones: 2, descriptionKey: 'boardSize.epicGame', gameLength: '50+' },
];

export default function BoardSizeScreen() {
  const { t } = useTranslation();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleBack = () => {
    router.replace('/');
  };

  const handleBoardSizeSelect = (size: number) => {
    // Navigate to game with the selected board size
    router.push({
      pathname: '/game',
      params: { boardSize: size.toString() }
    });
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
        <Text style={styles.headerTitle}>{t('boardSize.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>{t('boardSize.chooseYourGame')}</Text>
          <Text style={styles.instructionsText}>
            {t('boardSize.description')}
          </Text>
        </View>

        {/* Board Size Options */}
        <ScrollView 
          style={styles.optionsContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.optionsContent}
        >
          {BOARD_SIZE_OPTIONS.map((option, index) => (
            <Animated.View
              key={option.size}
              style={[
                styles.optionCard,
                {
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateY: slideAnim.interpolate({
                        inputRange: [0, 30],
                        outputRange: [0, 30 + (index * 5)],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.optionHeader}>
                <View style={styles.optionTitleContainer}>
                  <Text style={styles.optionTitle}>{t(option.descriptionKey)}</Text>
                  <Text style={styles.optionSize}>{option.size}×{option.size}</Text>
                </View>
                <Text style={styles.optionDuration}>{option.gameLength} {t('boardSize.minutes')}</Text>
              </View>

              <View style={styles.optionDetails}>
                <View style={styles.detailsGrid}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>{t('boardSize.boardSize')}</Text>
                    <Text style={styles.detailValue}>{option.size}×{option.size}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>{t('boardSize.flatStones')}</Text>
                    <Text style={styles.detailValue}>{option.flatStones} {t('common.each')}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>{t('boardSize.capstones')}</Text>
                    <Text style={styles.detailValue}>{option.capstones} {t('common.each')}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>{t('boardSize.totalSquares')}</Text>
                    <Text style={styles.detailValue}>{option.size * option.size}</Text>
                  </View>
                </View>
              </View>

              <Button
                title={t('boardSize.startGame', { description: t(option.descriptionKey) })}
                onPress={() => handleBoardSizeSelect(option.size)}
                style={option.size === 5 ?
                  StyleSheet.flatten([styles.selectButton, styles.recommendedButton]) :
                  styles.selectButton
                }
                textStyle={option.size === 5 ?
                  StyleSheet.flatten([styles.selectButtonText, styles.recommendedButtonText]) :
                  styles.selectButtonText
                }
              />

              {option.size === 5 && (
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedText}>{t('boardSize.recommended')}</Text>
                </View>
              )}
            </Animated.View>
          ))}
        </ScrollView>
      </Animated.View>
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
    paddingHorizontal: scaleWidth(16),
  },

  instructionsContainer: {
    paddingVertical: scaleHeight(20),
    alignItems: 'center',
  },

  instructionsTitle: {
    fontSize: scaleFontSize(24),
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: scaleHeight(8),
  },

  instructionsText: {
    fontSize: scaleFontSize(16),
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: scaleFontSize(22),
    paddingHorizontal: scaleWidth(20),
  },

  optionsContainer: {
    flex: 1,
  },

  optionsContent: {
    paddingBottom: scaleHeight(20),
  },

  optionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: scaleWidth(20),
    marginBottom: scaleHeight(16),
    borderWidth: 1,
    borderColor: Colors.boardDark,
    shadowColor: Colors.background,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },

  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: scaleHeight(16),
  },

  optionTitleContainer: {
    flex: 1,
  },

  optionTitle: {
    fontSize: scaleFontSize(20),
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: scaleHeight(4),
  },

  optionSize: {
    fontSize: scaleFontSize(16),
    color: Colors.accent,
    fontWeight: '600',
  },

  optionDuration: {
    fontSize: scaleFontSize(14),
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },

  optionDetails: {
    marginBottom: scaleHeight(20),
  },

  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scaleWidth(16),
  },

  detailItem: {
    flex: 1,
    minWidth: scaleWidth(120),
    alignItems: 'center',
    paddingVertical: scaleHeight(8),
    backgroundColor: Colors.background,
    borderRadius: 8,
  },

  detailLabel: {
    fontSize: scaleFontSize(12),
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: scaleHeight(4),
  },

  detailValue: {
    fontSize: scaleFontSize(16),
    color: Colors.text,
    fontWeight: 'bold',
  },

  selectButton: {
    backgroundColor: Colors.highlight,
    paddingVertical: scaleHeight(14),
    borderRadius: 12,
  },

  selectButtonText: {
    fontSize: scaleFontSize(16),
    fontWeight: '600',
    color: Colors.background,
  },

  recommendedButton: {
    backgroundColor: Colors.accent,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  recommendedButtonText: {
    color: Colors.background,
  },

  recommendedBadge: {
    position: 'absolute',
    top: scaleHeight(-8),
    right: scaleWidth(20),
    backgroundColor: Colors.accent,
    paddingHorizontal: scaleWidth(12),
    paddingVertical: scaleHeight(4),
    borderRadius: 12,
  },

  recommendedText: {
    fontSize: scaleFontSize(10),
    fontWeight: 'bold',
    color: Colors.background,
    letterSpacing: 0.5,
  },
});