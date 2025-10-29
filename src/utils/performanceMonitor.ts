/**
 * Performance monitoring utilities for tracking app performance
 */
import React from 'react';

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private isEnabled: boolean = process.env.NODE_ENV === 'development';

  /**
   * Start measuring a performance metric
   */
  start(name: string, metadata?: Record<string, any>): void {
    if (!this.isEnabled) return;

    this.metrics.set(name, {
      name,
      startTime: performance.now(),
      metadata,
    });
  }

  /**
   * End measuring a performance metric
   */
  end(name: string): number | null {
    if (!this.isEnabled) return null;

    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`Performance metric "${name}" was not started`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;

    metric.endTime = endTime;
    metric.duration = duration;

    // Log performance metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance: ${name} took ${duration.toFixed(2)}ms`, metric.metadata);
    }

    return duration;
  }

  /**
   * Measure a function execution time
   */
  measure<T>(name: string, fn: () => T, metadata?: Record<string, any>): T {
    this.start(name, metadata);
    const result = fn();
    this.end(name);
    return result;
  }

  /**
   * Measure an async function execution time
   */
  async measureAsync<T>(
    name: string, 
    fn: () => Promise<T>, 
    metadata?: Record<string, any>
  ): Promise<T> {
    this.start(name, metadata);
    const result = await fn();
    this.end(name);
    return result;
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values()).filter(metric => metric.duration !== undefined);
  }

  /**
   * Get a specific metric
   */
  getMetric(name: string): PerformanceMetric | undefined {
    return this.metrics.get(name);
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
  }

  /**
   * Get performance summary
   */
  getSummary(): {
    totalMetrics: number;
    averageDuration: number;
    slowestMetric: PerformanceMetric | null;
    fastestMetric: PerformanceMetric | null;
  } {
    const completedMetrics = this.getMetrics();
    
    if (completedMetrics.length === 0) {
      return {
        totalMetrics: 0,
        averageDuration: 0,
        slowestMetric: null,
        fastestMetric: null,
      };
    }

    const durations = completedMetrics.map(m => m.duration!);
    const totalDuration = durations.reduce((sum, duration) => sum + duration, 0);
    const averageDuration = totalDuration / durations.length;

    const slowestMetric = completedMetrics.reduce((slowest, current) => 
      (current.duration! > slowest.duration!) ? current : slowest
    );

    const fastestMetric = completedMetrics.reduce((fastest, current) => 
      (current.duration! < fastest.duration!) ? current : fastest
    );

    return {
      totalMetrics: completedMetrics.length,
      averageDuration,
      slowestMetric,
      fastestMetric,
    };
  }

  /**
   * Enable or disable performance monitoring
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Check if performance monitoring is enabled
   */
  isMonitoringEnabled(): boolean {
    return this.isEnabled;
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Higher-order component to measure component render performance
 */
export function withPerformanceMonitoring<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) {
  const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Component';
  
  const PerformanceWrappedComponent = React.memo((props: P) => {
    const renderStartTime = React.useRef<number>(0);
    
    // Measure render start
    renderStartTime.current = performance.now();
    
    React.useEffect(() => {
      // Measure render completion
      const renderEndTime = performance.now();
      const renderDuration = renderEndTime - renderStartTime.current;
      
      if (process.env.NODE_ENV === 'development' && renderDuration > 16) { // Log slow renders (>16ms for 60fps)
        console.warn(`Slow render detected: ${displayName} took ${renderDuration.toFixed(2)}ms`);
      }
    });
    
    return React.createElement(WrappedComponent, props);
  });
  
  PerformanceWrappedComponent.displayName = `withPerformanceMonitoring(${displayName})`;
  
  return PerformanceWrappedComponent;
}

/**
 * Hook to measure component lifecycle performance
 */
export function usePerformanceMonitoring(componentName: string) {
  const mountTime = React.useRef<number>(0);
  const renderCount = React.useRef<number>(0);
  
  React.useEffect(() => {
    // Component mounted
    mountTime.current = performance.now();
    performanceMonitor.start(`${componentName}_mount`);
    
    return () => {
      // Component unmounted
      performanceMonitor.end(`${componentName}_mount`);
    };
  }, [componentName]);
  
  React.useEffect(() => {
    // Component rendered
    renderCount.current += 1;
    
    if (process.env.NODE_ENV === 'development' && renderCount.current > 10) {
      console.warn(`High render count detected: ${componentName} has rendered ${renderCount.current} times`);
    }
  });
  
  return {
    renderCount: renderCount.current,
    getMountDuration: () => {
      const metric = performanceMonitor.getMetric(`${componentName}_mount`);
      return metric?.duration || null;
    },
  };
}

/**
 * Performance benchmarking utilities
 */
const budgets = {
  componentRender: 16, // 60fps = 16.67ms per frame
  animationFrame: 16,
  userInteraction: 100, // Response to user input
  pageLoad: 2000, // Initial page load
  apiCall: 1000, // Network requests
} as const;

export const performanceBenchmarks = {
  /**
   * Target performance budgets (in milliseconds)
   */
  budgets,

  /**
   * Check if a duration meets the performance budget
   */
  meetsTarget(duration: number, target: keyof typeof budgets): boolean {
    return duration <= budgets[target];
  },

  /**
   * Get performance grade based on duration and target
   */
  getGrade(duration: number, target: keyof typeof budgets): 'excellent' | 'good' | 'poor' {
    const budget = budgets[target];
    
    if (duration <= budget) return 'excellent';
    if (duration <= budget * 1.5) return 'good';
    return 'poor';
  },
};

/**
 * Memory usage monitoring
 */
export const memoryMonitor = {
  /**
   * Get current memory usage (if available)
   */
  getCurrentUsage(): number | null {
    if ((performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return null;
  },

  /**
   * Monitor memory usage over time
   */
  startMonitoring(intervalMs: number = 5000): () => void {
    const measurements: number[] = [];
    
    const interval = setInterval(() => {
      const usage = this.getCurrentUsage();
      if (usage !== null) {
        measurements.push(usage);
        
        if (process.env.NODE_ENV === 'development' && measurements.length > 1) {
          const previous = measurements[measurements.length - 2];
          const increase = usage - previous;
          
          if (increase > 5 * 1024 * 1024) { // 5MB increase
            console.warn(`Memory usage increased by ${(increase / 1024 / 1024).toFixed(2)}MB`);
          }
        }
      }
    }, intervalMs);
    
    return () => {
      clearInterval(interval);
      if (process.env.NODE_ENV === 'development') {
        console.log('Memory monitoring stopped. Measurements:', measurements.length);
      }
    };
  },
};

// Export default instance
export default performanceMonitor;