import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  Animated,
} from 'react-native';
import { Player, StoneType, PlayerReserve } from '../../../types';
import { Colors } from '../../../constants/colors';
import { scaleWidth, scaleHeight, scaleFontSize } from '../../../utils/responsive';
import { HapticService } from '../../../services/HapticService';
import { AccessibilityService } from '../../../services/AccessibilityService';

export interface PlayerHUDProps {
  player: Player;
  reserve: PlayerReserve;
  isCurrentPlayer: boolean;
  selectedStoneType: StoneType | null;
  isFirstTurn: boolean;
  boardSize?: number;
  onStoneTypeSelect: (type: StoneType) => void;
  onClearSelection: () => void;
  style?: ViewStyle;
  gamePhase?: string;
}

/**
 * PlayerHUD component showing current player turn indicator,
 * remaining stone counts, and stone type selection buttons
 */
export const PlayerHUD: React.FC<PlayerHUDProps> = React.memo(({
  player,
  reserve,
  isCurrentPlayer,
  selectedStoneType,
  isFirstTurn,
  boardSize = 5,
  onStoneTypeSelect,
  onClearSelection,
  style,
}) => {
  const playerColor = player === Player.PLAYER1 ? Colors.player1 : Colors.player2;
  const playerName = player === Player.PLAYER1 ? 'Player 1' : 'Player 2';
  
  // Determine available stone types based on reserves and game phase
  const getAvailableStoneTypes = (): StoneType[] => {
    const available: StoneType[] = [];
    
    if (isFirstTurn) {
      // During first turn, only flat stones can be placed (opponent's stones)
      available.push(StoneType.FLAT);
    } else {
      // Normal gameplay - check reserves
      if (reserve.flatStones > 0) {
        available.push(StoneType.FLAT, StoneType.WALL);
      }
      if (reserve.capstones > 0) {
        available.push(StoneType.CAPSTONE);
      }
    }
    
    return available;
  };
  
  const availableStoneTypes = getAvailableStoneTypes();
  
  // Animation values for stone type transitions
  const buttonScales = useRef<Record<StoneType, Animated.Value>>({
    [StoneType.FLAT]: new Animated.Value(1),
    [StoneType.WALL]: new Animated.Value(1),
    [StoneType.CAPSTONE]: new Animated.Value(1),
  }).current;
  
  const previousSelectedType = useRef<StoneType | null>(selectedStoneType);
  
  // Handle stone type selection animations
  useEffect(() => {
    const currentType = selectedStoneType;
    const prevType = previousSelectedType.current;
    
    // Animate deselection of previous type
    if (prevType && prevType !== currentType) {
      Animated.spring(buttonScales[prevType], {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }).start();
    }
    
    // Animate selection of current type
    if (currentType) {
      Animated.sequence([
        Animated.spring(buttonScales[currentType], {
          toValue: 1.1,
          useNativeDriver: true,
          tension: 300,
          friction: 8,
        }),
        Animated.spring(buttonScales[currentType], {
          toValue: 1.05,
          useNativeDriver: true,
          tension: 300,
          friction: 12,
        }),
      ]).start();
    }
    
    previousSelectedType.current = currentType;
  }, [selectedStoneType, buttonScales]);
  
  // Render stone type button
  const renderStoneButton = (stoneType: StoneType) => {
    const isSelected = selectedStoneType === stoneType;
    const isAvailable = availableStoneTypes.includes(stoneType);
    const isDisabled = !isCurrentPlayer || !isAvailable;
    
    // Get stone count for display
    const getStoneCount = () => {
      switch (stoneType) {
        case StoneType.FLAT:
        case StoneType.WALL:
          return reserve.flatStones;
        case StoneType.CAPSTONE:
          return reserve.capstones;
        default:
          return 0;
      }
    };
    
    const stoneCount = getStoneCount();
    const displayText = isFirstTurn && stoneType === StoneType.FLAT 
      ? 'Opponent Flat' 
      : `${stoneType.charAt(0).toUpperCase() + stoneType.slice(1)} (${stoneCount})`;
    
    const buttonStyle = [
      styles.stoneButton,
      {
        backgroundColor: isSelected ? Colors.accent : Colors.surface,
        borderColor: isSelected ? Colors.accent : playerColor,
        borderWidth: scaleWidth(2),
        opacity: isDisabled ? 0.5 : 1,
      }
    ];
    
    const textStyle = [
      styles.buttonText,
      {
        color: isSelected ? Colors.background : Colors.text,
        fontSize: scaleFontSize(12),
      }
    ];
    
    return (
      <Animated.View
        key={stoneType}
        style={{
          transform: [{ scale: buttonScales[stoneType] }],
        }}
      >
        <TouchableOpacity
          style={buttonStyle}
          onPress={async () => {
            await HapticService.stoneSelection();
            if (isSelected) {
              onClearSelection();
            } else {
              onStoneTypeSelect(stoneType);
            }
          }}
          disabled={isDisabled}
          activeOpacity={0.7}
          accessibilityLabel={AccessibilityService.getStoneTypeSelectionLabel(stoneType, getStoneCount(), isSelected)}
          accessibilityRole="button"
          accessibilityState={{ selected: isSelected, disabled: isDisabled }}
          accessibilityHint={AccessibilityService.getStoneTypeSelectionHint(stoneType, getStoneCount(), 'normal')}
        >
          <Text style={textStyle}>{displayText}</Text>
          
          {/* Visual feedback for selection */}
          {isSelected && (
            <View style={[
              styles.selectionIndicator,
              {
                backgroundColor: Colors.accent,
                width: scaleWidth(4),
                height: scaleWidth(4),
                borderRadius: scaleWidth(2),
              }
            ]} />
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };
  
  // Render carry limit info for stack movement
  const renderCarryLimitInfo = () => {
    if (!isCurrentPlayer) return null;
    
    return (
      <View style={styles.carryLimitContainer}>
        <Text style={[
          styles.carryLimitText,
          {
            color: Colors.textSecondary,
            fontSize: scaleFontSize(10),
          }
        ]}>
          Max Carry: Stack Size (up to {boardSize})
        </Text>
      </View>
    );
  };
  
  const containerStyle = [
    styles.container,
    {
      backgroundColor: isCurrentPlayer ? Colors.surface : Colors.background,
      borderColor: playerColor,
      borderWidth: isCurrentPlayer ? scaleWidth(3) : scaleWidth(1),
      shadowColor: isCurrentPlayer ? playerColor : '#000',
      shadowOpacity: isCurrentPlayer ? 0.3 : 0.1,
    },
    style,
  ];
  
  return (
    <View 
      style={containerStyle}
      accessibilityLabel={`${playerName} controls`}
      accessibilityRole="none"
    >
      {/* Player header */}
      <View style={styles.header}>
        <View style={[
          styles.playerIndicator,
          {
            backgroundColor: playerColor,
            width: scaleWidth(12),
            height: scaleWidth(12),
            borderRadius: scaleWidth(6),
          }
        ]} />
        <Text style={[
          styles.playerName,
          {
            color: isCurrentPlayer ? Colors.text : Colors.textSecondary,
            fontSize: scaleFontSize(14),
            fontWeight: isCurrentPlayer ? 'bold' : 'normal',
          }
        ]}>
          {playerName}
        </Text>
        {isCurrentPlayer && (
          <View style={[
            styles.currentPlayerBadge,
            {
              backgroundColor: Colors.highlight,
              paddingHorizontal: scaleWidth(6),
              paddingVertical: scaleHeight(2),
              borderRadius: scaleWidth(8),
            }
          ]}>
            <Text style={[
              styles.currentPlayerText,
              {
                color: Colors.text,
                fontSize: scaleFontSize(10),
                fontWeight: 'bold',
              }
            ]}>
              TURN
            </Text>
          </View>
        )}
      </View>
      
      {/* Stone reserves display */}
      <View style={styles.reservesContainer}>
        <View style={styles.reserveItem}>
          <Text style={[
            styles.reserveLabel,
            {
              color: Colors.textSecondary,
              fontSize: scaleFontSize(11),
            }
          ]}>
            Flat Stones:
          </Text>
          <Text style={[
            styles.reserveValue,
            {
              color: Colors.text,
              fontSize: scaleFontSize(12),
              fontWeight: 'bold',
            }
          ]}>
            {reserve.flatStones}
          </Text>
        </View>
        <View style={styles.reserveItem}>
          <Text style={[
            styles.reserveLabel,
            {
              color: Colors.textSecondary,
              fontSize: scaleFontSize(11),
            }
          ]}>
            Capstones:
          </Text>
          <Text style={[
            styles.reserveValue,
            {
              color: Colors.text,
              fontSize: scaleFontSize(12),
              fontWeight: 'bold',
            }
          ]}>
            {reserve.capstones}
          </Text>
        </View>
      </View>
      
      {/* Stone type selection buttons */}
      {isCurrentPlayer && (
        <View style={styles.stoneSelection}>
          <Text style={[
            styles.selectionTitle,
            {
              color: Colors.text,
              fontSize: scaleFontSize(12),
              marginBottom: scaleHeight(8),
            }
          ]}>
            {isFirstTurn ? 'Place Opponent Stone:' : 'Select Stone Type:'}
          </Text>
          <View style={styles.buttonRow}>
            {[StoneType.FLAT, StoneType.WALL, StoneType.CAPSTONE].map(renderStoneButton)}
          </View>
          
          {/* Clear selection button */}
          {selectedStoneType && (
            <TouchableOpacity
              style={[
                styles.clearButton,
                {
                  backgroundColor: Colors.warning,
                  marginTop: scaleHeight(8),
                  paddingHorizontal: scaleWidth(12),
                  paddingVertical: scaleHeight(6),
                  borderRadius: scaleWidth(6),
                }
              ]}
              onPress={onClearSelection}
              accessibilityLabel="Clear stone selection"
              accessibilityRole="button"
            >
              <Text style={[
                styles.clearButtonText,
                {
                  color: Colors.text,
                  fontSize: scaleFontSize(11),
                  fontWeight: 'bold',
                }
              ]}>
                Clear Selection
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      
      {/* Carry limit info */}
      {renderCarryLimitInfo()}
    </View>
  );
});

PlayerHUD.displayName = 'PlayerHUD';

const styles = StyleSheet.create({
  container: {
    padding: scaleWidth(12),
    borderRadius: scaleWidth(8),
    marginVertical: scaleHeight(4),
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scaleHeight(8),
  },
  
  playerIndicator: {
    marginRight: scaleWidth(8),
  },
  
  playerName: {
    flex: 1,
  },
  
  currentPlayerBadge: {
    alignItems: 'center',
  },
  
  currentPlayerText: {
    textAlign: 'center',
  },
  
  reservesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: scaleHeight(8),
  },
  
  reserveItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  reserveLabel: {
    marginRight: scaleWidth(4),
  },
  
  reserveValue: {
    minWidth: scaleWidth(20),
    textAlign: 'center',
  },
  
  stoneSelection: {
    marginTop: scaleHeight(8),
  },
  
  selectionTitle: {
    fontWeight: '600',
    textAlign: 'center',
  },
  
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: scaleWidth(4),
  },
  
  stoneButton: {
    flex: 1,
    paddingHorizontal: scaleWidth(8),
    paddingVertical: scaleHeight(8),
    borderRadius: scaleWidth(6),
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    minHeight: scaleHeight(36),
  },
  
  buttonText: {
    textAlign: 'center',
    fontWeight: '600',
  },
  
  selectionIndicator: {
    position: 'absolute',
    top: scaleHeight(2),
    right: scaleWidth(2),
  },
  
  clearButton: {
    alignItems: 'center',
    alignSelf: 'center',
  },
  
  clearButtonText: {
    textAlign: 'center',
  },
  
  carryLimitContainer: {
    marginTop: scaleHeight(4),
    alignItems: 'center',
  },
  
  carryLimitText: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
});