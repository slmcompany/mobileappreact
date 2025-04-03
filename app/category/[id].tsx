import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Image, Dimensions, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';

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
  imageUrl?: string;
  media_contents?: MediaContent[];
  category?: {
    code: string;
    id: number;
    name: string;
    sector: string;
  };
}

export default function CategoryDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const categoryId = typeof id === 'string' ? id : '1';
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('https://id.slmsolar.com/api/content');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      
      // Lọc bài viết theo category ID và chỉ lấy những bài có ảnh
      const filteredPosts = data
        .filter((item: Post) => 
          item.category?.id.toString() === categoryId &&
          item.media_contents?.some(media => media.kind === "image")
        )
        .map((item: Post) => {
          const firstImage = item.media_contents?.find(media => media.kind === "image");
          return {
            id: item.id,
            title: item.title,
            imageUrl: firstImage?.link || '',
            category: item.category,
          };
        });
      
      setPosts(filteredPosts);
      
    } catch (err) {
      console.error('Lỗi khi lấy dữ liệu:', err);
      setError('Đã xảy ra lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [categoryId]);

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
            <Text style={styles.headerTitle}>{posts[0]?.category?.name || 'Bài viết'}</Text>
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
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#D9261C" />
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={fetchPosts}
            >
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : posts.length === 0 ? (
          <View style={styles.centerContainer}>
            <Ionicons name="images-outline" size={48} color="#ddd" />
            <Text style={styles.emptyText}>Không có ảnh nào</Text>
          </View>
        ) : (
          <FlatList
            data={posts}
            renderItem={renderGridItem}
            keyExtractor={item => item.id.toString()}
            numColumns={3}
            contentContainerStyle={styles.gridContainer}
            onRefresh={fetchPosts}
            refreshing={loading}
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
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
}); 