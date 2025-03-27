import { Stack } from 'expo-router';

export default function QuotesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="quote-detail" />
    </Stack>
  );
} 