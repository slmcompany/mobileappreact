import { Stack } from 'expo-router';

export default function QuotationLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="quotation_create_new" />
      <Stack.Screen name="quotation_product_selection" />
      <Stack.Screen name="quotation_basic_info" />
    </Stack>
  );
} 