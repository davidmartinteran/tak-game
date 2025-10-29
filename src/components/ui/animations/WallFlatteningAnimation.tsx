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
import { Stone, StoneType, Position } from '../../../types';

export interface WallFlatteningAnimationProps {
  wallStone: Stone;
  position: Position;
  squareSize: number;
  onAnimationComplete?: () => void;
}

export const WallFlatteningAnimation: React.FC<WallFlatteningAnimationProps> = ({
  wallStone,
  position,
  squareSize,
  onAnimationComplete,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const rotation = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    // Animation sequence: rotate, scale down, then transform
    rotation.value = withSequence(
      withTiming(0, { duration: 0 }),
      withTiming(90, { duration: 300, easing: Easing.out(Easing.cubic) }),
      withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) })
    );

    scale.value = withSequence(
      withTiming(1, { duration: 0 }),
      withTiming(1.2, { duration: 200, easing: Easing.out(Easing.cubic) }),
      withTiming(1, { duration: 200, easing: Easing.out(Easing.cubic) })
    );

    glowOpacity.value = withSequence(
      withTiming(1, { duration: 200 }),
      withTiming(0, { duration: 400 }, () => {
        // Animation complete
        if (onAnimationComplete) {
          runOnJS(onAnimationComplete)();
        }
      })
    );

    opacity.value = withTiming(1, { duration: 600 });
  }, [onAnimationComplete, scale, rotation, glowOpacity, opacity]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotate: `${rotation.value}deg` },
      ],
      opacity: opacity.value,
    };
  });

  const glowStyle = useAnimatedStyle(() => {
    return {
      opacity: glowOpacity.value,
    };
  });

  // Transform the wall stone to a flat stone
  const transformedStone: Stone = {
    ...wallStone,
    type: StoneType.FLAT, // Changed from WALL to FLAT
  };

  const stoneSize = squareSize * 0.8;

  return (
    <View style={[styles.container, { width: squareSize, height: squareSize }]}>
      {/* Glow effect */}
      <Animated.View style={[styles.glowEffect, glowStyle]}>
        <View style={[styles.glow, { width: stoneSize * 1.5, height: stoneSize * 1.5 }]} />
      </Animated.View>

      {/* Animated stone */}
      <Animated.View style={[styles.stoneContainer, animatedStyle]}>
        <StoneComponent
          stone={transformedStone}
          stackIndex={0}
          isTopStone={true}
          size={stoneSize}
          animationState="type-changing"
        />
      </Animated.View>

      {/* Particle effects */}
      <View style={styles.particleContainer}>
        {[...Array(8)].map((_, index) => (
          <View
            key={`particle-${index}`}
            style={[
              styles.particle,
              {
                transform: [
                  { rotate: `${index * 45}deg` },
                  { translateY: -stoneSize * 0.6 },
                ],
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

WallFlatteningAnimation.displayName = 'WallFlatteningAnimation';

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  stoneContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowEffect: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    backgroundColor: 'rgba(255, 215, 0, 0.5)',
    borderRadius: 1000,
    shadowColor: '#ffd700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  particleContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    backgroundColor: '#ffd700',
    borderRadius: 2,
  },
});

export default WallFlatteningAnimation;
