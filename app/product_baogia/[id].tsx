import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Dimensions, ActivityIndicator, Modal, Linking } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface PreQuoteCombo {
  id: number;
  code: string;
  description: string;
  total_price: number;
  kind: string;
  status: string;
  name: string;
  created_at: string;
  installation_type: string;
  customer_id: number;
  image_url?: string;
  customer: {
    id: number;
    address: string;
    created_at: string | null;
    user_id: number | null;
    name: string;
    phone: string;
    email: string;
    description: string | null;
  };
  pre_quote_merchandises: Array<{
    id: number;
    merchandise_id: number;
    quantity: number;
    pre_quote_id: number;
    note: string | null;
    price: number;
    merchandise: {
      id: number;
      supplier_id: number | null;
      name: string;
      unit: string;
      data_json: {
        power_watt?: string;
        width_mm?: string;
        height_mm?: string;
        thickness_mm?: string;
        area_m2?: string;
        weight_kg?: string;
        technology?: string;
        warranty_years?: string;
        price_vnd?: string;
        ac_power_kw?: number;
        dc_max_power_kw?: number;
        installation_type?: string;
        phase_type?: string;
        brand_ranking?: number;
      };
      active: boolean;
      template_id: number;
      brand_id: number;
      code: string;
      data_sheet_link: string;
      description_in_contract: string;
      created_at: string;
    };
  }>;
}

export default function ProductBaoGiaPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [product, setProduct] = useState<PreQuoteCombo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://id.slmsolar.com/api/pre_quote/combo');
      const data: PreQuoteCombo[] = await response.json();
      const foundProduct = data.find(p => p.id.toString() === id);
      
      if (foundProduct) {
        setProduct(foundProduct);
      } else {
        setError('Không tìm thấy sản phẩm');
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi tải dữ liệu sản phẩm');
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDatasheet = (url: string) => {
    Linking.openURL(url);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const renderPlaceholder = () => {
    return (
      <Image 
        source={require('@/assets/images/replace-holder.png')}
        style={styles.placeholderImage}
        resizeMode="contain"
      />
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00A650" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
          <Text style={styles.errorText}>{error || 'Không tìm thấy sản phẩm'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalPower = product.pre_quote_merchandises.reduce((sum, merch) => {
    const power = merch.merchandise.data_json.power_watt || '0';
    return sum + (parseInt(power) * merch.quantity);
  }, 0);

  const phaseType = product.pre_quote_merchandises.some(merch => 
    merch.merchandise.data_json.phase_type === '3-phase'
  ) ? 'BA PHA' : 'MỘT PHA';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: '',
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: '#00A650',
          },
          headerTintColor: '#fff',
          headerLeft: () => (
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={28} color="#fff" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => router.push('/products')}
              >
                <Ionicons name="cart-outline" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => router.push('/')}
              >
                <Ionicons name="home-outline" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <ScrollView style={styles.container}>
        <View style={[styles.productHeader, { paddingTop: 0 }]}>
          <Text style={styles.productTitle}>HỆ ĐỘC LẬP 5.5 KWH</Text>
          <Text style={styles.productSubtitle}>LƯU TRỮ 5.2 KWH</Text>
          <Text style={styles.productCapacity}>Sản lượng trung bình: 400-600 kWh/tháng</Text>
          
          <View style={styles.tags}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>MỘT PHA</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>ÁP THẤP</Text>
            </View>
          </View>
        </View>

        <View style={styles.equipmentList}>
          {product?.pre_quote_merchandises.map((item, index) => (
            <View key={index} style={styles.equipmentItem}>
              <Image 
                source={require('@/assets/images/replace-holder.png')}
                style={styles.equipmentImage}
              />
              <View style={styles.equipmentDetails}>
                <Text style={styles.equipmentName}>{item.merchandise.name}</Text>
                {item.merchandise.data_json.power_watt && (
                  <Text style={styles.equipmentSpecs}>Công suất: {item.merchandise.data_json.power_watt} Wp</Text>
                )}
                {item.merchandise.data_json.technology && (
                  <Text style={styles.equipmentSpecs}>Công nghệ: {item.merchandise.data_json.technology}</Text>
                )}
                {item.merchandise.data_json.weight_kg && (
                  <Text style={styles.equipmentSpecs}>Khối lượng: {item.merchandise.data_json.weight_kg} kg</Text>
                )}
                {item.merchandise.data_json.warranty_years && (
                  <Text style={styles.equipmentSpecs}>Bảo hành: {item.merchandise.data_json.warranty_years} năm</Text>
                )}
                <Text style={styles.equipmentPrice}>{item.price.toLocaleString('vi-VN')} đ</Text>
                <Text style={styles.equipmentQuantity}>Số lượng: {item.quantity.toString().padStart(2, '0')}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.equipmentSummary}>
          <Text style={styles.summaryTitle}>DANH MỤC THIẾT BỊ</Text>
          <View style={styles.summaryList}>
            {product?.pre_quote_merchandises.map((item, index) => (
              <View key={index} style={styles.summaryItem}>
                <Text style={styles.summaryText}>{index + 1}. {item.merchandise.name}</Text>
                <Text style={styles.summaryQuantity}>{item.quantity.toString().padStart(2, '0')} {item.merchandise.unit}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalPrice}>
          <Text style={styles.totalPriceLabel}>Trọn gói 100%</Text>
          <Text style={styles.totalPriceValue}>94.800.000 đ</Text>
        </View>
        <TouchableOpacity style={styles.contactButton}>
          <Text style={styles.contactButtonText}>0969 66 33 87</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#333',
  },
  container: {
    flex: 1,
  },
  productHeader: {
    padding: 16,
    backgroundColor: '#00A650',
  },
  productTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  productSubtitle: {
    fontSize: 20,
    color: '#fff',
    marginTop: 4,
  },
  productCapacity: {
    fontSize: 14,
    color: '#fff',
    marginTop: 8,
  },
  tags: {
    flexDirection: 'row',
    marginTop: 12,
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  tagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  equipmentList: {
    padding: 16,
  },
  equipmentItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  equipmentImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 12,
  },
  equipmentDetails: {
    flex: 1,
  },
  equipmentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  equipmentSpecs: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  equipmentPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginTop: 4,
  },
  equipmentQuantity: {
    fontSize: 14,
    color: '#333',
    marginTop: 4,
  },
  equipmentSummary: {
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  summaryList: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  summaryText: {
    fontSize: 14,
    color: '#333',
  },
  summaryQuantity: {
    fontSize: 14,
    color: '#666',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  totalPrice: {
    flex: 1,
  },
  totalPriceLabel: {
    fontSize: 14,
    color: '#666',
  },
  totalPriceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF3B30',
  },
  contactButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
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
    backgroundColor: '#fff',
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
}); 