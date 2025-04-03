import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable, useColorScheme, View, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Tạo useClientOnlyValue tạm thời nếu không import được
function useClientOnlyValue(webValue: any, nativeValue: any) {
  return nativeValue;
}

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#D9261C',
        tabBarInactiveTintColor: '#888',
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, false),
        tabBarShowLabel: false, // Ẩn text trong navbar
        tabBarStyle: { 
          height: 60 + (insets.bottom > 0 ? insets.bottom : 10),
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#eee',
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          paddingTop: 5,
        },
        tabBarItemStyle: {
          padding: 5
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <Image 
                source={require('@/assets/images/nav-icon-1.png')} 
                style={styles.iconImage} 
                resizeMode="contain" 
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Khách hàng tiềm năng',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <Image 
                source={require('@/assets/images/nav-icon-2.png')} 
                style={styles.iconImage} 
                resizeMode="contain" 
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'Sản phẩm',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <Image 
                source={require('@/assets/images/nav-icon-3.png')} 
                style={styles.iconImage} 
                resizeMode="contain" 
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Thống kê',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <Image 
                source={require('@/assets/images/nav-icon-4.png')} 
                style={styles.iconImage} 
                resizeMode="contain" 
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="gallery"
        options={{
          title: 'Thư viện',
          href: '/(gallery)',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <Image 
                source={require('@/assets/images/nav-icon-5.png')} 
                style={styles.iconImage} 
                resizeMode="contain" 
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconContainer: {
    backgroundColor: '#FFE8E8',
    borderRadius: 50,
    padding: 12,
  },
  iconImage: {
    width: 24,
    height: 24,
  }
});
