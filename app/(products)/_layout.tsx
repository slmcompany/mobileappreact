import { Stack } from 'expo-router';
import { Image, View, Text } from 'react-native';

export default function ProductsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
          color: '#27273E',
        },
        headerShadowVisible: false,
        headerBackTitle: 'Quay lại',
      }}
    >
      <Stack.Screen
        name="product_brand"
        options={{
          headerShown: true,
          headerTitleAlign: 'left',
          headerTitle: () => null, // Will be set dynamically in the screen
        }}
      />
      <Stack.Screen
        name="product-line"
        options={{
          headerShown: true,
          title: 'Chi tiết sản phẩm',
        }}
      />
    </Stack>
  );
} 