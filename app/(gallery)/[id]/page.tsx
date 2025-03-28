import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Text, Image, ActivityIndicator, TouchableOpacity, Dimensions, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';

// Interfaces
interface MediaContent {
  kind: 'image' | 'video';
  title: string;
  link: string;
}

interface PostDetail {
  id: number;
  title: string;
  content: string;
  created_at: string;
  media_contents: MediaContent[];
  category: {
    name: string;
    code: string;
  };
}

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isVideoModalVisible, setIsVideoModalVisible] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState('');

  useEffect(() => {
    console.log('Current post ID:', id);
    fetchPostDetail();
  }, [id]);

  const fetchPostDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // TODO: Implement API call here
      // const response = await fetch(`${API_URL}/posts/${id}`);
      // const data = await response.json();
      // setPost(data);
      
    } catch (err) {
      console.error('Error fetching post detail:', err);
      setError('Không thể tải thông tin bài viết. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const getGalleryImages = () => {
    if (!post?.media_contents) {
      console.log('No media contents found');
      return [];
    }
    const images = post.media_contents.filter(media => media.kind === "image");
    console.log('Gallery images:', images);
    return images;
  };

  const getVideo = () => {
    if (!post?.media_contents) {
      console.log('No media contents found for video');
      return null;
    }
    const video = post.media_contents.find(media => media.kind === "video");
    console.log('Video found:', video);
    return video || null;
  };

  const handleNextImage = () => {
    const galleryImages = getGalleryImages();
    if (galleryImages.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
    }
  };

  const handlePreviousImage = () => {
    const galleryImages = getGalleryImages();
    if (galleryImages.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
    }
  };

  const renderGallery = () => {
    const galleryImages = getGalleryImages();
    if (galleryImages.length === 0) {
      console.log('No images to display in gallery');
      return null;
    }

    console.log('Rendering gallery with images:', galleryImages);
    console.log('Current image index:', currentImageIndex);

    return (
      <View style={styles.galleryContainer}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: galleryImages[currentImageIndex].link }}
            style={styles.image}
            resizeMode="cover"
            onError={(error) => {
              console.error('Error loading image:', error.nativeEvent.error);
            }}
            onLoad={() => {
              console.log('Image loaded successfully:', galleryImages[currentImageIndex].link);
            }}
          />
          {galleryImages.length > 1 && (
            <>
              <TouchableOpacity 
                style={[styles.navigationButton, styles.leftButton]} 
                onPress={handlePreviousImage}
              >
                <Ionicons name="chevron-back" size={24} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.navigationButton, styles.rightButton]} 
                onPress={handleNextImage}
              >
                <Ionicons name="chevron-forward" size={24} color="#FFF" />
              </TouchableOpacity>
              <View style={styles.imageIndicator}>
                {galleryImages.map((_, index) => (
                  <View
                    key={`gallery-dot-${index}`}
                    style={[
                      styles.indicatorDot,
                      index === currentImageIndex && styles.activeIndicatorDot,
                    ]}
                  />
                ))}
              </View>
            </>
          )}
        </View>
      </View>
    );
  };

  const renderVideoButton = () => {
    const video = getVideo();
    if (!video?.link) {
      console.log('No video link found');
      return null;
    }

    console.log('Rendering video button with link:', video.link);
    return (
      <TouchableOpacity
        style={styles.videoButton}
        onPress={() => {
          console.log('Video button pressed, opening:', video.link);
          setSelectedVideoUrl(video.link);
          setIsVideoModalVisible(true);
        }}
      >
        <View style={styles.videoButtonContent}>
          <Ionicons name="play-circle" size={24} color="#ED1C24" />
          <Text style={styles.videoButtonText}>Xem video</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    console.log('Loading state...');
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ED1C24" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </SafeAreaView>
    );
  }

  if (error || !post) {
    console.log('Error state:', error);
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#ED1C24" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={fetchPostDetail}
        >
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  console.log('Rendering post:', {
    id: post.id,
    title: post.title,
    category: post.category,
    mediaCount: post.media_contents?.length || 0
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {renderGallery()}
        {renderVideoButton()}
        <View style={styles.header}>
          <Text style={styles.category}>{post.category.name}</Text>
          <Text style={styles.title}>{post.title}</Text>
          <Text style={styles.date}>
            {new Date(post.created_at).toLocaleDateString('vi-VN')}
          </Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.contentText}>{post.content}</Text>
        </View>
      </ScrollView>

      {isVideoModalVisible && (
        <Modal
          visible={isVideoModalVisible}
          onRequestClose={() => setIsVideoModalVisible(false)}
          animationType="slide"
          transparent={false}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setIsVideoModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <WebView
              source={{ uri: selectedVideoUrl }}
              style={styles.webview}
              javaScriptEnabled={true}
              domStorageEnabled={true}
            />
          </SafeAreaView>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 12,
    color: '#27273E',
    fontSize: 14,
    fontFamily: 'Roboto Flex',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    marginVertical: 12,
    color: '#27273E',
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'Roboto Flex',
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#ED1C24',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
    fontFamily: 'Roboto Flex',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#DCDCE6',
  },
  category: {
    fontSize: 12,
    color: '#ED1C24',
    fontWeight: '500',
    marginBottom: 8,
    fontFamily: 'Roboto Flex',
  },
  title: {
    fontSize: 24,
    color: '#27273E',
    fontWeight: '700',
    marginBottom: 8,
    fontFamily: 'Roboto Flex',
  },
  date: {
    fontSize: 12,
    color: '#9394B0',
    fontFamily: 'Roboto Flex',
  },
  galleryContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F8F8F8',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  navigationButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  leftButton: {
    left: 16,
  },
  rightButton: {
    right: 16,
  },
  imageIndicator: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    zIndex: 1,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    opacity: 0.5,
  },
  activeIndicatorDot: {
    opacity: 1,
    backgroundColor: '#ED1C24',
  },
  content: {
    padding: 16,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#27273E',
    fontFamily: 'Roboto Flex',
  },
  videoButton: {
    marginHorizontal: 16,
    marginVertical: 16,
    padding: 12,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ED1C24',
    zIndex: 2,
  },
  videoButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  videoButtonText: {
    color: '#ED1C24',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Roboto Flex',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  modalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#DCDCE6',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  webview: {
    flex: 1,
  },
}); 