import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors } from '../../../constants/colors';
import { scaleWidth, scaleHeight, scaleFontSize } from '../../../utils/responsive';

export interface LoadingStateProps {
  visible: boolean;
  message?: string;
  overlay?: boolean; // Show as overlay over existing content
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  visible,
  message = 'Loading...',
  overlay = false,
  size = 'medium',
  color = Colors.accent,
}) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const fadeValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Start spinning animation
      const spinAnimation = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      );

      // Fade in
      const fadeAnimation = Animated.timing(fadeValue, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      });

      spinAnimation.start();
      fadeAnimation.start();

      return () => {
        spinAnimation.stop();
      };
    } else {
      // Fade out
      Animated.timing(fadeValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, spinValue, fadeValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getSpinnerSize = () => {
    switch (size) {
      case 'small':
        return scaleWidth(20);
      case 'large':
        return scaleWidth(40);
      default:
        return scaleWidth(30);
    }
  };

  const getSpinnerBorderWidth = () => {
    switch (size) {
      case 'small':
        return 2;
      case 'large':
        return 4;
      default:
        return 3;
    }
  };

  if (!visible) {
    return null;
  }

  const content = (
    <Animated.View
      style={[
        styles.container,
        overlay && styles.overlay,
        { opacity: fadeValue },
      ]}
    >
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.spinner,
            {
              width: getSpinnerSize(),
              height: getSpinnerSize(),
              borderWidth: getSpinnerBorderWidth(),
              borderColor: color,
              borderTopColor: 'transparent',
              transform: [{ rotate: spin }],
            },
          ]}
        />
        {message && (
          <Text style={[styles.message, { color }]}>
            {message}
          </Text>
        )}
      </View>
    </Animated.View>
  );

  return content;
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: scaleWidth(20),
  },

  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },

  content: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: scaleWidth(20),
    minWidth: scaleWidth(120),
  },

  spinner: {
    borderRadius: 50,
    marginBottom: scaleHeight(12),
  },

  message: {
    fontSize: scaleFontSize(14),
    fontWeight: '500',
    textAlign: 'center',
  },
});