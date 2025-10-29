import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from '../common/Button';
import { StackMovementAnimationManager, StackMovementAnimationManagerRef } from './StackMovementAnimationManager';
import { Stone, StoneType, Player, Position, StackMove } from '../../../types';
import { scaleWidth, scaleHeight } from '../../../utils/responsive';

/**
 * Demo component to showcase stack movement animations
 */
export const StackMovementDemo: React.FC = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  const animationManagerRef = React.useRef<StackMovementAnimationManagerRef>(null);

  const mockStones: Stone[] = [
    {
      id: 'demo-stone-1',
      type: StoneType.FLAT,
      owner: Player.PLAYER1,
    },
    {
      id: 'demo-stone-2',
      type: StoneType.FLAT,
      owner: Player.PLAYER1,
    },
  ];

  const mockMove: StackMove = {
    type: 'move',
    from: { row: 1, col: 1 },
    to: { row: 1, col: 3 },
    stonesToMove: 2,
    dropPattern: [0, 1, 1],
  };

  const mockPath: Position[] = [
    { row: 1, col: 2 },
    { row: 1, col: 3 },
  ];

  const mockWallStone: Stone = {
    id: 'demo-wall-1',
    type: StoneType.WALL,
    owner: Player.PLAYER2,
  };

  const handleStartStackMovement = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const animationId = animationManagerRef.current?.startStackMovementAnimation(
      mockMove,
      mockStones,
      mockPath
    );
    
    console.log('Started stack movement animation:', animationId);
  };

  const handleStartWallFlattening = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const animationId = animationManagerRef.current?.startWallFlatteningAnimation(
      { row: 2, col: 2 },
      mockWallStone
    );
    
    console.log('Started wall flattening animation:', animationId);
  };

  const handleAnimationComplete = (animationId: string) => {
    console.log('Animation completed:', animationId);
    setIsAnimating(false);
  };

  const handleStoneDropped = (position: Position, stones: Stone[]) => {
    console.log('Stones dropped at', position, ':', stones.length, 'stones');
  };

  const handleWallFlattened = (position: Position, wallStone: Stone) => {
    console.log('Wall flattened at', position, ':', wallStone.id);
  };

  const squareSize = scaleWidth(60);
  const boardSize = squareSize * 5; // 5x5 demo board

  return (
    <View style={styles.container}>
      <View style={styles.demoBoard}>
        {/* Demo board background */}
        <View style={[styles.boardBackground, { width: boardSize, height: boardSize }]} />
        
        {/* Animation manager */}
        <StackMovementAnimationManager
          ref={animationManagerRef}
          squareSize={squareSize}
          boardSize={boardSize}
          onAnimationComplete={handleAnimationComplete}
          onStoneDropped={handleStoneDropped}
          onWallFlattened={handleWallFlattened}
        />
      </View>
      
      <View style={styles.controls}>
        <Button
          title="Stack Movement"
          onPress={handleStartStackMovement}
          disabled={isAnimating}
          style={styles.button}
        />
        
        <Button
          title="Wall Flattening"
          onPress={handleStartWallFlattening}
          disabled={isAnimating}
          style={styles.button}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: scaleWidth(20),
  },
  
  demoBoard: {
    position: 'relative',
    marginBottom: scaleHeight(40),
  },
  
  boardBackground: {
    backgroundColor: '#8B4513',
    borderRadius: scaleWidth(8),
    borderWidth: 2,
    borderColor: '#654321',
  },
  
  controls: {
    flexDirection: 'row',
    gap: scaleWidth(16),
  },
  
  button: {
    minWidth: scaleWidth(120),
  },
});

export default StackMovementDemo;