import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, FlatList, TouchableOpacity, ActivityIndicator, Dimensions, Modal, ScrollView, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import WebView from 'react-native-webview';

// Định nghĩa interface cho nội dung media
interface MediaContent {
  id: number;
  title: string;
  kind: string;
  content_id: number;
  created_at: string;
  link: string;
  thumbnail: string | null;
}

// Định nghĩa interface cho content
interface Content {
  id: number;
  title: string;
  content: string;
  created_at: string;
  slug: string | null;
  category_id: number;
  hashtag: string;
  media_contents: MediaContent[];
  category?: {
    id: number;
    name: string;
    code: string;
    image: string | null;
    sector?: {
      id: number;
      description: string | null;
      image_rectangular: string | null;
      name?: string;
    }
  };
}

// Định nghĩa interface cho user response
interface UserContentResponse {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  avatar: string | null;
  contents: Content[];
}

interface ContentGalleryProps {
  userId?: number; // Optional userId, mặc định sẽ lấy từ AsyncStorage
  showTitle?: boolean; // Hiển thị tiêu đề "Bài viết liên quan"
  sectionTitle?: string; // Tiêu đề section
  maxItems?: number; // Số lượng bài viết tối đa hiển thị
  horizontal?: boolean; // Hiển thị danh sách theo chiều ngang
  detailInModal?: boolean; // Hiển thị chi tiết trong modal thay vì chuyển trang
  cardStyle?: 'minimal' | 'standard' | 'full' | 'simple'; // Kiểu hiển thị card
  showViewAll?: boolean; // Hiển thị nút "Khám phá"
  viewAllPath?: string; // Đường dẫn khi nhấn nút "Khám phá"
  containerStyle?: object; // Style cho container
}

const ContentGallery = ({
  userId: propUserId,
  showTitle = false,
  sectionTitle = 'Bài viết liên quan',
  maxItems,
  horizontal = false,
  detailInModal = false,
  cardStyle = 'standard',
  showViewAll = false,
  viewAllPath = '/(tabs)/gallery',
  containerStyle = {}
}: ContentGalleryProps) => {
  const router = useRouter();
  const { width } = Dimensions.get('window');
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(propUserId || null);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [webViewHeight, setWebViewHeight] = useState<number>(500);

  useEffect(() => {
    if (propUserId) {
      setUserId(propUserId);
    } else {
      getUserId();
    }
  }, [propUserId]);

  useEffect(() => {
    if (userId) {
      fetchUserContents(userId);
    }
  }, [userId]);

  const getUserId = async () => {
    try {
      const userData = await AsyncStorage.getItem('@slm_user_data');
      if (userData) {
        const user = JSON.parse(userData);
        if (user.id) {
          setUserId(user.id);
        } else {
          // Fallback nếu không có ID
          setUserId(4);
        }
      } else {
        // Fallback nếu không có user data
        setUserId(4);
      }
    } catch (error) {
      console.error('Lỗi khi lấy ID người dùng:', error);
      // Fallback nếu có lỗi
      setUserId(4);
    }
  };

  const fetchUserContents = async (id: number) => {
    try {
      setLoading(true);
      const response = await fetch(`https://id.slmsolar.com/api/users/${id}`, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Lỗi khi lấy dữ liệu: ${response.status}`);
      }

      const data: UserContentResponse = await response.json();
      if (data.contents && Array.isArray(data.contents)) {
        // Lọc số lượng bài viết nếu maxItems được cung cấp
        let filteredContents = [...data.contents];
        if (maxItems && maxItems > 0) {
          filteredContents = filteredContents.slice(0, maxItems);
        }
        setContents(filteredContents);
      } else {
        setContents([]);
      }
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu bài viết:', error);
      setError('Không thể tải dữ liệu bài viết. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleContentPress = (content: Content) => {
    // Điều hướng đến màn hình chi tiết bài viết
    router.push({
      pathname: "/(gallery)/post-detail",
      params: { id: content.id }
    });
  };

  const navigateToViewAll = () => {
    router.push(viewAllPath as any);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedContent(null);
  };

  // Lấy ảnh đầu tiên của bài viết nếu có
  const getFirstImage = (content: Content): string | null => {
    if (content.media_contents && content.media_contents.length > 0) {
      const image = content.media_contents.find(media => media.kind === 'image');
      return image ? image.link : null;
    }
    return null;
  };

  // Lấy tất cả hình ảnh của bài viết
  const getAllImages = (content: Content): string[] => {
    if (content.media_contents && content.media_contents.length > 0) {
      return content.media_contents
        .filter(media => media.kind === 'image')
        .map(media => media.link);
    }
    return [];
  };

  // Định dạng ngày tháng
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Tính thời gian đã trôi qua
  const getTimeAgo = (dateString: string): string => {
    const now = new Date();
    const createdDate = new Date(dateString);
    const differenceInSeconds = Math.floor((now.getTime() - createdDate.getTime()) / 1000);
    
    if (differenceInSeconds < 60) {
      return `${differenceInSeconds} giây trước`;
    }
    
    const differenceInMinutes = Math.floor(differenceInSeconds / 60);
    if (differenceInMinutes < 60) {
      return `${differenceInMinutes} phút trước`;
    }
    
    const differenceInHours = Math.floor(differenceInMinutes / 60);
    if (differenceInHours < 24) {
      return `${differenceInHours} giờ trước`;
    }
    
    const differenceInDays = Math.floor(differenceInHours / 24);
    if (differenceInDays < 7) {
      return `${differenceInDays} ngày trước`;
    }
    
    const differenceInWeeks = Math.floor(differenceInDays / 7);
    if (differenceInWeeks < 4) {
      return `${differenceInWeeks} tuần trước`;
    }
    
    const differenceInMonths = Math.floor(differenceInDays / 30);
    if (differenceInMonths < 12) {
      return `${differenceInMonths} tháng trước`;
    }
    
    const differenceInYears = Math.floor(differenceInDays / 365);
    return `${differenceInYears} năm trước`;
  };

  // Xử lý nội dung HTML
  const stripHtml = (html: string): string => {
    if (!html) return '';
    
    // Loại bỏ tất cả các thẻ HTML
    let content = html.replace(/<[^>]*>/g, ' ');
    
    // Thay thế các entity HTML phổ biến
    content = content.replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&ndash;/g, '-')
      .replace(/&mdash;/g, '—')
      .replace(/&lsquo;|&rsquo;/g, "'")
      .replace(/&ldquo;|&rdquo;/g, '"');
      
    // Loại bỏ khoảng trắng thừa
    content = content.replace(/\s+/g, ' ').trim();
    
    return content;
  };

  // Hàm xử lý khi WebView thay đổi kích thước
  const onWebViewMessage = (event: any) => {
    const data = JSON.parse(event.nativeEvent.data);
    if (data.type === 'contentHeight') {
      setWebViewHeight(data.height);
    }
  };
  
  // Hàm xử lý khi người dùng click vào URL trong WebView
  const onShouldStartLoadWithRequest = (event: any) => {
    // Cho phép tải các nội dung nội bộ
    if (event.url.startsWith('data:') || event.url === 'about:blank') {
      return true;
    }
    
    // Mở URL bên ngoài trong trình duyệt
    Linking.openURL(event.url).catch(err => {
      console.error('Không thể mở URL:', err);
    });
    return false;
  };

  // Render mỗi item trong FlatList
  const renderContentItem = ({ item }: { item: Content }) => {
    const imageUrl = getFirstImage(item);
    const cleanContent = stripHtml(item.content);

    // Card nhỏ gọn
    if (cardStyle === 'minimal') {
      return (
        <TouchableOpacity 
          style={[
            styles.minimalCard,
            horizontal && { width: width * 0.7, marginRight: 12 }
          ]} 
          onPress={() => handleContentPress(item)}
        >
          {imageUrl && (
            <Image 
              source={{ uri: imageUrl }} 
              style={styles.minimalImage} 
              resizeMode="cover" 
            />
          )}
          <View style={styles.minimalInfo}>
            <Text style={styles.minimalTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.contentDate}>{formatDate(item.created_at)}</Text>
            <Text style={styles.minimalExcerpt} numberOfLines={1}>{cleanContent}</Text>
          </View>
        </TouchableOpacity>
      );
    }

    // Card đầy đủ
    if (cardStyle === 'full') {
      return (
        <TouchableOpacity 
          style={[
            styles.fullCard,
            horizontal && { width: width * 0.85, marginRight: 16 }
          ]} 
          onPress={() => handleContentPress(item)}
        >
          <View style={styles.imageContainer}>
            {imageUrl ? (
              <Image 
                source={{ uri: imageUrl }} 
                style={styles.contentImage} 
                resizeMode="cover" 
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="newspaper-outline" size={40} color="#ccc" />
              </View>
            )}
          </View>
          <View style={styles.fullCardInfo}>
            <Text style={styles.contentTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.contentDate}>{formatDate(item.created_at)}</Text>
            <Text style={styles.contentExcerpt} numberOfLines={3}>{cleanContent}</Text>
            {item.hashtag && (
              <Text style={styles.contentHashtag} numberOfLines={1}>{item.hashtag}</Text>
            )}
          </View>
        </TouchableOpacity>
      );
    }
    
    // Simple card - hiển thị ảnh trên và text bên dưới
    if (cardStyle === 'simple') {
      return (
        <TouchableOpacity 
          style={[
            styles.simpleCard,
            horizontal && { width: width * 0.38, marginRight: 10 }
          ]} 
          onPress={() => handleContentPress(item)}
        >
          {item.category?.sector?.image_rectangular && (
            <View style={styles.sectorHeaderContainer}>
              <Image 
                source={{ uri: item.category.sector.image_rectangular }} 
                style={styles.sectorHeaderImage} 
                resizeMode="contain" 
              />
              {item.category?.sector?.name && (
                <Text style={styles.sectorHeaderName}>{item.category.sector.name}</Text>
              )}
            </View>
          )}
          
          <View style={styles.simpleImageContainer}>
            {imageUrl ? (
              <Image 
                source={{ uri: imageUrl }} 
                style={styles.simpleImage} 
                resizeMode="cover" 
              />
            ) : (
              <View style={styles.simplePlaceholderImage}>
                <Ionicons name="newspaper-outline" size={30} color="#ccc" />
              </View>
            )}
          </View>
          <View style={styles.simpleInfo}>
            <Text style={styles.simpleContent} numberOfLines={3}>{cleanContent}</Text>
            <Text style={styles.simpleDate}>{getTimeAgo(item.created_at)}</Text>
          </View>
        </TouchableOpacity>
      );
    }

    // Card tiêu chuẩn (mặc định)
    return (
      <TouchableOpacity 
        style={[
          styles.contentCard,
          horizontal && { width: width * 0.75, marginRight: 16 }
        ]} 
        onPress={() => handleContentPress(item)}
      >
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image 
              source={{ uri: imageUrl }} 
              style={styles.contentImage} 
              resizeMode="cover" 
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="newspaper-outline" size={40} color="#ccc" />
            </View>
          )}
        </View>
        <View style={styles.contentInfo}>
          <Text style={styles.contentTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.contentDate}>{formatDate(item.created_at)}</Text>
          <Text style={styles.contentExcerpt} numberOfLines={2}>{cleanContent}</Text>
          {item.hashtag && (
            <Text style={styles.contentHashtag} numberOfLines={1}>{item.hashtag}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Modal hiển thị chi tiết bài viết
  const renderContentDetail = () => {
    if (!selectedContent) return null;
    
    const images = getAllImages(selectedContent);

    return (
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.contentHeader}>
              <Text style={styles.contentTitle}>{selectedContent.title}</Text>
              <Text style={styles.contentDate}>
                Ngày đăng: {formatDate(selectedContent.created_at)}
              </Text>
            </View>

            {images.length > 0 && (
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: images[0] }} 
                  style={styles.mainImage} 
                  resizeMode="cover" 
                />
              </View>
            )}

            <View style={styles.contentBody}>
              <WebView
                originWhitelist={['*']}
                source={{
                  html: `
                    <html>
                      <head>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
                        <style>
                          body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                            padding: 0;
                            margin: 0;
                            font-size: 16px;
                            line-height: 1.5;
                            color: #333;
                          }
                          img {
                            max-width: 100%;
                            height: auto;
                          }
                          a {
                            color: #0066CC;
                            text-decoration: underline;
                          }
                          h1, h2 {
                            font-weight: bold;
                          }
                          h1 {
                            font-size: 24px;
                            margin-top: 16px;
                            margin-bottom: 16px;
                          }
                          h2 {
                            font-size: 20px;
                            margin-top: 12px;
                            margin-bottom: 12px;
                          }
                          p {
                            margin-bottom: 16px;
                          }
                          li {
                            margin-bottom: 8px;
                          }
                        </style>
                      </head>
                      <body>
                        ${selectedContent.content}
                        <script>
                          // Gửi chiều cao nội dung về cho React Native
                          const sendHeight = () => {
                            window.ReactNativeWebView.postMessage(JSON.stringify({
                              type: 'contentHeight',
                              height: document.body.scrollHeight
                            }));
                          };
                          
                          // Theo dõi khi tải ảnh xong
                          const images = document.querySelectorAll('img');
                          let loadedImages = 0;
                          const totalImages = images.length;
                          
                          if (totalImages > 0) {
                            images.forEach(img => {
                              if (img.complete) {
                                loadedImages++;
                                if (loadedImages === totalImages) {
                                  sendHeight();
                                }
                              } else {
                                img.addEventListener('load', () => {
                                  loadedImages++;
                                  if (loadedImages === totalImages) {
                                    sendHeight();
                                  }
                                });
                                img.addEventListener('error', () => {
                                  loadedImages++;
                                  if (loadedImages === totalImages) {
                                    sendHeight();
                                  }
                                });
                              }
                            });
                          } else {
                            sendHeight();
                          }
                          
                          // Gửi ngay sau khi tải trang
                          sendHeight();
                          
                          // Thêm event listener cho tất cả các link
                          document.addEventListener('click', (e) => {
                            if (e.target.tagName === 'A') {
                              e.preventDefault();
                              window.ReactNativeWebView.postMessage(JSON.stringify({
                                type: 'linkClicked',
                                url: e.target.href
                              }));
                            }
                          });
                        </script>
                      </body>
                    </html>
                  `
                }}
                style={{ height: webViewHeight, width: width - 32 }}
                scalesPageToFit={false}
                scrollEnabled={false}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                onMessage={onWebViewMessage}
                onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
                automaticallyAdjustContentInsets={true}
              />
            </View>

            {selectedContent.hashtag && (
              <View style={styles.hashtagContainer}>
                <Text style={styles.hashtagText}>{selectedContent.hashtag}</Text>
              </View>
            )}

            {images.length > 1 && (
              <View style={styles.galleryContainer}>
                <Text style={styles.galleryTitle}>Hình ảnh</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.galleryScroll}
                >
                  {images.map((image, index) => (
                    <Image 
                      key={index}
                      source={{ uri: image }} 
                      style={styles.galleryImage} 
                      resizeMode="cover" 
                    />
                  ))}
                </ScrollView>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    );
  };

  // Render phần tiêu đề và nút "Khám phá"
  const renderSectionHeader = () => {
    if (showTitle) {
      return (
        <View style={styles.titleContainer}>
          <Text style={styles.sectionTitle}>{sectionTitle}</Text>
          {showViewAll && (
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={navigateToViewAll}
            >
              <Text style={styles.viewAllText}>Khám phá</Text>
              <Ionicons name="chevron-forward" size={16} color="#ED1C24" />
            </TouchableOpacity>
          )}
        </View>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ED1C24" />
        <Text style={styles.loadingText}>Đang tải bài viết...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#ED1C24" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (contents.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="document-text-outline" size={48} color="#999" />
        <Text style={styles.emptyText}>Không có bài viết nào</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, horizontal && styles.horizontalContainer, containerStyle]}>
      {renderSectionHeader()}
      
      <FlatList
        data={contents}
        renderItem={renderContentItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[
          styles.listContainer,
          horizontal && styles.horizontalListContainer
        ]}
        horizontal={horizontal}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />
      
      {detailInModal && renderContentDetail()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f8',
  },
  horizontalContainer: {
    paddingVertical: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: '#ED1C24',
    marginRight: 4,
  },
  listContainer: {
    paddingBottom: 20,
  },
  horizontalListContainer: {
    paddingLeft: 4,
    paddingRight: 20,
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  minimalCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  minimalImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  minimalInfo: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  minimalTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  minimalExcerpt: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  fullCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  fullCardInfo: {
    padding: 16,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    overflow: 'hidden',
  },
  contentImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentInfo: {
    padding: 16,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
  },
  contentDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  contentExcerpt: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  contentHashtag: {
    fontSize: 12,
    color: '#0066CC',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 200,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 200,
  },
  errorText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 200,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 16,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    marginTop: 30,
  },
  contentHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  contentBody: {
    padding: 16,
  },
  mainImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  hashtagContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  hashtagText: {
    fontSize: 14,
    color: '#0066CC',
  },
  galleryContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  galleryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  galleryScroll: {
    flexDirection: 'row',
  },
  galleryImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginRight: 10,
  },
  // Simple card styles
  simpleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectorHeaderContainer: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectorHeaderImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  sectorHeaderName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  simpleImageContainer: {
    width: '100%',
    aspectRatio: 4/3,
    overflow: 'hidden',
  },
  simpleImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  simplePlaceholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  simpleInfo: {
    padding: 10,
  },
  simpleContent: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
    marginBottom: 6,
  },
  simpleDate: {
    fontSize: 12,
    color: '#999',
  },
});

export default ContentGallery; 