import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, Text, View, ScrollView, 
  TouchableOpacity, Image, Dimensions, 
  ActivityIndicator, FlatList, StatusBar, Linking 
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { API_CONFIG } from '@/config/api';
import RenderHtml from 'react-native-render-html';
import * as ExpoLinking from 'expo-linking';

// Định nghĩa kiểu dữ liệu
interface MediaContent {
  id: number;
  link: string;
  title: string;
  kind: string;
  content_id: number;
}

interface Category {
  id: number;
  name: string;
  code: string;
  description: string | null;
}

interface Post {
  id: number;
  title: string;
  content: string;
  created_at: string;
  category_id: number;
  hashtag: string;
  category: Category;
  media_contents: MediaContent[];
}

export default function PostDetailScreen() {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(1);
  
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const slideshowRef = useRef<FlatList>(null);
  const { width } = Dimensions.get('window');

  // Fetch dữ liệu từ API
  const fetchPostDetails = async () => {
    if (!id) {
      setError('Không tìm thấy ID bài viết');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log(`Bắt đầu fetch chi tiết bài viết với ID: ${id}`);
      const response = await fetch(`${API_CONFIG.BASE_URL}/content`, {
        method: 'GET',
        headers: API_CONFIG.HEADERS
      });
      
      if (!response.ok) {
        throw new Error('Không thể kết nối đến máy chủ');
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        setError('Định dạng dữ liệu không đúng');
        return;
      }
      
      const foundPost = data.find(item => item.id === Number(id));
      
      if (!foundPost) {
        setError('Không tìm thấy bài viết');
        return;
      }
      
      setPost(foundPost);
    } catch (err) {
      console.error('Lỗi khi lấy dữ liệu:', err);
      setError('Đã xảy ra lỗi khi tải dữ liệu: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostDetails();
  }, [id]);

  // Định dạng thời gian
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay > 0) {
      return `${diffDay} ngày trước`;
    } else if (diffHour > 0) {
      return `${diffHour} giờ trước`;
    } else if (diffMin > 0) {
      return `${diffMin} phút trước`;
    } else {
      return 'Vừa xong';
    }
  };

  // Hàm chuyển slide
  const changeSlide = (direction: 'next' | 'prev') => {
    if (!post || !post.media_contents || post.media_contents.length <= 1) return;
    
    const totalSlides = post.media_contents.length;
    
    let newIndex = direction === 'next' ? currentSlide + 1 : currentSlide - 1;
    
    // Kiểm tra giới hạn
    if (newIndex < 1) newIndex = totalSlides;
    if (newIndex > totalSlides) newIndex = 1;
    
    // Cập nhật trạng thái
    setCurrentSlide(newIndex);
    
    // Scroll đến slide mới
    if (slideshowRef.current) {
      slideshowRef.current.scrollToIndex({ 
        index: newIndex - 1,
        animated: true
      });
    }
  };

  // Hiển thị các slide của post
  const renderSlides = () => {
    if (!post || !post.media_contents || post.media_contents.length === 0) {
      return (
        <View style={styles.noImageContainer}>
          <Ionicons name="image-outline" size={48} color="#ddd" />
          <Text style={styles.noImageText}>Không có hình ảnh</Text>
        </View>
      );
    }

    return (
      <View style={styles.slideshowContainer}>
        <FlatList
          ref={slideshowRef}
          data={post.media_contents}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id.toString()}
          onMomentumScrollEnd={(event) => {
            const slideWidth = width;
            const newIndex = Math.floor(event.nativeEvent.contentOffset.x / slideWidth) + 1;
            setCurrentSlide(newIndex);
          }}
          renderItem={({ item }) => (
            <Image 
              source={{ uri: item.link }} 
              style={styles.postImage}
              resizeMode="cover"
            />
          )}
        />
        
        {post.media_contents.length > 1 && (
          <>
            <TouchableOpacity 
              style={[styles.slideNavButton, styles.slideNavLeft]} 
              onPress={() => changeSlide('prev')}
            >
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.slideNavButton, styles.slideNavRight]} 
              onPress={() => changeSlide('next')}
            >
              <Ionicons name="chevron-forward" size={24} color="white" />
            </TouchableOpacity>
            
            <View style={styles.slideIndicator}>
              <Text style={styles.slideIndicatorText}>
                {currentSlide}/{post.media_contents.length}
              </Text>
            </View>
          </>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Stack.Screen 
        options={{ 
          headerShown: false,
        }} 
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top > 0 ? 0 : 10 }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết bài viết</Text>
        <View style={styles.iconPlaceholder} />
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D9261C" />
          <Text style={styles.loadingText}>Đang tải bài viết...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#D9261C" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchPostDetails}
          >
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : post ? (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.postContainer}>
            <View style={styles.postHeader}>
              <View style={styles.userContainer}>
                <Image 
                  source={require('../assets/images/solarmax-logo.png')} 
                  style={styles.avatar}
                  resizeMode="contain"
                />
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>SolarMax</Text>
                  <Text style={styles.postTime}>{formatTimeAgo(post.created_at)}</Text>
                </View>
              </View>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{post.category.name}</Text>
              </View>
            </View>
            
            {/* Images */}
            <View style={styles.imageContainer}>
              {renderSlides()}
            </View>
            
            {/* Content */}
            <View style={styles.contentContainer}>
              <Text style={styles.title}>{post.title}</Text>
              
              <View style={styles.htmlContent}>
                <RenderHtml 
                  contentWidth={width - 32} 
                  source={{ html: post.content }} 
                  tagsStyles={{
                    p: { fontSize: 16, lineHeight: 24, color: '#333', marginBottom: 10 },
                    a: { color: '#0066cc', textDecorationLine: 'underline' },
                    br: { height: 10 }
                  }}
                  renderersProps={{
                    a: {
                      onPress: (_, href) => {
                        Linking.openURL(href);
                      }
                    }
                  }}
                />
              </View>
              
              <Text style={styles.hashtags}>{post.hashtag}</Text>
            </View>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Không có dữ liệu</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  iconPlaceholder: {
    width: 40,
    height: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginVertical: 10,
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#D9261C',
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  postContainer: {
    flex: 1,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userInfo: {
    justifyContent: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  postTime: {
    fontSize: 14,
    color: '#999',
  },
  categoryBadge: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  categoryText: {
    color: '#D9261C',
    fontSize: 14,
    fontWeight: '500',
  },
  imageContainer: {
    width: '100%',
  },
  slideshowContainer: {
    position: 'relative',
    width: width,
    height: width,
  },
  postImage: {
    width: width,
    height: width,
  },
  slideNavButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -24 }],
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  slideNavLeft: {
    left: 10,
  },
  slideNavRight: {
    right: 10,
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
  noImageContainer: {
    width: width,
    height: width / 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  noImageText: {
    color: '#999',
    marginTop: 10,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 30,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  htmlContent: {
    marginBottom: 20,
  },
  hashtags: {
    color: '#0066cc',
    fontSize: 14,
    marginTop: 16,
  }
}); 