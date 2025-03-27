import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import 'react-native-reanimated';
import { Provider as AntDesignProvider } from '@ant-design/react-native';
import * as Font from 'expo-font';
import { IconFill, IconOutline } from '@ant-design/icons-react-native';
import { AuthProvider } from '@/context/AuthContext';

// Cấu hình màn hình splash với màu nền đỏ
SplashScreen.preventAutoHideAsync();

// Màu nền splash screen được cấu hình trong app.json

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    antoutline: require('@ant-design/icons-react-native/fonts/antoutline.ttf'),
    antfill: require('@ant-design/icons-react-native/fonts/antfill.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <AntDesignProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(products)" options={{ headerShown: false }} />
            <Stack.Screen name="(profile)" options={{ headerShown: false }} />
            <Stack.Screen name="(quotes)" options={{ headerShown: false }} />
            <Stack.Screen name="(contacts)" options={{ headerShown: false }} />
            <Stack.Screen name="(stats)" options={{ headerShown: false }} />
            <Stack.Screen name="product_page" options={{ headerShown: false }} />
            <Stack.Screen name="product_baogia/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </AntDesignProvider>
    </AuthProvider>
  );
}
