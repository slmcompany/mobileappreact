import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_URL, API_ROUTES } from '../../constants';

// Dữ liệu người dùng
const defaultUsers = [
  {
    id: '1',
    name: 'SolarMax',
    avatar: require('../../assets/images/solarmax-logo.png'),
    postCount: 0
  },
  {
    id: '2',
    name: 'Eliton',
    avatar: require('../../assets/images/eliton-logo.png'),
    postCount: 0
  },
];

// Interface cho API response
interface MediaContent {
  kind: 'image' | 'video';
  title: string;
  content_id: number;
  link: string;
  id: number;
  created_at: string;
}

interface Category {
  name: string;
  code: string;
  id: number;
  description: null | string;
}

interface ApiPost {
  id: number;
  title: string;
  category_id: number;
  hashtag: string;
  content: string;
  created_at: string;
  slug: string;
  media_contents: MediaContent[];
  category: Category;
}

// Interface cho bài đăng đã xử lý
interface Post {
  id: number;
  title: string;
  hashtag: string;
  imageUrl: string;
  brand: 'solarmax' | 'eliton';
  createdAt: string;
}

export default function GalleryTab() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState(defaultUsers);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentBrand, setCurrentBrand] = useState('solarmax');
  const [selectedUser, setSelectedUser] = useState<typeof defaultUsers[0]>(defaultUsers[0]);

  // Xử lý URL ảnh
  const processImageUrl = (url: string | undefined) => {
    if (!url) return undefined;
    
    // Đảm bảo url là string
    const urlString = String(url);
    
    // Kiểm tra nếu URL đã có https
    if (urlString.startsWith('https://')) {
      return urlString;
    }
    
    // Thêm https nếu URL bắt đầu với //
    if (urlString.startsWith('//')) {
      return `https:${urlString}`;
    }
    
    // Thêm https nếu URL bắt đầu với /
    if (urlString.startsWith('/')) {
      return `https://api.slmsolar.com${urlString}`;
    }
    
    // Mặc định thêm https:// nếu không có protocol
    if (!urlString.includes('://')) {
      return `https://${urlString}`;
    }
    
    return urlString;
  };

  // Fetch dữ liệu từ API
  const fetchPosts = async (brand: string = 'solarmax') => {
    try {
      setLoading(true);
      setError(null);

      // Gọi API với endpoint mới
      const response = await axios.get(`${API_URL}${API_ROUTES.CONTENT}`);

      // Kiểm tra và xử lý response
      if (response.data && Array.isArray(response.data)) {
        const apiPosts: ApiPost[] = response.data;
        
        // Đếm số bài viết cho mỗi brand
        const elitonPostCount = apiPosts.filter(post => post.category?.code === 'ELITON').length;
        const solarmaxPostCount = apiPosts.filter(post => post.category?.code !== 'ELITON').length;
        
        // Cập nhật số lượng bài viết cho users
        setUsers(prevUsers => prevUsers.map(user => ({
          ...user,
          postCount: user.id === '1' ? solarmaxPostCount : elitonPostCount
        })));
        
        // Lọc bài viết theo brand nếu cần
        const filteredPosts = brand === 'eliton' 
          ? apiPosts.filter(post => post.category?.code === 'ELITON')
          : apiPosts.filter(post => post.category?.code !== 'ELITON');
        
        // Chuyển đổi dữ liệu từ API sang định dạng hiển thị
        const processedPosts: Post[] = filteredPosts.map(post => {
          // Tìm URL ảnh từ media_contents
          let imageUrl = '';
          if (post.media_contents && Array.isArray(post.media_contents)) {
            const imageContent = post.media_contents.find(media => media.kind === 'image');
            if (imageContent && imageContent.link) {
              imageUrl = imageContent.link;
            }
          }

          return {
            id: post.id,
            title: post.title,
            hashtag: post.hashtag || '',
            imageUrl: imageUrl,
            brand: post.category?.code === 'ELITON' ? 'eliton' : 'solarmax',
            createdAt: post.created_at
          };
        });

        setPosts(processedPosts);
      } else {
        throw new Error('Dữ liệu không hợp lệ');
      }
    } catch (err) {
      console.error('Lỗi khi lấy dữ liệu:', err);
      
      if (axios.isAxiosError(err)) {
        if (err.response) {
          // Lỗi từ server (status code không phải 2xx)
          setError(`Lỗi từ server: ${err.response.status} - ${err.response.data?.message || 'Không có thông tin chi tiết'}`);
        } else if (err.request) {
          // Không nhận được response
          setError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng của bạn.');
        } else {
          // Lỗi khi set up request
          setError('Đã xảy ra lỗi khi gửi yêu cầu.');
        }
      } else {
        setError('Đã xảy ra lỗi không xác định.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(currentBrand);
  }, [currentBrand]);

  const handleUserSelect = (user: typeof defaultUsers[0]) => {
    const brand = user.id === '1' ? 'solarmax' : 'eliton';
    setSelectedUser(user);
    setCurrentBrand(brand);
  };

  // Format thời gian
  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInMillis = now.getTime() - past.getTime();
    
    const minutes = Math.floor(diffInMillis / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} ngày trước`;
    if (hours > 0) return `${hours} giờ trước`;
    if (minutes > 0) return `${minutes} phút trước`;
    return 'Vừa xong';
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#2B2B3D" />
      <SafeAreaView style={styles.safeArea} edges={['top', 'right', 'left']}>
        <Stack.Screen
          options={{
            headerShown: true,
            headerStyle: {
              backgroundColor: '#2B2B3D',
            },
            headerShadowVisible: false,
            headerTitle: 'Thư viện nội dung',
            headerTitleStyle: {
              fontFamily: 'Roboto Flex',
              fontSize: 20,
              fontWeight: '600',
              color: '#FFFFFF',
            },
            headerTitleAlign: 'center',
            headerLeft: () => (
              <TouchableOpacity 
                style={styles.backButton}
                onPress={handleBack}
              >
                <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            ),
          }}
        />
        
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
                style={[
                  styles.userItem,
                  selectedUser?.id === user.id && styles.activeUserItem,
                ]}
                onPress={() => handleUserSelect(user)}
              >
                <Image
                  source={user.avatar}
                  style={[
                    styles.userAvatar,
                    selectedUser?.id === user.id && styles.activeUserAvatar,
                  ]}
                  resizeMode="contain"
                />
                <View style={styles.userTextContainer}>
                  <Text 
                    style={[
                      styles.userName,
                      selectedUser?.id === user.id && styles.activeUserName,
                    ]}
                    numberOfLines={1}
                  >
                    {user.name}
                  </Text>
                  <Text style={styles.postCount}>
                    {user.postCount} bài viết
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {/* Nội dung */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#D9261C" />
            <Text style={styles.loadingText}>Đang tải nội dung...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#D9261C" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => fetchPosts(currentBrand)}
            >
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView 
            style={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {posts.map((post) => (
              <View key={post.id} style={styles.postContainer}>
                <View style={styles.postItem}>
                  <View style={styles.userInfoBar}>
                    <View style={styles.brandCircle}>
                      <Text style={styles.brandText}>
                        {post.brand === 'eliton' ? 'E' : 'S'}
                      </Text>
                    </View>
                    <View style={styles.userInfoContent}>
                      <Text style={styles.postAuthor}>
                        {post.brand === 'eliton' ? 'Eliton' : 'SolarMax'}
                      </Text>
                      <View style={styles.timeContainer}>
                        <Text style={styles.postTime}>{getTimeAgo(post.createdAt)}</Text>
                      </View>
                    </View>
                    <TouchableOpacity style={styles.moreButton}>
                      <Ionicons name="ellipsis-vertical" size={20} color="#7B7D9D" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.postImageContainer}>
                    <Image 
                      source={post.imageUrl ? { uri: post.imageUrl } : require('../../assets/images/replace-holder.png')}
                      style={styles.postImage}
                      resizeMode="cover"
                    />
                    <View style={styles.postIndicators}>
                      <View style={styles.dotsContainer}>
                        <View style={[styles.dot, styles.activeDot]} />
                        <View style={styles.dot} />
                        <View style={styles.dot} />
                      </View>
                      <Text style={styles.pageIndicator}>1/3</Text>
                    </View>
                  </View>

                  <View style={styles.postDetailContainer}>
                    <TouchableOpacity 
                      onPress={() => router.push({
                        pathname: "/post-detail",
                        params: { id: post.id }
                      })}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.postDetailText, styles.postTitle]} numberOfLines={2}>
                        {post.title}
                        <Text style={styles.seeMoreText}> ...xem thêm</Text>
                      </Text>
                    </TouchableOpacity>
                    <Text style={styles.hashtagText}>{post.hashtag}</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#2B2B3D',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#2B2B3D',
  },
  backButton: {
    padding: 8,
    marginLeft: 8,
  },
  headerButton: {
    elevation: 2,
    position: 'relative',
  },
  usersContainer: {
    backgroundColor: '#2B2B3D',
    paddingVertical: 16,
    borderBottomWidth: 0,
  },
  usersList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  userItem: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    width: 180,
    flexDirection: 'row',
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    padding: 8,
  },
  userTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    fontFamily: 'Roboto Flex',
    marginBottom: 4,
  },
  postCount: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    fontFamily: 'Roboto Flex',
  },
  activeUserItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeUserAvatar: {
    borderWidth: 0,
  },
  activeUserName: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F8',
  },
  loadingText: {
    marginTop: 12,
    color: '#27273E',
    fontSize: 14,
    fontFamily: 'Roboto Flex',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F8',
  },
  errorText: {
    marginVertical: 12,
    color: '#27273E',
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'Roboto Flex',
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#ED1C24',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
    fontFamily: 'Roboto Flex',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#2B2B3D',
    paddingTop: 16,
  },
  postContainer: {
    marginBottom: 16,
    marginHorizontal: 0,
  },
  postItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    overflow: 'hidden',
    shadowColor: '#27273E',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.16,
    shadowRadius: 3,
    elevation: 3,
  },
  userInfoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  brandCircle: {
    width: 32,
    height: 32,
    borderRadius: 32,
    marginRight: 8,
    backgroundColor: '#ED1C24',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Roboto Flex',
  },
  userInfoContent: {
    flex: 1,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  postAuthor: {
    fontSize: 14,
    fontWeight: '500',
    color: '#27273E',
    fontFamily: 'Roboto Flex',
    marginBottom: 2,
  },
  postTime: {
    fontSize: 8,
    color: '#9394B0',
    fontFamily: 'Roboto Flex',
  },
  moreButton: {
    padding: 8,
    marginRight: -8,
  },
  postImageContainer: {
    position: 'relative',
    width: '100%',
    height: undefined,
    aspectRatio: 1,
  },
  postImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5F8',
  },
  postIndicators: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(39, 39, 62, 0.3)',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#C4C4D4',
  },
  activeDot: {
    backgroundColor: '#ED1C24',
  },
  pageIndicator: {
    fontSize: 8,
    color: '#FFFFFF',
    fontWeight: '400',
    backgroundColor: 'rgba(39, 39, 62, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontFamily: 'Roboto Flex',
  },
  postDetailContainer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#DCDCE6',
  },
  postDetailText: {
    fontSize: 14,
    color: '#27273E',
    lineHeight: 20,
    fontFamily: 'Roboto Flex',
  },
  postTitle: {
    textDecorationLine: 'underline',
  },
  seeMoreText: {
    fontSize: 14,
    color: '#9394B0',
    fontFamily: 'Roboto Flex',
  },
  hashtagText: {
    fontSize: 12,
    color: '#9394B0',
    marginTop: 4,
    fontFamily: 'Roboto Flex',
  }
}); 