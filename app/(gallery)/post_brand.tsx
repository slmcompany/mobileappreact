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
    image?: string;
    description?: string | null;
  };
  created_at?: string;
  media_contents?: { kind: string; link: string }[];
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
  code: string;
  id: number;
  name: string;
  sector: string;
  image?: string;
  description?: string | null;
}

interface CategoryUI {
  id: number;
  title: string;
  code: string;
  postCount: number;
  backgroundColor: string;
  image_url: string;
}

interface CategoryCardProps {
  title: string;
  postCount: number;
  backgroundColor: string;
  image_url: string;
  onPress: () => void;
}

// Component CategoryCard
const CategoryCard: React.FC<CategoryCardProps> = ({ title, postCount, backgroundColor, image_url, onPress }) => {
  return (
    <TouchableOpacity style={styles.categoryCard} onPress={onPress}>
      <View style={styles.categoryImageContainer}>
        <ImageWithFallback 
          uri={image_url}
          style={styles.categoryImage}
          priority={true}
        />
      </View>
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
  
  const fallbackImage = require('../../assets/images/replace-holder.png');
  
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
          resizeMode="contain"
          onLoadEnd={() => {
            setIsLoading(false);
            setIsImageLoaded(true);
          }}
        />
      ) : (
        <Image 
          source={{ uri: uri }}
          style={[style, !isImageLoaded && { opacity: 0 }]}
          resizeMode="contain"
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => {
            setIsLoading(false);
            setIsImageLoaded(true);
          }}
          onError={() => {
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
  const [categories, setCategories] = useState<CategoryUI[]>([]);

  // Fetch thông tin sector và categories
  const fetchSectorAndCategories = async () => {
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

  // Fetch bài viết và categories
  const fetchPostsAndCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch posts
      const response = await fetch('https://id.slmsolar.com/api/content');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      
      // Lọc bài viết theo sector code
      const filteredPosts = data.filter((post: Post) => {
        if (!post.category?.sector || !sector?.code) return false;
        return post.category.sector.toLowerCase() === sector.code.toLowerCase();
      });
      
      setPosts(filteredPosts);

      // Tạo categories với số lượng bài viết và lấy ảnh từ category
      const postCountByCategory = filteredPosts.reduce((acc: { [key: string]: { count: number; image?: string } }, post: Post) => {
        const categoryCode = post.category?.code?.toUpperCase();
        if (categoryCode) {
          if (!acc[categoryCode]) {
            acc[categoryCode] = {
              count: 1,
              image: post.category?.image // Lấy ảnh trực tiếp từ category với null safety
            };
          } else {
            acc[categoryCode].count += 1;
          }
        }
        return acc;
      }, {});

      // Tạo danh sách categories mới với số lượng bài viết và ảnh
      const newCategories: CategoryUI[] = [
        {
          id: 1,
          title: 'Hiểu Đúng Mua Đúng',
          code: 'HDMD',
          postCount: postCountByCategory['HDMD']?.count || 0,
          backgroundColor: '#363652',
          image_url: postCountByCategory['HDMD']?.image || sector?.image || ''
        },
        {
          id: 2,
          title: 'RìViu',
          code: 'RVSLM',
          postCount: postCountByCategory['RVSLM']?.count || 0,
          backgroundColor: '#363652',
          image_url: postCountByCategory['RVSLM']?.image || sector?.image || ''
        },
        {
          id: 3,
          title: 'Hỏi Xoay Hỏi Xoáy',
          code: 'HXHX',
          postCount: postCountByCategory['HXHX']?.count || 0,
          backgroundColor: '#363652',
          image_url: postCountByCategory['HXHX']?.image || sector?.image || ''
        },
        {
          id: 4,
          title: 'Em Biết Không?',
          code: 'EBK',
          postCount: postCountByCategory['EBK']?.count || 0,
          backgroundColor: '#363652',
          image_url: postCountByCategory['EBK']?.image || sector?.image || ''
        }
      ];

      setCategories(newCategories);

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSectorAndCategories();
  }, [brandId]);

  useEffect(() => {
    if (sector?.code) {
      fetchPostsAndCategories();
    }
  }, [sector?.code]);

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
              onPress={() => {
                fetchSectorAndCategories();
              }}
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
                <View style={styles.brandLogoContainer}>
                  <ImageWithFallback 
                    uri={sector?.image_rectangular}
                    style={styles.brandLogo}
                    priority={true}
                  />
                </View>
                <View style={styles.brandTextContainer}>
                  <Text style={styles.brandName}>{sector?.name || 'SolarMax'}</Text>
                  <View style={styles.brandPostAndSocial}>
                    <Text style={styles.brandPostCount}>
                      {posts.length} bài viết
                    </Text>
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
                  </View>
                </View>
              </View>
              
              {/* Products Section */}
              <TouchableOpacity 
                style={styles.productsSection}
                onPress={() => {
                  router.push({
                    pathname: "/(products)/product_brand" as const,
                    params: { 
                      id: brandId,
                      brandName: sector?.name || 'SolarMax'
                    }
                  });
                }}
              >
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
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  title={category.title}
                  postCount={category.postCount}
                  backgroundColor={category.backgroundColor}
                  image_url={category.image_url}
                  onPress={() => {
                    router.push({
                      pathname: "/(gallery)/post_category" as const,
                      params: { 
                        id: category.id,
                        categoryName: category.title,
                        brandId: brandId,
                        categoryCode: category.code
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
  brandLogoContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    marginRight: 12,
  },
  brandLogo: {
    width: '100%',
    height: '100%',
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
  brandPostAndSocial: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 8,
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
    width: 60,
    height: 40,
  },
  categoryImageContainer: {
    width: 80,
    height: 56,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#363652',
    justifyContent: 'center',
    alignItems: 'center',
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