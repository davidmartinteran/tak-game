import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Theme } from '../../../constants/theme';
import { Button } from '../common/Button';
import { scaleFontSize, getScreenDimensions } from '../../../utils/responsive';

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  showCloseButton?: boolean;
  closeOnBackdropPress?: boolean;
  primaryAction?: {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  };
  secondaryAction?: {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  };
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  titleStyle?: TextStyle;
  accessibilityLabel?: string;
  testID?: string;
}

export const Modal: React.FC<ModalProps> = React.memo(({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  closeOnBackdropPress = true,
  primaryAction,
  secondaryAction,
  style,
  contentStyle,
  titleStyle,
  accessibilityLabel,
  testID,
}) => {
  const handleBackdropPress = () => {
    if (closeOnBackdropPress) {
      onClose();
    }
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      accessibilityViewIsModal
      testID={testID}
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View
              style={[styles.container, style]}
              accessibilityLabel={accessibilityLabel || title}
              accessibilityRole="none"
            >
              <View style={[styles.content, contentStyle]}>
                {/* Header */}
                {(title || showCloseButton) && (
                  <View style={styles.header}>
                    {title && (
                      <Text style={[styles.title, titleStyle]}>{title}</Text>
                    )}
                    {showCloseButton && (
                      <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                        accessibilityRole="button"
                        accessibilityLabel="Close modal"
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Text style={styles.closeButtonText}>×</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
                
                {/* Content */}
                {children && (
                  <View style={styles.body}>
                    {children}
                  </View>
                )}
                
                {/* Actions */}
                {(primaryAction || secondaryAction) && (
                  <View style={styles.actions}>
                    {secondaryAction && (
                      <Button
                        title={secondaryAction.title}
                        onPress={secondaryAction.onPress}
                        variant={secondaryAction.variant || 'outline'}
                        style={styles.actionButton}
                      />
                    )}
                    {primaryAction && (
                      <Button
                        title={primaryAction.title}
                        onPress={primaryAction.onPress}
                        variant={primaryAction.variant || 'primary'}
                        style={styles.actionButton}
                      />
                    )}
                  </View>
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
});

Modal.displayName = 'Modal';

const { width: screenWidth } = getScreenDimensions();

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Theme.colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.md,
  },
  
  container: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.sizing.radiusLarge,
    maxWidth: screenWidth * 0.9,
    width: '100%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  content: {
    padding: Theme.spacing.lg,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  
  title: {
    ...Theme.typography.title,
    color: Theme.colors.text,
    fontSize: scaleFontSize(Theme.typography.title.fontSize),
    flex: 1,
  },
  
  closeButton: {
    width: Theme.sizing.touchTarget,
    height: Theme.sizing.touchTarget,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Theme.spacing.sm,
  },
  
  closeButtonText: {
    fontSize: scaleFontSize(24),
    color: Theme.colors.textSecondary,
    fontWeight: '300',
  },
  
  body: {
    marginBottom: Theme.spacing.lg,
  },
  
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Theme.spacing.sm,
  },
  
  actionButton: {
    minWidth: 80,
  },
}); 