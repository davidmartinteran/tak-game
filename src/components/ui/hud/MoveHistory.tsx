import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Share,
} from 'react-native';
import { useGameStore } from '../../../store';
import { MoveHistoryEntry } from '../../../services/MoveHistoryService';
import { Player } from '../../../types';
import { Colors } from '../../../constants/colors';
import { scaleWidth, scaleFontSize } from '../../../utils/responsive';

export interface MoveHistoryProps {
  visible: boolean;
  onClose: () => void;
  showUndoButton?: boolean;
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({
  visible,
  onClose,
  showUndoButton = true,
}) => {
  const [selectedMoveIndex, setSelectedMoveIndex] = useState<number | null>(null);
  
  const {
    getMoveHistory,
    getMoveStatistics,
    exportMoveHistory,
    canUndo,
    undoLastMove,
    undoMoves,
  } = useGameStore();

  const moveHistory = getMoveHistory();
  const statistics = getMoveStatistics();

  const handleUndoLastMove = () => {
    if (canUndo()) {
      undoLastMove();
      onClose();
    }
  };

  const handleUndoToMove = (moveIndex: number) => {
    const movesToUndo = moveHistory.length - moveIndex;
    if (movesToUndo > 0) {
      undoMoves(movesToUndo);
      onClose();
    }
  };

  const handleExportHistory = async () => {
    try {
      const historyText = exportMoveHistory();
      await Share.share({
        message: historyText,
        title: 'Tak Game Move History',
      });
    } catch (error) {
      console.error('Failed to export move history:', error);
    }
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getPlayerColor = (player: Player): string => {
    return player === Player.PLAYER1 ? Colors.player1 : Colors.player2;
  };

  const renderMoveEntry = (entry: MoveHistoryEntry, index: number) => {
    const isSelected = selectedMoveIndex === index;
    const playerColor = getPlayerColor(entry.player);

    return (
      <TouchableOpacity
        key={`${entry.moveNumber}-${entry.timestamp}`}
        style={[
          styles.moveEntry,
          isSelected && styles.selectedMoveEntry,
        ]}
        onPress={() => setSelectedMoveIndex(isSelected ? null : index)}
      >
        <View style={styles.moveHeader}>
          <View style={styles.moveNumberContainer}>
            <Text style={styles.moveNumber}>{entry.moveNumber}</Text>
          </View>
          <View style={[styles.playerIndicator, { backgroundColor: playerColor }]} />
          <Text style={styles.moveDescription}>{entry.description}</Text>
          <Text style={styles.moveTime}>{formatTimestamp(entry.timestamp)}</Text>
        </View>
        
        {isSelected && (
          <View style={styles.moveDetails}>
            <Text style={styles.moveDetailText}>
              Player: {entry.player === Player.PLAYER1 ? 'Player 1' : 'Player 2'}
            </Text>
            <Text style={styles.moveDetailText}>
              Move Type: {entry.move.type === 'place' ? 'Place Stone' : 'Move Stack'}
            </Text>
            {entry.move.type === 'place' && (
              <>
                <Text style={styles.moveDetailText}>
                  Stone Type: {entry.move.stoneType}
                </Text>
                <Text style={styles.moveDetailText}>
                  Position: {String.fromCharCode(97 + entry.move.position.col)}{entry.move.position.row + 1}
                </Text>
              </>
            )}
            {entry.move.type === 'move' && (
              <>
                <Text style={styles.moveDetailText}>
                  From: {String.fromCharCode(97 + entry.move.from.col)}{entry.move.from.row + 1}
                </Text>
                <Text style={styles.moveDetailText}>
                  To: {String.fromCharCode(97 + entry.move.to.col)}{entry.move.to.row + 1}
                </Text>
                <Text style={styles.moveDetailText}>
                  Stones Moved: {entry.move.stonesToMove}
                </Text>
              </>
            )}
            {showUndoButton && (
              <TouchableOpacity
                style={styles.undoButton}
                onPress={() => handleUndoToMove(index)}
              >
                <Text style={styles.undoButtonText}>Undo to here</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderStatistics = () => (
    <View style={styles.statisticsContainer}>
      <Text style={styles.statisticsTitle}>Game Statistics</Text>
      <View style={styles.statisticsGrid}>
        <View style={styles.statisticsItem}>
          <Text style={styles.statisticsLabel}>Total Moves</Text>
          <Text style={styles.statisticsValue}>{statistics.totalMoves}</Text>
        </View>
        <View style={styles.statisticsItem}>
          <Text style={styles.statisticsLabel}>Player 1 Moves</Text>
          <Text style={styles.statisticsValue}>{statistics.movesByPlayer[Player.PLAYER1]}</Text>
        </View>
        <View style={styles.statisticsItem}>
          <Text style={styles.statisticsLabel}>Player 2 Moves</Text>
          <Text style={styles.statisticsValue}>{statistics.movesByPlayer[Player.PLAYER2]}</Text>
        </View>
        <View style={styles.statisticsItem}>
          <Text style={styles.statisticsLabel}>Place Moves</Text>
          <Text style={styles.statisticsValue}>{statistics.placeMovesCount}</Text>
        </View>
        <View style={styles.statisticsItem}>
          <Text style={styles.statisticsLabel}>Stack Moves</Text>
          <Text style={styles.statisticsValue}>{statistics.stackMovesCount}</Text>
        </View>
        <View style={styles.statisticsItem}>
          <Text style={styles.statisticsLabel}>Avg Moves/Turn</Text>
          <Text style={styles.statisticsValue}>{statistics.averageMovesPerTurn.toFixed(1)}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Move History</Text>
          <View style={styles.headerButtons}>
            {showUndoButton && canUndo() && (
              <TouchableOpacity
                style={styles.headerButton}
                onPress={handleUndoLastMove}
              >
                <Text style={styles.headerButtonText}>Undo Last</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleExportHistory}
            >
              <Text style={styles.headerButtonText}>Export</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerButton, styles.closeButton]}
              onPress={onClose}
            >
              <Text style={styles.headerButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>

        {renderStatistics()}

        <ScrollView style={styles.movesList} showsVerticalScrollIndicator={false}>
          {moveHistory.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No moves yet</Text>
            </View>
          ) : (
            moveHistory.map((entry, index) => renderMoveEntry(entry, index))
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: scaleWidth(16),
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface,
  },
  title: {
    fontSize: scaleFontSize(20),
    fontWeight: 'bold',
    color: Colors.text,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: scaleWidth(8),
  },
  headerButton: {
    paddingHorizontal: scaleWidth(12),
    paddingVertical: scaleWidth(6),
    backgroundColor: Colors.accent,
    borderRadius: scaleWidth(6),
  },
  closeButton: {
    backgroundColor: Colors.surface,
  },
  headerButtonText: {
    color: Colors.background,
    fontSize: scaleFontSize(14),
    fontWeight: '600',
  },
  statisticsContainer: {
    padding: scaleWidth(16),
    backgroundColor: Colors.surface,
    margin: scaleWidth(16),
    borderRadius: scaleWidth(8),
  },
  statisticsTitle: {
    fontSize: scaleFontSize(16),
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: scaleWidth(12),
  },
  statisticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scaleWidth(12),
  },
  statisticsItem: {
    flex: 1,
    minWidth: '30%',
    alignItems: 'center',
  },
  statisticsLabel: {
    fontSize: scaleFontSize(12),
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  statisticsValue: {
    fontSize: scaleFontSize(16),
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: scaleWidth(4),
  },
  movesList: {
    flex: 1,
    padding: scaleWidth(16),
  },
  moveEntry: {
    backgroundColor: Colors.surface,
    borderRadius: scaleWidth(8),
    marginBottom: scaleWidth(8),
    overflow: 'hidden',
  },
  selectedMoveEntry: {
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  moveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scaleWidth(12),
  },
  moveNumberContainer: {
    width: scaleWidth(32),
    height: scaleWidth(32),
    borderRadius: scaleWidth(16),
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scaleWidth(12),
  },
  moveNumber: {
    color: Colors.text,
    fontSize: scaleFontSize(14),
    fontWeight: 'bold',
  },
  playerIndicator: {
    width: scaleWidth(12),
    height: scaleWidth(12),
    borderRadius: scaleWidth(6),
    marginRight: scaleWidth(12),
  },
  moveDescription: {
    flex: 1,
    color: Colors.text,
    fontSize: scaleFontSize(14),
  },
  moveTime: {
    color: Colors.textSecondary,
    fontSize: scaleFontSize(12),
  },
  moveDetails: {
    padding: scaleWidth(12),
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: Colors.background,
  },
  moveDetailText: {
    color: Colors.textSecondary,
    fontSize: scaleFontSize(12),
    marginBottom: scaleWidth(4),
  },
  undoButton: {
    marginTop: scaleWidth(8),
    paddingHorizontal: scaleWidth(12),
    paddingVertical: scaleWidth(6),
    backgroundColor: Colors.warning,
    borderRadius: scaleWidth(4),
    alignSelf: 'flex-start',
  },
  undoButtonText: {
    color: Colors.text,
    fontSize: scaleFontSize(12),
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: scaleWidth(48),
  },
  emptyStateText: {
    color: Colors.textSecondary,
    fontSize: scaleFontSize(16),
  },
});