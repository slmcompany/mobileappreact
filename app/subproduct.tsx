import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, StatusBar, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack, useNavigation } from 'expo-router';
import { API_CONFIG, API_ENDPOINTS, ApiResponse, handleApiError, buildUrl } from './config/api';

interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  image_url?: string;
  category?: string;
  in_stock?: boolean;
  specifications?: {
    power?: string;
    voltage?: string;
    warranty?: string;
    brand?: string;
  };
}

// Hàm định dạng tiền tệ VND
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

export default function SubProductScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<'unknown' | 'checking' | 'success' | 'error'>('unknown');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
      
      const url = buildUrl(API_ENDPOINTS.PRODUCTS.LIST);
      console.log('Fetching products from:', url);
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: API_CONFIG.HEADERS
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      
      // Kiểm tra cấu trúc response
      if (Array.isArray(data)) {
        // Nếu response là array, chuyển đổi sang định dạng chuẩn
        const formattedProducts: Product[] = data.map((item: any) => ({
          id: item.id?.toString() || '',
          name: item.name || '',
          price: parseFloat(item.price) || 0,
          description: item.description || '',
          image_url: item.image_url || '',
          category: item.category || '',
          in_stock: item.in_stock || false,
          specifications: item.specifications || {}
        }));
        setProducts(formattedProducts);
        setError(null);
      } else if (data.status === 'success' && data.data) {
        // Nếu response có cấu trúc chuẩn
        setProducts(data.data);
        setError(null);
      } else {
        throw new Error(data.message || 'Không thể tải dữ liệu sản phẩm');
      }
    } catch (err: any) {
      console.error('Chi tiết lỗi:', err);
      const apiError = handleApiError(err);
      console.error('Lỗi khi lấy dữ liệu:', apiError);
      setError(apiError.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const checkApiConnection = async () => {
    setApiStatus('checking');
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(API_ENDPOINTS.PRODUCTS.HEALTHCHECK, {
        signal: controller.signal,
        headers: API_CONFIG.HEADERS
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        setApiStatus('success');
        setTimeout(() => setApiStatus('unknown'), 3000);
      } else {
        setApiStatus('error');
      }
    } catch (err) {
      setApiStatus('error');
    }
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => {
        if (item.id) {
          router.push(`/product_page/${item.id}`);
        }
      }}
    >
      <View style={styles.productImageContainer}>
        {item.image_url ? (
          <Image 
            source={{ uri: item.image_url }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.productImageText}>{item.name.slice(0, 1)}</Text>
          </View>
        )}
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.productPrice}>{formatCurrency(item.price)}</Text>
        
        {item.specifications && (
          <View style={styles.specsContainer}>
            {item.specifications.power && (
              <View style={styles.specItem}>
                <Ionicons name="flash-outline" size={12} color="#666" />
                <Text style={styles.specText}>{item.specifications.power}</Text>
              </View>
            )}
            {item.specifications.voltage && (
              <View style={styles.specItem}>
                <Ionicons name="battery-charging-outline" size={12} color="#666" />
                <Text style={styles.specText}>{item.specifications.voltage}</Text>
              </View>
            )}
          </View>
        )}

        {item.category && (
          <View style={styles.tagContainer}>
            <Text style={styles.tagText}>{item.category}</Text>
          </View>
        )}
        
        {item.in_stock !== undefined && (
          <View style={[styles.stockContainer, {backgroundColor: item.in_stock ? '#E8F5E9' : '#FFEBEE'}]}>
            <Ionicons 
              name={item.in_stock ? 'checkmark-circle-outline' : 'alert-circle-outline'} 
              size={12} 
              color={item.in_stock ? '#4CAF50' : '#F44336'} 
              style={styles.stockIcon}
            />
            <Text style={[styles.stockStatus, {color: item.in_stock ? '#4CAF50' : '#F44336'}]}>
              {item.in_stock ? 'Còn hàng' : 'Hết hàng'}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Sản phẩm',
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '600',
            color: '#333',
          },
          headerTintColor: '#333',
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="chevron-back" size={24} color="#333" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={checkApiConnection}
              style={styles.apiCheckButton}
              disabled={apiStatus === 'checking'}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons 
                name={
                  apiStatus === 'unknown' ? 'server-outline' :
                  apiStatus === 'checking' ? 'hourglass-outline' :
                  apiStatus === 'success' ? 'checkmark-circle-outline' :
                  'close-circle-outline'
                } 
                size={24} 
                color={
                  apiStatus === 'unknown' ? '#888' :
                  apiStatus === 'checking' ? '#888' :
                  apiStatus === 'success' ? '#4CAF50' :
                  '#F44336'
                } 
              />
            </TouchableOpacity>
          ),
        }}
      />

      {apiStatus !== 'unknown' && (
        <View style={[
          styles.apiStatusBanner,
          {
            backgroundColor: 
              apiStatus === 'checking' ? '#E3F2FD' :
              apiStatus === 'success' ? '#E8F5E9' :
              '#FFEBEE'
          }
        ]}>
          <Ionicons 
            name={
              apiStatus === 'checking' ? 'time-outline' :
              apiStatus === 'success' ? 'checkmark-circle-outline' :
              'close-circle-outline'
            } 
            size={20} 
            color={
              apiStatus === 'checking' ? '#2196F3' :
              apiStatus === 'success' ? '#4CAF50' :
              '#F44336'
            } 
          />
          <Text style={[
            styles.apiStatusText,
            {
              color: 
                apiStatus === 'checking' ? '#2196F3' :
                apiStatus === 'success' ? '#4CAF50' :
                '#F44336'
            }
          ]}>
            {
              apiStatus === 'checking' ? 'Đang kiểm tra kết nối API...' :
              apiStatus === 'success' ? 'Kết nối API thành công!' :
              'Không thể kết nối đến API'
            }
          </Text>
        </View>
      )}

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A80F0" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      ) : (
        <>
          {error && (
            <View style={styles.warningBanner}>
              <Ionicons name="warning-outline" size={18} color="#856404" />
              <Text style={styles.warningText}>{error}</Text>
            </View>
          )}
          <FlatList
            data={products}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            contentContainerStyle={styles.productsList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#4A80F0']}
                tintColor="#4A80F0"
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="basket-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>Không tìm thấy sản phẩm nào</Text>
              </View>
            }
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  backButton: {
    padding: 8,
    marginLeft: 4,
    borderRadius: 20,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#4A80F0',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  productsList: {
    padding: 12,
  },
  productCard: {
    flex: 1,
    margin: 6,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImageContainer: {
    height: 140,
    width: '100%',
    backgroundColor: '#f9f9f9',
  },
  placeholderImage: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4A80F0',
  },
  productImageText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A80F0',
    marginBottom: 8,
  },
  tagContainer: {
    backgroundColor: '#E8F0FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#4A80F0',
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 8,
  },
  stockIcon: {
    marginRight: 4,
  },
  stockStatus: {
    fontSize: 12,
    marginTop: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEEBA',
    borderWidth: 1,
    padding: 12,
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 6,
  },
  warningText: {
    color: '#856404',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  apiCheckButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#F5F7FA',
  },
  apiStatusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 6,
  },
  apiStatusText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  productImage: {
    height: '100%',
    width: '100%',
  },
  specsContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  specText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
}); 