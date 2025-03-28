import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme, StyleSheet } from 'react-native';
import 'react-native-reanimated';
import { Provider as AntDesignProvider } from '@ant-design/react-native';
import * as Font from 'expo-font';
import { IconFill, IconOutline } from '@ant-design/icons-react-native';
import { AuthProvider } from '@/context/AuthContext';
import Toast, { BaseToast, ErrorToast, BaseToastProps } from 'react-native-toast-message';

// Cấu hình màn hình splash với màu nền đỏ
SplashScreen.preventAutoHideAsync();

// Màu nền splash screen được cấu hình trong app.json

/*
  1. Tạo cấu hình cho toast
*/
const toastConfig = {
  success: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#00A86B', backgroundColor: 'rgba(39, 39, 62, 0.75)' }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 12,
        fontWeight: '400',
        color: '#FFFFFF'
      }}
    />
  ),
  error: (props: BaseToastProps) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: '#ED1C24', backgroundColor: 'rgba(39, 39, 62, 0.75)' }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 12,
        fontWeight: '400',
        color: '#FFFFFF'
      }}
      text2Style={{
        fontSize: 12,
        color: '#FFFFFF'
      }}
    />
  )
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    RobotoFlex: require('../assets/fonts/RobotoFlex-Regular.ttf'),
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
          <Toast config={toastConfig} />
        </ThemeProvider>
      </AntDesignProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#fff'
  }
});
