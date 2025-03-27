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

export default function ProductPage() {
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
          headerTitle: () => null,
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerShadowVisible: true,
          headerTintColor: '#000',
          headerLeft: () => (
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={28} color="#000" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => setShowMenu(!showMenu)}
            >
              <Ionicons name="ellipsis-vertical" size={24} color="#000" />
            </TouchableOpacity>
          ),
        }}
      />
      
      {/* Dropdown Menu */}
      {showMenu && (
        <View style={styles.menuDropdown}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              router.push('/products');
              setShowMenu(false);
            }}
          >
            <Ionicons name="cart-outline" size={20} color="#333" />
            <Text style={styles.menuItemText}>Về trang sản phẩm</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              router.push('/');
              setShowMenu(false);
            }}
          >
            <Ionicons name="home-outline" size={20} color="#333" />
            <Text style={styles.menuItemText}>Về trang chủ</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <ScrollView style={styles.container}>
        {/* Product Images Carousel */}
        <View style={styles.carousel}>
          <View style={styles.imageContainer}>
            {product?.image_url && !imageError ? (
              <Image 
                source={{ uri: product.image_url }}
                style={styles.productImage}
                resizeMode="contain"
                onError={handleImageError}
              />
            ) : renderPlaceholder()}
            
            <View style={styles.imageIndicators}>
              {[...Array(5)].map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.imageIndicator,
                    index === currentImageIndex && styles.imageIndicatorActive
                  ]}
                />
              ))}
            </View>
          </View>
        </View>

        {/* Product Authenticity Notice */}
        <View style={styles.authenticityNotice}>
          <Text style={styles.authenticityText}>
            Sản phẩm 100% chính hãng, mẫu mã có thể thay đổi theo lô hàng
          </Text>
        </View>
        
        {/* Product Information */}
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product?.name || 'Hệ Độc lập Một pha 8kW'}</Text>
          <Text style={styles.productPrice}>
            {product ? product.total_price.toLocaleString('vi-VN') : '124 570 689'} đ
          </Text>
          
          <View style={styles.priceInfo}>
            <Text style={styles.priceNote}>
              Giá đã bao gồm thuế. Phí vận chuyển và các chi phí khác (nếu có) sẽ được
              thông báo tới quý khách hàng thông qua nhân viên tư vấn.
            </Text>
          </View>
          
          {/* Description */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>MÔ TẢ SẢN PHẨM</Text>
              <TouchableOpacity 
                style={styles.quoteButton}
                onPress={() => {
                  const productId = Array.isArray(id) ? id[0] : id;
                  router.push(`/product_baogia/${productId}`);
                }}
              >
                <Text style={styles.quoteButtonText}>Xem báo giá</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.descriptionItem}>
              <Text style={styles.descriptionLabel}>Tên sản phẩm</Text>
              <Text style={styles.descriptionValue}>{product?.name || 'Hệ Độc lập Một pha 8kW'}</Text>
            </View>
            
            <View style={styles.descriptionItem}>
              <Text style={styles.descriptionLabel}>Danh mục</Text>
              <Text style={styles.descriptionValue}>Điện năng lượng mặt trời</Text>
            </View>
            
            {/* Chi tiết thiết bị */}
            <View style={styles.descriptionItem}>
              <Text style={styles.descriptionLabel}>Chi tiết thiết bị</Text>
              <View style={styles.deviceDetails}>
                {product?.pre_quote_merchandises.map((item, index) => (
                  <Text key={index} style={styles.deviceDetailItem}>
                    <Text style={styles.boldText}>{item.quantity} x </Text>
                    {item.merchandise.name}
                  </Text>
                )) || (
                  <>
                    <Text style={styles.deviceDetailItem}>
                      <Text style={styles.boldText}>10 x </Text>
                      Tấm quang năng JASolar 580W, loại 01 mặt kính
                    </Text>
                    <Text style={styles.deviceDetailItem}>
                      <Text style={styles.boldText}>01 x </Text>
                      Biến tần Solis Hybrid 5kW
                    </Text>
                    <Text style={styles.deviceDetailItem}>
                      <Text style={styles.boldText}>01 x </Text>
                      Pin lưu trữ Lithium Dyness 5kWh - bản xếp tầng
                    </Text>
                    <Text style={styles.deviceDetailItem}>
                      <Text style={styles.boldText}>01 x </Text>
                      Hệ khung nhôm cao cấp: Full-rail
                    </Text>
                    <Text style={styles.deviceDetailItem}>
                      <Text style={styles.boldText}>01 x </Text>
                      Bộ tủ điện năng lượng mặt trời SolarMax
                    </Text>
                  </>
                )}
              </View>
            </View>
            
            {/* Lưu ý */}
            <View style={styles.note}>
              <Text style={styles.noteText}>
                Mọi thông tin trên đây chỉ mang tính chất tham khảo.
                Để nhận báo giá chi tiết vui lòng liên hệ hotline 0969 66 33 87
              </Text>
            </View>
          </View>

          {/* Datasheet Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>DATASHEET</Text>
            <View style={styles.datasheetList}>
              {product?.pre_quote_merchandises.map((item, index) => (
                item.merchandise.data_sheet_link && (
                  <TouchableOpacity 
                    key={index}
                    style={styles.datasheetItem}
                    onPress={() => handleOpenDatasheet(item.merchandise.data_sheet_link)}
                  >
                    <Ionicons name="document-text-outline" size={24} color="#666" />
                    <Text style={styles.datasheetText}>
                      {item.merchandise.name} - Datasheet
                    </Text>
                  </TouchableOpacity>
                )
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
      
      {/* Bottom Action Buttons */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-social-outline" size={24} color="#333" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.addCustomerButton}>
          <Ionicons name="add-circle-outline" size={22} color="#fff" style={{marginRight: 5}} />
          <Text style={styles.addCustomerButtonText}>Thêm thông tin khách hàng</Text>
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
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuDropdown: {
    position: 'absolute',
    top: 60,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  menuItemText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  carousel: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 8,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.2)',
    marginHorizontal: 3,
  },
  imageIndicatorActive: {
    backgroundColor: '#00A650',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  productInfo: {
    backgroundColor: '#fff',
    padding: 15,
  },
  productName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 10,
  },
  priceInfo: {
    paddingVertical: 12,
  },
  priceNote: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  section: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  quoteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  quoteButtonText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '600',
  },
  descriptionItem: {
    marginBottom: 15,
  },
  descriptionLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 5,
  },
  descriptionValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  deviceDetails: {
    marginTop: 5,
  },
  deviceDetailItem: {
    fontSize: 15,
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#000',
  },
  note: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
    marginTop: 5,
    marginBottom: 20,
  },
  noteText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  datasheetList: {
    marginTop: 10,
  },
  datasheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  datasheetText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#0066CC',
    textDecorationLine: 'underline',
  },
  bottomActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  shareButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    marginRight: 10,
  },
  addCustomerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF3B30',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 4,
  },
  addCustomerButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
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
  authenticityNotice: {
    backgroundColor: '#f5f5f8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  authenticityText: {
    fontSize: 13,
    color: '#666666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
}); 