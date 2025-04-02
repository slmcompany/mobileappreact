import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Image, Linking, Alert, ImageStyle, StyleProp, ViewStyle, useWindowDimensions, Modal, FlatList, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import RenderHtml from 'react-native-render-html';
import WebView from 'react-native-webview';

// Định nghĩa kiểu dữ liệu
interface MediaContent {
  id: number;
  title: string;
  kind: string;
  content_id: number;
  link: string;
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

  // Fetch dữ liệu từ API
  const fetchPosts = async () => {
    let timeoutId: NodeJS.Timeout | null = null;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('https://id.slmsolar.com/api/content');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      
      const simplifiedPosts = data
        .filter((item: ContentItem) => item && typeof item === 'object' && 'id' in item && 'title' in item)
        .map((item: ContentItem) => {
          console.log("----------------- CHI TIẾT ITEM -----------------");
          console.log("ID:", item.id);
          console.log("Title:", item.title);
          console.log("Hashtag:", item.hashtag);
          console.log("Category:", item.category);
          
          let imageUrl = "";
          
          if (item.media_contents && Array.isArray(item.media_contents)) {
            const imageContent = item.media_contents.find((media: MediaContent) => media.kind === "image");
            if (imageContent) {
              imageUrl = imageContent.link;
              console.log("Tìm thấy ảnh:", imageUrl);
            }
          }
          
          if (!imageUrl) {
            imageUrl = "";
            console.log("Sử dụng ảnh dự phòng do không tìm thấy ảnh trong media_contents");
          }
          
          console.log("URL ảnh cuối cùng:", imageUrl);
          console.log("----------------- HẾT CHI TIẾT -----------------");
          
          return {
            id: item.id,
            title: item.title,
            description: stripHtmlTags(item.description || item.content || item.title),
            content: item.content || '',
            hashtag: item.hashtag || '',
            imageUrl: imageUrl,
            media_contents: item.media_contents?.filter((media: MediaContent) => media.kind === "image") || [],
            category: item.category,
            created_at: item.created_at
          };
        });
      
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
          }
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
      const response = await fetch('https://id.slmsolar.com/api/sector');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setSectors(data);
    } catch (error) {
      console.error('Error fetching sectors:', error);
      // Fallback data
      setSectors([
        {
          id: 1,
          name: 'SolarMax',
          code: 'SLM',
          image: 'https://supabase.slmsolar.com/storage/v1/object/sign/solarmax/06.%20Brand/01.%20SolarMax/SolarMax.jpg',
          image_rectangular: 'https://supabase.slmsolar.com/storage/v1/object/sign/solarmax/Logo/Logo_SolarMax.jpg',
          description: null,
          tech_phone: null,
          sale_phone: null
        },
        {
          id: 2,
          name: 'Eliton',
          code: 'ELT',
          image: 'https://supabase.slmsolar.com/storage/v1/object/sign/solarmax/06.%20Brand/02.%20Eliton/Eliton.jpg',
          image_rectangular: 'https://supabase.slmsolar.com/storage/v1/object/sign/solarmax/Logo/Logo_Eliton.jpg',
          description: null,
          tech_phone: null,
          sale_phone: null
        }
      ]);
    }
  };

  // Thêm useEffect để fetch sectors
  useEffect(() => {
    fetchSectors();
  }, []);

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
            {sectors.map((sector) => (
              <TouchableOpacity 
                key={sector.id} 
                style={styles.userItem}
                onPress={() => navigateToBrand(sector.id.toString())}
              >
                <ImageWithFallback 
                  uri={sector.image_rectangular}
                  style={styles.userAvatar}
                />
                <Text style={styles.userName}>{sector.name}</Text>
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
              onPress={() => fetchPosts()}
            >
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
            {posts.length > 0 ? (
              posts.map((post) => (
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

                    <View style={styles.postImageContainer}>
                      <FlatList
                        data={post.media_contents?.map((media, index) => ({
                          uri: media.link,
                          postId: post.id,
                          index
                        })) || [{ uri: post.imageUrl, postId: post.id, index: 0 }]}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item, index) => `${item.postId}-${index}`}
                        onViewableItemsChanged={handleViewableItemsChanged}
                        viewabilityConfig={viewabilityConfig}
                        initialNumToRender={1}
                        maxToRenderPerBatch={2}
                        windowSize={3}
                        removeClippedSubviews={true}
                        renderItem={({ item, index }) => (
                          <View style={[styles.postImageContainer, { width: Dimensions.get('window').width }]}>
                            <ImageWithFallback
                              uri={item.uri}
                              style={styles.postImage}
                              priority={index === 0}
                            />
                          </View>
                        )}
                        onEndReachedThreshold={0.5}
                        onEndReached={() => {
                          // Prefetch next images if available
                          const nextImages = post.media_contents?.slice((currentImageIndexes[post.id] || 0) + 1);
                          nextImages?.forEach(media => {
                            if (media.link) {
                              Image.prefetch(media.link);
                            }
                          });
                        }}
                      />
                      {post.media_contents && post.media_contents.length > 0 && (
                        <View style={styles.imageCounter}>
                          <Text style={styles.imageCounterText}>
                            {((currentImageIndexes[post.id] || 0) + 1)}/{post.media_contents.length}
                          </Text>
                        </View>
                      )}
                    </View>
                    
                    <View style={styles.postTextOverlay}>
                      <View>
                        <View style={styles.categoryContainer}>
                          <View style={styles.redDot} />
                          <Text style={styles.categoryText}>{post.category?.name || ''}</Text>
                        </View>
                        <View style={styles.descriptionContainer}>
                          <Text style={styles.postDescription} numberOfLines={2}>
                            {post.description && post.description.length > 80 ? (
                              <>
                                {post.description.substring(0, 80)}
                                <Text 
                                  onPress={() => router.push({
                                    pathname: '/post-detail',
                                    params: { id: post.id }
                                  })}
                                  style={styles.seeMoreText}
                                >
                                  ... Xem chi tiết
                                </Text>
                              </>
                            ) : (
                              <>
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
                              </>
                            )}
                          </Text>
                        </View>
                      </View>
                      
                      {post.media_contents && post.media_contents.length > 1 && (
                        <View style={styles.postIndicators}>
                          <View style={styles.dotsContainer}>
                            {post.media_contents.map((_, index) => (
                              <View 
                                key={index} 
                                style={[
                                  styles.dot,
                                  index === (currentImageIndexes[post.id] || 0) ? styles.activeDot : null
                                ]} 
                              />
                            ))}
                          </View>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="document-outline" size={48} color="#ddd" />
                <Text style={styles.emptyText}>Không có bài viết nào</Text>
              </View>
            )}
          </ScrollView>
        )}
      </SafeAreaView>
      <Modal
        visible={webViewVisible}
        animationType="slide"
        onRequestClose={() => setWebViewVisible(false)}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.webViewHeader}>
            <TouchableOpacity 
              onPress={() => setWebViewVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <WebView 
            source={{ uri: webViewUrl }}
            style={{ flex: 1 }}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.webViewLoading}>
                <ActivityIndicator size="large" color="#D9261C" />
              </View>
            )}
          />
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  headerButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
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
    padding: 5,
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
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  redDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D9261C',
    marginRight: 8,
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
}); 
