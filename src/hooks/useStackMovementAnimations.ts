import { useState, useCallback, useRef } from 'react';
import { Position, Stone, StackMove } from '../types';

export interface MovementAnimationState {
  type: 'stack-moving' | 'stone-dropping' | 'wall-flattening';
  moveId: string;
  from: Position;
  to: Position;
  path: Position[];
  movingStones: Stone[];
  dropPattern: number[];
  currentStep: number;
  totalSteps: number;
  isComplete: boolean;
}

export interface UseStackMovementAnimationsReturn {
  currentMovementAnimation: MovementAnimationState | null;
  triggerStackMovementAnimation: (move: StackMove, movingStones: Stone[], path: Position[]) => void;
  triggerWallFlatteningAnimation: (position: Position, wallStone: Stone) => void;
  clearMovementAnimation: () => void;
  isMovementAnimating: boolean;
  getAnimationProgress: () => number;
}

/**
 * Hook to manage stack movement animations including path following,
 * stone dropping, and wall flattening effects
 */
export const useStackMovementAnimations = (): UseStackMovementAnimationsReturn => {
  const [currentMovementAnimation, setCurrentMovementAnimation] = useState<MovementAnimationState | null>(null);
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moveIdCounterRef = useRef(0);
  
  const clearMovementAnimation = useCallback(() => {
    setCurrentMovementAnimation(null);
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
  }, []);
  
  const generateMoveId = useCallback((): string => {
    return `move_${++moveIdCounterRef.current}`;
  }, []);
  
  const triggerStackMovementAnimation = useCallback((
    move: StackMove, 
    movingStones: Stone[], 
    path: Position[]
  ) => {
    clearMovementAnimation();
    
    const moveId = generateMoveId();
    const totalSteps = path.length;
    
    setCurrentMovementAnimation({
      type: 'stack-moving',
      moveId,
      from: move.from,
      to: move.to,
      path,
      movingStones,
      dropPattern: move.dropPattern,
      currentStep: 0,
      totalSteps,
      isComplete: false,
    });
    
    // Auto-complete animation after total duration
    const totalDuration = totalSteps * 400 + 200; // 400ms per step + 200ms buffer
    animationTimeoutRef.current = setTimeout(() => {
      setCurrentMovementAnimation(prev => prev ? { ...prev, isComplete: true } : null);
      
      // Clear animation after completion
      setTimeout(() => {
        setCurrentMovementAnimation(null);
      }, 300);
    }, totalDuration);
  }, [clearMovementAnimation, generateMoveId]);
  
  const triggerWallFlatteningAnimation = useCallback((position: Position, wallStone: Stone) => {
    // This will be handled as part of the stack movement animation
    // when a capstone moves over a wall
    console.log('Wall flattening animation triggered at', position, 'for stone', wallStone.id);
  }, []);
  
  const getAnimationProgress = useCallback((): number => {
    if (!currentMovementAnimation || currentMovementAnimation.totalSteps === 0) {
      return 0;
    }
    
    return currentMovementAnimation.currentStep / currentMovementAnimation.totalSteps;
  }, [currentMovementAnimation]);
  
  const isMovementAnimating = currentMovementAnimation !== null && !currentMovementAnimation.isComplete;
  
  return {
    currentMovementAnimation,
    triggerStackMovementAnimation,
    triggerWallFlatteningAnimation,
    clearMovementAnimation,
    isMovementAnimating,
    getAnimationProgress,
  };
};