import React from 'react';
import { Stack } from 'expo-router';

export default function GroupLayout() {
  return (
    <>
      <Stack 
        screenOptions={{ 
          headerShown: false
        }}
      >
        <Stack.Screen name="group_agent" options={{ headerShown: false }} />
      </Stack>
    </>
  );
} 