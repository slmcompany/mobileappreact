import { Stack } from 'expo-router';

export default function ContactsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="new-contact" />
      <Stack.Screen name="old-customers" />
    </Stack>
  );
} 