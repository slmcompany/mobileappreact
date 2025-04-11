import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, Text, View, ScrollView, 
  TouchableOpacity, Image, Dimensions, 
  ActivityIndicator, FlatList, StatusBar, Linking, Modal,
  Share, Alert
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { API_CONFIG } from '@/src/config/api';
import RenderHtml, { 
  HTMLElementModel,
  HTMLContentModel,
  defaultSystemFonts,
  useContentWidth,
  TRenderEngineConfig,
  MixedStyleDeclaration
} from 'react-native-render-html';
import * as ExpoLinking from 'expo-linking';
import WebView from 'react-native-webview';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

// Định nghĩa kiểu dữ liệu
interface MediaContent {
  id: number;
  link: string;
  title: string;
  kind: string;
  content_id: number;
  thumbnail: string | null;
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

// Thêm interface cho FlatList item
interface GalleryItem {
  uri: string;
  id: number;
  index: number;
  kind: string;
  videoId: string | null;
}

const stripFirstH1Tag = (html: string) => {
  // Tìm và xóa thẻ H1 đầu tiên và nội dung của nó
  return html.replace(/<h1[^>]*>.*?<\/h1>/, '');
};

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

export default function PostDetailScreen() {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [webViewVisible, setWebViewVisible] = useState(false);
  const [webViewUrl, setWebViewUrl] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const slideshowRef = useRef<FlatList>(null);
  const { width } = Dimensions.get('window');

  // Add contentWidth hook for responsive rendering
  const contentWidth = useContentWidth();

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

    const galleryItems: GalleryItem[] = post.media_contents.map((media, index) => ({
      uri: media.kind === 'video' 
        ? (media.thumbnail || `https://img.youtube.com/vi/${media.link}/hqdefault.jpg`) 
        : media.link,
      id: media.id,
      index,
      kind: media.kind,
      videoId: media.kind === 'video' ? media.link : null
    }));

    return (
      <View style={styles.slideshowContainer}>
        <FlatList
          ref={slideshowRef}
          data={galleryItems}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id.toString()}
          snapToInterval={width}
          decelerationRate="fast"
          onMomentumScrollEnd={(event) => {
            const slideWidth = width;
            const newIndex = Math.floor(event.nativeEvent.contentOffset.x / slideWidth) + 1;
            setCurrentSlide(newIndex);
          }}
          renderItem={({ item }) => (
            <View style={styles.slideItemContainer}>
              <Image 
                source={{ uri: item.uri }} 
                style={styles.postImage}
                resizeMode="contain"
              />
              {item.kind === 'video' && (
                <View style={styles.playButtonOverlay}>
                  <TouchableOpacity 
                    style={styles.playButton}
                    onPress={() => {
                      if (item.videoId) {
                        setWebViewUrl(`https://www.youtube.com/embed/${item.videoId}`);
                        setWebViewVisible(true);
                      }
                    }}
                  >
                    <Ionicons name="play-circle" size={64} color="white" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
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
            
            <View style={styles.paginationContainer}>
              {galleryItems.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    currentSlide === index + 1 && styles.paginationDotActive
                  ]}
                />
              ))}
            </View>

            <View style={styles.imageCounter}>
              <Text style={styles.imageCounterText}>
                {currentSlide}/{post.media_contents.length}
              </Text>
            </View>
          </>
        )}
      </View>
    );
  };

  // Hàm copy nội dung
  const copyContent = async () => {
    if (post) {
      try {
        await Clipboard.setStringAsync(post.content.replace(/<[^>]*>/g, ''));
        Alert.alert('Thành công', 'Đã copy nội dung vào clipboard');
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể copy nội dung');
      }
    }
    setShowOptions(false);
  };

  // Hàm tải ảnh
  const downloadImage = async (post: Post, currentIndex: number = 0) => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Lỗi', 'Cần cấp quyền để tải ảnh');
        return;
      }

      const imageContents = post.media_contents?.filter(media => media.kind === "image") || [];
      if (imageContents.length === 0) {
        Alert.alert('Lỗi', 'Không tìm thấy ảnh để tải');
        return;
      }

      const imageToDownload = imageContents[currentIndex];
      if (!imageToDownload) {
        Alert.alert('Lỗi', 'Không tìm thấy ảnh để tải');
        return;
      }

      const { uri } = await FileSystem.downloadAsync(
        imageToDownload.link,
        FileSystem.documentDirectory + `temp_image_${imageToDownload.id}.jpg`
      );

      await MediaLibrary.saveToLibraryAsync(uri);
      await FileSystem.deleteAsync(uri);

      Alert.alert('Thành công', 'Đã tải ảnh về thiết bị');
    } catch (error) {
      console.error('Lỗi khi tải ảnh:', error);
      Alert.alert('Lỗi', 'Không thể tải ảnh');
    }
    setShowOptions(false);
  };

  // Hàm tải nhiều ảnh
  const downloadMultipleImages = async (post: Post) => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Lỗi', 'Cần cấp quyền để tải ảnh');
        return;
      }

      const imageContents = post.media_contents?.filter(media => media.kind === "image") || [];
      if (imageContents.length === 0) {
        Alert.alert('Lỗi', 'Không tìm thấy ảnh để tải');
        return;
      }

      let successCount = 0;
      let failCount = 0;

      Alert.alert('Đang tải', `Đang tải ${imageContents.length} ảnh...`);

      for (const media of imageContents) {
        try {
          console.log('Đang tải ảnh:', media.link);
          const { uri } = await FileSystem.downloadAsync(
            media.link,
            FileSystem.documentDirectory + `temp_image_${media.id}.jpg`
          );

          await MediaLibrary.saveToLibraryAsync(uri);
          await FileSystem.deleteAsync(uri);
          successCount++;
        } catch (error) {
          console.error('Lỗi khi tải ảnh:', media.link, error);
          failCount++;
        }
      }

      if (successCount > 0) {
        Alert.alert(
          'Thành công', 
          `Đã tải thành công ${successCount} ảnh${failCount > 0 ? `, ${failCount} ảnh thất bại` : ''}`
        );
      } else {
        Alert.alert('Lỗi', 'Không thể tải bất kỳ ảnh nào');
      }
    } catch (error) {
      console.error('Lỗi khi tải nhiều ảnh:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi tải ảnh');
    }
    setShowOptions(false);
  };

  // Hàm chia sẻ
  const shareContent = async () => {
    if (post) {
      try {
        await Share.share({
          message: `${post.title}\n\n${post.content.replace(/<[^>]*>/g, '')}`,
        });
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể chia sẻ nội dung');
      }
    }
    setShowOptions(false);
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
       
        <TouchableOpacity onPress={() => setShowOptions(true)}>
          <Ionicons name="ellipsis-vertical" size={24} color="#666" />
        </TouchableOpacity>
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
        <>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.postContainer}>
              <View style={styles.postHeader}>
                <View style={styles.userContainer}>
                  <Image 
                    source={require('../../assets/images/solarmax-logo.png')} 
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
                    contentWidth={contentWidth}
                    source={{ html: stripFirstH1Tag(post.content) }}
                    systemFonts={systemFonts}
                    customHTMLElementModels={customHTMLElementModels}
                    renderersProps={renderersProps}
                    tagsStyles={tagsStyles}
                    enableExperimentalMarginCollapsing
                    enableExperimentalGhostLinesPrevention
                    defaultTextProps={{
                      selectable: true
                    }}
                  />
                </View>
                
                <Text style={styles.hashtags}>{post.hashtag}</Text>
              </View>
            </View>
          </ScrollView>

          {/* Video Modal */}
          <Modal
            visible={webViewVisible}
            animationType="slide"
            onRequestClose={() => setWebViewVisible(false)}
          >
            <SafeAreaView style={styles.webViewContainer}>
              <View style={styles.webViewHeader}>
                <TouchableOpacity 
                  onPress={() => setWebViewVisible(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.webViewTitle}>Video</Text>
                <View style={styles.headerSpacer} />
              </View>
              <WebView 
                source={{ uri: webViewUrl }}
                style={styles.webView}
                startInLoadingState={true}
                renderLoading={() => (
                  <View style={styles.webViewLoading}>
                    <ActivityIndicator size="large" color="#D9261C" />
                  </View>
                )}
              />
            </SafeAreaView>
          </Modal>

          {/* Options Modal */}
          <Modal
            visible={showOptions}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowOptions(false)}
          >
            <TouchableOpacity 
              style={styles.modalOverlay}
              activeOpacity={1} 
              onPress={() => setShowOptions(false)}
            >
              <View style={styles.optionsContainer}>
                <TouchableOpacity 
                  style={styles.optionItem}
                  onPress={() => {
                    if (post) {
                      downloadImage(post, currentSlide - 1);
                    }
                  }}
                >
                  <Ionicons name="download-outline" size={24} color="#333" />
                  <Text style={styles.optionText}>Tải ảnh hiện tại</Text>
                </TouchableOpacity>

                {(post?.media_contents?.filter(media => media.kind === "image") || []).length > 1 && (
                  <TouchableOpacity 
                    style={styles.optionItem}
                    onPress={() => {
                      if (post) {
                        downloadMultipleImages(post);
                      }
                    }}
                  >
                    <Ionicons name="images-outline" size={24} color="#333" />
                    <Text style={styles.optionText}>
                      Tải tất cả ảnh ({post?.media_contents?.filter(media => media.kind === "image").length || 0})
                    </Text>
                  </TouchableOpacity>
                )}

                {post?.media_contents?.some(media => media.kind === "video") && (
                  <TouchableOpacity 
                    style={styles.optionItem}
                    onPress={async () => {
                      const videoContent = post.media_contents.find(media => media.kind === "video");
                      if (videoContent?.link) {
                        const youtubeUrl = `https://www.youtube.com/watch?v=${videoContent.link}`;
                        await Clipboard.setStringAsync(youtubeUrl);
                        Alert.alert(
                          'Thành công',
                          'Đã sao chép link YouTube vào clipboard',
                          [{ text: 'OK' }]
                        );
                      }
                    }}
                  >
                    <Ionicons name="copy-outline" size={24} color="#333" />
                    <Text style={styles.optionText}>Copy link YouTube</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity 
                  style={styles.optionItem}
                  onPress={copyContent}
                >
                  <Ionicons name="copy-outline" size={24} color="#333" />
                  <Text style={styles.optionText}>Copy nội dung</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.optionItem}
                  onPress={shareContent}
                >
                  <Ionicons name="share-social-outline" size={24} color="#333" />
                  <Text style={styles.optionText}>Chia sẻ</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
        </>
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
    borderWidth: 1,
    borderColor: '#ABACC2',
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
    backgroundColor: '#f5f5f5',
  },
  slideNavButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -24 }],
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
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
  paginationContainer: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#fff',
    width: 24,
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
    marginBottom: 0,
  },
  descriptionContainer: {
    marginTop: 10,
    marginBottom: 16,
  },
  postDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  htmlContent: {
    marginBottom: 0,
  },
  hashtags: {
    color: '#0066cc',
    fontSize: 14,
    marginTop: 16,
  },
  slideItemContainer: {
    position: 'relative',
    width: width,
    height: width,
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
  webViewContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  webViewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeButton: {
    padding: 8,
  },
  webViewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerSpacer: {
    width: 40,
  },
  webView: {
    flex: 1,
    backgroundColor: '#000',
  },
  webViewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  optionsContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: {
    fontSize: 16,
    marginLeft: 15,
    color: '#333',
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
  copyButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
}); 