import { renderHook, act } from '@testing-library/react';
import { useStoneAnimations } from '../useStoneAnimations';
import { StoneType } from '../../types';

describe('useStoneAnimations', () => {
  beforeEach(() => {
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should initialize with no current animation', () => {
    const { result } = renderHook(() => useStoneAnimations());
    
    expect(result.current.currentAnimation).toBeNull();
    expect(result.current.isAnimating).toBe(false);
  });

  it('should trigger placement animation', () => {
    const { result } = renderHook(() => useStoneAnimations());
    
    act(() => {
      result.current.triggerPlacementAnimation({ row: 0, col: 0 }, StoneType.FLAT);
    });

    expect(result.current.currentAnimation).toEqual({
      type: 'placing',
      position: { row: 0, col: 0 },
      stoneType: StoneType.FLAT,
    });
    expect(result.current.isAnimating).toBe(true);
  });

  it('should trigger invalid move animation', () => {
    const { result } = renderHook(() => useStoneAnimations());
    
    act(() => {
      result.current.triggerInvalidMoveAnimation({ row: 1, col: 1 });
    });

    expect(result.current.currentAnimation).toEqual({
      type: 'invalid',
      position: { row: 1, col: 1 },
    });
    expect(result.current.isAnimating).toBe(true);
  });

  it('should clear animation manually', () => {
    const { result } = renderHook(() => useStoneAnimations());
    
    act(() => {
      result.current.triggerPlacementAnimation({ row: 0, col: 0 }, StoneType.FLAT);
    });

    expect(result.current.isAnimating).toBe(true);

    act(() => {
      result.current.clearAnimation();
    });

    expect(result.current.currentAnimation).toBeNull();
    expect(result.current.isAnimating).toBe(false);
  });

  it('should auto-clear placement animation after timeout', () => {
    const { result } = renderHook(() => useStoneAnimations());
    
    act(() => {
      result.current.triggerPlacementAnimation({ row: 0, col: 0 }, StoneType.FLAT);
    });

    expect(result.current.isAnimating).toBe(true);

    act(() => {
      jest.advanceTimersByTime(600);
    });

    expect(result.current.currentAnimation).toBeNull();
    expect(result.current.isAnimating).toBe(false);
  });

  it('should auto-clear invalid animation after timeout', () => {
    const { result } = renderHook(() => useStoneAnimations());
    
    act(() => {
      result.current.triggerInvalidMoveAnimation({ row: 0, col: 0 });
    });

    expect(result.current.isAnimating).toBe(true);

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current.currentAnimation).toBeNull();
    expect(result.current.isAnimating).toBe(false);
  });

  it('should replace current animation when new one is triggered', () => {
    const { result } = renderHook(() => useStoneAnimations());
    
    act(() => {
      result.current.triggerPlacementAnimation({ row: 0, col: 0 }, StoneType.FLAT);
    });

    expect(result.current.currentAnimation?.type).toBe('placing');

    act(() => {
      result.current.triggerInvalidMoveAnimation({ row: 1, col: 1 });
    });

    expect(result.current.currentAnimation?.type).toBe('invalid');
    expect(result.current.currentAnimation?.position).toEqual({ row: 1, col: 1 });
  });
});