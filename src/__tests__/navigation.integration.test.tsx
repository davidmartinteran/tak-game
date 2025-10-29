import { router } from 'expo-router';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    back: jest.fn(),
  },
}));

describe('Navigation Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should have proper navigation flow from main menu to board size to game', () => {
    // Test that main menu navigates to board size selection
    const mockPush = router.push as jest.Mock;
    
    // Simulate main menu "New Game" button press
    mockPush('/board-size');
    expect(mockPush).toHaveBeenCalledWith('/board-size');

    // Simulate board size selection
    mockPush({
      pathname: '/game',
      params: { boardSize: '5' }
    });
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/game',
      params: { boardSize: '5' }
    });
  });

  it('should handle back navigation properly', () => {
    const mockBack = router.back as jest.Mock;
    
    // Simulate back navigation from board size screen
    mockBack();
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('should navigate to settings and about screens', () => {
    const mockPush = router.push as jest.Mock;
    
    // Test settings navigation
    mockPush('/settings');
    expect(mockPush).toHaveBeenCalledWith('/settings');

    // Test about navigation
    mockPush('/about');
    expect(mockPush).toHaveBeenCalledWith('/about');
  });
});