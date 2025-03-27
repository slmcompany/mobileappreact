import { Stack } from 'expo-router';

export default function ProductsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="product-line" />
      <Stack.Screen name="subproduct" />
    </Stack>
  );
} 