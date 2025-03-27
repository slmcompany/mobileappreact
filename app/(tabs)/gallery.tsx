import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Platform, Dimensions, TextInput } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';

// Dữ liệu người dùng
const users = [
  {
    id: '1',
    name: 'SolarMax',
    avatar: require('../../assets/images/solarmax-logo.png'),
  },
  {
    id: '2',
    name: 'Eliton',
    avatar: require('../../assets/images/eliton-logo.png'),
  }
];

// Dữ liệu bài đăng
const posts = [
  {
    id: '1',
    userId: '1',
    title: 'Diện mặt trời SoLarMax | Em biết không? | Phần 4 | DA296 - Hải Dương...',
    content: '',
    image: require('../../assets/images/sales-promo.png'),
    time: '0 min ago'
  },
  {
    id: '2',
    userId: '2',
    title: 'Diện mặt trời SoLarMax | Em biết không? | Phần 4 | DA296 - Hải Dương...',
    content: '',
    image: require('../../assets/images/team-promo.png'),
    time: '0 min ago'
  }
];

export default function GalleryScreen() {
  const [currentSlide, setCurrentSlide] = useState(1);
  const totalSlides = 3;
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const navigateToBrand = (brandId: string) => {
    if (brandId === '1') {
      router.push('/brand/solarmax');
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Thư viện nội dung',
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: '600',
            color: '#333',
          },
          headerStyle: {
            backgroundColor: 'white',
          },
          headerShadowVisible: true,
          headerLeft: () => (
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="chevron-back" size={24} color="#333" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="search-outline" size={24} color="#333" />
            </TouchableOpacity>
          ),
        }}
      />
      <SafeAreaView style={[styles.container, { backgroundColor: '#fff' }]}>
        {/* Danh sách người dùng */}
        <View style={styles.usersContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.usersList}
          >
            {users.map((user) => (
              <TouchableOpacity 
                key={user.id} 
                style={styles.userItem}
                onPress={() => navigateToBrand(user.id)}
              >
                <Image 
                  source={user.avatar} 
                  style={styles.userAvatar} 
                  resizeMode="contain"
                />
                <Text style={styles.userName}>{user.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {/* Nội dung */}
        <ScrollView 
          showsVerticalScrollIndicator={false}
        >
          {posts.map((post) => {
            const user = users.find(u => u.id === post.userId);
            return (
              <View key={post.id} style={styles.postContainer}>
                <View style={styles.postHeader}>
                  <Image 
                    source={user?.avatar} 
                    style={styles.postAvatar} 
                    resizeMode="contain"
                  />
                  <Text style={styles.postUsername}>{user?.name}</Text>
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
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  headerButton: {
    width: 24,
    marginHorizontal: 8,
  },
  usersContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  usersList: {
    paddingHorizontal: 15,
  },
  userItem: {
    alignItems: 'center',
    marginRight: 20,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 5,
    overflow: 'hidden',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#eeeeee',
  },
  userName: {
    fontSize: 12,
    color: '#000000',
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
  }
}); 