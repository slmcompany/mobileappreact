import { Stack } from 'expo-router';

export default function StatsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="commission-stats" />
      <Stack.Screen name="comission_history" options={{ headerShown: true }} />
      <Stack.Screen name="potential_customers" options={{ headerShown: true }} />
    </Stack>
  );
} 