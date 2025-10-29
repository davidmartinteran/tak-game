import React, { useState, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet } from 'react-native';
import { AnimatedStackMovement } from './AnimatedStackMovement';
import { WallFlatteningAnimation } from './WallFlatteningAnimation';
import { Position, Stone, StackMove } from '../../../types';

export interface ActiveMovementAnimation {
  id: string;
  type: 'stack-movement' | 'wall-flattening';
  move?: StackMove;
  movingStones?: Stone[];
  path?: Position[];
  wallStone?: Stone;
  position?: Position;
  squareSize: number;
  boardSize: number;
}

export interface StackMovementAnimationManagerProps {
  squareSize: number;
  boardSize: number;
  onAnimationComplete?: (animationId: string) => void;
  onStoneDropped?: (position: Position, stones: Stone[]) => void;
  onWallFlattened?: (position: Position, wallStone: Stone) => void;
}

/**
 * Manager component that coordinates all stack movement and wall flattening animations
 */
export const StackMovementAnimationManager = React.memo(forwardRef<StackMovementAnimationManagerRef, StackMovementAnimationManagerProps>(({
  squareSize,
  boardSize,
  onAnimationComplete,
  onStoneDropped,
  onWallFlattened,
}, ref) => {
  const [activeAnimations, setActiveAnimations] = useState<ActiveMovementAnimation[]>([]);
  const animationIdCounterRef = useRef(0);
  
  const generateAnimationId = useCallback((): string => {
    return `animation_${++animationIdCounterRef.current}`;
  }, []);
  
  const startStackMovementAnimation = useCallback((
    move: StackMove,
    movingStones: Stone[],
    path: Position[]
  ): string => {
    const animationId = generateAnimationId();
    
    const newAnimation: ActiveMovementAnimation = {
      id: animationId,
      type: 'stack-movement',
      move,
      movingStones,
      path,
      squareSize,
      boardSize,
    };
    
    setActiveAnimations(prev => [...prev, newAnimation]);
    return animationId;
  }, [generateAnimationId, squareSize, boardSize]);
  
  const startWallFlatteningAnimation = useCallback((
    position: Position,
    wallStone: Stone
  ): string => {
    const animationId = generateAnimationId();
    
    const newAnimation: ActiveMovementAnimation = {
      id: animationId,
      type: 'wall-flattening',
      wallStone,
      position,
      squareSize,
      boardSize,
    };
    
    setActiveAnimations(prev => [...prev, newAnimation]);
    return animationId;
  }, [generateAnimationId, squareSize, boardSize]);
  
  const handleAnimationComplete = useCallback((animationId: string) => {
    setActiveAnimations(prev => prev.filter(anim => anim.id !== animationId));
    
    if (onAnimationComplete) {
      onAnimationComplete(animationId);
    }
  }, [onAnimationComplete]);
  
  // Callbacks para eventos durante las animaciones
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleStoneDropped = useCallback((position: Position, stones: Stone[]) => {
    if (onStoneDropped) {
      onStoneDropped(position, stones);
    }
  }, [onStoneDropped]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleWallFlattened = useCallback((position: Position, wallStone: Stone) => {
    if (onWallFlattened) {
      onWallFlattened(position, wallStone);
    }
  }, [onWallFlattened]);
  
  // Expose methods to parent components
  useImperativeHandle(ref, () => ({
    startStackMovementAnimation,
    startWallFlatteningAnimation,
    clearAllAnimations: () => setActiveAnimations([]),
    getActiveAnimationCount: () => activeAnimations.length,
  }));
  
  return (
    <View style={styles.container} pointerEvents="none">
      {activeAnimations.map((animation) => {
        if (animation.type === 'stack-movement' && animation.move && animation.movingStones && animation.path) {
          return (
            <AnimatedStackMovement
              key={animation.id}
              movingStones={animation.movingStones}
              fromPosition={animation.move.from}
              toPosition={animation.move.to}
              path={animation.path}
              dropPattern={animation.move.dropPattern}
              squareSize={animation.squareSize}
              boardSize={animation.boardSize}
              onAnimationComplete={() => handleAnimationComplete(animation.id)}
              onStoneDropped={() => {
                if (onStoneDropped && animation.move?.to && animation.movingStones) {
                  onStoneDropped(animation.move.to, animation.movingStones);
                }
              }}
              onWallFlattened={() => {
                if (onWallFlattened && animation.wallStone && animation.position) {
                  onWallFlattened(animation.position, animation.wallStone);
                }
              }}
            />
          );
        }
        
        if (animation.type === 'wall-flattening' && animation.wallStone && animation.position) {
          return (
            <WallFlatteningAnimation
              key={animation.id}
              wallStone={animation.wallStone}
              position={animation.position}
              squareSize={animation.squareSize}
              onAnimationComplete={() => handleAnimationComplete(animation.id)}
            />
          );
        }
        
        return null;
      })}
    </View>
  );
}));

StackMovementAnimationManager.displayName = 'StackMovementAnimationManager';

// Export ref type for parent components
export interface StackMovementAnimationManagerRef {
  startStackMovementAnimation: (move: StackMove, movingStones: Stone[], path: Position[]) => string;
  startWallFlatteningAnimation: (position: Position, wallStone: Stone) => string;
  clearAllAnimations: () => void;
  getActiveAnimationCount: () => number;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000, // Above all other board elements
  },
});

export default StackMovementAnimationManager;