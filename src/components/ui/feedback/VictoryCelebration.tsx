import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Player } from '../../../types';
import { Colors } from '../../../constants/colors';

export interface VictoryCelebrationProps {
  visible: boolean;
  winner: Player | 'draw' | null;
  onAnimationComplete?: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const VictoryCelebration: React.FC<VictoryCelebrationProps> = ({
  visible,
  winner,
  onAnimationComplete,
}) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Start celebration animation
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSequence(
        withTiming(1.2, { duration: 400, easing: Easing.out(Easing.back(1.7)) }),
        withTiming(1, { duration: 200 })
      );

      // Auto-hide after animation
      const timer = setTimeout(() => {
        opacity.value = withTiming(0, { duration: 500 }, () => {
          if (onAnimationComplete) {
            runOnJS(onAnimationComplete)();
          }
        });
        scale.value = withTiming(0.8, { duration: 500 });
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      opacity.value = 0;
      scale.value = 0;
    }
  }, [visible, opacity, scale, onAnimationComplete]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (!visible || !winner) return null;

  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.container, containerStyle]}>
        {/* Confetti particles */}
        {Array.from({ length: 20 }).map((_, index) => (
          <ConfettiParticle
            key={index}
            index={index}
            winner={winner}
            visible={visible}
          />
        ))}
        
        {/* Victory burst effect */}
        <VictoryBurst visible={visible} winner={winner} />
      </Animated.View>
    </View>
  );
};

interface ConfettiParticleProps {
  index: number;
  winner: Player | 'draw';
  visible: boolean;
}

const ConfettiParticle: React.FC<ConfettiParticleProps> = ({ index, winner, visible }) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      const delay = index * 50;
      const angle = (index * 18) * (Math.PI / 180); // Spread particles in circle
      const distance = 100 + Math.random() * 150;
      const targetX = Math.cos(angle) * distance;
      const targetY = Math.sin(angle) * distance - 50; // Slight upward bias

      opacity.value = withDelay(delay, withTiming(1, { duration: 200 }));
      translateX.value = withDelay(
        delay,
        withTiming(targetX, { duration: 1000 + Math.random() * 500, easing: Easing.out(Easing.quad) })
      );
      translateY.value = withDelay(
        delay,
        withTiming(targetY, { duration: 1000 + Math.random() * 500, easing: Easing.out(Easing.quad) })
      );
      rotation.value = withDelay(
        delay,
        withRepeat(
          withTiming(360, { duration: 1000 + Math.random() * 500 }),
          -1,
          false
        )
      );

      // Fade out
      setTimeout(() => {
        opacity.value = withTiming(0, { duration: 500 });
      }, 1500 + delay);
    }
  }, [visible, index, translateX, translateY, rotation, opacity]);

  const particleStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  const getParticleColor = (): string => {
    if (winner === 'draw') {
      return index % 2 === 0 ? Colors.player1 : Colors.player2;
    }
    return winner === Player.PLAYER1 ? Colors.player1 : Colors.player2;
  };

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          backgroundColor: getParticleColor(),
        },
        particleStyle,
      ]}
    />
  );
};

interface VictoryBurstProps {
  visible: boolean;
  winner: Player | 'draw';
}

const VictoryBurst: React.FC<VictoryBurstProps> = ({ visible, winner }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSequence(
        withTiming(0.5, { duration: 100 }),
        withTiming(2, { duration: 400, easing: Easing.out(Easing.quad) }),
        withTiming(2.5, { duration: 300 })
      );
      opacity.value = withSequence(
        withTiming(0.8, { duration: 200 }),
        withDelay(400, withTiming(0, { duration: 600 }))
      );
    }
  }, [visible, scale, opacity]);

  const burstStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const getBurstColor = (): string => {
    if (winner === 'draw') {
      return Colors.accent;
    }
    return winner === Player.PLAYER1 ? Colors.player1 : Colors.player2;
  };

  return (
    <Animated.View
      style={[
        styles.burst,
        {
          borderColor: getBurstColor(),
        },
        burstStyle,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
    zIndex: 1000,
  },

  container: {
    width: screenWidth,
    height: screenHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  burst: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    backgroundColor: 'transparent',
  },
});