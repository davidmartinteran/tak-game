import React, { useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  withSequence,
  runOnJS,
  interpolate,
  Extrapolation
} from 'react-native-reanimated';
import { Stone as StoneType, StoneType as StoneTypeEnum, Player } from '../../../types';
import { Colors } from '../../../constants/colors';
import { scaleWidth, scaleHeight } from '../../../utils/responsive';


export interface StoneProps {
  stone: StoneType;
  stackIndex: number;
  isTopStone: boolean;
  size?: number;
  animationState?: 'idle' | 'moving' | 'placing' | 'invalid' | 'type-changing';
  onAnimationComplete?: () => void;
}

/**
 * Stone component that renders different visual representations
 * for flat stones, walls, and capstones with player color coding and animations
 */
export const Stone: React.FC<StoneProps> = React.memo(({
  stone,
  stackIndex,
  isTopStone,
  size = 40,
  animationState = 'idle',
  onAnimationComplete,
}) => {
  const playerColor = stone.owner === Player.PLAYER1 ? Colors.player1 : Colors.player2;
  const stoneSize = scaleWidth(size);
  
  // Animation values with error handling - using Reanimated 3 for native performance
  // const { createValue } = useSafeAnimation(); // Unused variable
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);
  const previousStoneType = useRef(stone.type);

  // Safe animation completion callback
  const safeAnimationComplete = useCallback(() => {
    try {
      onAnimationComplete?.();
    } catch (error) {
      console.warn('Animation completion callback error:', error);
    }
  }, [onAnimationComplete]);
  
  // Handle animation state changes
  useEffect(() => {
    switch (animationState) {
      case 'placing':
        // Stone placement animation: scale up from 0 with bounce
        scale.value = 0;
        opacity.value = 0;
        translateY.value = -20;
        
        scale.value = withSequence(
          withSpring(1.2, { damping: 8, stiffness: 100 }),
          withSpring(1, { damping: 12, stiffness: 150 })
        );
        opacity.value = withTiming(1, { duration: 300 });
        translateY.value = withSpring(0, { damping: 10, stiffness: 100 }, () => {
          runOnJS(safeAnimationComplete)();
        });
        break;
        
      case 'type-changing':
        // Stone type change animation: brief scale and rotation
        scale.value = withSequence(
          withTiming(0.8, { duration: 150 }),
          withTiming(1.1, { duration: 150 }),
          withSpring(1, { damping: 12, stiffness: 150 })
        );
        rotation.value = withSequence(
          withTiming(10, { duration: 150 }),
          withTiming(-5, { duration: 150 }),
          withSpring(0, { damping: 12, stiffness: 150 }, () => {
            if (onAnimationComplete) {
              runOnJS(onAnimationComplete)();
            }
          })
        );
        break;
        
      case 'invalid':
        // Invalid move feedback: shake animation with red tint
        translateY.value = withSequence(
          withTiming(-5, { duration: 100 }),
          withTiming(5, { duration: 100 }),
          withTiming(-3, { duration: 100 }),
          withTiming(3, { duration: 100 }),
          withTiming(0, { duration: 100 }, () => {
            if (onAnimationComplete) {
              runOnJS(onAnimationComplete)();
            }
          })
        );
        break;
        
      case 'moving':
        // Moving state: slight scale down and opacity reduction
        scale.value = withSpring(0.95, { damping: 12, stiffness: 150 });
        opacity.value = withTiming(0.8, { duration: 200 });
        break;
        
      case 'idle':
      default:
        // Return to idle state
        scale.value = withSpring(1, { damping: 12, stiffness: 150 });
        opacity.value = withTiming(1, { duration: 200 });
        translateY.value = withSpring(0, { damping: 12, stiffness: 150 });
        rotation.value = withSpring(0, { damping: 12, stiffness: 150 });
        break;
    }
  }, [animationState, scale, opacity, translateY, rotation, onAnimationComplete, safeAnimationComplete]);
  
  // Track stone type changes for type-changing animation
  useEffect(() => {
    if (previousStoneType.current !== stone.type && previousStoneType.current !== undefined) {
      // Stone type changed, trigger type-changing animation if not already animating
      if (animationState === 'idle') {
        // This would typically be handled by the parent component
        // but we track it here for future enhancements
      }
    }
    previousStoneType.current = stone.type;
  }, [stone.type, animationState]);
  
  // Animated style for the container
  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateY: translateY.value },
        { rotate: `${rotation.value}deg` }
      ],
      opacity: opacity.value,
    };
  });
  
  // Invalid move overlay style
  const invalidOverlayStyle = useAnimatedStyle(() => {
    const redTintOpacity = animationState === 'invalid' 
      ? interpolate(
          Math.abs(translateY.value),
          [0, 5],
          [0, 0.3],
          Extrapolation.CLAMP
        )
      : 0;
    
    return {
      opacity: redTintOpacity,
    };
  });
  
  const renderFlatStone = () => (
    <Animated.View
      style={[
        styles.flatStone,
        {
          backgroundColor: playerColor,
          width: stoneSize,
          height: stoneSize,
          borderRadius: stoneSize * 0.1,
        },
      ]}
      accessibilityLabel={`${stone.owner} flat stone`}
      accessibilityRole="button"
    >
      {/* Inner circle for visual depth */}
      <View
        style={[
          styles.flatStoneInner,
          {
            backgroundColor: lightenColor(playerColor, 0.2),
            width: stoneSize * 0.7,
            height: stoneSize * 0.7,
            borderRadius: stoneSize * 0.35,
          },
        ]}
      />
      
      {/* Ownership indicator dot */}
      <View
        style={[
          styles.ownershipDot,
          {
            backgroundColor: darkenColor(playerColor, 0.3),
            width: stoneSize * 0.15,
            height: stoneSize * 0.15,
            borderRadius: stoneSize * 0.075,
          },
        ]}
      />
    </Animated.View>
  );
  
  const renderWall = () => (
    <Animated.View
      style={[
        styles.wall,
        {
          backgroundColor: playerColor,
          width: stoneSize * 0.85,
          height: stoneSize * 0.85,
          borderRadius: stoneSize * 0.08,
          transform: [{ rotate: '45deg' }],
        },
      ]}
      accessibilityLabel={`${stone.owner} wall`}
      accessibilityRole="button"
    >
      {/* Main wall surface with gradient effect */}
      <View
        style={[
          styles.wallSurface,
          {
            backgroundColor: lightenColor(playerColor, 0.15),
            width: stoneSize * 0.75,
            height: stoneSize * 0.75,
            borderRadius: stoneSize * 0.06,
          },
        ]}
      />
      
      {/* Inner diamond pattern */}
      <View
        style={[
          styles.wallInnerDiamond,
          {
            backgroundColor: lightenColor(playerColor, 0.3),
            width: stoneSize * 0.5,
            height: stoneSize * 0.5,
            borderRadius: stoneSize * 0.04,
          },
        ]}
      />
      
      {/* Center indicator dot */}
      <View
        style={[
          styles.wallCenterDot,
          {
            backgroundColor: darkenColor(playerColor, 0.4),
            width: stoneSize * 0.12,
            height: stoneSize * 0.12,
            borderRadius: stoneSize * 0.06,
          },
        ]}
      />
      
      {/* Corner accent marks */}
      <View style={styles.wallCornerAccents}>
        {[0, 1, 2, 3].map((index) => (
          <View
            key={index}
            style={[
              styles.cornerAccent,
              {
                backgroundColor: darkenColor(playerColor, 0.2),
                width: stoneSize * 0.08,
                height: stoneSize * 0.08,
                borderRadius: stoneSize * 0.04,
                position: 'absolute',
                ...(index === 0 && { top: stoneSize * 0.1, left: stoneSize * 0.1 }),
                ...(index === 1 && { top: stoneSize * 0.1, right: stoneSize * 0.1 }),
                ...(index === 2 && { bottom: stoneSize * 0.1, left: stoneSize * 0.1 }),
                ...(index === 3 && { bottom: stoneSize * 0.1, right: stoneSize * 0.1 }),
              },
            ]}
          />
        ))}
      </View>
    </Animated.View>
  );
  
  const renderCapstone = () => (
    <Animated.View
      style={[
        styles.capstone,
        {
          width: stoneSize,
          height: stoneSize,
        },
      ]}
      accessibilityLabel={`${stone.owner} capstone`}
      accessibilityRole="button"
    >
      {/* Outer tower ring (base) */}
      <View
        style={[
          styles.capstoneOuterRing,
          {
            backgroundColor: playerColor,
            width: stoneSize,
            height: stoneSize,
            borderRadius: stoneSize * 0.5,
          },
        ]}
      />
      
      {/* Middle tower ring */}
      <View
        style={[
          styles.capstoneMiddleRing,
          {
            backgroundColor: lightenColor(playerColor, 0.15),
            width: stoneSize * 0.8,
            height: stoneSize * 0.8,
            borderRadius: stoneSize * 0.4,
          },
        ]}
      />
      
      {/* Inner tower ring */}
      <View
        style={[
          styles.capstoneInnerRing,
          {
            backgroundColor: lightenColor(playerColor, 0.25),
            width: stoneSize * 0.6,
            height: stoneSize * 0.6,
            borderRadius: stoneSize * 0.3,
          },
        ]}
      />
      
      {/* Tower battlements (small notches around the edge) */}
      <View style={styles.capstoneBattlements}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => {
          const angle = (index * 45) * (Math.PI / 180); // 8 battlements at 45° intervals
          const radius = stoneSize * 0.42;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          return (
            <View
              key={index}
              style={[
                styles.battlement,
                {
                  backgroundColor: darkenColor(playerColor, 0.2),
                  width: stoneSize * 0.08,
                  height: stoneSize * 0.08,
                  borderRadius: stoneSize * 0.04,
                  position: 'absolute',
                  left: stoneSize * 0.5 + x - stoneSize * 0.04,
                  top: stoneSize * 0.5 + y - stoneSize * 0.04,
                },
              ]}
            />
          );
        })}
      </View>
      
      {/* Central crown jewel (yellow accent) */}
      <View
        style={[
          styles.capstoneJewel,
          {
            backgroundColor: Colors.accent,
            width: stoneSize * 0.2,
            height: stoneSize * 0.2,
            borderRadius: stoneSize * 0.1,
            borderWidth: 2,
            borderColor: darkenColor(playerColor, 0.3),
          },
        ]}
      />
      
      {/* Inner jewel highlight */}
      <View
        style={[
          styles.capstoneJewelInner,
          {
            backgroundColor: lightenColor(Colors.accent, 0.3),
            width: stoneSize * 0.12,
            height: stoneSize * 0.12,
            borderRadius: stoneSize * 0.06,
          },
        ]}
      />
    </Animated.View>
  );
  
  const renderStone = () => {
    switch (stone.type) {
      case StoneTypeEnum.FLAT:
        return renderFlatStone();
      case StoneTypeEnum.WALL:
        return renderWall();
      case StoneTypeEnum.CAPSTONE:
        return renderCapstone();
      default:
        return renderFlatStone();
    }
  };
  
  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: stoneSize,
          height: stoneSize * 1.5, // Max height to accommodate capstones
        },
        animatedContainerStyle,
      ]}
    >
      {renderStone()}
      
      {/* Invalid move overlay */}
      {animationState === 'invalid' && (
        <Animated.View
          style={[
            styles.invalidOverlay,
            {
              backgroundColor: Colors.warning,
            },
            invalidOverlayStyle,
          ]}
        />
      )}
    </Animated.View>
  );
});

Stone.displayName = 'Stone';

/**
 * Utility function to lighten a color
 */
const lightenColor = (color: string, amount: number): string => {
  // Simple color lightening - in a real app, you might use a color manipulation library
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  const newR = Math.min(255, Math.floor(r + (255 - r) * amount));
  const newG = Math.min(255, Math.floor(g + (255 - g) * amount));
  const newB = Math.min(255, Math.floor(b + (255 - b) * amount));
  
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
};

/**
 * Utility function to darken a color
 */
const darkenColor = (color: string, amount: number): string => {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  const newR = Math.max(0, Math.floor(r * (1 - amount)));
  const newG = Math.max(0, Math.floor(g * (1 - amount)));
  const newB = Math.max(0, Math.floor(b * (1 - amount)));
  
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Flat stone styles
  flatStone: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  
  flatStoneInner: {
    position: 'absolute',
  },
  
  ownershipDot: {
    position: 'absolute',
  },
  
  // Wall styles
  wall: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 4,
  },
  
  wallSurface: {
    position: 'absolute',
  },
  
  wallInnerDiamond: {
    position: 'absolute',
  },
  
  wallCenterDot: {
    position: 'absolute',
  },
  
  wallCornerAccents: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  
  cornerAccent: {
    // Individual corner accent styling handled inline
  },
  
  // Capstone styles
  capstone: {
    position: 'absolute',
    justifyContent: 'flex-end',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 6,
  },
  
  capstoneOuterRing: {
    position: 'absolute',
  },
  
  capstoneMiddleRing: {
    position: 'absolute',
  },
  
  capstoneInnerRing: {
    position: 'absolute',
  },
  
  capstoneBattlements: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  
  battlement: {
    // Individual battlement styling handled inline
  },
  
  capstoneJewel: {
    position: 'absolute',
  },
  
  capstoneJewelInner: {
    position: 'absolute',
  },
  
  // Invalid move overlay
  invalidOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 4,
  },
});