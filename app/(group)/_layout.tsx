import React from 'react';
import { Stack } from 'expo-router';

export default function GroupLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="group_agent" 
        options={{
          headerShown: true,
          headerTitle: "Cộng đồng",
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '600',
            color: '#27273E',
          },
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerShadowVisible: false,
          headerBackTitle: "Quay lại"
        }} 
      />
    </Stack>
  );
} 