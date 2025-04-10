import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs, useRouter } from 'expo-router';
import { Pressable, useColorScheme, View, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/src/context/AuthContext';

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
  const userRoleId = authState.user?.role_id;
  const router = useRouter();
  
  // Lọc các routes được hiển thị dựa vào role
  const filteredRoutes = state.routes.filter((route: any) => {
    // Chỉ hiển thị tab profile_contract cho role_id = 3
    if (route.name === 'profile_contract') {
      return userRoleId === 3;
    }
    // Hiển thị tất cả các tab khác cho mọi người dùng
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
            if (route.name === 'products') {
              // Chuyển hướng đến trang product_brand với id của SolarMax
              router.push({
                pathname: "/(products)/product_brand",
                params: { id: "1" }
              });
            } else {
              navigation.navigate(route.name);
            }
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
        } else if (route.name === 'profile_contract') {
          iconSource = require('@/assets/images/nav-icon-2.png');
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
          href: {
            pathname: "/(products)/product_brand",
            params: { id: "1" }
          }
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
      <Tabs.Screen
        name="profile_contract"
        options={{
          title: 'Hồ sơ & Hợp đồng',
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
