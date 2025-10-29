import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Position, Stack } from '../../../types';
import { Colors } from '../../../constants/colors';
import { scaleWidth, scaleHeight, scaleFontSize } from '../../../utils/responsive';

export interface StackMoveSelectorProps {
  visible: boolean;
  stack: Stack | null;
  position: Position | null;
  boardSize: number;
  validTargets: Position[];
  onMoveSelect: (from: Position, to: Position, stonesToMove: number, dropPattern?: number[]) => void;
  onCancel: () => void;
}

/**
 * StackMoveSelector component for selecting stack movement options
 * Shows after long press on a stack
 */
export const StackMoveSelector: React.FC<StackMoveSelectorProps> = ({
  visible,
  stack,
  position,
  boardSize,
  validTargets,
  onMoveSelect,
  onCancel,
}) => {
  const [selectedStonesToMove, setSelectedStonesToMove] = useState(1);
  const [selectedTarget, setSelectedTarget] = useState<Position | null>(null);
  const [dropPattern, setDropPattern] = useState<number[]>([]);

  // Reset state when modal becomes visible
  React.useEffect(() => {
    if (visible) {
      setSelectedStonesToMove(1);
      setSelectedTarget(null);
      setDropPattern([]);
    }
  }, [visible]);

  // Helper to calculate movement path (defined before hooks)
  const getMovementPath = React.useCallback((from: Position, to: Position): Position[] => {
    const path: Position[] = [];

    if (from.row === to.row) {
      // Horizontal movement
      const direction = from.col < to.col ? 1 : -1;
      for (let col = from.col + direction; col !== to.col + direction; col += direction) {
        path.push({ row: from.row, col });
      }
    } else {
      // Vertical movement
      const direction = from.row < to.row ? 1 : -1;
      for (let row = from.row + direction; row !== to.row + direction; row += direction) {
        path.push({ row, col: from.col });
      }
    }

    return path;
  }, []);

  // Filter valid targets based on selected stones to move
  // Can only move as far as the number of stones (1 stone per square minimum)
  const filteredValidTargets = React.useMemo(() => {
    if (!position) return validTargets;
    return validTargets.filter(target => {
      const path = getMovementPath(position, target);
      // Path length must be <= number of stones selected
      return path.length <= selectedStonesToMove;
    });
  }, [validTargets, selectedStonesToMove, position, getMovementPath]);

  // Reset target when stones to move changes (might be too far now)
  React.useEffect(() => {
    if (selectedTarget && position) {
      const path = getMovementPath(position, selectedTarget);
      // If the path is longer than stones we want to move, reset target
      if (path.length > selectedStonesToMove) {
        setSelectedTarget(null);
        setDropPattern([]);
      }
    }
  }, [selectedStonesToMove, selectedTarget, position, getMovementPath]);

  // Calculate path when target changes
  React.useEffect(() => {
    if (selectedTarget && position) {
      const path = getMovementPath(position, selectedTarget);
      // Initialize drop pattern: 1 stone per square, rest at the end
      const initialPattern = new Array(path.length).fill(1);
      if (initialPattern.length > 0) {
        const remaining = selectedStonesToMove - (path.length - 1);
        initialPattern[initialPattern.length - 1] = remaining;
      }
      setDropPattern(initialPattern);
    }
  }, [selectedTarget, position, selectedStonesToMove, getMovementPath]);

  if (!visible || !stack || !position) {
    return null;
  }

  const stackHeight = stack.stones.length;
  const maxCarry = Math.min(stackHeight, boardSize);

  // Get current path
  const currentPath = selectedTarget ? getMovementPath(position, selectedTarget) : [];

  // Calculate remaining stones to distribute
  const distributedStones = dropPattern.reduce((sum, count) => sum + count, 0);
  const remainingStones = selectedStonesToMove - distributedStones;
  
  // Render stone count selector
  const renderStoneCountSelector = () => {
    const buttons = [];
    
    for (let i = 1; i <= maxCarry; i++) {
      const isSelected = selectedStonesToMove === i;
      
      buttons.push(
        <TouchableOpacity
          key={i}
          style={[
            styles.countButton,
            {
              backgroundColor: isSelected ? Colors.accent : Colors.surface,
              borderColor: isSelected ? Colors.accent : Colors.textSecondary,
              borderWidth: scaleWidth(1),
              marginHorizontal: scaleWidth(2),
              paddingHorizontal: scaleWidth(12),
              paddingVertical: scaleHeight(8),
              borderRadius: scaleWidth(6),
            }
          ]}
          onPress={() => setSelectedStonesToMove(i)}
          accessibilityLabel={`Move ${i} stone${i > 1 ? 's' : ''}`}
          accessibilityRole="button"
          accessibilityState={{ selected: isSelected || false }}
        >
          <Text style={[
            styles.countButtonText,
            {
              color: isSelected ? Colors.background : Colors.text,
              fontSize: scaleFontSize(12),
              fontWeight: isSelected ? 'bold' : 'normal',
            }
          ]}>
            {i}
          </Text>
        </TouchableOpacity>
      );
    }
    
    return (
      <View style={styles.countSelector}>
        <Text style={[
          styles.selectorTitle,
          {
            color: Colors.text,
            fontSize: scaleFontSize(14),
            marginBottom: scaleHeight(8),
          }
        ]}>
          Stones to Move:
        </Text>
        <View style={styles.countButtonRow}>
          {buttons}
        </View>
      </View>
    );
  };
  
  // Render drop pattern selector (shows after target is selected)
  const renderDropPatternSelector = () => {
    if (!selectedTarget || currentPath.length === 0) {
      return null;
    }

    const handleDropChange = (index: number, delta: number) => {
      const newPattern = [...dropPattern];
      // Minimum 1 stone per square (TAK rule)
      const newValue = Math.max(1, Math.min(selectedStonesToMove, (newPattern[index] || 1) + delta));
      newPattern[index] = newValue;
      setDropPattern(newPattern);
    };

    return (
      <View style={styles.dropPatternSelector}>
        <Text style={[
          styles.selectorTitle,
          {
            color: Colors.text,
            fontSize: scaleFontSize(14),
            marginBottom: scaleHeight(4),
          }
        ]}>
          Drop Pattern
        </Text>
        <Text style={[
          styles.instructionText,
          {
            color: Colors.textSecondary,
            fontSize: scaleFontSize(11),
            marginBottom: scaleHeight(8),
            textAlign: 'center',
            fontStyle: 'italic',
          }
        ]}>
          Distribute {selectedStonesToMove} stone{selectedStonesToMove > 1 ? 's' : ''} (min. 1 per square)
        </Text>
        <Text style={[
          styles.helperText,
          {
            color: remainingStones === 0 ? Colors.success : Colors.warning,
            fontSize: scaleFontSize(11),
            marginBottom: scaleHeight(8),
          }
        ]}>
          {remainingStones === 0
            ? '✓ All stones distributed'
            : `⚠ ${remainingStones} stone${remainingStones > 1 ? 's' : ''} remaining - add them to the path!`}
        </Text>
        <ScrollView style={styles.pathList} nestedScrollEnabled>
          {currentPath.map((pos, index) => {
            const isFinalPosition = index === currentPath.length - 1;
            const currentDrop = dropPattern[index] || 0;

            return (
              <View
                key={`${pos.row}-${pos.col}`}
                style={[
                  styles.pathItem,
                  {
                    backgroundColor: isFinalPosition ? Colors.highlight + '20' : Colors.background,
                  }
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[
                    styles.pathItemPosition,
                    {
                      color: isFinalPosition ? Colors.highlight : Colors.textSecondary,
                      fontSize: scaleFontSize(12),
                      fontWeight: isFinalPosition ? 'bold' : 'normal',
                    }
                  ]}>
                    {isFinalPosition ? '🎯 Final' : `Step ${index + 1}`}
                  </Text>
                  <Text style={{
                    color: Colors.textSecondary,
                    fontSize: scaleFontSize(10),
                  }}>
                    ({pos.row + 1},{pos.col + 1})
                  </Text>
                </View>
                <View style={styles.dropControls}>
                  <TouchableOpacity
                    style={[
                      styles.dropButton,
                      {
                        backgroundColor: currentDrop > 1 ? Colors.warning : Colors.disabled,
                        borderRadius: scaleWidth(4),
                        padding: scaleWidth(8),
                        opacity: currentDrop > 1 ? 1 : 0.5,
                      }
                    ]}
                    onPress={() => handleDropChange(index, -1)}
                    disabled={currentDrop <= 1}
                  >
                    <Text style={[
                      styles.dropButtonText,
                      {
                        color: Colors.text,
                        fontSize: scaleFontSize(14),
                        fontWeight: 'bold',
                      }
                    ]}>
                      −
                    </Text>
                  </TouchableOpacity>
                  <Text style={[
                    styles.dropCount,
                    {
                      color: currentDrop > 1 ? Colors.accent : Colors.text,
                      fontSize: scaleFontSize(16),
                      fontWeight: 'bold',
                      minWidth: scaleWidth(30),
                      textAlign: 'center',
                    }
                  ]}>
                    {currentDrop}
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.dropButton,
                      {
                        backgroundColor: remainingStones > 0 ? Colors.success : Colors.disabled,
                        borderRadius: scaleWidth(4),
                        padding: scaleWidth(8),
                        opacity: remainingStones > 0 ? 1 : 0.5,
                      }
                    ]}
                    onPress={() => handleDropChange(index, 1)}
                    disabled={remainingStones === 0}
                  >
                    <Text style={[
                      styles.dropButtonText,
                      {
                        color: Colors.text,
                        fontSize: scaleFontSize(14),
                        fontWeight: 'bold',
                      }
                    ]}>
                      +
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  // Render target position selector
  const renderTargetSelector = () => {
    if (filteredValidTargets.length === 0) {
      return (
        <View style={styles.noTargetsContainer}>
          <Text style={[
            styles.noTargetsText,
            {
              color: Colors.textSecondary,
              fontSize: scaleFontSize(12),
              textAlign: 'center',
            }
          ]}>
            {selectedStonesToMove === 1
              ? 'Select more stones to move farther'
              : 'No valid move targets available'}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.targetSelector}>
        <Text style={[
          styles.selectorTitle,
          {
            color: Colors.text,
            fontSize: scaleFontSize(14),
            marginBottom: scaleHeight(8),
          }
        ]}>
          Target Position (max {selectedStonesToMove} square{selectedStonesToMove > 1 ? 's' : ''} away):
        </Text>
        <View style={styles.targetGrid}>
          {filteredValidTargets.map((target, index) => {
            const isSelected = selectedTarget && 
              selectedTarget.row === target.row && 
              selectedTarget.col === target.col;
            
            return (
              <TouchableOpacity
                key={`${target.row}-${target.col}`}
                style={[
                  styles.targetButton,
                  {
                    backgroundColor: isSelected ? Colors.highlight : Colors.surface,
                    borderColor: isSelected ? Colors.highlight : Colors.textSecondary,
                    borderWidth: scaleWidth(1),
                    margin: scaleWidth(2),
                    paddingHorizontal: scaleWidth(8),
                    paddingVertical: scaleHeight(6),
                    borderRadius: scaleWidth(4),
                    minWidth: scaleWidth(50),
                  }
                ]}
                onPress={() => setSelectedTarget(target)}
                accessibilityLabel={`Move to row ${target.row + 1}, column ${target.col + 1}`}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected || false }}
              >
                <Text style={[
                  styles.targetButtonText,
                  {
                    color: isSelected ? Colors.text : Colors.textSecondary,
                    fontSize: scaleFontSize(11),
                    textAlign: 'center',
                  }
                ]}>
                  {`${target.row + 1},${target.col + 1}`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };
  
  // Handle move confirmation
  const handleConfirmMove = () => {
    if (selectedTarget && position && remainingStones === 0) {
      onMoveSelect(position, selectedTarget, selectedStonesToMove, dropPattern);
    }
  };

  const canConfirmMove = selectedTarget !== null && remainingStones === 0;
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={[
          styles.container,
          {
            backgroundColor: Colors.surface,
            borderRadius: scaleWidth(12),
            padding: scaleWidth(16),
            marginHorizontal: scaleWidth(12),
            marginVertical: scaleHeight(20),
            width: '90%',
            maxHeight: '80%',
          }
        ]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[
              styles.title,
              {
                color: Colors.text,
                fontSize: scaleFontSize(16),
                fontWeight: 'bold',
                textAlign: 'center',
              }
            ]}>
              Move Stack
            </Text>
            <Text style={[
              styles.subtitle,
              {
                color: Colors.textSecondary,
                fontSize: scaleFontSize(12),
                textAlign: 'center',
                marginTop: scaleHeight(4),
              }
            ]}>
              From ({position.row + 1}, {position.col + 1}) • {stackHeight} stones
            </Text>

            {/* Stack Visualization */}
            <View style={styles.stackVisualization}>
              <Text style={[
                styles.stackLabel,
                {
                  color: Colors.textSecondary,
                  fontSize: scaleFontSize(10),
                  marginBottom: scaleHeight(8),
                  textAlign: 'center',
                }
              ]}>
                Stack ({stackHeight} stone{stackHeight > 1 ? 's' : ''})
              </Text>
              <View style={styles.stackContainer}>
                {stack.stones.slice().reverse().map((stone, index) => {
                  const isTop = index === 0;
                  const ownerColor = stone.owner === 'player1' ? Colors.player1 : Colors.player2;
                  const playerLabel = stone.owner === 'player1' ? 'P1' : 'P2';

                  return (
                    <View
                      key={`${stone.id}-${index}`}
                      style={[
                        styles.stackLayer,
                        {
                          backgroundColor: ownerColor,
                          marginTop: index === 0 ? 0 : -scaleHeight(8),
                          zIndex: stackHeight - index,
                          borderWidth: isTop ? 2 : 1,
                          borderColor: isTop ? Colors.accent : Colors.background,
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: 0.3,
                          shadowRadius: 2,
                          elevation: stackHeight - index,
                        }
                      ]}
                    >
                      <Text style={{
                        color: Colors.background,
                        fontSize: scaleFontSize(9),
                        fontWeight: 'bold',
                      }}>
                        {playerLabel}
                      </Text>
                      <Text style={{
                        color: Colors.background,
                        fontSize: scaleFontSize(7),
                      }}>
                        {stone.type === 'flat' ? '●' : stone.type === 'wall' ? '▮' : '◆'}
                      </Text>
                    </View>
                  );
                })}
                <View style={{
                  position: 'absolute',
                  top: -scaleHeight(12),
                  alignSelf: 'center',
                }}>
                  <Text style={{
                    color: Colors.accent,
                    fontSize: scaleFontSize(8),
                    fontWeight: 'bold',
                  }}>
                    ▲ TOP
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Scrollable content */}
          <ScrollView
            style={styles.scrollContent}
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={true}
          >
            {/* Stone count selector */}
            {renderStoneCountSelector()}

            {/* Target selector */}
            {renderTargetSelector()}

            {/* Drop pattern selector (shows after target is selected) */}
            {renderDropPatternSelector()}
          </ScrollView>

          {/* Action buttons - always visible at bottom */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.cancelButton,
                {
                  backgroundColor: Colors.warning,
                  paddingHorizontal: scaleWidth(16),
                  paddingVertical: scaleHeight(10),
                  borderRadius: scaleWidth(6),
                  flex: 1,
                  marginRight: scaleWidth(8),
                }
              ]}
              onPress={onCancel}
              accessibilityLabel="Cancel move"
              accessibilityRole="button"
            >
              <Text style={[
                styles.actionButtonText,
                {
                  color: Colors.text,
                  fontSize: scaleFontSize(14),
                  fontWeight: 'bold',
                  textAlign: 'center',
                }
              ]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.confirmButton,
                {
                  backgroundColor: canConfirmMove ? Colors.success : Colors.textSecondary,
                  paddingHorizontal: scaleWidth(16),
                  paddingVertical: scaleHeight(10),
                  borderRadius: scaleWidth(6),
                  flex: 1,
                  marginLeft: scaleWidth(8),
                  opacity: canConfirmMove ? 1 : 0.5,
                }
              ]}
              onPress={handleConfirmMove}
              disabled={!canConfirmMove}
              accessibilityLabel="Confirm move"
              accessibilityRole="button"
              accessibilityState={{ disabled: !canConfirmMove }}
            >
              <Text style={[
                styles.actionButtonText,
                {
                  color: Colors.text,
                  fontSize: scaleFontSize(14),
                  fontWeight: 'bold',
                  textAlign: 'center',
                }
              ]}>
                Move
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  container: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  scrollContent: {
    flexGrow: 0,
  },

  scrollContentContainer: {
    paddingBottom: scaleHeight(8),
  },

  header: {
    marginBottom: scaleHeight(12),
  },

  title: {
    textAlign: 'center',
  },

  subtitle: {
    textAlign: 'center',
  },

  stackVisualization: {
    marginTop: scaleHeight(12),
    paddingTop: scaleHeight(12),
    paddingBottom: scaleHeight(8),
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'center',
  },

  stackLabel: {
    fontWeight: '600',
  },

  stackContainer: {
    alignItems: 'center',
    position: 'relative',
    paddingTop: scaleHeight(16),
    paddingBottom: scaleHeight(8),
  },

  stackLayer: {
    width: scaleWidth(50),
    height: scaleHeight(22),
    borderRadius: scaleWidth(8),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: scaleWidth(4),
  },

  stackStones: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: scaleWidth(6),
  },

  stoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scaleWidth(8),
    paddingVertical: scaleHeight(4),
    backgroundColor: Colors.background,
    borderRadius: scaleWidth(6),
    borderWidth: 1,
    borderColor: Colors.border,
  },

  stoneIndicator: {
    // Styles are inline for flexibility
  },

  stoneText: {
    // Styles are inline for flexibility
  },
  
  countSelector: {
    marginBottom: scaleHeight(16),
  },
  
  selectorTitle: {
    fontWeight: '600',
    textAlign: 'center',
  },
  
  countButtonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  
  countButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: scaleWidth(32),
  },
  
  countButtonText: {
    textAlign: 'center',
  },
  
  targetSelector: {
    marginBottom: scaleHeight(16),
  },
  
  targetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  
  targetButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  targetButtonText: {
    fontWeight: '600',
  },
  
  noTargetsContainer: {
    padding: scaleHeight(16),
    alignItems: 'center',
  },
  
  noTargetsText: {
    fontStyle: 'italic',
  },
  
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: scaleHeight(8),
  },
  
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  cancelButton: {
    // Additional cancel button styles if needed
  },
  
  confirmButton: {
    // Additional confirm button styles if needed
  },
  
  actionButtonText: {
    fontWeight: 'bold',
  },

  dropPatternSelector: {
    marginBottom: scaleHeight(16),
  },

  pathList: {
    maxHeight: scaleHeight(150),
  },

  pathItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: scaleHeight(8),
    paddingHorizontal: scaleWidth(12),
    marginBottom: scaleHeight(4),
    backgroundColor: Colors.background,
    borderRadius: scaleWidth(6),
    borderWidth: 1,
    borderColor: Colors.textSecondary,
  },

  pathItemPosition: {
    flex: 1,
  },

  dropControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleWidth(8),
  },

  dropButton: {
    minWidth: scaleWidth(32),
    minHeight: scaleWidth(32),
    alignItems: 'center',
    justifyContent: 'center',
  },

  dropButtonText: {
    userSelect: 'none',
  },

  dropCount: {
    marginHorizontal: scaleWidth(4),
  },

  helperText: {
    fontStyle: 'italic',
    textAlign: 'center',
  },

  instructionText: {
    // Styles are inline for flexibility
  },
});