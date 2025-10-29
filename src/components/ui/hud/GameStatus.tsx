import React from 'react';
import { View, Text, StyleSheet, TextStyle } from 'react-native';
import { Player, GameState } from '../../../types';
import { Colors } from '../../../constants/colors';
import { scaleWidth, scaleHeight, scaleFontSize } from '../../../utils/responsive';

export interface GameStatusProps {
  gameState: GameState;
  style?: any;
}

export const GameStatus: React.FC<GameStatusProps> = ({
  gameState,
  style,
}) => {
  const getPlayerName = (player: Player): string => {
    return player === Player.PLAYER1 ? 'Player 1' : 'Player 2';
  };

  const getPlayerColor = (player: Player): string => {
    return player === Player.PLAYER1 ? Colors.player1 : Colors.player2;
  };

  const getStatusMessage = (): string => {
    if (gameState.gamePhase === 'ended') {
      if (gameState.winner === 'draw') {
        return 'Game ended in a draw!';
      } else if (gameState.winner) {
        return `${getPlayerName(gameState.winner)} wins!`;
      }
      return 'Game ended';
    }

    if (gameState.gamePhase === 'first-turn') {
      return `${getPlayerName(gameState.currentPlayer)}'s turn - Place opponent's flat stone`;
    }

    return `${getPlayerName(gameState.currentPlayer)}'s turn`;
  };

  const getStatusColor = (): string => {
    if (gameState.gamePhase === 'ended') {
      if (gameState.winner && gameState.winner !== 'draw') {
        return getPlayerColor(gameState.winner);
      }
      return Colors.textSecondary;
    }

    return getPlayerColor(gameState.currentPlayer);
  };

  const getTurnIndicator = () => {
    if (gameState.gamePhase === 'ended') {
      return null;
    }

    return (
      <View style={styles.turnIndicatorContainer}>
        <View 
          style={[
            styles.turnIndicator,
            { backgroundColor: getPlayerColor(gameState.currentPlayer) }
          ]} 
        />
      </View>
    );
  };

  const getPhaseIndicator = () => {
    if (gameState.gamePhase === 'first-turn') {
      return (
        <View style={styles.phaseIndicator}>
          <Text style={styles.phaseText}>First Turn Phase</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.statusRow}>
        {getTurnIndicator()}
        <View style={styles.statusTextContainer}>
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusMessage()}
          </Text>
          {getPhaseIndicator()}
        </View>
      </View>
      
      {gameState.gamePhase !== 'ended' && (
        <View style={styles.gameInfo}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Turn:</Text>
            <Text style={styles.infoValue}>{gameState.moveHistory.length + 1}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Phase:</Text>
            <Text style={styles.infoValue}>
              {gameState.gamePhase === 'first-turn' ? 'Opening' : 'Normal'}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: scaleWidth(12),
    marginVertical: scaleHeight(8),
    borderWidth: 1,
    borderColor: Colors.boardDark,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scaleHeight(8),
  },

  turnIndicatorContainer: {
    marginRight: scaleWidth(12),
  },

  turnIndicator: {
    width: scaleWidth(12),
    height: scaleWidth(12),
    borderRadius: scaleWidth(6),
    borderWidth: 2,
    borderColor: Colors.background,
  },

  statusTextContainer: {
    flex: 1,
  },

  statusText: {
    fontSize: scaleFontSize(16),
    fontWeight: '600',
    marginBottom: scaleHeight(2),
  } as TextStyle,

  phaseIndicator: {
    alignSelf: 'flex-start',
  },

  phaseText: {
    fontSize: scaleFontSize(12),
    color: Colors.accent,
    fontWeight: '500',
    backgroundColor: Colors.background,
    paddingHorizontal: scaleWidth(6),
    paddingVertical: scaleHeight(2),
    borderRadius: 4,
  } as TextStyle,

  gameInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: scaleHeight(8),
    borderTopWidth: 1,
    borderTopColor: Colors.boardDark,
  },

  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoLabel: {
    fontSize: scaleFontSize(12),
    color: Colors.textSecondary,
    marginRight: scaleWidth(4),
  } as TextStyle,

  infoValue: {
    fontSize: scaleFontSize(12),
    color: Colors.text,
    fontWeight: '600',
  } as TextStyle,
});