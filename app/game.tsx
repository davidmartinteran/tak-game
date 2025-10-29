import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GameFlowManager } from '@/src/components/game/GameFlowManager';
import { Colors } from '@/src/constants/colors';

export default function GameScreen() {
  const { boardSize, resume } = useLocalSearchParams<{ boardSize?: string; resume?: string }>();
  const selectedBoardSize = boardSize ? parseInt(boardSize, 10) : undefined;
  const shouldResume = resume === 'true';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />
      <GameFlowManager initialBoardSize={selectedBoardSize} resumeGame={shouldResume} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});