import { useState, useCallback, useRef } from 'react';
import { Position, StoneType } from '../types';

export interface AnimationState {
  type: 'placing' | 'moving' | 'invalid' | 'type-changing' | 'stack-moving' | 'wall-flattening';
  position?: Position;
  stoneId?: string;
  stoneType?: StoneType;
  moveId?: string;
  path?: Position[];
}

export interface UseStoneAnimationsReturn {
  currentAnimation: AnimationState | null;
  triggerPlacementAnimation: (position: Position, stoneType: StoneType) => void;
  triggerInvalidMoveAnimation: (position: Position) => void;
  triggerTypeChangeAnimation: (stoneId: string, newType: StoneType) => void;
  triggerStackMovementAnimation: (moveId: string, path: Position[]) => void;
  triggerWallFlatteningAnimation: (position: Position) => void;
  clearAnimation: () => void;
  isAnimating: boolean;
}

/**
 * Hook to manage stone placement and interaction animations
 */
export const useStoneAnimations = (): UseStoneAnimationsReturn => {
  const [currentAnimation, setCurrentAnimation] = useState<AnimationState | null>(null);
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const clearAnimation = useCallback(() => {
    setCurrentAnimation(null);
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
  }, []);
  
  const triggerPlacementAnimation = useCallback((position: Position, stoneType: StoneType) => {
    clearAnimation();
    
    setCurrentAnimation({
      type: 'placing',
      position,
      stoneType,
    });
    
    // Auto-clear animation after completion
    animationTimeoutRef.current = setTimeout(() => {
      setCurrentAnimation(null);
    }, 600); // Match animation duration from Stone component
  }, [clearAnimation]);
  
  const triggerInvalidMoveAnimation = useCallback((position: Position) => {
    clearAnimation();
    
    setCurrentAnimation({
      type: 'invalid',
      position,
    });
    
    // Auto-clear animation after completion
    animationTimeoutRef.current = setTimeout(() => {
      setCurrentAnimation(null);
    }, 500); // Match shake animation duration
  }, [clearAnimation]);
  
  const triggerTypeChangeAnimation = useCallback((stoneId: string, newType: StoneType) => {
    clearAnimation();
    
    setCurrentAnimation({
      type: 'type-changing',
      stoneId,
      stoneType: newType,
    });
    
    // Auto-clear animation after completion
    animationTimeoutRef.current = setTimeout(() => {
      setCurrentAnimation(null);
    }, 450); // Match type change animation duration
  }, [clearAnimation]);
  
  const triggerStackMovementAnimation = useCallback((moveId: string, path: Position[]) => {
    clearAnimation();
    
    setCurrentAnimation({
      type: 'stack-moving',
      moveId,
      path,
    });
    
    // Auto-clear animation after completion
    const totalDuration = path.length * 400 + 500; // 400ms per step + buffer
    animationTimeoutRef.current = setTimeout(() => {
      setCurrentAnimation(null);
    }, totalDuration);
  }, [clearAnimation]);
  
  const triggerWallFlatteningAnimation = useCallback((position: Position) => {
    clearAnimation();
    
    setCurrentAnimation({
      type: 'wall-flattening',
      position,
    });
    
    // Auto-clear animation after completion
    animationTimeoutRef.current = setTimeout(() => {
      setCurrentAnimation(null);
    }, 600); // Match wall flattening animation duration
  }, [clearAnimation]);
  
  const isAnimating = currentAnimation !== null;
  
  return {
    currentAnimation,
    triggerPlacementAnimation,
    triggerInvalidMoveAnimation,
    triggerTypeChangeAnimation,
    triggerStackMovementAnimation,
    triggerWallFlatteningAnimation,
    clearAnimation,
    isAnimating,
  };
};