import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Image, Linking, Alert, ImageStyle, StyleProp, ViewStyle, useWindowDimensions, Modal, FlatList, Dimensions, Platform, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import RenderHtml, { 
  HTMLElementModel,
  HTMLContentModel,
  defaultSystemFonts,
  useContentWidth,
  TRenderEngineConfig,
  MixedStyleDeclaration
} from 'react-native-render-html';
import WebView from 'react-native-webview';

// Định nghĩa kiểu dữ liệu
interface MediaContent {
  id: number;
  title: string;
  kind: string;
  content_id: number;
  link: string;
  thumbnail: string | null;
  created_at: string;
}

interface Post {
  id: number;
  title: string;
  description?: string;
  hashtag?: string;
  imageUrl?: string;
  media_contents?: MediaContent[];
  category?: {
    code: string;
    id: number;
    name: string;
    sector: string;
  };
  content?: string;
  created_at?: string;
  hasImage: boolean;
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
  post_count?: number;
}

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

// Thêm định nghĩa kiểu cho ImageWithFallback
interface ImageWithFallbackProps {
  uri: string | undefined;
  style: StyleProp<ViewStyle & ImageStyle>;
  priority?: boolean;
}

// Thêm component riêng để xử lý ảnh và lỗi CORS
const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ uri, style, priority = false }) => {
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
    <View style={[style as ViewStyle, {overflow: 'hidden', position: 'relative'}]}>
      {isLoading && (
        <View style={[StyleSheet.absoluteFill, {justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5'}]}>
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
          style={[
            style,
            !isImageLoaded && { opacity: 0 }
          ]}
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
          <Text style={{color: 'white', fontSize: 10, textAlign: 'center'}}>Đã dùng ảnh dự phòng</Text>
        </View>
      )}
    </View>
  );
};

// Định nghĩa interface cho API response
interface ContentItem {
  id: number;
  title: string;
  description?: string;
  content?: string;
  hashtag?: string;
  media_contents?: MediaContent[];
  category?: {
    code: string;
    id: number;
    name: string;
    sector: string;
  };
  created_at?: string;
}

// Thêm hàm format thời gian
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

// Thêm hàm stripHtmlTags sau phần import
const stripHtmlTags = (html: string) => {
  if (!html) return '';
  const text = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  return text.length > 80 ? text.substring(0, 80) : text;
};

// Thêm interface cho FlatList item
interface GalleryItem {
  uri: string;
  postId: number;
  index: number;
  kind: string;
  videoId: string | null;
}

// Add custom renderers configuration
const customHTMLElementModels = {
  iframe: HTMLElementModel.fromCustomModel({
    contentModel: HTMLContentModel.block,
    isVoid: true,
    tagName: 'iframe'
  })
};

const renderersProps = {
  a: {
    onPress: (event: any, href: string) => {
      if (href) {
        Linking.openURL(href).catch(error => {
          console.warn('Không thể mở link:', error);
        });
      }
    }
  },
  img: {
    enableExperimentalPercentWidth: true
  }
};

const systemFonts = [...defaultSystemFonts, 'Roboto', 'Roboto-Bold'];

const baseStyle = {
  fontSize: 16,
  lineHeight: 24,
  color: '#333'
};

const tagsStyles: Record<string, MixedStyleDeclaration> = {
  body: {
    ...baseStyle,
    fontFamily: 'Roboto'
  },
  p: {
    ...baseStyle,
    marginBottom: 10
  },
  a: {
    color: '#0066cc',
    textDecorationLine: 'underline' as const
  },
  strong: {
    ...baseStyle,
    fontFamily: 'Roboto-Bold',
    fontWeight: 'bold'
  },
  h1: {
    ...baseStyle,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: 'bold',
    marginBottom: 16
  },
  h2: {
    ...baseStyle,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: 'bold',
    marginBottom: 12
  },
  img: {
    marginVertical: 8
  },
  ul: {
    ...baseStyle,
    marginBottom: 10
  },
  ol: {
    ...baseStyle,
    marginBottom: 10
  },
  li: {
    ...baseStyle,
    marginBottom: 5
  }
};

export default function GalleryScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentBrand, setCurrentBrand] = useState('solarmax');
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [expandedPosts, setExpandedPosts] = useState<Set<number>>(new Set());
  const [webViewVisible, setWebViewVisible] = useState(false);
  const [webViewUrl, setWebViewUrl] = useState('');
  const [currentImageIndexes, setCurrentImageIndexes] = useState<{ [key: number]: number }>({});
  
  const insets = useSafeAreaInsets();

  // Add contentWidth hook for responsive rendering
  const contentWidth = useContentWidth();

  // Fetch dữ liệu từ API
  const fetchPosts = async () => {
    let timeoutId: NodeJS.Timeout | null = null;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('https://id.slmsolar.com/api/content', {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Lỗi mạng: ${response.status} ${response.statusText}`);
      }
      
      // Kiểm tra content-type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Phản hồi không phải JSON: ${contentType}`);
      }
      
      // Lấy và kiểm tra text trước khi parse JSON
      const text = await response.text();
      if (!text || text.trim().startsWith('<')) {
        console.error('Phản hồi API không hợp lệ:', text.substring(0, 100));
        throw new Error('Phản hồi API không phải định dạng JSON');
      }
      
      // Parse JSON
      const data = JSON.parse(text);
      
      // Xử lý data
      const simplifiedPosts = Array.isArray(data) ? data
        .filter((item: ContentItem) => item && typeof item === 'object' && 'id' in item && 'title' in item)
        .map((item: ContentItem) => {
          let imageUrl = "";
          let hasImage = false;
          
          if (item.media_contents && Array.isArray(item.media_contents)) {
            // Tìm media có kind là image trước
            const imageContent = item.media_contents.find((media: MediaContent) => media.kind === "image");
            if (imageContent && imageContent.link) {
              imageUrl = imageContent.link;
              hasImage = true;
            }
            
            // Nếu không có ảnh, tìm video
            if (!hasImage) {
              const videoContent = item.media_contents.find((media: MediaContent) => media.kind === "video");
              if (videoContent) {
                if (videoContent.thumbnail) {
                  imageUrl = videoContent.thumbnail;
                  hasImage = true;
                } else if (videoContent.link && !videoContent.link.startsWith('https://')) {
                  // Nếu link video không bắt đầu bằng https://, giả định là YouTube ID
                  imageUrl = `https://img.youtube.com/vi/${videoContent.link}/hqdefault.jpg`;
                  hasImage = true;
                }
              }
            }
          }
          
          return {
            id: item.id,
            title: item.title,
            description: stripHtmlTags(item.description || item.content || item.title),
            content: item.content || '',
            hashtag: item.hashtag || '',
            imageUrl: imageUrl,
            hasImage: hasImage,
            media_contents: item.media_contents || [],
            category: item.category,
            created_at: item.created_at
          };
        })
        .filter((post: Post | null): post is Post => post !== null) : [];
      
      setPosts(simplifiedPosts);
      
    } catch (err) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      
      console.error('Lỗi khi lấy dữ liệu:', err);
      setError('Đã xảy ra lỗi khi tải dữ liệu: ' + (err instanceof Error ? err.message : String(err)));
      
      // Fallback data với category
      const fallbackPosts = [
        {
          id: 1,
          title: "Chỉ 1 triệu đồng",
          content: "Bạn có tin: Chỉ 1 triệu đồng cho 1,000 số điện? Hãy cùng SolarMax tìm hiểu về cách tiết kiệm điện hiệu quả với năng lượng mặt trời...",
          hashtag: "#slmsolar #hieudungmuadung #post #bancotin #1trieudongcho1000sodien",
          imageUrl: "",
          category: {
            code: "HDMD",
            id: 1,
            name: "Hiểu đúng mua đúng",
            sector: "SLM"
          },
          hasImage: false
        }
      ];
      setPosts(fallbackPosts);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  // Thêm hàm fetchSectors
  const fetchSectors = async () => {
    try {
      // Fetch sector data
      const sectorResponse = await fetch('https://id.slmsolar.com/api/sector', {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!sectorResponse.ok) {
        throw new Error(`Lỗi mạng khi lấy sector: ${sectorResponse.status}`);
      }
      
      // Kiểm tra content-type
      const sectorContentType = sectorResponse.headers.get('content-type');
      if (!sectorContentType || !sectorContentType.includes('application/json')) {
        throw new Error(`Phản hồi sector không phải JSON: ${sectorContentType}`);
      }
      
      // Lấy và kiểm tra text trước khi parse JSON
      const sectorText = await sectorResponse.text();
      if (!sectorText || sectorText.trim().startsWith('<')) {
        console.error('Phản hồi API sector không hợp lệ:', sectorText.substring(0, 100));
        throw new Error('Phản hồi API sector không phải định dạng JSON');
      }
      
      // Parse JSON
      const sectorData = JSON.parse(sectorText);

      // Tính toán số lượng bài viết cho mỗi sector
      const sectorsWithPostCount = Array.isArray(sectorData) ? sectorData.map((sector: Sector) => {
        const postCount = posts.filter(post => post.category?.sector === sector.code).length;
        return {
          ...sector,
          post_count: postCount
        };
      }) : [];

      setSectors(sectorsWithPostCount);
    } catch (error) {
      console.error('Error fetching sectors:', error);
      setSectors([]);
    }
  };

  // Thêm useEffect để fetch sectors
  useEffect(() => {
    fetchSectors();
  }, [posts]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const navigateToBrand = (brandId: string) => {
    const brandCode = brandId === '2' ? 'ELT' : 'SLM';
    setCurrentBrand(brandCode.toLowerCase());
  };

  // Thêm hàm toggle expanded
  const togglePostExpanded = (postId: number) => {
    setExpandedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  // Thêm hàm xử lý khi scroll kết thúc
  const handleViewableItemsChanged = React.useCallback(({ viewableItems, changed }: any) => {
    if (viewableItems.length > 0) {
      const postId = viewableItems[0].item.postId;
      const index = viewableItems[0].index;
      setCurrentImageIndexes(prev => ({
        ...prev,
        [postId]: index
      }));
    }
  }, []);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#27273E" />
      <Stack.Screen
        options={{
          title: 'Thư viện nội dung',
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '700',
            color: '#FFFFFF',
            fontFamily: 'Roboto Flex',
          },
          headerStyle: {
            backgroundColor: '#27273E',
          },
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={24} color="#7B7D9D" />
            </TouchableOpacity>
          ),
          headerTintColor: '#FFFFFF',
          headerRight: () => null,
          contentStyle: {
            backgroundColor: '#27273E',
          },
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
          <View style={[styles.usersContainer, { paddingTop: insets.top + 16 }]}>
            <View style={styles.usersList}>
              {sectors.map((sector) => (
                <TouchableOpacity 
                  key={sector.id} 
                  style={styles.userItem}
                  onPress={() => router.push({
                    pathname: '/post_brand',
                    params: { brandId: sector.id.toString() }
                  })}
                >
                  <ImageWithFallback 
                    uri={sector.image_rectangular}
                    style={styles.userAvatar}
                  />
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{sector.name}</Text>
                    <Text style={styles.postCount}>{sector.post_count || 0} bài viết</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
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
            <View style={styles.contentContainer}>
              {posts.map((post) => (
                <View key={post.id} style={styles.postContainer}>
                  <View style={styles.postItem}>
                    <View style={styles.userInfoBar}>
                      <ImageWithFallback 
                        uri={sectors.find(s => s.code === post.category?.sector)?.image_rectangular || ''}
                        style={styles.smallLogo} 
                      />
                      <Text style={styles.postAuthor}>
                        {sectors.find(s => s.code === post.category?.sector)?.name || 'Unknown'}
                      </Text>
                      <Text style={styles.postTime}>
                        {post.created_at ? formatTimeAgo(post.created_at) : '0 phút trước'}
                      </Text>
                      <TouchableOpacity style={styles.moreButton}>
                        <Ionicons name="ellipsis-vertical" size={16} color="#666" />
                      </TouchableOpacity>
                    </View>

                    {post.hasImage && (
                      <View style={styles.postImageContainer}>
                        <ImageWithFallback
                          uri={post.imageUrl}
                          style={styles.postImage}
                        />
                      </View>
                    )}
                    
                    <View style={[styles.postTextOverlay, !post.hasImage && styles.postTextOnly]}>
                      <View style={styles.categoryRow}>
                        <TouchableOpacity 
                          style={styles.categoryTag}
                          onPress={() => {
                            if (post.category?.code) {
                              router.push({
                                pathname: '/post-detail',
                                params: { id: post.id }
                              });
                            }
                          }}
                        >
                          <Text style={styles.categoryText} numberOfLines={1}>
                            {post.category?.name || ''}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <View style={styles.descriptionContainer}>
                        <Text style={[styles.postDescription, !post.hasImage && styles.postDescriptionLarge]} numberOfLines={post.hasImage ? 2 : 4}>
                          {post.description}
                          <Text 
                            onPress={() => router.push({
                              pathname: '/post-detail',
                              params: { id: post.id }
                            })}
                            style={styles.seeMoreText}
                          >
                            ... Xem chi tiết
                          </Text>
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#27273E',
  },
  headerButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  usersContainer: {
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  usersList: {
    flexDirection: 'row',
    gap: 12,
  },
  userItem: {
    backgroundColor: '#363652',
    borderRadius: 12,
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(39, 39, 62, 0.16)',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 0,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  userInfo: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  userName: {
    fontSize: 14,
    lineHeight: 20,
    color: '#FFFFFF',
    fontWeight: '500',
    fontFamily: 'Roboto Flex',
  },
  postCount: {
    fontSize: 12,
    color: '#666',
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
  postContainer: {
    marginBottom: 10,
  },
  postItem: {
    backgroundColor: '#fff',
    borderRadius: 0,
    overflow: 'hidden',
    position: 'relative',
  },
  postImageContainer: {
    position: 'relative',
    width: '100%',
    height: undefined,
    aspectRatio: 1,
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
    resizeMode: 'cover',
  },
  postTextOverlay: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userInfoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  smallLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  postAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  postTime: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  moreButton: {
    padding: 5,
  },
  descriptionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  postDescription: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    flex: 1,
  },
  seeMoreText: {
    color: '#D9261C',
    fontWeight: '500',
    fontSize: 14,
  },
  postIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ddd',
    marginRight: 5,
  },
  activeDot: {
    backgroundColor: '#D9261C',
    width: 10,
    height: 6,
    borderRadius: 3,
  },
  imageCounter: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  imageCounterText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginVertical: 10,
    color: '#666',
    textAlign: 'center',
  },
  errorOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  webViewHeader: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  closeButton: {
    padding: 8,
  },
  webViewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryTag: {
    backgroundColor: '#FFF1F0',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    maxWidth: '60%',
    borderWidth: 1,
    borderColor: '#FFE4E1',
  },
  categoryText: {
    fontSize: 12,
    color: '#D9261C',
    fontWeight: '600',
    textAlign: 'center',
  },
  postTextOnly: {
    paddingVertical: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    margin: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  postDescriptionLarge: {
    fontSize: 16,
    lineHeight: 24,
    color: '#212529',
  },
  playButtonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  playButton: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end'
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
}); 
