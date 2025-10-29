import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Theme } from '../../../constants/theme';
import { scaleFontSize } from '../../../utils/responsive';

export interface HUDProps {
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  accessibilityLabel?: string;
  testID?: string;
}

export const HUD: React.FC<HUDProps> = React.memo(({
  children,
  position = 'top',
  style,
  contentStyle,
  accessibilityLabel,
  testID,
}) => {
  const containerStyle = [
    styles.container,
    styles[position],
    style,
  ];

  const contentStyleCombined = [
    styles.content,
    contentStyle,
  ];

  return (
    <View
      style={containerStyle}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      <View style={contentStyleCombined}>
        {children}
      </View>
    </View>
  );
});

export interface HUDItemProps {
  label: string;
  value: string | number;
  variant?: 'default' | 'highlight' | 'warning';
  style?: ViewStyle;
  labelStyle?: TextStyle;
  valueStyle?: TextStyle;
  accessibilityLabel?: string;
  testID?: string;
}

export const HUDItem: React.FC<HUDItemProps> = React.memo(({
  label,
  value,
  variant = 'default',
  style,
  labelStyle,
  valueStyle,
  accessibilityLabel,
  testID,
}) => {
  return (
    <View
      style={[styles.item, style]}
      accessibilityLabel={accessibilityLabel || `${label}: ${value}`}
      testID={testID}
    >
      <Text style={[styles.label, labelStyle]}>
        {label}
      </Text>
      <Text style={[
        styles.value,
        styles[`${variant}Value`],
        valueStyle,
      ]}>
        {value}
      </Text>
    </View>
  );
});

export interface HUDSeparatorProps {
  style?: ViewStyle;
}

export const HUDSeparator: React.FC<HUDSeparatorProps> = React.memo(({ style }) => {
  return <View style={[styles.separator, style]} />;
});

HUD.displayName = 'HUD';
HUDItem.displayName = 'HUDItem';
HUDSeparator.displayName = 'HUDSeparator';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 100,
  },
  
  // Positions
  top: {
    top: 0,
    left: 0,
    right: 0,
  },
  
  bottom: {
    bottom: 0,
    left: 0,
    right: 0,
  },
  
  left: {
    left: 0,
    top: 0,
    bottom: 0,
  },
  
  right: {
    right: 0,
    top: 0,
    bottom: 0,
  },
  
  content: {
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.md,
    margin: Theme.spacing.sm,
    borderRadius: Theme.sizing.radiusMedium,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Theme.spacing.xs,
  },
  
  label: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    fontSize: scaleFontSize(Theme.typography.caption.fontSize),
    flex: 1,
  },
  
  value: {
    ...Theme.typography.body,
    fontSize: scaleFontSize(Theme.typography.body.fontSize),
    fontWeight: '600',
    marginLeft: Theme.spacing.sm,
  },
  
  defaultValue: {
    color: Theme.colors.text,
  },
  
  highlightValue: {
    color: Theme.colors.highlight,
  },
  
  warningValue: {
    color: Theme.colors.warning,
  },
  
  separator: {
    height: 1,
    backgroundColor: Theme.colors.border,
    marginVertical: Theme.spacing.xs,
  },
}); 