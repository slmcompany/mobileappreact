import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Dimensions, StatusBar, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';

// Định nghĩa kiểu dữ liệu
interface CategoryItem {
  id: string;
  name: string;
  count: number;
  logo: any;
}

// Định nghĩa kiểu cho đối tượng dữ liệu danh mục
interface CategoryDataType {
  [key: string]: CategoryItem;
}

// Dữ liệu các danh mục
const categoryData: CategoryDataType = {
  '1': {
    id: '1',
    name: 'Hiểu Đúng Mua Đúng',
    count: 12,
    logo: require('../../assets/images/sales-promo.png')
  },
  '2': {
    id: '2',
    name: 'RiViu',
    count: 12,
    logo: require('../../assets/images/team-promo.png')
  },
  '3': {
    id: '3',
    name: 'Hỏi Xoay Hỏi Xoắy',
    count: 12,
    logo: require('../../assets/images/sales-promo.png')
  },
  '4': {
    id: '4',
    name: 'Em Biết Không?',
    count: 12,
    logo: require('../../assets/images/team-promo.png')
  }
};

// Dữ liệu grid
const gridItems = [
  { id: '1', image: require('../../assets/images/sales-promo.png') },
  { id: '2', image: require('../../assets/images/team-promo.png') },
  { id: '3', image: require('../../assets/images/sales-promo.png') },
  { id: '4', image: require('../../assets/images/team-promo.png') },
  { id: '5', image: require('../../assets/images/sales-promo.png') },
  { id: '6', image: require('../../assets/images/team-promo.png') },
  { id: '7', image: require('../../assets/images/sales-promo.png') },
  { id: '8', image: require('../../assets/images/team-promo.png') },
  { id: '9', image: require('../../assets/images/sales-promo.png') }
];

export default function CategoryDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const categoryId = typeof id === 'string' ? id : '1';
  const category = categoryData[categoryId];

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <Stack.Screen
        options={{
          headerTitle: () => (
            <Image 
              source={require('../../assets/images/solarmax-logo.png')} 
              style={styles.headerLogo}
              resizeMode="contain"
            />
          ),
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerShadowVisible: true,
          headerLeft: () => (
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={24} color="#333" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="ellipsis-vertical" size={24} color="#333" />
            </TouchableOpacity>
          ),
        }}
      />
      <SafeAreaView style={styles.container} edges={['right', 'left', 'bottom']}>
        {/* Category Profile */}
        <View style={styles.categoryProfile}>
          <View style={styles.categoryLogo}>
            <Image 
              source={category.logo} 
              style={styles.categoryLogoImage} 
              resizeMode="contain"
            />
          </View>
          <View style={styles.categoryInfo}>
            <Text style={styles.categoryName}>{category.name}</Text>
            <Text style={styles.categoryCount}>{category.count} bài viết</Text>
          </View>
        </View>
        
        {/* Grid Content */}
        <FlatList
          style={styles.gridContainer}
          data={gridItems}
          numColumns={3}
          renderItem={({ item }) => (
            <View style={styles.gridItemContainer}>
              <Image source={item.image} style={styles.gridItemImage} />
              <View style={styles.videoIconContainer}>
                <Ionicons name="videocam" size={24} color="white" />
              </View>
            </View>
          )}
          keyExtractor={(item) => item.id}
        />
      </SafeAreaView>
    </>
  );
}

const { width } = Dimensions.get('window');
const gridItemWidth = width / 3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  headerButton: {
    width: 24,
    marginHorizontal: 8,
  },
  headerLogo: {
    width: 120,
    height: 30,
  },
  categoryProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  categoryLogo: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#383B50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  categoryLogoImage: {
    width: 50,
    height: 50,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 14,
    color: '#999',
  },
  // Grid View Styles
  gridContainer: {
    flex: 1,
  },
  gridItemContainer: {
    width: gridItemWidth,
    height: gridItemWidth,
    position: 'relative',
  },
  gridItemImage: {
    width: gridItemWidth,
    height: gridItemWidth,
    borderWidth: 0.5,
    borderColor: '#fff',
  },
  videoIconContainer: {
    position: 'absolute',
    right: 8,
    bottom: 8,
  },
}); 