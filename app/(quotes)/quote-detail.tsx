import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';

export default function QuoteDetailScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Báo giá',
          headerTitleAlign: 'center',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color="#333" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity>
              <Ionicons name="document-text-outline" size={24} color="#333" />
            </TouchableOpacity>
          ),
          headerTitleStyle: {
            fontSize: 17,
            fontWeight: '600',
          },
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: '#fff',
          },
          contentStyle: {
            backgroundColor: '#fff'
          }
        }}
      />
      
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView style={styles.scrollView}>
          {/* Product Overview */}
          <View style={styles.productOverview}>
            <View style={styles.productImagePlaceholder}>
              <Text style={styles.placeholderText}>Ảnh sản phẩm</Text>
            </View>
            <View style={styles.productInfo}>
              <Text style={styles.productName}>8,8kW</Text>
              <Text style={styles.productDescription}>## Tấm quang năng JASolar ###W (kèm khung nhôm cao cấp), ## Biến tần Hybrid Solis ##kW, ## Pin lưu trữ Lithium Dyness ##kWh, 01 Tủ điện SolarMax.</Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>124.570.689 đ</Text>
              <TouchableOpacity style={styles.viewQuoteButton}>
                <Ionicons name="document-text-outline" size={16} color="#666" />
                <Text style={styles.viewQuoteText}>Xem báo giá</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Tags */}
          <View style={styles.tagsContainer}>
            <View style={[styles.tag, { backgroundColor: '#E8F5E9' }]}>
              <Text style={[styles.tagText, { color: '#2E7D32' }]}>ĐỘC LẬP</Text>
            </View>
            <View style={[styles.tag, { backgroundColor: '#F3E5F5' }]}>
              <Text style={[styles.tagText, { color: '#7B1FA2' }]}>MỘT PHA</Text>
            </View>
            <View style={[styles.tag, { backgroundColor: '#E3F2FD' }]}>
              <Text style={[styles.tagText, { color: '#1565C0' }]}>ÁP THẤP</Text>
            </View>
          </View>

          {/* SolarMax Banner */}
          <View style={styles.banner}>
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoText}>SOLAR MAX</Text>
            </View>
            <Text style={styles.bannerText}>Bắt đầu Tiết kiệm Điện</Text>
          </View>

          {/* System Info */}
          <View style={styles.systemInfo}>
            <Text style={styles.systemTitle}>HỆ ĐỘC LẬP 5,5 KWH</Text>
            <Text style={styles.systemSubtitle}>LƯU TRỮ 5,2 KWH</Text>
            <View style={styles.tagRow}>
              <Text style={styles.tagLabel}>MỘT PHA</Text>
              <Text style={styles.tagLabel}>ÁP THẤP</Text>
            </View>
            <Text style={styles.systemDescription}>Sản lượng trung bình: 400-600 kWh/tháng</Text>
          </View>

          {/* Equipment List */}
          <View style={styles.equipmentList}>
            {/* JASolar Panel */}
            <View style={styles.equipmentItem}>
              <View style={styles.equipmentImagePlaceholder}>
                <Text style={styles.placeholderText}>JA</Text>
              </View>
              <View style={styles.equipmentInfo}>
                <Text style={styles.equipmentTitle}>PV JASolar 580W</Text>
                <Text style={styles.equipmentSpecs}>
                  Công suất: 580W{'\n'}
                  Công nghệ: n-type, Mono Half-Cell{'\n'}
                  Khối lượng: 27.4 kg{'\n'}
                  Bảo hành: 12 năm
                </Text>
                <View style={styles.quantityRow}>
                  <Text style={styles.equipmentPrice}>124.570.689 đ</Text>
                  <View style={styles.quantityBadge}>
                    <Text style={styles.quantityText}>Số lượng: 09</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Other equipment items... */}
          </View>

          {/* Total Section */}
          <View style={styles.totalSection}>
            <Text style={styles.totalTitle}>Trọn gói 100%</Text>
            <Text style={styles.totalSubtitle}>Cam kết không phát sinh{'\n'}với mái ngói, mái tôn</Text>
            <Text style={styles.totalPrice}>94.800.000 đ</Text>
          </View>

          {/* Equipment Summary */}
          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>DANH MỤC THIẾT BỊ</Text>
            <View style={styles.summaryList}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>1</Text>
                <Text style={styles.summaryText}>Tấm quang năng - 1 mặt kính</Text>
                <View style={styles.summaryLogoPlaceholder}>
                  <Text style={styles.logoText}>JA</Text>
                </View>
                <Text style={styles.summaryQuantity}>10 tấm</Text>
              </View>
              {/* Other summary items... */}
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Báo giá trên chưa bao gồm... vui lòng liên hệ hotline để được tư vấn
            </Text>
            <TouchableOpacity style={styles.hotlineButton}>
              <Ionicons name="call" size={20} color="#fff" />
              <Text style={styles.hotlineText}>0969 66 33 87</Text>
            </TouchableOpacity>

            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>Công ty Cổ phần Đầu tư SLM</Text>
              <Text style={styles.companyAddress}>
                Tầng 5, Tòa nhà Diamond Flower Tower{'\n'}
                Số 01, P. Hoàng Đạo Thúy, P. Nhân Chính{'\n'}
                Quận Thanh Xuân, Hà Nội
              </Text>
            </View>

            <View style={styles.socialLinks}>
              <Text style={styles.websiteLink}>www.slmsolar.com</Text>
              <View style={styles.socialIcons}>
                <Ionicons name="logo-facebook" size={24} color="#666" />
                <Ionicons name="logo-youtube" size={24} color="#666" />
                <Ionicons name="logo-instagram" size={24} color="#666" />
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.templateButton}>
              <Ionicons name="document-text-outline" size={20} color="#333" />
              <Text style={styles.templateButtonText}>Sử dụng mẫu</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton}>
              <Ionicons name="share-social" size={20} color="#fff" />
              <Text style={styles.shareButtonText}>Chia sẻ</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  productOverview: {
    padding: 15,
  },
  productImagePlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: '#666',
  },
  logoPlaceholder: {
    width: 100,
    height: 20,
    backgroundColor: '#fff',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  logoText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  productInfo: {
    marginBottom: 10,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
    color: '#EE0033',
    fontWeight: '600',
  },
  viewQuoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  viewQuoteText: {
    marginLeft: 4,
    color: '#666',
    fontSize: 14,
  },
  tagsContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  banner: {
    backgroundColor: '#00A650',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  bannerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  systemInfo: {
    padding: 15,
    backgroundColor: '#f5f5f5',
  },
  systemTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 5,
  },
  systemSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  tagLabel: {
    fontSize: 14,
    color: '#666',
  },
  systemDescription: {
    fontSize: 14,
    color: '#666',
  },
  equipmentList: {
    padding: 15,
  },
  equipmentItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  equipmentImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 4,
    marginRight: 10,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  equipmentInfo: {
    flex: 1,
  },
  equipmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  equipmentSpecs: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  equipmentPrice: {
    fontSize: 16,
    color: '#EE0033',
    fontWeight: '600',
  },
  quantityBadge: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  quantityText: {
    fontSize: 12,
    color: '#666',
  },
  totalSection: {
    backgroundColor: '#333',
    padding: 15,
  },
  totalTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  totalSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    marginTop: 5,
  },
  totalPrice: {
    fontSize: 24,
    color: '#EE0033',
    fontWeight: '600',
    marginTop: 10,
  },
  summary: {
    padding: 15,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },
  summaryList: {
    gap: 10,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  summaryNumber: {
    fontSize: 14,
    color: '#666',
  },
  summaryText: {
    flex: 1,
    fontSize: 14,
  },
  summaryLogoPlaceholder: {
    width: 60,
    height: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryQuantity: {
    fontSize: 14,
    color: '#666',
  },
  footer: {
    padding: 15,
    backgroundColor: '#f5f5f5',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  hotlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EE0033',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  hotlineText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  companyInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  companyName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  companyAddress: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  socialLinks: {
    alignItems: 'center',
  },
  websiteLink: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  socialIcons: {
    flexDirection: 'row',
    gap: 15,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 15,
    gap: 15,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  templateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  templateButtonText: {
    marginLeft: 8,
    color: '#333',
    fontSize: 15,
    fontWeight: '600',
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EE0033',
    paddingVertical: 12,
    borderRadius: 8,
  },
  shareButtonText: {
    marginLeft: 8,
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
}); 