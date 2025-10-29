import React, { lazy, Suspense } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { Colors } from '../../constants/colors';

/**
 * Lazy-loaded components for better startup performance
 */

// Lazy load heavy UI components
export const LazyVictoryModal = lazy(() =>
  import('../ui/feedback/VictoryModal').then(m => ({ default: m.VictoryModal }))
);

export const LazyVictoryCelebration = lazy(() =>
  import('../ui/feedback/VictoryCelebration').then(m => ({ default: m.VictoryCelebration }))
);

export const LazyStackMovementAnimationManager = lazy(() =>
  import('../ui/animations/StackMovementAnimationManager').then(m => ({ default: m.StackMovementAnimationManager }))
);

export const LazyAnimatedStackMovement = lazy(() =>
  import('../ui/animations/AnimatedStackMovement').then(m => ({ default: m.AnimatedStackMovement }))
);

export const LazyWallFlatteningAnimation = lazy(() =>
  import('../ui/animations/WallFlatteningAnimation').then(m => ({ default: m.WallFlatteningAnimation }))
);

export const LazyMoveHistory = lazy(() =>
  import('../ui/hud/MoveHistory').then(m => ({ default: m.MoveHistory }))
);

export const LazyGamePersistenceSettings = lazy(() =>
  import('../ui/common/GamePersistenceSettings').then(m => ({ default: m.GamePersistenceSettings }))
);

// Loading fallback component
interface LoadingFallbackProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
}

export const LoadingFallback: React.FC<LoadingFallbackProps> = ({ 
  size = 'medium', 
  message = 'Loading...' 
}) => {
  const getSize = () => {
    switch (size) {
      case 'small': return 20;
      case 'large': return 40;
      default: return 30;
    }
  };

  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator
        size={getSize()}
        color={Colors.accent}
        testID="loading-indicator"
      />
      {message && (
        <View style={styles.messageContainer}>
          <Text style={styles.loadingMessage}>{message}</Text>
        </View>
      )}
    </View>
  );
};

LoadingFallback.displayName = 'LoadingFallback';

// Higher-order component for lazy loading with error boundary
interface WithLazyLoadingProps {
  fallback?: React.ComponentType<any>;
  errorFallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

export const withLazyLoading = <P extends object>(
  LazyComponent: React.LazyExoticComponent<React.ComponentType<P>>,
  options: WithLazyLoadingProps = {}
) => {
  const { 
    fallback: CustomFallback = LoadingFallback,
    errorFallback: CustomErrorFallback 
  } = options;

  const WrappedComponent = React.forwardRef<any, P>((props, ref) => {
    const [error, setError] = React.useState<Error | null>(null);
    const [retryCount, setRetryCount] = React.useState(0);

    const retry = React.useCallback(() => {
      setError(null);
      setRetryCount(prev => prev + 1);
    }, []);

    if (error && CustomErrorFallback) {
      return <CustomErrorFallback error={error} retry={retry} />;
    }

    return (
      <Suspense fallback={<CustomFallback />}>
        <LazyComponent 
          {...props} 
          ref={ref}
          key={retryCount} // Force remount on retry
          onError={setError}
        />
      </Suspense>
    );
  });
  
  WrappedComponent.displayName = `withLazyLoading(Component)`;
  return WrappedComponent;
};

// Preload components for better UX
export const preloadComponents = async () => {
  try {
    // Preload critical components that might be needed soon
    await Promise.all([
      import('../ui/feedback/VictoryModal').then(m => ({ default: m.VictoryModal })),
      import('../ui/animations/StackMovementAnimationManager').then(m => ({ default: m.StackMovementAnimationManager })),
    ]);
  } catch (error) {
    console.warn('Failed to preload some components:', error);
  }
};

// Component-specific lazy wrappers with optimized loading
export const LazyVictoryModalWithFallback = withLazyLoading(LazyVictoryModal, {
  fallback: () => <LoadingFallback size="large" message="Loading victory screen..." />,
});

export const LazyAnimationManagerWithFallback = withLazyLoading(LazyStackMovementAnimationManager, {
  fallback: () => <LoadingFallback size="small" message="" />,
});

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  messageContainer: {
    marginTop: 12,
  },

  loadingMessage: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
});

// Add display names for components
LoadingFallback.displayName = 'LoadingFallback';
withLazyLoading.displayName = 'withLazyLoading';
LazyVictoryModalWithFallback.displayName = 'LazyVictoryModalWithFallback';
LazyAnimationManagerWithFallback.displayName = 'LazyAnimationManagerWithFallback';