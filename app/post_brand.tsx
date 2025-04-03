import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Định nghĩa kiểu dữ liệu
interface Post {
  id: number;
  title: string;
  description?: string;
  content?: string;
  hashtag?: string;
  imageUrl?: string;
  category?: {
    code: string;
    id: number;
    name: string;
    sector: string;
  };
  created_at?: string;
}

interface Sector {
  id: number;
  name: string;
  code: string;
  image: string;
  image_rectangular: string;
  description: string | null;
  tech_phone: string | null;
  sale_phone: string | null;
}

interface Category {
  id: string;
  title: string;
  postCount: number;
  backgroundColor: string;
  image: any;
  code: string;
}

interface CategoryCardProps {
  title: string;
  postCount: number;
  backgroundColor: string;
  image: any;
  onPress: () => void;
}

// Component CategoryCard
const CategoryCard: React.FC<CategoryCardProps> = ({ title, postCount, backgroundColor, image, onPress }) => {
  return (
    <TouchableOpacity style={styles.categoryCard} onPress={onPress}>
      <Image source={image} style={[styles.categoryImage, { backgroundColor }]} resizeMode="contain" />
      <View style={styles.categoryContent}>
        <View style={styles.categoryTextContainer}>
          <Text style={styles.categoryTitle}>{title}</Text>
          <Text style={styles.categoryPostCount}>{postCount} bài viết</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#7B7D9D" />
    </TouchableOpacity>
  );
};

// Component ImageWithFallback để xử lý ảnh và lỗi CORS
const ImageWithFallback: React.FC<{
  uri: string | undefined;
  style: any;
  priority?: boolean;
}> = ({ uri, style, priority = false }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  
  const fallbackImage = require('../assets/images/replace-holder.png');
  
  useEffect(() => {
    if (uri && priority) {
      Image.prefetch(uri).catch(() => setHasError(true));
    }
  }, [uri, priority]);
  
  return (
    <View style={[style, { overflow: 'hidden', position: 'relative' }]}>
      {isLoading && (
        <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }]}>
          <ActivityIndicator size="small" color="#D9261C" />
        </View>
      )}
      
      {hasError || !uri ? (
        <Image 
          source={fallbackImage}
          style={style}
          resizeMode="cover"
          onLoadEnd={() => {
            setIsLoading(false);
            setIsImageLoaded(true);
          }}
        />
      ) : (
        <Image 
          source={{ uri: uri }}
          style={[style, !isImageLoaded && { opacity: 0 }]}
          resizeMode="cover"
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => {
            setIsLoading(false);
            setIsImageLoaded(true);
          }}
          onError={() => {
            console.log("Lỗi khi tải ảnh:", uri);
            setHasError(true);
            setIsLoading(false);
          }}
        />
      )}
      
      {hasError && (
        <View style={styles.errorOverlay}>
          <Text style={{ color: 'white', fontSize: 10, textAlign: 'center' }}>Đã dùng ảnh dự phòng</Text>
        </View>
      )}
    </View>
  );
};

// Hàm format thời gian
const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (isNaN(seconds)) {
    return '0 phút trước';
  }

  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) {
    return `${interval} năm trước`;
  }

  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) {
    return `${interval} tháng trước`;
  }

  interval = Math.floor(seconds / 86400);
  if (interval >= 1) {
    return `${interval} ngày trước`;
  }

  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
    return `${interval} giờ trước`;
  }

  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
    return `${interval} phút trước`;
  }

  if (seconds < 10) return 'vừa xong';

  return `${Math.floor(seconds)} giây trước`;
};

export default function PostBrandScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { brandId } = params;

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sector, setSector] = useState<Sector | null>(null);
  const [categories, setCategories] = useState<Category[]>([
    {
      id: '1',
      title: 'Hiểu Đúng Mua Đúng',
      postCount: 0,
      backgroundColor: '#363652',
      image: require('../assets/images/category_1.png'),
      code: 'HDMD'
    },
    {
      id: '2',
      title: 'RìViu',
      postCount: 0,
      backgroundColor: '#363652',
      image: require('../assets/images/category_2.png'),
      code: 'REVIEW'
    },
    {
      id: '3',
      title: 'Hỏi Xoay Hỏi Xoáy',
      postCount: 0,
      backgroundColor: '#363652',
      image: require('../assets/images/category_3.png'),
      code: 'HXHX'
    },
    {
      id: '4',
      title: 'Em Biết Không?',
      postCount: 0,
      backgroundColor: '#363652',
      image: require('../assets/images/category_4.png'),
      code: 'EBK'
    },
  ]);

  // Fetch thông tin sector
  const fetchSector = async () => {
    try {
      const response = await fetch('https://id.slmsolar.com/api/sector');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      const currentSector = data.find((s: Sector) => s.id.toString() === brandId);
      setSector(currentSector || null);
    } catch (error) {
      console.error('Error fetching sector:', error);
      setError('Không thể tải thông tin thương hiệu');
    }
  };

  // Fetch bài viết theo brand và cập nhật số lượng bài viết cho từng chuyên mục
  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('https://id.slmsolar.com/api/content');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      
      // Lọc bài viết theo sector code
      const filteredPosts = data.filter((post: Post) => 
        post.category?.sector === sector?.code
      );
      
      setPosts(filteredPosts);

      // Cập nhật số lượng bài viết cho từng chuyên mục
      setCategories(prevCategories => 
        prevCategories.map(category => ({
          ...category,
          postCount: filteredPosts.filter((post: Post) => 
            post.category?.code === category.code
          ).length
        }))
      );

    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Không thể tải bài viết');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSector();
  }, [brandId]);

  useEffect(() => {
    if (sector) {
      fetchPosts();
    }
  }, [sector]);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <SafeAreaView style={styles.container} edges={['top']}>
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
              onPress={() => fetchPosts()}
            >
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton}>
                <Ionicons name="ellipsis-vertical" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Brand Profile */}
            <View style={styles.brandProfile}>
              <View style={styles.brandInfo}>
                <Image 
                  source={require('../assets/images/brand_logo.png')}
                  style={styles.brandLogo}
                  resizeMode="contain"
                />
                <View style={styles.brandTextContainer}>
                  <Text style={styles.brandName}>{sector?.name || 'SolarMax'}</Text>
                  <Text style={styles.brandPostCount}>{posts.length} bài viết</Text>
                </View>
              </View>
              
              <View style={styles.socialButtons}>
                <TouchableOpacity style={styles.socialButton}>
                  <Ionicons name="logo-facebook" size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                  <Ionicons name="logo-youtube" size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                  <Ionicons name="logo-instagram" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Products Section */}
              <TouchableOpacity style={styles.productsSection}>
                <View style={styles.productsLeft}>
                  <Ionicons name="cube-outline" size={24} color="#FFFFFF" />
                  <Text style={styles.productsTitle}>Sản phẩm của {sector?.name || 'SolarMax'}</Text>
                </View>
                <View style={styles.productsRight}>
                  <Text style={styles.productsCount}>16 sản phẩm</Text>
                  <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            </View>

            {/* Categories */}
            <View style={styles.categoriesContainer}>
              {categories.map((category, index) => (
                <CategoryCard
                  key={category.id}
                  title={category.title}
                  postCount={category.postCount}
                  backgroundColor={category.backgroundColor}
                  image={category.image}
                  onPress={() => {
                    router.push({
                      pathname: '/category/[id]' as const,
                      params: { 
                        id: category.id,
                        categoryName: category.title,
                        brandId: brandId
                      }
                    });
                  }}
                />
              ))}
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#0F974A',
  },
  headerButton: {
    padding: 8,
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
  contentContainer: {
    flex: 1,
  },
  brandProfile: {
    backgroundColor: '#0F974A',
    padding: 16,
  },
  brandInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandLogo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  brandTextContainer: {
    flex: 1,
  },
  brandName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  brandPostCount: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  socialButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(39, 39, 62, 0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(39, 39, 62, 0.16)',
    borderRadius: 4,
    padding: 8,
  },
  productsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  productsTitle: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  productsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  productsCount: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  categoriesContainer: {
    padding: 16,
    gap: 8,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  categoryImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  categoryContent: {
    flex: 1,
    paddingVertical: 8,
  },
  categoryTextContainer: {
    justifyContent: 'center',
    height: 40,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7B7D9D',
  },
  categoryPostCount: {
    fontSize: 12,
    color: '#7B7D9D',
  },
  errorOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
}); 