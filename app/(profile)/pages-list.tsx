import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';

const PagesListScreen = () => {
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      Alert.alert(
        'Đăng xuất',
        'Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng?',
        [
          {
            text: 'Hủy',
            style: 'cancel',
          },
          {
            text: 'Đăng xuất',
            style: 'destructive',
            onPress: async () => {
              await logout();
              router.replace('/login');
            },
          },
        ],
        { cancelable: true }
      );
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#27273E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Danh sách trang</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content}>
        <TouchableOpacity 
          style={styles.pageItem}
          onPress={() => router.push('/(tabs)')}
        >
          <View style={styles.pageItemLeft}>
            <View style={[styles.iconContainer, styles.numberContainer]}>
              <Text style={styles.numberText}>1</Text>
            </View>
            <Text style={styles.pageLabel}>Home</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#7B7D9D" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.pageItem}
          onPress={handleLogout}
        >
          <View style={styles.pageItemLeft}>
            <View style={[styles.iconContainer, styles.numberContainer]}>
              <Text style={styles.numberText}>2</Text>
            </View>
            <Text style={styles.pageLabel}>Login</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#7B7D9D" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.pageItem}
          onPress={() => router.push('/profile')}
        >
          <View style={styles.pageItemLeft}>
            <View style={[styles.iconContainer, styles.numberContainer]}>
              <Text style={styles.numberText}>3</Text>
            </View>
            <Text style={styles.pageLabel}>User Profile</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#7B7D9D" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.pageItem}>
          <View style={styles.pageItemLeft}>
            <View style={[styles.iconContainer, styles.numberContainer]}>
              <Text style={styles.numberText}>4</Text>
            </View>
            <Text style={styles.pageLabel}>Customer</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#7B7D9D" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.pageItem}
          onPress={() => router.push('../product')}
        >
          <View style={styles.pageItemLeft}>
            <View style={[styles.iconContainer, styles.numberContainer]}>
              <Text style={styles.numberText}>5</Text>
            </View>
            <Text style={styles.pageLabel}>Product</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#7B7D9D" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.pageItem}>
          <View style={styles.pageItemLeft}>
            <View style={[styles.iconContainer, styles.numberContainer]}>
              <Text style={styles.numberText}>6</Text>
            </View>
            <Text style={styles.pageLabel}>Statistics</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#7B7D9D" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.pageItem}>
          <View style={styles.pageItemLeft}>
            <View style={[styles.iconContainer, styles.numberContainer]}>
              <Text style={styles.numberText}>7</Text>
            </View>
            <Text style={styles.pageLabel}>Gallery</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#7B7D9D" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.pageItem}>
          <View style={styles.pageItemLeft}>
            <View style={[styles.iconContainer, styles.numberContainer]}>
              <Text style={styles.numberText}>8</Text>
            </View>
            <Text style={styles.pageLabel}>Mini Admin</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#7B7D9D" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.pageItem}>
          <View style={styles.pageItemLeft}>
            <View style={[styles.iconContainer, styles.numberContainer]}>
              <Text style={styles.numberText}>9</Text>
            </View>
            <Text style={styles.pageLabel}>Quantation</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#7B7D9D" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.pageItem}>
          <View style={styles.pageItemLeft}>
            <View style={[styles.iconContainer, styles.numberContainer]}>
              <Text style={styles.numberText}>10</Text>
            </View>
            <Text style={styles.pageLabel}>Notification</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#7B7D9D" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.pageItem}>
          <View style={styles.pageItemLeft}>
            <View style={[styles.iconContainer, styles.numberContainer]}>
              <Text style={styles.numberText}>11</Text>
            </View>
            <Text style={styles.pageLabel}>FAQ</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#7B7D9D" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.pageItem}>
          <View style={styles.pageItemLeft}>
            <View style={[styles.iconContainer, styles.numberContainer]}>
              <Text style={styles.numberText}>12</Text>
            </View>
            <Text style={styles.pageLabel}>Contract Summary</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#7B7D9D" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F3',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#27273E',
  },
  content: {
    flex: 1,
    backgroundColor: 'white',
  },
  pageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F3',
  },
  pageItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pageLabel: {
    fontSize: 16,
    color: '#27273E',
    fontWeight: '500',
  },
  numberContainer: {
    backgroundColor: '#F5F5F8',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7B7D9D',
  },
});

export default PagesListScreen; 