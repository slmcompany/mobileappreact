import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Image, Linking, Alert, ImageStyle, StyleProp, ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';

// Định nghĩa kiểu dữ liệu
interface Post {
  id: number;
  title: string;
  hashtag?: string;
  imageUrl?: string;
  brandId?: string;
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
}

// Thêm component riêng để xử lý ảnh và lỗi CORS
const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ uri, style }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Sử dụng ảnh dự phòng local
  const fallbackImage = require('../../assets/images/replace-holder.png');
  
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
          onLoadEnd={() => setIsLoading(false)}
        />
      ) : (
        <Image 
          source={{ uri: uri }}
          style={style}
          resizeMode="cover"
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
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

export default function GalleryScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentBrand, setCurrentBrand] = useState('solarmax');
  
  const insets = useSafeAreaInsets();

  // Fetch dữ liệu từ API
  const fetchPosts = async (brand: string = 'solarmax') => {
    // Tạo biến để lưu trữ ID timeout
    let timeoutId: NodeJS.Timeout | null = null;
    
    try {
      setLoading(true);
      setError(null);
      
      // Test trực tiếp với dữ liệu API cứng (mock data)
      const mockApiData = [
        {
          "content": "<p>Bạn có tin: Chỉ 1 triệu đồng cho 1,000 số điện?</p>...",
          "created_at": "2025-03-27T05:02:51.348947",
          "id": 1,
          "title": "Chỉ 1 triệu đồng",
          "category_id": 1,
          "hashtag": "#slmsolar #hieudungmuadung #post #bancotin #1trieudongcho1000sodien",
          "category": {
            "code": "HDMD",
            "description": null,
            "id": 1,
            "name": "Hiểu đúng mua đúng"
          },
          "media_contents": [
            {
              "url": "https://supabase.slmsolar.com/storage/v1/object/sign/solarmax/04.%20Content%20/HDMD/Post1_Chi1trieudong/Post1_Chi1trdong_1.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJzb2xhcm1heC8wNC4gQ29udGVudCAvSERNRC9Qb3N0MV9DaGkxdHJpZXVkb25nL1Bvc3QxX0NoaTF0cmRvbmdfMS5wbmciLCJpYXQiOjE3NDMwNTI3OTQsImV4cCI6MTc3NDU4ODc5NH0.clPUbkF2n0-un9VOgZXAzfRlMFACuzA8LngstW35sTI&t=2025-03-27T05%3A19%3A54.105Z"
            }
          ]
        }
      ];
      
      // Kiểm tra xem có cần thử kết nối API thực tế không
      const shouldTryRealApi = false; // Đặt thành true để thử API thực, false để dùng dữ liệu mẫu
      
      let data;
      
      if (shouldTryRealApi) {
        // Các URL API khác nhau để thử
        const apiUrls = [
          'https://id.slmsolar.com/api/content',
          'http://id.slmsolar.com/api/content',
          'https://slmsolar.com/api/content'
        ];
        
        let successfulResponse = null;
        let errorMessages = [];
        
        // Thử từng URL cho đến khi thành công
        for (const apiUrl of apiUrls) {
          try {
            console.log(`Thử fetch dữ liệu từ: ${apiUrl}`);
            
            // Tạo AbortController để có thể hủy request
            const controller = new AbortController();
            
            // Thiết lập timeout 10 giây
            timeoutId = setTimeout(() => {
              console.log(`Request timeout cho ${apiUrl} - đang hủy fetch`);
              controller.abort();
            }, 10000);
            
            // Gọi API
            const response = await fetch(apiUrl, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              signal: controller.signal
            });
            
            // Xóa timeout nếu request thành công
            if (timeoutId) {
              clearTimeout(timeoutId);
              timeoutId = null;
            }
            
            if (response.ok) {
              successfulResponse = response;
              console.log(`Kết nối thành công tới ${apiUrl}`);
              break;
            } else {
              errorMessages.push(`${apiUrl}: ${response.status} ${response.statusText}`);
            }
          } catch (urlError: any) {
            // Đảm bảo timeout đã được xóa
            if (timeoutId) {
              clearTimeout(timeoutId);
              timeoutId = null;
            }
            errorMessages.push(`${apiUrl}: ${urlError.message}`);
            console.error(`Lỗi khi kết nối đến ${apiUrl}:`, urlError);
            continue;
          }
        }
        
        if (!successfulResponse) {
          throw new Error(`Không thể kết nối đến bất kỳ API nào: ${errorMessages.join(', ')}`);
        }
        
        // Parse JSON response từ API thành công
        const text = await successfulResponse.text();
        console.log("RAW API RESPONSE:", text.substring(0, 200) + "...");
        
        try {
          data = JSON.parse(text);
          console.log("Dữ liệu API đã được parse thành công");
        } catch (jsonError) {
          console.error("Lỗi khi parse JSON:", jsonError);
          throw new Error("Dữ liệu API không đúng định dạng JSON");
        }
      } else {
        // Sử dụng dữ liệu mẫu
        console.log("Sử dụng dữ liệu mẫu thay vì gọi API");
        data = mockApiData;
      }
      
      // Kiểm tra cấu trúc dữ liệu
      console.log("Cấu trúc dữ liệu:", {
        isArray: Array.isArray(data),
        length: Array.isArray(data) ? data.length : 'không phải mảng',
        type: typeof data,
        sample: data && Array.isArray(data) && data.length > 0 ? JSON.stringify(data[0]).substring(0, 100) + "..." : "không có dữ liệu"
      });
      
      // Chỉ lấy id và title từ mỗi bài viết
      if (Array.isArray(data) && data.length > 0) {
        console.log(`Số lượng bài viết: ${data.length}`);
        
        // Log dữ liệu chi tiết của bài viết đầu tiên
        if (data[0]) {
          console.log("Chi tiết bài viết đầu tiên:", {
            id: data[0].id,
            title: data[0].title,
            hasTitle: Boolean(data[0].title),
            hasId: Boolean(data[0].id)
          });
        }
        
        // Tạo mảng posts mới với chỉ id, title, hashtag và imageUrl
        const simplifiedPosts = data
          .filter(item => item && typeof item === 'object' && 'id' in item && 'title' in item) // Đảm bảo item hợp lệ
          .map(item => {
            console.log("----------------- CHI TIẾT ITEM -----------------");
            console.log("ID:", item.id);
            console.log("Title:", item.title);
            console.log("Hashtag:", item.hashtag);
            
            // Debug chi tiết media_contents
            if (item.media_contents) {
              console.log("media_contents là mảng?", Array.isArray(item.media_contents));
              console.log("media_contents độ dài:", item.media_contents.length);
              
              if (Array.isArray(item.media_contents) && item.media_contents.length > 0) {
                const firstMedia = item.media_contents[0];
                console.log("Media đầu tiên:", JSON.stringify(firstMedia));
                
                // Liệt kê tất cả các thuộc tính của firstMedia
                console.log("Các thuộc tính của media đầu tiên:", Object.keys(firstMedia));
                
                // Kiểm tra các thuộc tính có thể chứa URL
                const possibleImageFields = ['url', 'link', 'image_url', 'imageUrl', 'src', 'source', 'path'];
                possibleImageFields.forEach(field => {
                  if (field in firstMedia) {
                    console.log(`Tìm thấy trường ${field}:`, firstMedia[field]);
                  }
                });
              }
            } else {
              console.log("Item KHÔNG có media_contents");
            }
            
            let imageUrl = null;
            
            // Kiểm tra nhiều khả năng để tìm URL ảnh
            if (item.media_contents && Array.isArray(item.media_contents) && item.media_contents.length > 0) {
              const firstMedia = item.media_contents[0];
              
              // Cách 1: Kiểm tra các trường phổ biến
              for (const field of ['url', 'link', 'image_url', 'imageUrl', 'src', 'source', 'path']) {
                if (firstMedia[field]) {
                  imageUrl = firstMedia[field];
                  console.log(`Tìm thấy URL ảnh trong trường ${field}:`, imageUrl);
                  break;
                }
              }
              
              // Cách 2: Nếu firstMedia là string, có thể đó chính là URL
              if (!imageUrl && typeof firstMedia === 'string') {
                imageUrl = firstMedia;
                console.log("media_contents[0] là string, sử dụng làm URL:", imageUrl);
              }
              
              // Cách 3: Thử lấy giá trị của thuộc tính đầu tiên nếu không có trường nào ở trên
              if (!imageUrl && typeof firstMedia === 'object') {
                const firstKey = Object.keys(firstMedia)[0];
                if (firstKey && typeof firstMedia[firstKey] === 'string') {
                  imageUrl = firstMedia[firstKey];
                  console.log(`Không tìm thấy trường URL chuẩn, sử dụng giá trị đầu tiên (${firstKey}):`, imageUrl);
                }
              }
            }
            
            // Sử dụng fallback nếu không tìm thấy URL
            if (!imageUrl) {
              imageUrl = "";  // Để trống để kích hoạt ảnh dự phòng
              console.log("Sử dụng ảnh dự phòng local replace-holder.png do không tìm thấy URL trong media_contents");
            }
            
            console.log("URL ảnh cuối cùng:", imageUrl);
            console.log("----------------- HẾT CHI TIẾT -----------------");
            
            return {
              id: item.id,
              title: item.title,
              hashtag: item.hashtag || '',
              imageUrl: imageUrl,
              brandId: brand === 'eliton' ? '2' : '1'
            };
          });
        
        console.log("Số bài viết hợp lệ:", simplifiedPosts.length);
        console.log("Posts sau khi xử lý:", simplifiedPosts);
        
        if (simplifiedPosts.length > 0) {
          setPosts(simplifiedPosts);
          setCurrentBrand(brand);
        } else {
          console.warn("Không có bài viết nào với title hợp lệ");
          // Sử dụng fallback
          const fallbackPosts = [
            {
              id: 1,
              title: "Chỉ 1 triệu đồng",
              hashtag: "#slmsolar #hieudungmuadung #post #bancotin #1trieudongcho1000sodien",
              imageUrl: "",  // Để trống để kích hoạt ảnh dự phòng
              brandId: brand === 'eliton' ? '2' : '1'
            }
          ];
          setPosts(fallbackPosts);
          setCurrentBrand(brand);
        }
      } else {
        console.log("Không có dữ liệu hoặc dữ liệu không phải mảng:", data);
        
        // Sử dụng fallback
        const fallbackPosts = [
          {
            id: 1,
            title: "Chỉ 1 triệu đồng",
            hashtag: "#slmsolar #hieudungmuadung #post #bancotin #1trieudongcho1000sodien",
            imageUrl: "",  // Để trống để kích hoạt ảnh dự phòng
            brandId: brand === 'eliton' ? '2' : '1'
          }
        ];
        setPosts(fallbackPosts);
        setCurrentBrand(brand);
      }
      
    } catch (err) {
      // Đảm bảo timeout đã được xóa nếu có lỗi
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      
      console.error('Lỗi khi lấy dữ liệu:', err);
      
      // Xử lý các loại lỗi cụ thể
      if (err instanceof DOMException && err.name === 'AbortError') {
        console.log('Lỗi AbortError - request bị hủy bỏ');
        setError('Yêu cầu bị hủy do quá thời gian. Vui lòng kiểm tra kết nối mạng của bạn.');
      } else if (err instanceof TypeError && err.message.includes('Network request failed')) {
        console.log('Lỗi Network request failed');
        setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại sau.');
      } else {
      setError('Đã xảy ra lỗi khi tải dữ liệu: ' + (err instanceof Error ? err.message : String(err)));
      }
      
      // Nếu không lấy được dữ liệu từ API, hiển thị dữ liệu hardcode
      console.log("Sử dụng dữ liệu fallback");
      const fallbackPosts = [
        {
          id: 1,
          title: "Chỉ 1 triệu đồng",
          hashtag: "#slmsolar #hieudungmuadung #post #bancotin #1trieudongcho1000sodien",
          imageUrl: "",  // Để trống để kích hoạt ảnh dự phòng
          brandId: brand === 'eliton' ? '2' : '1'
        }
      ];
      setPosts(fallbackPosts);
      setCurrentBrand(brand);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const navigateToBrand = (brandId: string) => {
    if (brandId === '1') {
      fetchPosts('solarmax');
    } else if (brandId === '2') {
      fetchPosts('eliton');
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
                style={[
                  styles.userItem, 
                  (currentBrand === 'solarmax' && user.id === '1') || 
                  (currentBrand === 'eliton' && user.id === '2') 
                    ? styles.activeUserItem : null
                ]}
                onPress={() => navigateToBrand(user.id)}
              >
                <Image 
                  source={user.avatar} 
                  style={[
                    styles.userAvatar,
                    (currentBrand === 'solarmax' && user.id === '1') || 
                    (currentBrand === 'eliton' && user.id === '2') 
                      ? styles.activeUserAvatar : null
                  ]} 
                  resizeMode="contain"
                />
                <Text style={[
                  styles.userName,
                  (currentBrand === 'solarmax' && user.id === '1') || 
                  (currentBrand === 'eliton' && user.id === '2') 
                    ? styles.activeUserName : null
                ]}>{user.name}</Text>
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
          <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
            {posts.length > 0 ? (
              posts.map((post) => (
                <View key={post.id} style={styles.postContainer}>
                  <View style={styles.postItem}>
                    <View style={styles.postImageContainer}>
                      <ImageWithFallback 
                        uri={post.imageUrl}
                        style={styles.postImage}
                      />
                      <TouchableOpacity 
                        style={styles.imageOverlayButton}
                        onPress={() => {
                          if (post.imageUrl) {
                            console.log('Đang mở link ảnh:', post.imageUrl);
                            // Thử mở trong ứng dụng
                            Linking.canOpenURL(post.imageUrl)
                              .then(supported => {
                                if (supported) {
                                  if (post.imageUrl) {
                                    return Linking.openURL(post.imageUrl);
                                  }
                                } else {
                                  // Nếu không mở được, thử url khác
                                  const imgUrl = post.imageUrl || ''; 
                                  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(imgUrl)}`;
                                  Alert.alert(
                                    'Thông báo',
                                    'URL gốc không thể mở trực tiếp. Bạn có muốn thử mở qua proxy?',
                                    [
                                      {
                                        text: 'Hủy',
                                        style: 'cancel'
                                      },
                                      {
                                        text: 'Thử',
                                        onPress: () => Linking.openURL(proxyUrl)
                                      }
                                    ]
                                  );
                                }
                              })
                              .catch(err => {
                                console.error('Lỗi khi mở URL:', err);
                                Alert.alert('Lỗi', 'Đã xảy ra lỗi khi mở URL');
                              });
                          }
                        }}
                      >
                        <Ionicons name="open-outline" size={20} color="#ffffff" />
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.postTextOverlay}>
                      <View style={styles.userInfoBar}>
                        <Image 
                          source={post.brandId === '2' ? require('../../assets/images/eliton-logo.png') : require('../../assets/images/solarmax-logo.png')} 
                          style={styles.smallLogo} 
                          resizeMode="contain"
                        />
                        <Text style={styles.postAuthor}>{post.brandId === '2' ? 'Eliton' : 'SolarMax'}</Text>
                        <Text style={styles.postTime}>0 min ago</Text>
                        <TouchableOpacity style={styles.moreButton}>
                          <Ionicons name="ellipsis-vertical" size={16} color="#666" />
                        </TouchableOpacity>
                      </View>
                      
                      <Text 
                        style={styles.postTitle} 
                        numberOfLines={2}
                        ellipsizeMode="tail"
                      >
                        {post.title}
                      </Text>
                      
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
                      <Text 
                        style={styles.postDetailText} 
                        numberOfLines={2} 
                        ellipsizeMode="tail"
                      >
                        {post.title} | Em biết không? | Phần 4 | DA296 - Hải Dương...
                      </Text>
                      <TouchableOpacity>
                        <Text style={styles.seeMoreText}>xem thêm</Text>
                      </TouchableOpacity>
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
    borderRadius: 8,
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
  activeUserItem: {
    backgroundColor: 'rgba(217, 38, 28, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  activeUserAvatar: {
    borderWidth: 2,
    borderColor: '#D9261C',
  },
  activeUserName: {
    fontWeight: 'bold',
    color: '#D9261C',
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
  },
  postImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
  },
  postTextOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  userInfoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
  postTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
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
  pageIndicator: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  postDetailContainer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  postDetailText: {
    fontSize: 15,
    color: '#333',
    marginBottom: 4,
  },
  seeMoreText: {
    fontSize: 14,
    color: '#666',
  },
  imageOverlayButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
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
}); 
