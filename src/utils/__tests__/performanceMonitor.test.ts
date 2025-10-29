import { performanceMonitor, performanceBenchmarks, memoryMonitor } from '../performanceMonitor';

describe('Performance Monitor', () => {
  beforeEach(() => {
    performanceMonitor.clear();
    performanceMonitor.setEnabled(true);
  });

  describe('Basic Functionality', () => {
    it('should start and end performance measurements', () => {
      performanceMonitor.start('test-metric');
      
      // Simulate some work
      for (let i = 0; i < 1000; i++) {
        Math.random();
      }
      
      const duration = performanceMonitor.end('test-metric');
      
      expect(duration).toBeGreaterThan(0);
      expect(typeof duration).toBe('number');
    });

    it('should measure function execution time', () => {
      const result = performanceMonitor.measure('test-function', () => {
        // Simulate work
        for (let i = 0; i < 1000; i++) {
          Math.random();
        }
        return 'test-result';
      });
      
      expect(result).toBe('test-result');
      
      const metric = performanceMonitor.getMetric('test-function');
      expect(metric).toBeDefined();
      expect(metric?.duration).toBeGreaterThan(0);
    });

    it('should measure async function execution time', async () => {
      const result = await performanceMonitor.measureAsync('test-async', async () => {
        // Simulate async work
        await new Promise(resolve => setTimeout(resolve, 10));
        return 'async-result';
      });

      expect(result).toBe('async-result');

      const metric = performanceMonitor.getMetric('test-async');
      expect(metric).toBeDefined();
      expect(metric?.duration).toBeGreaterThanOrEqual(9);
    });
  });

  describe('Metrics Management', () => {
    it('should store and retrieve metrics', () => {
      performanceMonitor.start('metric1');
      performanceMonitor.end('metric1');
      
      performanceMonitor.start('metric2');
      performanceMonitor.end('metric2');
      
      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toHaveLength(2);
      
      const metric1 = performanceMonitor.getMetric('metric1');
      expect(metric1).toBeDefined();
      expect(metric1?.name).toBe('metric1');
    });

    it('should clear all metrics', () => {
      performanceMonitor.start('test');
      performanceMonitor.end('test');
      
      expect(performanceMonitor.getMetrics()).toHaveLength(1);
      
      performanceMonitor.clear();
      
      expect(performanceMonitor.getMetrics()).toHaveLength(0);
    });

    it('should generate performance summary', () => {
      // Add multiple metrics
      performanceMonitor.measure('fast', () => {
        for (let i = 0; i < 100; i++) Math.random();
      });
      
      performanceMonitor.measure('slow', () => {
        for (let i = 0; i < 10000; i++) Math.random();
      });
      
      const summary = performanceMonitor.getSummary();
      
      expect(summary.totalMetrics).toBe(2);
      expect(summary.averageDuration).toBeGreaterThan(0);
      expect(summary.slowestMetric?.name).toBe('slow');
      expect(summary.fastestMetric?.name).toBe('fast');
    });
  });

  describe('Enable/Disable Functionality', () => {
    it('should respect enabled/disabled state', () => {
      performanceMonitor.setEnabled(false);
      
      performanceMonitor.start('disabled-test');
      const duration = performanceMonitor.end('disabled-test');
      
      expect(duration).toBeNull();
      expect(performanceMonitor.getMetrics()).toHaveLength(0);
    });

    it('should report monitoring state correctly', () => {
      expect(performanceMonitor.isMonitoringEnabled()).toBe(true);
      
      performanceMonitor.setEnabled(false);
      expect(performanceMonitor.isMonitoringEnabled()).toBe(false);
      
      performanceMonitor.setEnabled(true);
      expect(performanceMonitor.isMonitoringEnabled()).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle ending non-existent metrics gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const duration = performanceMonitor.end('non-existent');
      
      expect(duration).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('Performance metric "non-existent" was not started');
      
      consoleSpy.mockRestore();
    });
  });
});

describe('Performance Benchmarks', () => {
  describe('Budget Checking', () => {
    it('should correctly identify if duration meets target', () => {
      expect(performanceBenchmarks.meetsTarget(10, 'componentRender')).toBe(true);
      expect(performanceBenchmarks.meetsTarget(20, 'componentRender')).toBe(false);
      expect(performanceBenchmarks.meetsTarget(50, 'userInteraction')).toBe(true);
      expect(performanceBenchmarks.meetsTarget(150, 'userInteraction')).toBe(false);
    });

    it('should provide correct performance grades', () => {
      expect(performanceBenchmarks.getGrade(10, 'componentRender')).toBe('excellent');
      expect(performanceBenchmarks.getGrade(20, 'componentRender')).toBe('good');
      expect(performanceBenchmarks.getGrade(30, 'componentRender')).toBe('poor');
    });
  });

  describe('Budget Values', () => {
    it('should have reasonable budget values', () => {
      expect(performanceBenchmarks.budgets.componentRender).toBe(16);
      expect(performanceBenchmarks.budgets.animationFrame).toBe(16);
      expect(performanceBenchmarks.budgets.userInteraction).toBe(100);
      expect(performanceBenchmarks.budgets.pageLoad).toBe(2000);
      expect(performanceBenchmarks.budgets.apiCall).toBe(1000);
    });
  });
});

describe('Memory Monitor', () => {
  describe('Memory Usage', () => {
    it('should get current memory usage if available', () => {
      const usage = memoryMonitor.getCurrentUsage();
      
      // Memory API might not be available in test environment
      expect(usage === null || typeof usage === 'number').toBe(true);
    });

    it('should start and stop memory monitoring', () => {
      const stopMonitoring = memoryMonitor.startMonitoring(100);
      
      expect(typeof stopMonitoring).toBe('function');
      
      // Stop monitoring
      stopMonitoring();
      
      // Should not throw
      expect(true).toBe(true);
    });
  });
});

describe('Performance Integration', () => {
  it('should work with real-world scenarios', () => {
    // Clear any existing metrics
    performanceMonitor.clear();
    
    // Simulate component render
    performanceMonitor.measure('component-render', () => {
      // Simulate React component work
      const elements = [];
      for (let i = 0; i < 100; i++) {
        elements.push({ id: i, value: Math.random() });
      }
      return elements;
    });
    
    const renderMetric = performanceMonitor.getMetric('component-render');
    expect(renderMetric?.duration).toBeGreaterThan(0);
    expect(performanceBenchmarks.meetsTarget(renderMetric!.duration!, 'componentRender')).toBe(true);
    
    // Simulate user interaction
    performanceMonitor.measure('user-interaction', () => {
      // Simulate event handling
      for (let i = 0; i < 1000; i++) {
        Math.random();
      }
    });
    
    const interactionMetric = performanceMonitor.getMetric('user-interaction');
    expect(interactionMetric?.duration).toBeGreaterThan(0);
    expect(performanceBenchmarks.meetsTarget(interactionMetric!.duration!, 'userInteraction')).toBe(true);
  });

  it('should provide comprehensive performance insights', () => {
    // Clear any existing metrics
    performanceMonitor.clear();
    
    // Generate various performance metrics
    performanceMonitor.measure('fast-operation', () => {
      for (let i = 0; i < 10; i++) Math.random();
    });
    
    performanceMonitor.measure('medium-operation', () => {
      for (let i = 0; i < 1000; i++) Math.random();
    });
    
    performanceMonitor.measure('slow-operation', () => {
      for (let i = 0; i < 10000; i++) Math.random();
    });
    
    const summary = performanceMonitor.getSummary();
    
    expect(summary.totalMetrics).toBe(3);
    expect(summary.averageDuration).toBeGreaterThan(0);
    expect(summary.slowestMetric?.name).toBe('slow-operation');
    expect(summary.fastestMetric?.name).toBe('fast-operation');
    
    // Check performance grades
    const fastGrade = performanceBenchmarks.getGrade(
      summary.fastestMetric!.duration!, 
      'componentRender'
    );
    const slowGrade = performanceBenchmarks.getGrade(
      summary.slowestMetric!.duration!, 
      'componentRender'
    );
    
    expect(['excellent', 'good', 'poor']).toContain(fastGrade);
    expect(['excellent', 'good', 'poor']).toContain(slowGrade);
  });
});