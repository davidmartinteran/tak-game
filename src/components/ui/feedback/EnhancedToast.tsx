import React, { useEffect, useRef, useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Colors } from "../../../constants/colors";
import { scaleWidth, scaleHeight, scaleFontSize } from "../../../utils/responsive";

export interface EnhancedToastProps {
  visible: boolean;
  message: string;
  type?: "info" | "success" | "warning" | "error";
  duration?: number;
  onHide?: () => void;
  actionButton?: {
    text: string;
    onPress: () => void;
  };
  suggestions?: string[];
  persistent?: boolean; // Don't auto-hide
  allowDismiss?: boolean; // Allow manual dismissal
}

export const EnhancedToast: React.FC<EnhancedToastProps> = ({
  visible,
  message,
  type = "info",
  duration = 3000,
  onHide,
  actionButton,
  suggestions = [],
  persistent = false,
  allowDismiss = true,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const [isExpanded, setIsExpanded] = useState(false);

  const hideToast = useCallback(() => {
    if (!allowDismiss && persistent) return;

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
      setIsExpanded(false);
      onHide?.();
    });
  }, [fadeAnim, slideAnim, onHide, allowDismiss, persistent]);

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

      // Auto hide after duration (unless persistent)
      if (!persistent && duration > 0) {
        const timer = setTimeout(() => {
          hideToast();
        }, duration);

        return () => clearTimeout(timer);
      }
    } else {
      hideToast();
    }
  }, [visible, duration, fadeAnim, slideAnim, hideToast, persistent]);

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

  const handleToastPress = () => {
    if (suggestions.length > 0) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleActionPress = () => {
    actionButton?.onPress();
    hideToast();
  };

  const handleDismiss = () => {
    if (allowDismiss) {
      hideToast();
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
      <TouchableOpacity
        style={styles.content}
        onPress={handleToastPress}
        activeOpacity={suggestions.length > 0 ? 0.7 : 1}
      >
        <View style={styles.mainContent}>
          <Text style={styles.icon}>{getToastIcon()}</Text>
          <View style={styles.textContainer}>
            <Text style={styles.message}>{message}</Text>
            {suggestions.length > 0 && (
              <Text style={styles.expandHint}>
                {isExpanded ? "Tap to collapse" : "Tap for suggestions"}
              </Text>
            )}
          </View>
          {allowDismiss && (
            <TouchableOpacity
              style={styles.dismissButton}
              onPress={handleDismiss}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.dismissText}>×</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Expanded suggestions */}
        {isExpanded && suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>Suggestions:</Text>
            <ScrollView
              style={styles.suggestionsList}
              showsVerticalScrollIndicator={false}
            >
              {suggestions.map((suggestion, index) => (
                <Text key={index} style={styles.suggestionItem}>
                  • {suggestion}
                </Text>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Action button */}
        {actionButton && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleActionPress}
          >
            <Text style={styles.actionButtonText}>{actionButton.text}</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: scaleHeight(60),
    left: scaleWidth(16),
    right: scaleWidth(16),
    borderRadius: 8,
    zIndex: 1000,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    maxHeight: scaleHeight(300),
  },

  content: {
    paddingHorizontal: scaleWidth(16),
    paddingVertical: scaleHeight(12),
  },

  mainContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  icon: {
    fontSize: scaleFontSize(16),
    color: Colors.background,
    marginRight: scaleWidth(8),
    fontWeight: "bold",
    marginTop: scaleHeight(2),
  },

  textContainer: {
    flex: 1,
  },

  message: {
    fontSize: scaleFontSize(14),
    color: Colors.background,
    fontWeight: "500",
    lineHeight: scaleFontSize(18),
  },

  expandHint: {
    fontSize: scaleFontSize(12),
    color: Colors.background,
    opacity: 0.8,
    marginTop: scaleHeight(4),
    fontStyle: "italic",
  },

  dismissButton: {
    marginLeft: scaleWidth(8),
    paddingHorizontal: scaleWidth(4),
  },

  dismissText: {
    fontSize: scaleFontSize(20),
    color: Colors.background,
    fontWeight: "bold",
    lineHeight: scaleFontSize(20),
  },

  suggestionsContainer: {
    marginTop: scaleHeight(12),
    paddingTop: scaleHeight(12),
    borderTopWidth: 1,
    borderTopColor: Colors.background,
    opacity: 0.9,
  },

  suggestionsTitle: {
    fontSize: scaleFontSize(13),
    color: Colors.background,
    fontWeight: "bold",
    marginBottom: scaleHeight(6),
  },

  suggestionsList: {
    maxHeight: scaleHeight(100),
  },

  suggestionItem: {
    fontSize: scaleFontSize(12),
    color: Colors.background,
    lineHeight: scaleFontSize(16),
    marginBottom: scaleHeight(2),
  },

  actionButton: {
    marginTop: scaleHeight(12),
    backgroundColor: Colors.background,
    paddingHorizontal: scaleWidth(16),
    paddingVertical: scaleHeight(8),
    borderRadius: 6,
    alignSelf: "flex-start",
  },

  actionButtonText: {
    fontSize: scaleFontSize(13),
    fontWeight: "bold",
    color: Colors.text,
  },
});
