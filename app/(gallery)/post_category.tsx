import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Image, Dimensions, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';

// Định nghĩa kiểu dữ liệu
interface MediaContent {
  id: number;
  title: string;
  kind: string;
  content_id: number;
  link: string;
  thumbnail?: string;
  created_at: string;
}

interface Category {
  code: string;
  id: number;
  name: string;
  sector: string;
  image?: string;
}

interface Content {
  id: number;
  title: string;
  category_id: number;
  media_contents: MediaContent[];
  category?: Category;
}

interface Sector {
  id: number;
  code: string;
  name: string;
  image: string;
  image_rectangular: string;
  list_contents: Content[];
}

interface Post {
  id: number;
  title: string;
  imageUrl?: string;
  category?: Category;
}

// Hàm fetch API sector
const fetchSectors = async () => {
  try {
    console.log('Bắt đầu gọi API sectors');
    
    // Tạo AbortController với timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 giây timeout
    
    const response = await fetch('https://id.slmsolar.com/api/sector', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      signal: controller.signal,
    });
    
    // Xóa timeout sau khi request hoàn thành
    clearTimeout(timeoutId);
    
    console.log('Kết quả API status:', response.status);
    
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Nhận dữ liệu API thành công, số lượng sector:', data.length);
    return data;
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      throw new Error('Yêu cầu đã bị hủy do quá thời gian chờ');
    }
    console.error('Lỗi khi fetch sectors:', error);
    throw error;
  }
};

export default function CategoryDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const categoryId = typeof id === 'string' ? id : '1';

  // Dùng React Query để lấy dữ liệu sector
  const { 
    data: sectorsData,
    isLoading,
    error,
    refetch 
  } = useQuery({
    queryKey: ['sectors'],
    queryFn: fetchSectors,
    retry: 3, // Thử lại 3 lần nếu thất bại
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Độ trễ tăng dần
    staleTime: 5 * 60 * 1000, // Dữ liệu vẫn còn "mới" trong 5 phút
  });

  // Xử lý dữ liệu
  const contents = React.useMemo(() => {
    if (!sectorsData) return [];
    
    // Lấy tất cả bài viết từ tất cả các sector
    const allContents: Content[] = [];
    sectorsData.forEach((sector: Sector) => {
      if (sector.list_contents && sector.list_contents.length > 0) {
        allContents.push(...sector.list_contents);
      }
    });
    
    return allContents;
  }, [sectorsData]);
  
  // Lọc bài viết theo category
  const filteredPosts = React.useMemo(() => {
    if (!contents.length) return [];
    
    return contents
      .filter((content: Content) => 
        content.category?.id.toString() === categoryId &&
        content.media_contents?.some(media => media.kind === "image")
      )
      .map((content: Content) => {
        const firstImage = content.media_contents?.find(media => media.kind === "image");
        return {
          id: content.id,
          title: content.title,
          imageUrl: firstImage?.link || '',
          thumbnail: firstImage?.thumbnail || '',
          category: content.category,
        };
      });
  }, [contents, categoryId]);

  const postCount = filteredPosts.length;
  
  // Tìm sector có chứa category hiện tại
  const firstPost = filteredPosts[0];
  const sectorData = sectorsData && firstPost?.category 
    ? sectorsData.find((sector: Sector) => sector.code === firstPost.category?.sector)
    : null;

  const renderGridItem = ({ item }: { item: Post }) => (
    <TouchableOpacity 
      style={styles.gridItem}
      onPress={() => router.push({
        pathname: '/post-detail',
        params: { id: item.id }
      })}
    >
      <Image 
        source={item.imageUrl ? { uri: item.imageUrl } : require('../../assets/images/replace-holder.png')}
        style={styles.gridImage}
        defaultSource={require('../../assets/images/replace-holder.png')}
      />
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <View style={styles.headerTitleContainer}>
              {sectorData?.image && (
                <Image 
                  source={{ uri: sectorData.image }} 
                  style={styles.sectorAvatar} 
                  resizeMode="contain"
                />
              )}
              <Text style={styles.headerTitle}>{firstPost?.category?.name || 'Bài viết'}</Text>
              <Text style={styles.postCount}>{postCount} bài viết</Text>
            </View>
          ),
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerShadowVisible: true,
          headerLeft: () => (
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={24} color="#333" />
            </TouchableOpacity>
          ),
        }}
      />
      <SafeAreaView style={styles.container}>
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#D9261C" />
            <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Ionicons name="cloud-offline-outline" size={48} color="#666" />
            <Text style={styles.errorText}>
              {error instanceof Error ? 
                `Lỗi kết nối: ${error.message}` : 
                'Đã xảy ra lỗi khi tải dữ liệu'}
            </Text>
            <Text style={styles.errorSubtext}>
              Vui lòng kiểm tra kết nối mạng và thử lại
            </Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => refetch()}
            >
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : filteredPosts.length === 0 ? (
          <View style={styles.centerContainer}>
            <Ionicons name="images-outline" size={48} color="#ddd" />
            <Text style={styles.emptyText}>Không có ảnh nào</Text>
          </View>
        ) : (
          <FlatList
            data={filteredPosts}
            renderItem={renderGridItem}
            keyExtractor={item => item.id.toString()}
            numColumns={3}
            contentContainerStyle={styles.gridContainer}
            onRefresh={() => refetch()}
            refreshing={isLoading}
          />
        )}
      </SafeAreaView>
    </>
  );
}

const { width } = Dimensions.get('window');
const itemSize = width / 3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  postCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#D9261C',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  gridContainer: {
    flexGrow: 1,
  },
  gridItem: {
    width: itemSize,
    height: itemSize,
    padding: 1,
  },
  gridImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
    paddingHorizontal: 24,
  },
}); 