import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable, useColorScheme, View, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';

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

// Custom TabBar component
function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { authState } = useAuth();
  const isRoleId3 = authState.user?.role_id === 3;
  
  // Lọc các routes được hiển thị dựa vào role
  const filteredRoutes = state.routes.filter((route: any) => {
    if (isRoleId3) {
      return route.name !== 'account' && route.name !== 'stats';
    }
    return true;
  });

  return (
    <View style={[
      styles.tabBar, 
      { 
        height: 60 + (insets.bottom > 0 ? insets.bottom : 10),
        paddingBottom: insets.bottom > 0 ? insets.bottom : 10
      }
    ]}>
      {filteredRoutes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === state.routes.findIndex((r: any) => r.key === route.key);

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        // Lấy icon phù hợp
        let iconSource;
        if (route.name === 'index') {
          iconSource = require('@/assets/images/nav-icon-1.png');
        } else if (route.name === 'account') {
          iconSource = require('@/assets/images/nav-icon-2.png');
        } else if (route.name === 'products') {
          iconSource = require('@/assets/images/nav-icon-3.png');
        } else if (route.name === 'stats') {
          iconSource = require('@/assets/images/nav-icon-4.png');
        } else if (route.name === 'gallery') {
          iconSource = require('@/assets/images/nav-icon-5.png');
        }

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={styles.tabItem}
          >
            <View style={[styles.iconContainer, isFocused && styles.activeIconContainer]}>
              <Image 
                source={iconSource} 
                style={styles.iconImage} 
                resizeMode="contain" 
              />
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { authState } = useAuth();
  
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: useClientOnlyValue(false, false),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Khách hàng tiềm năng',
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'Sản phẩm',
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Thống kê',
        }}
      />
      <Tabs.Screen
        name="gallery"
        options={{
          title: 'Thư viện',
          href: '/(gallery)',
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
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 5,
    justifyContent: 'space-evenly',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
