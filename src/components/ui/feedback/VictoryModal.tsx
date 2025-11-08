import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Modal } from './Modal';
import { Button } from '../common/Button';
import { VictoryCelebration } from './VictoryCelebration';
import { Player } from '../../../types';
import { Colors } from '../../../constants/colors';
import { scaleWidth, scaleHeight, scaleFontSize } from '../../../utils/responsive';

export interface VictoryModalProps {
  visible: boolean;
  winner: Player | 'draw' | null;
  victoryType?: 'road' | 'flat' | null;
  winningPath?: { row: number; col: number }[];
  onNewGame: () => void;
  onMainMenu: () => void;
  onClose: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = React.memo(({
  visible,
  winner,
  victoryType,
  winningPath,
  onNewGame,
  onMainMenu,
  onClose,
}) => {
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (visible && winner) {
      // Start celebration animation when modal becomes visible
      setShowCelebration(true);
    } else {
      setShowCelebration(false);
    }
  }, [visible, winner]);
  const { t } = useTranslation();

  const getPlayerName = (player: Player): string => {
    return player === Player.PLAYER1 ? t('players.player1') : t('players.player2');
  };

  const getPlayerColor = (player: Player): string => {
    return player === Player.PLAYER1 ? Colors.player1 : Colors.player2;
  };

  const getVictoryTitle = (): string => {
    if (winner === 'draw') {
      return t('victory.draw');
    } else if (winner) {
      return t('victory.playerWins', { player: getPlayerName(winner) });
    }
    return t('victory.gameOver');
  };

  const getVictoryMessage = (): string => {
    if (winner === 'draw') {
      return t('victory.drawMessage');
    } else if (winner) {
      const playerName = getPlayerName(winner);
      if (victoryType === 'road') {
        return t('victory.roadVictoryMessage', { player: playerName });
      } else if (victoryType === 'flat') {
        return t('victory.flatVictoryMessage', { player: playerName });
      } else {
        return t('victory.genericVictoryMessage', { player: playerName });
      }
    }
    return t('victory.gameEnded');
  };

  const getVictoryTypeDescription = (): string => {
    if (victoryType === 'road') {
      return t('victory.roadVictory');
    } else if (victoryType === 'flat') {
      return t('victory.flatStoneVictory');
    }
    return '';
  };

  const getVictoryColor = (): string => {
    if (winner === 'draw') {
      return Colors.textSecondary;
    } else if (winner) {
      return getPlayerColor(winner);
    }
    return Colors.text;
  };

  return (
    <Modal
      visible={visible}
      title={getVictoryTitle()}
      onClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.victoryContent}>
          <View style={styles.victoryIcon}>
            {winner === 'draw' ? (
              <View style={styles.drawIcon}>
                <View style={[styles.drawCircle, { backgroundColor: Colors.player1 }]} />
                <View style={[styles.drawCircle, { backgroundColor: Colors.player2 }]} />
              </View>
            ) : winner ? (
              <View 
                style={[
                  styles.winnerIcon,
                  { backgroundColor: getPlayerColor(winner) }
                ]}
              >
                <Text style={styles.crownIcon}>👑</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.messageContainer}>
            <Text style={[styles.victoryTitle, { color: getVictoryColor() }]}>
              {getVictoryTitle()}
            </Text>
            {victoryType && (
              <Text style={styles.victoryType}>
                {getVictoryTypeDescription()}
              </Text>
            )}
            <Text style={styles.victoryMessage}>
              {getVictoryMessage()}
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title={t('victory.newGame')}
            onPress={onNewGame}
            style={StyleSheet.flatten([styles.button, styles.primaryButton])}
            textStyle={styles.primaryButtonText}
          />
          <Button
            title={t('victory.mainMenu')}
            onPress={onMainMenu}
            style={StyleSheet.flatten([styles.button, styles.secondaryButton])}
            textStyle={styles.secondaryButtonText}
          />
        </View>

        {/* Victory celebration animation */}
        <VictoryCelebration
          visible={showCelebration}
          winner={winner}
          onAnimationComplete={() => setShowCelebration(false)}
        />
      </View>
    </Modal>
  );
});

VictoryModal.displayName = 'VictoryModal';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: scaleWidth(20),
    paddingVertical: scaleHeight(16),
  },

  victoryContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scaleHeight(32),
  },

  victoryIcon: {
    marginBottom: scaleHeight(24),
  },

  drawIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleWidth(8),
  },

  drawCircle: {
    width: scaleWidth(40),
    height: scaleWidth(40),
    borderRadius: scaleWidth(20),
    borderWidth: 3,
    borderColor: Colors.background,
  },

  winnerIcon: {
    width: scaleWidth(80),
    height: scaleWidth(80),
    borderRadius: scaleWidth(40),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: Colors.background,
  },

  crownIcon: {
    fontSize: scaleFontSize(32),
  } as TextStyle,

  messageContainer: {
    alignItems: 'center',
    maxWidth: '90%',
  },

  victoryTitle: {
    fontSize: scaleFontSize(28),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: scaleHeight(16),
  } as TextStyle,

  victoryType: {
    fontSize: scaleFontSize(14),
    color: Colors.accent,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: scaleHeight(8),
    textTransform: 'uppercase',
    letterSpacing: 1,
  } as TextStyle,

  victoryMessage: {
    fontSize: scaleFontSize(16),
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: scaleFontSize(22),
  } as TextStyle,

  buttonContainer: {
    gap: scaleHeight(12),
    paddingTop: scaleHeight(24),
  },

  button: {
    paddingVertical: scaleHeight(14),
    borderRadius: 8,
  },

  primaryButton: {
    backgroundColor: Colors.accent,
  },

  primaryButtonText: {
    fontSize: scaleFontSize(20),
    fontWeight: 'bold',
    color: Colors.background,
  },

  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.textSecondary,
  },

  secondaryButtonText: {
    fontSize: scaleFontSize(18),
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});