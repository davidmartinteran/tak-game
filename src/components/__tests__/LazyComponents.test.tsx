import React from 'react';
import { render, waitFor, screen } from '@testing-library/react-native';
import { 
  LazyVictoryModal, 
  LazyVictoryCelebration,
  LoadingFallback,
  withLazyLoading,
  preloadComponents
} from '../layout/LazyComponents';

// Mock the lazy-loaded components
jest.mock('../ui/feedback/VictoryModal', () => ({
  VictoryModal: jest.fn(() => <div data-testid="victory-modal">Victory Modal</div>)
}));

jest.mock('../ui/feedback/VictoryCelebration', () => ({
  VictoryCelebration: jest.fn(() => <div data-testid="victory-celebration">Victory Celebration</div>)
}));

describe('LazyComponents', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('LoadingFallback', () => {
    it('renders loading indicator with default props', () => {
      render(<LoadingFallback />);
      
      expect(screen.getByTestId('loading-indicator')).toBeTruthy();
      expect(screen.getByText('Loading...')).toBeTruthy();
    });

    it('renders with custom size and message', () => {
      render(<LoadingFallback size="large" message="Custom loading message" />);
      
      expect(screen.getByTestId('loading-indicator')).toBeTruthy();
      expect(screen.getByText('Custom loading message')).toBeTruthy();
    });

    it('renders without message when not provided', () => {
      render(<LoadingFallback message="" />);
      
      expect(screen.getByTestId('loading-indicator')).toBeTruthy();
      expect(screen.queryByText('Loading...')).toBeFalsy();
    });
  });

  describe('withLazyLoading HOC', () => {
    const MockComponent = jest.fn(() => <div data-testid="mock-component">Mock Component</div>);
    const LazyMockComponent = React.lazy(() => Promise.resolve({ default: MockComponent }));

    it('shows loading fallback initially', async () => {
      const WrappedComponent = withLazyLoading(LazyMockComponent);
      
      render(<WrappedComponent />);
      
      expect(screen.getByTestId('loading-indicator')).toBeTruthy();
      
      await waitFor(() => {
        expect(screen.getByTestId('mock-component')).toBeTruthy();
      });
    });

    it('uses custom fallback when provided', async () => {
      const CustomFallback = () => <div data-testid="custom-fallback">Custom Loading</div>;
      const WrappedComponent = withLazyLoading(LazyMockComponent, {
        fallback: CustomFallback
      });
      
      render(<WrappedComponent />);
      
      expect(screen.getByTestId('custom-fallback')).toBeTruthy();
      
      await waitFor(() => {
        expect(screen.getByTestId('mock-component')).toBeTruthy();
      });
    });

    it('handles errors with custom error fallback', async () => {
      const FailingComponent = React.lazy(() => Promise.reject(new Error('Load failed')));
      const CustomErrorFallback = ({ error, retry }: { error: Error; retry: () => void }) => (
        <div data-testid="error-fallback">Error: {error.message}</div>
      );
      
      const WrappedComponent = withLazyLoading(FailingComponent, {
        errorFallback: CustomErrorFallback
      });
      
      render(<WrappedComponent />);
      
      await waitFor(() => {
        expect(screen.getByTestId('error-fallback')).toBeTruthy();
        expect(screen.getByText('Error: Load failed')).toBeTruthy();
      });
    });

    it('forwards props to wrapped component', async () => {
      const PropsComponent = jest.fn(({ testProp }: { testProp: string }) => (
        <div data-testid="props-component">{testProp}</div>
      ));
      const LazyPropsComponent = React.lazy(() => Promise.resolve({ default: PropsComponent }));
      const WrappedComponent = withLazyLoading(LazyPropsComponent);
      
      render(<WrappedComponent testProp="test-value" />);
      
      await waitFor(() => {
        expect(screen.getByTestId('props-component')).toBeTruthy();
        expect(screen.getByText('test-value')).toBeTruthy();
      });
      
      expect(PropsComponent).toHaveBeenCalledWith(
        expect.objectContaining({ testProp: 'test-value' }),
        expect.any(Object)
      );
    });
  });

  describe('preloadComponents', () => {
    it('preloads components without throwing', async () => {
      await expect(preloadComponents()).resolves.toBeUndefined();
    });

    it('handles preload failures gracefully', async () => {
      // Mock import to fail
      const originalImport = global.import;
      global.import = jest.fn().mockRejectedValue(new Error('Import failed'));
      
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      await preloadComponents();
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to preload some components:',
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
      global.import = originalImport;
    });
  });

  describe('Lazy component integration', () => {
    it('lazy loads VictoryModal successfully', async () => {
      const props = {
        visible: true,
        winner: 'player1' as const,
        onNewGame: jest.fn(),
        onMainMenu: jest.fn(),
        onClose: jest.fn()
      };
      
      render(<LazyVictoryModal {...props} />);
      
      expect(screen.getByTestId('loading-indicator')).toBeTruthy();
      
      await waitFor(() => {
        expect(screen.getByTestId('victory-modal')).toBeTruthy();
      });
    });

    it('lazy loads VictoryCelebration successfully', async () => {
      const props = {
        visible: true,
        winner: 'player1' as const,
        onAnimationComplete: jest.fn()
      };
      
      render(<LazyVictoryCelebration {...props} />);
      
      expect(screen.getByTestId('loading-indicator')).toBeTruthy();
      
      await waitFor(() => {
        expect(screen.getByTestId('victory-celebration')).toBeTruthy();
      });
    });
  });

  describe('Performance considerations', () => {
    it('does not render lazy component until needed', () => {
      const MockComponent = jest.fn(() => <div>Mock</div>);
      const LazyMockComponent = React.lazy(() => Promise.resolve({ default: MockComponent }));
      
      // Just creating the lazy component shouldn't call the actual component
      expect(MockComponent).not.toHaveBeenCalled();
      
      render(
        <React.Suspense fallback={<div>Loading</div>}>
          <LazyMockComponent />
        </React.Suspense>
      );
      
      // Component should be called after render
      expect(MockComponent).toHaveBeenCalled();
    });

    it('memoizes wrapped components properly', async () => {
      const MockComponent = jest.fn(() => <div data-testid="memo-test">Memo Test</div>);
      const LazyMockComponent = React.lazy(() => Promise.resolve({ default: MockComponent }));
      const WrappedComponent = withLazyLoading(LazyMockComponent);
      
      const { rerender } = render(<WrappedComponent testProp="value1" />);
      
      await waitFor(() => {
        expect(screen.getByTestId('memo-test')).toBeTruthy();
      });
      
      const firstCallCount = MockComponent.mock.calls.length;
      
      // Rerender with same props
      rerender(<WrappedComponent testProp="value1" />);
      
      // Should not cause additional renders due to memoization
      expect(MockComponent.mock.calls.length).toBe(firstCallCount);
      
      // Rerender with different props
      rerender(<WrappedComponent testProp="value2" />);
      
      // Should cause additional render due to prop change
      expect(MockComponent.mock.calls.length).toBeGreaterThan(firstCallCount);
    });
  });
});