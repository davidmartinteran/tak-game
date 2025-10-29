import { renderHook, act } from '@testing-library/react';
import { useStackMovementAnimations } from '../useStackMovementAnimations';
import { StackMove, Stone, StoneType, Player, Position } from '../../types';

// Mock setTimeout and clearTimeout
jest.useFakeTimers();

describe('useStackMovementAnimations', () => {
  const mockMove: StackMove = {
    type: 'move',
    from: { row: 0, col: 0 },
    to: { row: 0, col: 2 },
    stonesToMove: 2,
    dropPattern: [0, 1, 1],
  };

  const mockStones: Stone[] = [
    {
      id: 'stone1',
      type: StoneType.FLAT,
      owner: Player.PLAYER1,
    },
    {
      id: 'stone2',
      type: StoneType.FLAT,
      owner: Player.PLAYER1,
    },
  ];

  const mockPath: Position[] = [
    { row: 0, col: 1 },
    { row: 0, col: 2 },
  ];

  const mockWallStone: Stone = {
    id: 'wall1',
    type: StoneType.WALL,
    owner: Player.PLAYER2,
  };

  beforeEach(() => {
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.useFakeTimers();
  });

  it('should initialize with no active animation', () => {
    const { result } = renderHook(() => useStackMovementAnimations());

    expect(result.current.currentMovementAnimation).toBeNull();
    expect(result.current.isMovementAnimating).toBe(false);
    expect(result.current.getAnimationProgress()).toBe(0);
  });

  it('should trigger stack movement animation', () => {
    const { result } = renderHook(() => useStackMovementAnimations());

    act(() => {
      result.current.triggerStackMovementAnimation(mockMove, mockStones, mockPath);
    });

    expect(result.current.currentMovementAnimation).not.toBeNull();
    expect(result.current.currentMovementAnimation?.type).toBe('stack-moving');
    expect(result.current.currentMovementAnimation?.from).toEqual(mockMove.from);
    expect(result.current.currentMovementAnimation?.to).toEqual(mockMove.to);
    expect(result.current.currentMovementAnimation?.movingStones).toEqual(mockStones);
    expect(result.current.currentMovementAnimation?.path).toEqual(mockPath);
    expect(result.current.isMovementAnimating).toBe(true);
  });

  it('should calculate animation progress correctly', () => {
    const { result } = renderHook(() => useStackMovementAnimations());

    act(() => {
      result.current.triggerStackMovementAnimation(mockMove, mockStones, mockPath);
    });

    // Initial progress should be 0
    expect(result.current.getAnimationProgress()).toBe(0);

    // Simulate animation progress
    if (result.current.currentMovementAnimation) {
      act(() => {
        result.current.currentMovementAnimation!.currentStep = 1;
      });
      expect(result.current.getAnimationProgress()).toBe(0.5); // 1/2 steps
    }
  });

  it('should trigger wall flattening animation', () => {
    const { result } = renderHook(() => useStackMovementAnimations());
    const mockPosition: Position = { row: 1, col: 1 };

    // Mock console.log to avoid output during tests
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    act(() => {
      result.current.triggerWallFlatteningAnimation(mockPosition, mockWallStone);
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      'Wall flattening animation triggered at',
      mockPosition,
      'for stone',
      mockWallStone.id
    );

    consoleSpy.mockRestore();
  });

  it('should clear animation', () => {
    const { result } = renderHook(() => useStackMovementAnimations());

    act(() => {
      result.current.triggerStackMovementAnimation(mockMove, mockStones, mockPath);
    });

    expect(result.current.currentMovementAnimation).not.toBeNull();

    act(() => {
      result.current.clearMovementAnimation();
    });

    expect(result.current.currentMovementAnimation).toBeNull();
    expect(result.current.isMovementAnimating).toBe(false);
  });

  it('should auto-complete animation after timeout', () => {
    const { result } = renderHook(() => useStackMovementAnimations());

    act(() => {
      result.current.triggerStackMovementAnimation(mockMove, mockStones, mockPath);
    });

    expect(result.current.isMovementAnimating).toBe(true);

    // Fast-forward time to complete animation
    act(() => {
      jest.advanceTimersByTime(1000); // 2 steps * 400ms + 200ms buffer
    });

    expect(result.current.currentMovementAnimation?.isComplete).toBe(true);

    // Fast-forward additional time to clear animation
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current.currentMovementAnimation).toBeNull();
  });

  it('should generate unique move IDs', () => {
    const { result } = renderHook(() => useStackMovementAnimations());

    act(() => {
      result.current.triggerStackMovementAnimation(mockMove, mockStones, mockPath);
    });

    const firstMoveId = result.current.currentMovementAnimation?.moveId;

    act(() => {
      result.current.clearMovementAnimation();
      result.current.triggerStackMovementAnimation(mockMove, mockStones, mockPath);
    });

    const secondMoveId = result.current.currentMovementAnimation?.moveId;

    expect(firstMoveId).not.toEqual(secondMoveId);
    expect(firstMoveId).toMatch(/^move_\d+$/);
    expect(secondMoveId).toMatch(/^move_\d+$/);
  });

  it('should handle empty path gracefully', () => {
    const { result } = renderHook(() => useStackMovementAnimations());

    act(() => {
      result.current.triggerStackMovementAnimation(mockMove, mockStones, []);
    });

    expect(result.current.currentMovementAnimation?.totalSteps).toBe(0);
    expect(result.current.getAnimationProgress()).toBe(0);
  });

  it('should clear previous animation when starting new one', () => {
    const { result } = renderHook(() => useStackMovementAnimations());

    // Start first animation
    act(() => {
      result.current.triggerStackMovementAnimation(mockMove, mockStones, mockPath);
    });

    const firstMoveId = result.current.currentMovementAnimation?.moveId;

    // Start second animation
    act(() => {
      result.current.triggerStackMovementAnimation(mockMove, mockStones, mockPath);
    });

    const secondMoveId = result.current.currentMovementAnimation?.moveId;

    expect(firstMoveId).not.toEqual(secondMoveId);
    expect(result.current.currentMovementAnimation?.moveId).toBe(secondMoveId);
  });
});