import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Dimensions, StatusBar, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';

// Dữ liệu bài đăng
const posts = [
  {
    id: '1',
    title: 'Diện mặt trời SoLarMax | Em biết không? | Phần 4 | DA296 - Hải Dương...',
    content: '',
    image: require('../../assets/images/sales-promo.png'),
    time: '0 min ago'
  },
  {
    id: '2',
    title: 'Diện mặt trời SoLarMax | Em biết không? | Phần 4 | DA296 - Hải Dương...',
    content: '',
    image: require('../../assets/images/team-promo.png'),
    time: '0 min ago'
  }
];

// Dữ liệu grid
const gridItems = [
  { id: '1', image: require('../../assets/images/sales-promo.png') },
  { id: '2', image: require('../../assets/images/team-promo.png') },
  { id: '3', image: require('../../assets/images/sales-promo.png') },
  { id: '4', image: require('../../assets/images/team-promo.png') },
  { id: '5', image: require('../../assets/images/sales-promo.png') },
  { id: '6', image: require('../../assets/images/team-promo.png') }
];

// Dữ liệu danh mục
const categories = [
  { 
    id: '1', 
    name: 'Hiểu Đúng Mua Đúng', 
    count: 12,
    logo: require('../../assets/images/sales-promo.png') 
  },
  { 
    id: '2', 
    name: 'RiViu', 
    count: 12,
    logo: require('../../assets/images/team-promo.png') 
  },
  { 
    id: '3', 
    name: 'Hỏi Xoay Hỏi Xoắy', 
    count: 12,
    logo: require('../../assets/images/sales-promo.png') 
  },
  { 
    id: '4', 
    name: 'Em Biết Không?', 
    count: 12,
    logo: require('../../assets/images/team-promo.png') 
  }
];

export default function SolarMaxBrandScreen() {
  const [currentSlide, setCurrentSlide] = useState(1);
  const totalSlides = 3;
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0); // 0: feed, 1: grid, 2: categories

  // Render từng tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // Newsfeed
        return (
          <ScrollView style={styles.content}>
            {posts.map((post, index) => (
              <View key={post.id} style={styles.postContainer}>
                <View style={styles.postHeader}>
                  <Image 
                    source={require('../../assets/images/solarmax-logo.png')} 
                    style={styles.postAvatar} 
                    resizeMode="contain"
                  />
                  <Text style={styles.postUsername}>SolarMax</Text>
                  <Text style={styles.postTime}>{post.time}</Text>
                </View>
                
                <View style={styles.postContent}>
                  <Image source={post.image} style={styles.postImage} />
                  <View style={styles.slideIndicator}>
                    <Text style={styles.slideIndicatorText}>{currentSlide}/{totalSlides}</Text>
                  </View>
                </View>
                
                <View style={styles.postFooter}>
                  <Text style={styles.postTitle}>{post.title}</Text>
                  <TouchableOpacity>
                    <Text style={styles.readMoreText}>xem thêm</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        );
      
      case 1: // Grid View
        return (
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
        );
      
      case 2: // Categories
        return (
          <View style={styles.categoriesContainer}>
            {categories.map((category) => (
              <TouchableOpacity 
                key={category.id} 
                style={styles.categoryItem}
                onPress={() => router.push(`/category/${category.id}`)}
              >
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
                <Ionicons name="chevron-forward" size={22} color="#999" />
              </TouchableOpacity>
            ))}
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" />
      <Stack.Screen
        options={{
          title: '',
          headerStyle: {
            backgroundColor: '#00A650',
          },
          headerShadowVisible: false,
          headerTintColor: 'white',
          headerLeft: () => (
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="ellipsis-vertical" size={24} color="white" />
            </TouchableOpacity>
          ),
        }}
      />
      <SafeAreaView style={styles.container} edges={['right', 'left', 'bottom']}>
        {/* Brand Profile */}
        <View style={styles.brandProfile}>
          <View style={styles.brandInfo}>
            <Image 
              source={require('../../assets/images/solarmax-logo.png')} 
              style={styles.brandLogo} 
              resizeMode="contain"
            />
            <View style={styles.brandDetails}>
              <Text style={styles.brandName}>SolarMax</Text>
              <Text style={styles.postCount}>98 bài viết</Text>
              
              <View style={styles.socialLinks}>
                <TouchableOpacity style={styles.socialButton}>
                  <Ionicons name="logo-youtube" size={22} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                  <Ionicons name="logo-facebook" size={22} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                  <Ionicons name="logo-tiktok" size={22} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
          {/* Products Link */}
          <TouchableOpacity style={styles.productsLink}>
            <Ionicons name="cube-outline" size={22} color="white" style={styles.productsIcon} />
            <Text style={styles.productsText}>Sản phẩm của SolarMax</Text>
            <View style={styles.productsCount}>
              <Text style={styles.productsCountText}>16 sản phẩm</Text>
              <Ionicons name="chevron-forward" size={16} color="white" />
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <View style={styles.tabs}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 0 && styles.activeTab]} 
              onPress={() => setActiveTab(0)}
            >
              <Ionicons name="flame-outline" size={24} color={activeTab === 0 ? "#F44336" : "#666"} />
              {activeTab === 0 && <View style={styles.activeTabIndicator} />}
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 1 && styles.activeTab]} 
              onPress={() => setActiveTab(1)}
            >
              <Ionicons name="grid-outline" size={24} color={activeTab === 1 ? "#F44336" : "#666"} />
              {activeTab === 1 && <View style={styles.activeTabIndicator} />}
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 2 && styles.activeTab]} 
              onPress={() => setActiveTab(2)}
            >
              <Ionicons name="list-outline" size={24} color={activeTab === 2 ? "#F44336" : "#666"} />
              {activeTab === 2 && <View style={styles.activeTabIndicator} />}
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Tab Content */}
        {renderTabContent()}
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
  brandProfile: {
    backgroundColor: '#00A650',
    padding: 16,
    paddingBottom: 12,
  },
  brandInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandLogo: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    marginRight: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  brandDetails: {
    flex: 1,
  },
  brandName: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  postCount: {
    color: 'white',
    fontSize: 14,
    marginBottom: 8,
  },
  socialLinks: {
    flexDirection: 'row',
  },
  socialButton: {
    marginRight: 16,
  },
  productsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
    padding: 12,
  },
  productsIcon: {
    marginRight: 12,
  },
  productsText: {
    color: 'white',
    fontSize: 15,
    flex: 1,
  },
  productsCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productsCountText: {
    color: 'white',
    fontSize: 14,
    marginRight: 4,
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: 'white',
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
  },
  tab: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    position: 'relative',
  },
  activeTab: {
    borderBottomWidth: 0,
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    width: '100%',
    backgroundColor: '#F44336',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  content: {
    flex: 1,
  },
  postContainer: {
    marginBottom: 15,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  postAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
    overflow: 'hidden',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#eeeeee',
  },
  postUsername: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
    flex: 1,
  },
  postTime: {
    fontSize: 12,
    color: '#999999',
  },
  postContent: {
    position: 'relative',
  },
  postImage: {
    width: width,
    height: width,
  },
  slideIndicator: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  slideIndicatorText: {
    color: '#ffffff',
    fontSize: 12,
  },
  postFooter: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  postTitle: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 20,
  },
  readMoreText: {
    color: '#999999',
    fontSize: 14,
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
  // Categories View Styles
  categoriesContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryLogo: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#383B50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  categoryLogoImage: {
    width: 40,
    height: 40,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 14,
    color: '#999',
  }
}); 