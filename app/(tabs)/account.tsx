import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';

export default function AccountScreen() {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={styles.safeArea} edges={['top', 'right', 'left']}>
        <Stack.Screen
          options={{
            headerStyle: {
              backgroundColor: '#FFFFFF',
            },
            headerShadowVisible: false,
            headerTitle: 'Khách hàng tiềm năng',
            headerTitleStyle: {
              fontFamily: 'Roboto Flex',
              fontSize: 20,
              fontWeight: '600',
              color: '#27273E',
            },
            headerTitleAlign: 'center',
            headerLeft: () => (
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Ionicons name="chevron-back" size={24} color="#27273E" />
              </TouchableOpacity>
            ),
            headerRight: () => (
              <TouchableOpacity>
                <Ionicons name="add" size={24} color="#00A650" />
              </TouchableOpacity>
            ),
          }}
        />
        <View style={styles.mainContainer}>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Ô, hình như danh sách của bạn chưa có ai cả!</Text>
            <Text style={styles.emptySubText}>Hãy thêm liên hệ mới nhé.</Text>
            
            <TouchableOpacity style={styles.createButton} onPress={() => router.push('/new-contact')}>
              <Ionicons name="person-add-outline" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.createButtonText}>Tạo liên hệ mới</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#27273E',
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#7B7D9D',
    marginBottom: 24,
    textAlign: 'center',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00A650',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 