import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Stack as StackComponent } from './Stack';
import { Stack, Position, Player } from '../../../types';
import { Colors } from '../../../constants/colors';
import { scaleWidth } from '../../../utils/responsive';
import { HapticService } from '../../../services/HapticService';
import { AccessibilityService } from '../../../services/AccessibilityService';

export interface SquareProps {
  stack: Stack | null;
  position: Position;
  isHighlighted: boolean;
  isSelected: boolean;
  isValidTarget: boolean;
  squareSize: number;
  onPress: () => void;
  onLongPress: () => void;
  animationState?: 'idle' | 'placing' | 'invalid';
  // Additional props for enhanced accessibility
  boardSize?: number;
  gamePhase?: string;
  currentPlayer?: Player;
}

/**
 * Square component representing a single board square with touch interaction
 */
export const Square: React.FC<SquareProps> = React.memo(({
  stack,
  position,
  isHighlighted,
  isSelected,
  isValidTarget,
  squareSize,
  onPress,
  onLongPress,
  animationState = 'idle',
  boardSize,
  gamePhase,
  currentPlayer,
}) => {
  // Touch feedback state - optimized for native performance
  const [isPressed, setIsPressed] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));
  const [shakeAnim] = useState(new Animated.Value(0));
  const [invalidOverlayOpacity] = useState(new Animated.Value(0));
  
  // Handle invalid move animation
  useEffect(() => {
    if (animationState === 'invalid') {
      // Shake animation
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: -5, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 5, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -3, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 3, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]).start();
      
      // Red overlay flash
      Animated.sequence([
        Animated.timing(invalidOverlayOpacity, { toValue: 0.3, duration: 150, useNativeDriver: true }),
        Animated.timing(invalidOverlayOpacity, { toValue: 0, duration: 350, useNativeDriver: true }),
      ]).start();
    }
  }, [animationState, shakeAnim, invalidOverlayOpacity]);
  
  // Handle press in with immediate visual feedback
  const handlePressIn = () => {
    setIsPressed(true);
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };
  
  // Handle press out
  const handlePressOut = () => {
    setIsPressed(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };
  
  // Handle press with haptic feedback
  const handlePress = async () => {
    // Provide haptic feedback based on action type
    if (isValidTarget || isHighlighted) {
      await HapticService.stoneSelection();
    } else if (stack && stack.stones.length > 0) {
      await HapticService.stoneSelection();
    } else {
      await HapticService.buttonPress();
    }
    
    onPress();
  };
  
  // Handle long press with haptic feedback
  const handleLongPress = async () => {
    // Stronger haptic feedback for long press actions
    await HapticService.longPress();
    onLongPress();
  };
  // Calculate alternating board colors based on position
  const isLightSquare = (position.row + position.col) % 2 === 0;
  const baseColor = isLightSquare ? Colors.boardLight : Colors.boardDark;
  
  // Determine square background color based on state
  const getSquareColor = () => {
    if (isSelected) {
      return Colors.accent; // Gold for selected square
    }
    if (isValidTarget) {
      return Colors.highlight; // Teal for valid move targets
    }
    if (isHighlighted) {
      return Colors.success; // Green for highlighted squares
    }
    return baseColor;
  };
  
  // Calculate border styling
  const getBorderStyle = () => {
    const borderWidth = scaleWidth(1);
    let borderColor: string = Colors.boardDark;
    
    if (isSelected) {
      borderColor = Colors.accent;
    } else if (isValidTarget) {
      borderColor = Colors.highlight;
    } else if (isHighlighted) {
      borderColor = Colors.success;
    }
    
    return {
      borderWidth,
      borderColor,
    };
  };
  
  // Calculate shadow for highlighted states
  const getShadowStyle = () => {
    if (isSelected || isValidTarget || isHighlighted) {
      return {
        shadowColor: getSquareColor(),
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
      };
    }
    return {};
  };
  
  const squareStyle = [
    styles.square,
    {
      width: squareSize,
      height: squareSize,
      backgroundColor: getSquareColor(),
    },
    getBorderStyle(),
    getShadowStyle(),
  ];
  
  return (
    <Animated.View style={{ 
      transform: [
        { scale: scaleAnim },
        { translateX: shakeAnim }
      ] 
    }}>
      <TouchableOpacity
        style={squareStyle}
        onPress={handlePress}
        onLongPress={handleLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
        delayLongPress={500} // 500ms for long press
        testID={`square-${position.row}-${position.col}`}
        accessibilityLabel={
          boardSize 
            ? `${AccessibilityService.getBoardPositionLabel(position, boardSize)}${
                stack ? `, ${AccessibilityService.getStackLabel(stack.stones, stack.controlledBy)}` : ', empty'
              }`
            : `Board square at row ${position.row + 1}, column ${position.col + 1}${
                stack ? ` with ${stack.stones.length} stone${stack.stones.length > 1 ? 's' : ''}` : ' empty'
              }`
        }
        accessibilityRole="button"
        accessibilityHint={
          gamePhase && currentPlayer
            ? AccessibilityService.getSquareHint(position, stack?.stones || null, isHighlighted || isValidTarget, gamePhase, currentPlayer)
            : stack 
              ? "Tap to select stack, long press for move options"
              : isValidTarget 
                ? "Tap to place stone here"
                : "Empty square"
        }
      >
      {/* Wood grain texture overlay */}
      <View style={[styles.textureOverlay, { opacity: 0.1 }]} />
      
      {/* Stack component if present */}
      {stack && (
        <View style={styles.stackContainer}>
          <StackComponent
            stack={stack}
            isSelected={isSelected}
            isHighlighted={isHighlighted}
            size={squareSize * 0.7} // Stack size relative to square
            onPress={onPress}
            onLongPress={onLongPress}
            animatingStoneId={animationState === 'placing' ? stack.stones[stack.stones.length - 1]?.id : undefined}
          />
        </View>
      )}
      
      {/* Valid target indicator for empty squares */}
      {!stack && isValidTarget && (
        <View style={[
          styles.targetIndicator,
          {
            width: scaleWidth(12),
            height: scaleWidth(12),
            borderRadius: scaleWidth(6),
            backgroundColor: Colors.text,
            opacity: 0.6,
          }
        ]} />
      )}
      
      {/* Highlight pulse effect for selected squares */}
      {isSelected && (
        <View style={[
          styles.pulseEffect,
          {
            borderColor: Colors.accent,
            borderWidth: scaleWidth(2),
            borderRadius: scaleWidth(4),
          }
        ]} />
      )}
      
      {/* Press feedback overlay */}
      {isPressed && (
        <View style={[
          styles.pressOverlay,
          {
            backgroundColor: Colors.text,
            opacity: 0.1,
            borderRadius: scaleWidth(2),
          }
        ]} />
      )}
      
      {/* Invalid move overlay */}
      <Animated.View
        style={[
          styles.invalidOverlay,
          {
            backgroundColor: Colors.warning,
            opacity: invalidOverlayOpacity,
            borderRadius: scaleWidth(2),
          }
        ]}
        pointerEvents="none"
      />
      </TouchableOpacity>
    </Animated.View>
  );
});

Square.displayName = 'Square';

const styles = StyleSheet.create({
  square: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'solid',
  },
  
  textureOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#8B4513', // Wood brown
    opacity: 0.1,
  },
  
  stackContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  targetIndicator: {
    position: 'absolute',
  },
  
  pulseEffect: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderStyle: 'dashed',
  },
  
  pressOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  
  invalidOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});