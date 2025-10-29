import React, { useEffect, useRef, useCallback } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Colors } from "../../../constants/colors";
import { scaleWidth, scaleHeight, scaleFontSize } from "../../../utils/responsive";

export interface ToastProps {
  visible: boolean;
  message: string;
  type?: "info" | "success" | "warning" | "error";
  duration?: number;
  onHide?: () => void;
}

export const Toast: React.FC<ToastProps> = React.memo(function Toast({
  visible,
  message,
  type = "info",
  duration = 3000,
  onHide,
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;

  const hideToast = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide?.();
    });
  }, [fadeAnim, slideAnim, onHide]);

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      hideToast();
    }
  }, [visible, duration, fadeAnim, slideAnim, hideToast]);

  const getToastColor = () => {
    switch (type) {
      case "success":
        return Colors.success;
      case "warning":
        return Colors.accent;
      case "error":
        return Colors.warning;
      default:
        return Colors.highlight;
    }
  };

  const getToastIcon = () => {
    switch (type) {
      case "success":
        return "✓";
      case "warning":
        return "⚠";
      case "error":
        return "✗";
      default:
        return "ℹ";
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          backgroundColor: getToastColor(),
        },
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>{getToastIcon()}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: scaleHeight(60),
    left: scaleWidth(16),
    right: scaleWidth(16),
    borderRadius: 8,
    paddingHorizontal: scaleWidth(16),
    paddingVertical: scaleHeight(12),
    zIndex: 1000,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },

  content: {
    flexDirection: "row",
    alignItems: "center",
  },

  icon: {
    fontSize: scaleFontSize(16),
    color: Colors.background,
    marginRight: scaleWidth(8),
    fontWeight: "bold",
  },

  message: {
    flex: 1,
    fontSize: scaleFontSize(14),
    color: Colors.background,
    fontWeight: "500",
    lineHeight: scaleFontSize(18),
  },
});
