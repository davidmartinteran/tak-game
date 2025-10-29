import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { Colors } from '@/src/constants/colors';
import { SettingsProvider } from '@/src/contexts/SettingsContext';
import { AccessibilityService } from '@/src/services/AccessibilityService';

export default function RootLayout() {
  useEffect(() => {
    // Initialize accessibility service
    AccessibilityService.initialize();
  }, []);

  return (
    <SettingsProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="board-size"
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="game"
          options={{
            animation: 'slide_from_right',
          }}
        />
      </Stack>
    </SettingsProvider>
  );
}