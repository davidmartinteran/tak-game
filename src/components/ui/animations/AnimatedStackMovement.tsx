import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Stone as StoneComponent } from '../board/Stone';
import { Stone, Position } from '../../../types';

export interface AnimatedStackMovementProps {
  movingStones: Stone[];
  fromPosition: Position;
  toPosition: Position;
  path: Position[];
  dropPattern: number[];
  squareSize: number;
  boardSize: number;
  onAnimationComplete?: () => void;
  onStoneDropped?: () => void;
  onWallFlattened?: () => void;
}

export const AnimatedStackMovement: React.FC<AnimatedStackMovementProps> = ({
  movingStones,
  fromPosition,
  toPosition,
  path,
  dropPattern,
  squareSize,
  boardSize,
  onAnimationComplete,
  onStoneDropped,
  onWallFlattened,
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    // Calculate movement
    const fromX = fromPosition.col * squareSize;
    const fromY = fromPosition.row * squareSize;
    const toX = toPosition.col * squareSize;
    const toY = toPosition.row * squareSize;

    const deltaX = toX - fromX;
    const deltaY = toY - fromY;

    // Animate movement
    translateX.value = withSequence(
      withTiming(0, { duration: 0 }),
      withTiming(deltaX, {
        duration: 600,
        easing: Easing.out(Easing.cubic),
      })
    );

    translateY.value = withSequence(
      withTiming(0, { duration: 0 }),
      withTiming(deltaY, {
        duration: 600,
        easing: Easing.out(Easing.cubic),
      }, () => {
        // Animation complete
        if (onAnimationComplete) {
          runOnJS(onAnimationComplete)();
        }
      })
    );

    // Trigger stone dropped callbacks along the path
    if (onStoneDropped) {
      dropPattern.forEach((count, index) => {
        if (count > 0) {
          setTimeout(() => {
            onStoneDropped();
          }, (index + 1) * (600 / path.length));
        }
      });
    }
  }, [fromPosition, toPosition, path, dropPattern, squareSize, onAnimationComplete, onStoneDropped, translateX, translateY]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
      opacity: opacity.value,
    };
  });

  // Calculate starting position
  const startX = fromPosition.col * squareSize;
  const startY = fromPosition.row * squareSize;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.movingStack,
          animatedStyle,
          {
            left: startX,
            top: startY,
            width: squareSize,
            height: squareSize,
          },
        ]}
      >
        {/* Render moving stones */}
        {movingStones.map((stone, index) => (
          <View
            key={stone.id || `moving-${index}`}
            style={[styles.stoneContainer, { bottom: index * 3 }]}
          >
            <StoneComponent
              stone={stone}
              stackIndex={index}
              isTopStone={index === movingStones.length - 1}
              size={squareSize * 0.8}
              animationState="moving"
            />
          </View>
        ))}

        {/* Movement trail effect */}
        <View style={styles.trail} />
      </Animated.View>
    </View>
  );
};

AnimatedStackMovement.displayName = 'AnimatedStackMovement';

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  movingStack: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stoneContainer: {
    position: 'absolute',
  },
  trail: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
  },
});

export default AnimatedStackMovement;
