import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { StoneType, Player, PlayerReserve } from '../../../types';
import { Colors } from '../../../constants/colors';
import { scaleWidth, scaleHeight, scaleFontSize } from '../../../utils/responsive';

interface StoneTypeSelectorProps {
  selectedType: StoneType | null;
  onSelectType: (type: StoneType) => void;
  isFirstTurn: boolean;
  reserves: Record<Player, PlayerReserve>;
  currentPlayer: Player;
}

export const StoneTypeSelector: React.FC<StoneTypeSelectorProps> = ({
  selectedType,
  onSelectType,
  isFirstTurn,
  reserves,
  currentPlayer,
}) => {
  const { t } = useTranslation();
  const currentPlayerStones = reserves[currentPlayer];

  // During first turn, players place opponent's stones, so show opponent's color
  const displayPlayer = isFirstTurn
    ? (currentPlayer === Player.PLAYER1 ? Player.PLAYER2 : Player.PLAYER1)
    : currentPlayer;

  const playerColor = displayPlayer === Player.PLAYER1 ? Colors.player1 : Colors.player2;

  const getButtonStyle = (type: StoneType) => {
    const isSelected = selectedType === type;
    const isDisabled = isFirstTurn && type !== StoneType.FLAT;

    return [
      styles.typeButton,
      isSelected && styles.typeButtonSelected,
      isDisabled && styles.typeButtonDisabled,
    ];
  };

  const getButtonTextStyle = (type: StoneType) => {
    const isSelected = selectedType === type;
    const isDisabled = isFirstTurn && type !== StoneType.FLAT;

    return [
      styles.typeButtonText,
      isSelected && styles.typeButtonTextSelected,
      isDisabled && styles.typeButtonTextDisabled,
    ];
  };

  const getRemainingCount = (type: StoneType) => {
    if (type === StoneType.FLAT) {
      return currentPlayerStones.flatStones;
    } else if (type === StoneType.CAPSTONE) {
      return currentPlayerStones.capstones;
    }
    // Walls use the same pool as flats
    return currentPlayerStones.flatStones;
  };

  const handlePress = (type: StoneType) => {
    if (isFirstTurn && type !== StoneType.FLAT) {
      return; // Don't allow non-flat stones during first turn
    }
    // Toggle selection: if same type is already selected, deselect it
    if (selectedType === type) {
      onSelectType(null as any); // Deselect by passing null
    } else {
      onSelectType(type);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{t('hud.selectStoneType')}</Text>
        {selectedType && (
          <Text style={styles.cancelHint}>{t('hud.tapAgainToCancel')}</Text>
        )}
      </View>

      <View style={styles.buttonsContainer}>
        {/* Flat Stone */}
        <TouchableOpacity
          style={getButtonStyle(StoneType.FLAT)}
          onPress={() => handlePress(StoneType.FLAT)}
          activeOpacity={0.7}
        >
          <View style={styles.stoneIcon}>
            <View style={[styles.flatStoneIcon, { backgroundColor: playerColor }]} />
          </View>
          <Text style={getButtonTextStyle(StoneType.FLAT)}>
            {t('stoneTypes.flat')}
          </Text>
          <Text style={styles.countText}>
            {getRemainingCount(StoneType.FLAT)}
          </Text>
        </TouchableOpacity>

        {/* Wall */}
        <TouchableOpacity
          style={getButtonStyle(StoneType.WALL)}
          onPress={() => handlePress(StoneType.WALL)}
          activeOpacity={0.7}
          disabled={isFirstTurn}
        >
          <View style={styles.stoneIcon}>
            <View style={[styles.wallStoneIcon, { backgroundColor: playerColor }]} />
          </View>
          <Text style={getButtonTextStyle(StoneType.WALL)}>
            {t('stoneTypes.standing')}
          </Text>
          <Text style={styles.countText}>
            {getRemainingCount(StoneType.WALL)}
          </Text>
        </TouchableOpacity>

        {/* Capstone */}
        <TouchableOpacity
          style={getButtonStyle(StoneType.CAPSTONE)}
          onPress={() => handlePress(StoneType.CAPSTONE)}
          activeOpacity={0.7}
          disabled={isFirstTurn}
        >
          <View style={styles.stoneIcon}>
            <View style={[styles.capstoneIcon, { backgroundColor: playerColor }]} />
          </View>
          <Text style={getButtonTextStyle(StoneType.CAPSTONE)}>
            {t('stoneTypes.capstone')}
          </Text>
          <Text style={styles.countText}>
            {getRemainingCount(StoneType.CAPSTONE)}
          </Text>
        </TouchableOpacity>
      </View>

      {isFirstTurn && (
        <Text style={styles.helperText}>
          {t('hud.firstTurnOnlyFlat')}
        </Text>
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

  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scaleHeight(8),
  },

  title: {
    fontSize: scaleFontSize(14),
    fontWeight: '600',
    color: Colors.text,
  },

  cancelHint: {
    fontSize: scaleFontSize(11),
    color: Colors.accent,
    fontStyle: 'italic',
  },

  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: scaleWidth(8),
  },

  typeButton: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: scaleWidth(12),
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.boardDark,
  },

  typeButtonSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },

  typeButtonDisabled: {
    opacity: 0.4,
    backgroundColor: Colors.boardDark,
  },

  typeButtonText: {
    fontSize: scaleFontSize(12),
    fontWeight: '600',
    color: Colors.text,
    marginTop: scaleHeight(4),
  },

  typeButtonTextSelected: {
    color: Colors.background,
  },

  typeButtonTextDisabled: {
    color: Colors.textSecondary,
  },

  stoneIcon: {
    width: scaleWidth(32),
    height: scaleWidth(32),
    justifyContent: 'center',
    alignItems: 'center',
  },

  flatStoneIcon: {
    width: scaleWidth(24),
    height: scaleWidth(24),
    borderRadius: scaleWidth(12),
    borderWidth: 2,
    borderColor: Colors.background,
  },

  wallStoneIcon: {
    width: scaleWidth(20),
    height: scaleWidth(20),
    borderWidth: 2,
    borderColor: Colors.background,
    transform: [{ rotate: '45deg' }],
  },

  capstoneIcon: {
    width: scaleWidth(22),
    height: scaleWidth(26),
    borderWidth: 2,
    borderColor: Colors.background,
    borderTopLeftRadius: scaleWidth(4),
    borderTopRightRadius: scaleWidth(4),
  },

  countText: {
    fontSize: scaleFontSize(10),
    color: Colors.textSecondary,
    marginTop: scaleHeight(2),
  },

  helperText: {
    fontSize: scaleFontSize(11),
    color: Colors.accent,
    marginTop: scaleHeight(8),
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
