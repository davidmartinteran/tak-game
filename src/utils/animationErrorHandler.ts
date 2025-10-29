import React from 'react';
import { Animated, Text, View } from 'react-native';
import { reportError } from '../services/ErrorHandlingService';

/**
 * Utility functions for handling animation errors gracefully
 */

export interface AnimationConfig {
  fallbackValue?: number;
  onError?: (error: Error) => void;
  skipOnError?: boolean;
}

/**
 * Safely execute an animated timing with error handling
 */
export const safeAnimatedTiming = (
  value: Animated.Value,
  config: Animated.TimingAnimationConfig,
  animationConfig: AnimationConfig = {}
): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const animation = Animated.timing(value, {
        ...config,
        useNativeDriver: config.useNativeDriver ?? true,
      });

      animation.start((finished) => {
        if (finished) {
          resolve();
        } else {
          // Animation was interrupted, but this is not necessarily an error
          resolve();
        }
      });
    } catch (error) {
      const animationError = error instanceof Error ? error : new Error(String(error));
      
      // Report the error
      reportError(animationError, {
        component: 'AnimationHandler',
        action: 'animated_timing',
        additionalInfo: { config, animationConfig }
      }, 'low');

      // Handle fallback
      if (animationConfig.fallbackValue !== undefined) {
        try {
          value.setValue(animationConfig.fallbackValue);
        } catch (fallbackError) {
          console.warn('Failed to set fallback value:', fallbackError);
        }
      }

      // Call error handler if provided
      animationConfig.onError?.(animationError);

      if (animationConfig.skipOnError) {
        resolve(); // Continue as if animation completed
      } else {
        reject(animationError);
      }
    }
  });
};

/**
 * Safely execute parallel animations with error handling
 */
export const safeAnimatedParallel = (
  animations: Animated.CompositeAnimation[],
  animationConfig: AnimationConfig = {}
): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const parallelAnimation = Animated.parallel(animations);

      parallelAnimation.start((finished) => {
        if (finished) {
          resolve();
        } else {
          resolve(); // Interrupted but not an error
        }
      });
    } catch (error) {
      const animationError = error instanceof Error ? error : new Error(String(error));
      
      reportError(animationError, {
        component: 'AnimationHandler',
        action: 'animated_parallel',
        additionalInfo: { animationCount: animations.length, animationConfig }
      }, 'low');

      animationConfig.onError?.(animationError);

      if (animationConfig.skipOnError) {
        resolve();
      } else {
        reject(animationError);
      }
    }
  });
};

/**
 * Safely execute sequence animations with error handling
 */
export const safeAnimatedSequence = (
  animations: Animated.CompositeAnimation[],
  animationConfig: AnimationConfig = {}
): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const sequenceAnimation = Animated.sequence(animations);

      sequenceAnimation.start((finished) => {
        if (finished) {
          resolve();
        } else {
          resolve(); // Interrupted but not an error
        }
      });
    } catch (error) {
      const animationError = error instanceof Error ? error : new Error(String(error));
      
      reportError(animationError, {
        component: 'AnimationHandler',
        action: 'animated_sequence',
        additionalInfo: { animationCount: animations.length, animationConfig }
      }, 'low');

      animationConfig.onError?.(animationError);

      if (animationConfig.skipOnError) {
        resolve();
      } else {
        reject(animationError);
      }
    }
  });
};

/**
 * Safely create an animated value with error handling
 */
export const safeAnimatedValue = (
  initialValue: number,
  onError?: (error: Error) => void
): Animated.Value => {
  try {
    return new Animated.Value(initialValue);
  } catch (error) {
    const animationError = error instanceof Error ? error : new Error(String(error));
    
    reportError(animationError, {
      component: 'AnimationHandler',
      action: 'create_animated_value',
      additionalInfo: { initialValue }
    }, 'medium');

    onError?.(animationError);

    // Return a fallback animated value
    try {
      return new Animated.Value(0);
    } catch {
      // If even the fallback fails, return a mock object
      console.error('Critical animation error - returning mock animated value');
      return {
        setValue: () => {},
        addListener: () => ({ remove: () => {} }),
        removeListener: () => {},
        removeAllListeners: () => {},
        stopAnimation: () => {},
        resetAnimation: () => {},
        interpolate: () => ({ setValue: () => {} }),
      } as any;
    }
  }
};

/**
 * Wrapper for animation components to handle errors gracefully
 * Clean solution using React.createElement with proper typing for React Native
 */
export const withAnimationErrorHandling = <T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  componentName: string
): React.ForwardRefExoticComponent<React.PropsWithoutRef<T> & React.RefAttributes<any>> => {
  const WrappedComponent = React.forwardRef<any, T>((props, ref) => {
    try {
      // Use type assertion to satisfy TypeScript
      return React.createElement(Component, { ...props, ref } as any);
    } catch (error) {
      const animationError = error instanceof Error ? error : new Error(String(error));
      
      reportError(animationError, {
        component: componentName,
        action: 'render_animation_component'
      }, 'medium');

      // Return a React Native compatible fallback component
      
      return React.createElement(View, {
        style: {
          opacity: 0.5,
          flex: 1,
          justifyContent: 'center' as const,
          alignItems: 'center' as const,
        }
      }, React.createElement(Text, { style: { color: '#999' } }, 'Animation Error'));
    }
  });
  
  WrappedComponent.displayName = `withAnimationErrorHandling(${componentName})`;
  return WrappedComponent;
};

/**
 * Alternative solution with better error boundary pattern
 */
export const withAnimationErrorBoundary = <T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  componentName: string,
  FallbackComponent?: React.ComponentType<{ error: Error }>
): React.ForwardRefExoticComponent<React.PropsWithoutRef<T> & React.RefAttributes<any>> => {
  const WrappedComponent = React.forwardRef<any, T>((props, ref) => {
    const [error, setError] = React.useState<Error | null>(null);

    React.useEffect(() => {
      if (error) {
        reportError(error, {
          component: componentName,
          action: 'render_animation_component'
        }, 'medium');
      }
    }, [error]);

    if (error) {
      if (FallbackComponent) {
        return React.createElement(FallbackComponent, { error });
      }
      
      // Default React Native fallback
      return React.createElement(View, {
        style: {
          opacity: 0.5,
          flex: 1,
          justifyContent: 'center' as const,
          alignItems: 'center' as const,
        }
      }, React.createElement(Text, { style: { color: '#999' } }, 'Animation Error'));
    }

    try {
      return React.createElement(Component, { ...props, ref } as any);
    } catch (catchError) {
      const animationError = catchError instanceof Error ? catchError : new Error(String(catchError));
      setError(animationError);
      return null;
    }
  });

  WrappedComponent.displayName = `withAnimationErrorBoundary(${componentName})`;
  return WrappedComponent;
};

/**
 * Simple wrapper without forwardRef for components that don't need ref
 */
export const withAnimationErrorHandlingSimple = <T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  componentName: string
): React.ComponentType<T> => {
  const WrappedComponent: React.ComponentType<T> = (props: T) => {
    try {
      return React.createElement(Component, props);
    } catch (error) {
      const animationError = error instanceof Error ? error : new Error(String(error));
      
      reportError(animationError, {
        component: componentName,
        action: 'render_animation_component'
      }, 'medium');

      // Return a React Native compatible fallback component
      return React.createElement(View, {
        style: {
          opacity: 0.5,
          flex: 1,
          justifyContent: 'center' as const,
          alignItems: 'center' as const,
        }
      }, React.createElement(Text, { style: { color: '#999' } }, 'Animation Error'));
    }
  };
  
  WrappedComponent.displayName = `withAnimationErrorHandlingSimple(${componentName})`;
  return WrappedComponent;
};

/**
 * Hook for safely using animations in components
 */
export const useSafeAnimation = () => {
  const createValue = React.useCallback((initialValue: number) => {
    return safeAnimatedValue(initialValue);
  }, []);

  const timing = React.useCallback((
    value: Animated.Value,
    config: Animated.TimingAnimationConfig,
    animationConfig?: AnimationConfig
  ) => {
    return safeAnimatedTiming(value, config, animationConfig);
  }, []);

  const parallel = React.useCallback((
    animations: Animated.CompositeAnimation[],
    animationConfig?: AnimationConfig
  ) => {
    return safeAnimatedParallel(animations, animationConfig);
  }, []);

  const sequence = React.useCallback((
    animations: Animated.CompositeAnimation[],
    animationConfig?: AnimationConfig
  ) => {
    return safeAnimatedSequence(animations, animationConfig);
  }, []);

  return {
    createValue,
    timing,
    parallel,
    sequence,
  };
};