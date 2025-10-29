import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextStyle } from 'react-native';
import { Button } from '../components/ui/common/Button';
import { Modal } from '../components/ui/feedback/Modal';
import { Colors } from '../constants/colors';
import { scaleWidth, scaleHeight, scaleFontSize } from '../utils/responsive';

interface MenuScreenProps {
  visible: boolean;
  onBoardSizeSelect: (size: number) => void;
  onClose: () => void;
}

interface BoardSizeOption {
  size: number;
  flatStones: number;
  capstones: number;
  description: string;
}

const BOARD_SIZE_OPTIONS: BoardSizeOption[] = [
  { size: 4, flatStones: 15, capstones: 0, description: 'Quick Game (4x4)' },
  { size: 5, flatStones: 21, capstones: 1, description: 'Standard Game (5x5)' },
  { size: 6, flatStones: 30, capstones: 1, description: 'Extended Game (6x6)' },
  { size: 7, flatStones: 40, capstones: 2, description: 'Long Game (7x7)' },
  { size: 8, flatStones: 50, capstones: 2, description: 'Epic Game (8x8)' },
];

export const MenuScreen: React.FC<MenuScreenProps> = ({
  visible,
  onBoardSizeSelect,
  onClose,
}) => {
  const handleBoardSizeSelect = (size: number) => {
    onBoardSizeSelect(size);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      title="New Game"
      onClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>Select Board Size</Text>
          </View>
          <Text style={styles.subtitleText}>
            Choose your preferred game complexity
          </Text>
        </View>

        <ScrollView 
          style={styles.optionsContainer}
          showsVerticalScrollIndicator={false}
        >
          {BOARD_SIZE_OPTIONS.map((option) => (
            <View key={option.size} style={styles.optionCard}>
              <Button
                title={option.description}
                onPress={() => handleBoardSizeSelect(option.size)}
                style={styles.optionButton}
                textStyle={styles.optionButtonText}
              />
              <View style={styles.optionDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Board Size:</Text>
                  <Text style={styles.detailValue}>{option.size}x{option.size}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Flat Stones:</Text>
                  <Text style={styles.detailValue}>{option.flatStones} per player</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Capstones:</Text>
                  <Text style={styles.detailValue}>{option.capstones} per player</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: scaleWidth(20),
    paddingVertical: scaleHeight(16),
  },

  header: {
    alignItems: 'center',
    marginBottom: scaleHeight(24),
  },

  titleContainer: {
    marginBottom: scaleHeight(8),
  },

  titleText: {
    fontSize: scaleFontSize(24),
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
  } as TextStyle,

  subtitleText: {
    fontSize: scaleFontSize(16),
    color: Colors.textSecondary,
    textAlign: 'center',
  } as TextStyle,

  optionsContainer: {
    flex: 1,
  },

  optionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: scaleWidth(16),
    marginBottom: scaleHeight(16),
    borderWidth: 1,
    borderColor: Colors.boardDark,
  },

  optionButton: {
    backgroundColor: Colors.accent,
    marginBottom: scaleHeight(12),
    paddingVertical: scaleHeight(12),
  },

  optionButtonText: {
    fontSize: scaleFontSize(18),
    fontWeight: '600',
    color: Colors.background,
  },

  optionDetails: {
    gap: scaleHeight(6),
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  detailLabel: {
    fontSize: scaleFontSize(14),
    color: Colors.textSecondary,
    fontWeight: '500',
  } as TextStyle,

  detailValue: {
    fontSize: scaleFontSize(14),
    color: Colors.text,
    fontWeight: '600',
  } as TextStyle,
});