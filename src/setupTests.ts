import '@testing-library/jest-native/extend-expect';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Reanimated = require('react-native-reanimated/mock');
  
  // Add custom mocks for performance testing
  Reanimated.useSharedValue = jest.fn((initialValue) => ({
    value: initialValue,
  }));
  
  Reanimated.useAnimatedStyle = jest.fn((callback) => {
    return callback();
  });
  
  Reanimated.withTiming = jest.fn((value, config, callback) => {
    if (callback) {
      setTimeout(callback, config?.duration || 300);
    }
    return value;
  });
  
  Reanimated.withSpring = jest.fn((value, config, callback) => {
    if (callback) {
      setTimeout(callback, 300);
    }
    return value;
  });
  
  Reanimated.withSequence = jest.fn((...values) => {
    return values[values.length - 1];
  });
  
  Reanimated.runOnJS = jest.fn((callback) => callback);
  
  return Reanimated;
});

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const View = require('react-native/Libraries/Components/View/View');
  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    DrawerLayoutAndroid: View,
    WebView: View,
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    RawButton: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
    FlatList: View,
    gestureHandlerRootHOC: jest.fn((component) => component),
    Directions: {},
  };
});

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

// Mock Expo modules
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
}));

// Mock responsive utilities
jest.mock('./utils/responsive', () => ({
  scaleWidth: jest.fn((value: number) => value),
  scaleHeight: jest.fn((value: number) => value),
  scaleFontSize: jest.fn((value: number) => value),
  calculateBoardSize: jest.fn(() => 300),
  getScreenDimensions: jest.fn(() => ({ width: 400, height: 800 })),
}));

// Global test utilities
global.performance = global.performance || {
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByName: jest.fn(() => []),
  getEntriesByType: jest.fn(() => []),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn(),
};

// Define __DEV__ for tests
(global as any).__DEV__ = true;

// Mock console methods for cleaner test output
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  // Suppress expected warnings/errors in tests
  console.error = jest.fn((message) => {
    if (
      typeof message === 'string' &&
      (message.includes('Warning:') || 
       message.includes('React does not recognize'))
    ) {
      return;
    }
    originalConsoleError(message);
  });
  
  console.warn = jest.fn((message) => {
    if (
      typeof message === 'string' &&
      message.includes('componentWillReceiveProps')
    ) {
      return;
    }
    originalConsoleWarn(message);
  });
});

afterEach(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  jest.clearAllTimers();
});

// Custom matchers for performance testing
expect.extend({
  toBeWithinPerformanceBudget(received: number, budget: number) {
    const pass = received <= budget;
    if (pass) {
      return {
        message: () => `Expected ${received}ms to exceed performance budget of ${budget}ms`,
        pass: true,
      };
    } else {
      return {
        message: () => `Expected ${received}ms to be within performance budget of ${budget}ms`,
        pass: false,
      };
    }
  },
  
  toHaveEfficientReRenders(received: number, maxRenders: number) {
    const pass = received <= maxRenders;
    if (pass) {
      return {
        message: () => `Expected ${received} renders to exceed maximum of ${maxRenders}`,
        pass: true,
      };
    } else {
      return {
        message: () => `Expected ${received} renders to be within maximum of ${maxRenders}`,
        pass: false,
      };
    }
  },
});

// Declare custom matchers for TypeScript
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeWithinPerformanceBudget(budget: number): R;
      toHaveEfficientReRenders(maxRenders: number): R;
    }
  }
}

// Performance monitoring utilities for tests
export const measurePerformance = async (fn: () => Promise<void> | void) => {
  const startTime = performance.now();
  await fn();
  const endTime = performance.now();
  return endTime - startTime;
};

export const measureMemoryUsage = () => {
  if ((performance as any).memory) {
    return (performance as any).memory.usedJSHeapSize;
  }
  return 0;
};

// Test data factories
export const createMockStone = (overrides = {}) => ({
  id: `mock-stone-${Math.random().toString(36).substr(2, 9)}`,
  type: 'flat' as const,
  owner: 'player1' as const,
  ...overrides,
});

export const createMockBoard = (size = 5) => ({
  size,
  squares: Array(size).fill(null).map(() => Array(size).fill(null)),
});

export const createMockGameState = (overrides = {}) => ({
  board: createMockBoard(),
  currentPlayer: 'player1' as const,
  reserves: {
    player1: { flatStones: 21, capstones: 1 },
    player2: { flatStones: 21, capstones: 1 },
  },
  gamePhase: 'first-turn' as const,
  winner: null,
  moveHistory: [],
  ...overrides,
});