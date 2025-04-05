import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, ScrollView, ActivityIndicator, Dimensions, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RenderHtml from 'react-native-render-html';

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
}

export default function ContentDetailScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = Dimensions.get('window');
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const contentId = params.id ? Number(params.id) : null;

  useEffect(() => {
    if (contentId) {
      fetchContentDetail(contentId);
    } else {
      setError('Không tìm thấy ID bài viết');
      setLoading(false);
    }
  }, [contentId]);

  const fetchContentDetail = async (id: number) => {
    try {
      setLoading(true);
      // Trong ứng dụng thực tế, bạn sẽ cần một API riêng để lấy chi tiết bài viết
      // Vì API hiện tại trả về tất cả nội dung của user,
      // chúng ta sẽ lọc ra nội dung cần thiết từ response
      const response = await fetch('https://id.slmsolar.com/api/users/4', {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Lỗi khi lấy dữ liệu: ${response.status}`);
      }

      const data = await response.json();
      if (data.contents && Array.isArray(data.contents)) {
        const foundContent = data.contents.find((item: Content) => item.id === id);
        if (foundContent) {
          setContent(foundContent);
        } else {
          setError('Không tìm thấy bài viết');
        }
      } else {
        setError('Dữ liệu không hợp lệ');
      }
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết bài viết:', error);
      setError('Không thể tải dữ liệu bài viết. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
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

  // Lấy danh sách hình ảnh từ bài viết
  const getImages = (content: Content): string[] => {
    if (content.media_contents && content.media_contents.length > 0) {
      return content.media_contents
        .filter(media => media.kind === 'image')
        .map(media => media.link);
    }
    return [];
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#ED1C24" />
        <Text style={styles.loadingText}>Đang tải bài viết...</Text>
      </View>
    );
  }

  if (error || !content) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Ionicons name="alert-circle-outline" size={48} color="#ED1C24" />
        <Text style={styles.errorText}>{error || 'Không tìm thấy bài viết'}</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const images = getImages(content);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Chi tiết bài viết',
          headerShown: true,
          headerTitleAlign: 'center',
        }}
      />
      <ScrollView 
        style={[
          styles.container,
          { paddingTop: insets.top > 0 ? 0 : 20 }
        ]}
      >
        <View style={styles.contentHeader}>
          <Text style={styles.contentTitle}>{content.title}</Text>
          <Text style={styles.contentDate}>
            Ngày đăng: {formatDate(content.created_at)}
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
          <RenderHtml
            contentWidth={width - 32}
            source={{ html: content.content }}
            tagsStyles={{
              body: { color: '#333', fontSize: 16, lineHeight: 24 },
              p: { marginBottom: 16 },
              h1: { fontSize: 24, fontWeight: 'bold', marginVertical: 16 },
              h2: { fontSize: 20, fontWeight: 'bold', marginVertical: 12 },
              li: { marginBottom: 8 },
              a: { color: '#0066CC', textDecorationLine: 'underline' }
            }}
          />
        </View>

        {content.hashtag && (
          <View style={styles.hashtagContainer}>
            <Text style={styles.hashtagText}>{content.hashtag}</Text>
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
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#ED1C24',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  contentHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  contentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
  },
  contentDate: {
    fontSize: 14,
    color: '#999',
  },
  imageContainer: {
    width: '100%',
    height: 250,
    overflow: 'hidden',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  contentBody: {
    padding: 16,
  },
  contentText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
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
    borderRadius: 8,
    marginRight: 10,
  },
}); 