import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Button } from '@/src/components/ui/common/Button';
import { Colors } from '@/src/constants/colors';
import { scaleWidth, scaleHeight, scaleFontSize } from '@/src/utils/responsive';
import { gamePersistenceService } from '@/src/services/GamePersistenceService';

export default function MainMenuScreen() {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;
  const [hasSavedGame, setHasSavedGame] = React.useState(false);

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  // Check for saved game when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const checkSavedGame = async () => {
        const hasSaved = await gamePersistenceService.hasSavedGame();
        setHasSavedGame(hasSaved);
      };

      checkSavedGame();
    }, [])
  );

  const handleResumeGame = () => {
    // Resume saved game
    router.push({
      pathname: '/game',
      params: { resume: 'true' }
    });
  };

  const handleNewGame = () => {
    // Quick start with default 5x5 board
    router.push({
      pathname: '/game',
      params: { boardSize: '5' }
    });
  };

  const handleCustomGame = () => {
    // Go to board size selection
    router.push('/board-size');
  };

  const handleSettings = () => {
    router.push('/settings');
  };

  const handleAbout = () => {
    router.push('/about');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Background gradient effect */}
      <View style={styles.backgroundGradient} />
      
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Game Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.gameTitle}>TAK</Text>
          <Text style={styles.gameSubtitle}>The Beautiful Game</Text>
        </View>

        {/* Menu Buttons */}
        <View style={styles.menuContainer}>
          {hasSavedGame && (
            <Button
              title="Resume Game"
              onPress={handleResumeGame}
              style={styles.resumeButton}
              textStyle={styles.resumeButtonText}
            />
          )}

          <Button
            title="New Game (5×5)"
            onPress={handleNewGame}
            style={styles.primaryButton}
            textStyle={styles.primaryButtonText}
          />

          <Button
            title="Custom Board Size"
            onPress={handleCustomGame}
            style={styles.secondaryButton}
            textStyle={styles.secondaryButtonText}
          />

          <Button
            title="Settings"
            onPress={handleSettings}
            style={styles.secondaryButton}
            textStyle={styles.secondaryButtonText}
          />

          <Button
            title="About"
            onPress={handleAbout}
            style={styles.secondaryButton}
            textStyle={styles.secondaryButtonText}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            A strategic board game of roads and walls
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.background,
    opacity: 0.9,
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scaleWidth(32),
  },

  titleContainer: {
    alignItems: 'center',
    marginBottom: scaleHeight(80),
  },

  gameTitle: {
    fontSize: scaleFontSize(72),
    fontWeight: 'bold',
    color: Colors.accent,
    textAlign: 'center',
    letterSpacing: 8,
    textShadowColor: Colors.boardDark,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },

  gameSubtitle: {
    fontSize: scaleFontSize(18),
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: scaleHeight(8),
    fontStyle: 'italic',
  },

  menuContainer: {
    width: '100%',
    maxWidth: scaleWidth(280),
    gap: scaleHeight(16),
  },

  resumeButton: {
    backgroundColor: Colors.success,
    paddingVertical: scaleHeight(16),
    borderRadius: 12,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },

  resumeButtonText: {
    fontSize: scaleFontSize(20),
    fontWeight: 'bold',
    color: Colors.background,
  },

  primaryButton: {
    backgroundColor: Colors.accent,
    paddingVertical: scaleHeight(16),
    borderRadius: 12,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  primaryButtonText: {
    fontSize: scaleFontSize(20),
    fontWeight: 'bold',
    color: Colors.background,
  },

  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: scaleHeight(14),
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.textSecondary,
  },

  secondaryButtonText: {
    fontSize: scaleFontSize(18),
    fontWeight: '600',
    color: Colors.textSecondary,
  },

  footer: {
    position: 'absolute',
    bottom: scaleHeight(40),
    alignItems: 'center',
  },

  footerText: {
    fontSize: scaleFontSize(14),
    color: Colors.textSecondary,
    textAlign: 'center',
    opacity: 0.7,
  },
});