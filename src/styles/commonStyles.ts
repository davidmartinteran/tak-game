import { StyleSheet } from 'react-native';
import { Theme } from '../constants/theme';

/**
 * Common styles used throughout the app
 */
export const CommonStyles = StyleSheet.create({
  // Layout styles
  flex1: {
    flex: 1,
  },
  
  flexRow: {
    flexDirection: 'row',
  },
  
  flexColumn: {
    flexDirection: 'column',
  },
  
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  centerHorizontal: {
    alignItems: 'center',
  },
  
  centerVertical: {
    justifyContent: 'center',
  },
  
  spaceBetween: {
    justifyContent: 'space-between',
  },
  
  spaceAround: {
    justifyContent: 'space-around',
  },
  
  // Container styles
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  
  surface: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.sizing.radiusMedium,
  },
  
  card: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.sizing.radiusMedium,
    padding: Theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  // Text styles
  textTitle: {
    ...Theme.typography.title,
    color: Theme.colors.text,
  },
  
  textSubtitle: {
    ...Theme.typography.subtitle,
    color: Theme.colors.text,
  },
  
  textBody: {
    ...Theme.typography.body,
    color: Theme.colors.text,
  },
  
  textCaption: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
  },
  
  textSmall: {
    ...Theme.typography.small,
    color: Theme.colors.textSecondary,
  },
  
  // Border styles
  border: {
    borderWidth: Theme.sizing.borderThin,
    borderColor: Theme.colors.border,
  },
  
  borderRadius: {
    borderRadius: Theme.sizing.radiusMedium,
  },
  
  // Shadow styles
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  // Accessibility styles
  accessibleTouchTarget: {
    minHeight: Theme.sizing.touchTarget,
    minWidth: Theme.sizing.touchTarget,
  },
});