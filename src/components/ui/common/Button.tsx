import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from "react-native";
import { Theme } from "../../../constants/theme";
import { scaleFontSize } from "../../../utils/responsive";

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

export const Button: React.FC<ButtonProps> = React.memo(({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  style,
  textStyle,
  accessibilityLabel,
  accessibilityHint,
  testID,
}) => {
  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[`${size}Size`],
    disabled && styles.disabled,
    style,
  ];

  const textStyleCombined = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading }}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === "primary"
              ? Theme.colors.background
              : Theme.colors.accent
          }
        />
      ) : (
        <Text style={textStyleCombined} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.8}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
});

Button.displayName = 'Button';

const styles = StyleSheet.create({
  base: {
    borderRadius: Theme.sizing.radiusMedium,
    justifyContent: "center",
    alignItems: "center",
    minHeight: Theme.sizing.touchTarget,
  },

  // Variants
  primary: {
    backgroundColor: Theme.colors.accent,
  },

  secondary: {
    backgroundColor: Theme.colors.surface,
    borderWidth: Theme.sizing.borderThin,
    borderColor: Theme.colors.border,
  },

  outline: {
    backgroundColor: "transparent",
    borderWidth: Theme.sizing.borderThin,
    borderColor: Theme.colors.accent,
  },

  ghost: {
    backgroundColor: "transparent",
  },

  // Sizes
  smallSize: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    minHeight: Theme.sizing.minTouchTarget,
  },

  mediumSize: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
  },

  largeSize: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    minHeight: Theme.sizing.touchTarget + 8,
  },

  // Disabled state
  disabled: {
    opacity: 0.5,
  },

  // Text styles
  text: {
    textAlign: "center",
    fontWeight: "600",
  },

  primaryText: {
    color: Theme.colors.background,
    fontSize: scaleFontSize(Theme.typography.body.fontSize),
  },

  secondaryText: {
    color: Theme.colors.text,
    fontSize: scaleFontSize(Theme.typography.body.fontSize),
  },

  outlineText: {
    color: Theme.colors.accent,
    fontSize: scaleFontSize(Theme.typography.body.fontSize),
  },

  ghostText: {
    color: Theme.colors.text,
    fontSize: scaleFontSize(Theme.typography.body.fontSize),
  },

  smallText: {
    fontSize: scaleFontSize(Theme.typography.caption.fontSize),
  },

  mediumText: {
    fontSize: scaleFontSize(Theme.typography.body.fontSize),
  },

  largeText: {
    fontSize: scaleFontSize(Theme.typography.subtitle.fontSize),
  },

  disabledText: {
    color: Theme.colors.disabled,
  },
});