import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, ActivityIndicator, Linking } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCombo } from '@/src/hooks/useCombo';

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [showMenu, setShowMenu] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { data: product, isLoading, error } = useCombo(Number(id));

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

  if (isLoading) {
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
          <Text style={styles.errorText}>{error?.message || 'Không tìm thấy sản phẩm'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const getTypeDisplay = (type?: string) => {
    switch(type) {
      case 'DOC_LAP_MOT_PHA': return 'ĐỘC LẬP - MỘT PHA';
      case 'DOC_LAP_BA_PHA': return 'ĐỘC LẬP - BA PHA';
      case 'BAM_TAI_MOT_PHA': return 'BÁM TẢI - MỘT PHA';
      case 'BAM_TAI_BA_PHA': return 'BÁM TẢI - BA PHA';
      default: return 'ĐỘC LẬP';
    }
  };

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
        {/* Product Images */}
        <View style={styles.carousel}>
          <View style={styles.imageContainer}>
            {product.image ? (
              <Image 
                source={{ uri: product.image }} 
                style={styles.productImage}
                resizeMode="contain"
                onError={handleImageError}
              />
            ) : renderPlaceholder()}
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
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productPrice}>
            {product.total_price.toLocaleString('vi-VN')} đ
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
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>MÔ TẢ SẢN PHẨM</Text>
                <TouchableOpacity 
                  onPress={() => router.push({
                    pathname: "/product_baogia",
                    params: { id: product.id }
                  })}
                >
                  <Text style={styles.quoteLink}>Xem báo giá</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.descriptionContent}>
              <View style={styles.descriptionItem}>
                <Text style={styles.descriptionLabel}>Tên sản phẩm</Text>
                <Text style={styles.descriptionValue}>{product.name}</Text>
              </View>

              <View style={styles.descriptionItem}>
                <Text style={styles.descriptionLabel}>Loại</Text>
                <Text style={styles.descriptionValue}>{getTypeDisplay(product.type)}</Text>
              </View>

              <View style={styles.descriptionItem}>
                <Text style={styles.descriptionLabel}>Chi tiết thiết bị</Text>
                {product.grouped_merchandises?.map((group, index) => (
                  <Text key={index} style={styles.descriptionValue}>
                    {group.pre_quote_merchandises[0]?.quantity} x {group.template.name}
                  </Text>
                ))}
              </View>

              <View style={styles.descriptionItem}>
                <Text style={styles.descriptionLabel}>Lưu ý</Text>
                <Text style={styles.descriptionValue}>
                  Mọi thông tin trên đây chỉ mang tính chất tham khảo.
                  Để nhận báo giá chi tiết vui lòng liên hệ hotline 0969 66 33 87
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      
      {/* Bottom Action Buttons */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-social-outline" size={24} color="#333" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.addCustomerButton}
          onPress={() => {
            // TODO: Implement customer add navigation
            console.log('Add customer for combo:', product.id);
          }}
        >
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
    paddingTop: 12,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 20,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    borderRadius: 20,
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    borderRadius: 20,
  },
  productInfo: {
    backgroundColor: '#fff',
    padding: 15,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  productName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
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
    marginTop: 16,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7B7D9D',
    textTransform: 'uppercase',
  },
  quoteLink: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FF3B30',
  },
  descriptionContent: {
    gap: 12,
  },
  descriptionItem: {
    gap: 4,
  },
  descriptionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#27273E',
  },
  descriptionValue: {
    fontSize: 14,
    color: '#27273E',
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